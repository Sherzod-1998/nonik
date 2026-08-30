/* eslint-disable @typescript-eslint/no-unused-vars */
import cors from 'cors';
import express from 'express';
import path from 'path';
import router from './router';
import routerAdmin from './router-admin';
import morgan from 'morgan';
import { MORGAM_FORMAT } from './libs/config';
import cookieParser from 'cookie-parser';
import './cron/cleanupSchedule';
import session from 'express-session';
import ConnectMongoDB from 'connect-mongodb-session';
import { T } from './libs/types/common';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import crypto from 'crypto';

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
	uri: String(process.env.MONGO_URL),
	collection: 'sessions',
});

/** 1-ENTRANCE **/
const app = express();
app.set('trust proxy', 1); // behind nginx: honor X-Forwarded-Proto so secure cookies get set

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('./uploads'));
app.use(express.urlencoded({ extended: true })); //traditional api
app.use(express.json()); //REST API
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim());
app.use(
	cors({
		credentials: true,
		origin: allowedOrigins,
		exposedHeaders: ['X-Total-Count'],
	}),
);
app.use(cookieParser());
app.use(morgan(MORGAM_FORMAT)); //HTTP so'rovlarini logga yozish. REST API

/** 2-SESSIONS **/
app.use(
	session({
		secret: String(process.env.SESSION_SECRET), // Maxfiy kalit
		cookie: {
			maxAge: 1000 * 3600 * 3, // 3hours
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		},
		store: store, // Sessiyalarni saqlash uchun avval sozlangan MongoDBStore
		resave: false, // Sessiya o'zgarmagan bo'lsa qayta saqlanmaydi
		saveUninitialized: false, // Bo'sh sessiyalarni saqlamaydi
	}),
);

app.use(function (req, res, next) {
	const sessionInstancen = req.session as T;
	res.locals.member = sessionInstancen.member;
	next();
});

/** 3-VIEWS **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** CSRF TOKEN **/
function csrfTokenMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
	const sessionInstance = req.session as T;
	if (!sessionInstance.csrfToken) {
		sessionInstance.csrfToken = crypto.randomBytes(24).toString('hex');
	}
	res.locals.csrfToken = sessionInstance.csrfToken;
	next();
}

/** 4-ROUTERS **/
app.use('/admin', csrfTokenMiddleware, routerAdmin);
app.use('/', router);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: true,
		credentials: true,
	},
});

let summaryClient = 0;

io.on('connection', (socket) => {
	summaryClient++;
	console.log(`Connection & total [${summaryClient}]`);

	socket.on('disconnect', () => {
		summaryClient--;
		console.log(`Disconnection & total [${summaryClient}]`);
	});
});

export default server;
