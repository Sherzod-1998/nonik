import express from 'express';
import path from 'path';
import router from './router';
import morgan from 'morgan';
import { MORGAM_FORMAT } from './libs/config';
import routerAdmin from './router-admin';

/** 1-ENTRANCE **/
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAM_FORMAT));

/** 2-SESSIONS **/

/** 3-VIEWS **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** 4-ROUTERS **/
app.use('/admin', routerAdmin);
app.use('/', router);

export default app;
