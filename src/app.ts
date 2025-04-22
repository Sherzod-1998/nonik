import express from 'express';
import path from 'path';
import router from './router';
import morgan from 'morgan';
import { MORGAM_FORMAT } from './libs/config';
import routerAdmin from './router-admin';

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL) ,
    collection: 'sessions'
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
      secret: String(process.env.SESSION_SECRET), // secret key
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
      store: store, 
      resave: true, 
      saveUninitialized: true 
    })
  );

/** 3-VIEWS **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** 4-ROUTERS **/
app.use('/admin', routerAdmin);
app.use('/', router);

export default app;
