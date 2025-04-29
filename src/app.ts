import express from 'express';
import path from 'path';
import router from './router';
import morgan from 'morgan';
import { MORGAM_FORMAT } from './libs/config';
import routerAdmin from './router-admin';
import { T } from './libs/types/common';

import session from 'express-session';
import ConnectMongoDB from 'connect-mongodb-session';
const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
	uri: String(process.env.MONGO_URL),
	collection: 'sessions',
});

/** 1-ENTRANCE **/
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAM_FORMAT));

/** 2-SESSIONS **/
app.use(
	session({
		secret: String(process.env.SESSION_SECRET), // Maxfiy kalit
		cookie: {
			maxAge: 1000 * 3600 * 3, // 3hours
		},
		store: store, // Sessiyalarni saqlash uchun avval sozlangan MongoDBStore
		resave: true, // Har bir so‘rovda sessiya qayta saqlanadi
		saveUninitialized: true, // Bo‘sh sessiyalarni ham saqlaydi
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

/** 4-ROUTERS **/
app.use('/admin', routerAdmin);
app.use('/', router);

export default app;
