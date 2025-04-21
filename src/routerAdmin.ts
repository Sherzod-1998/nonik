import express from 'express';
const routerAdmin = express.Router();
import sellerController from './controllers/seller.controller';

/* Seller */
routerAdmin.get('/', sellerController.goHome);

routerAdmin.get('/login', sellerController.getLogin).post('/login', sellerController.processLogin);

routerAdmin.get('/signup', sellerController.getSignup).post('/signup', sellerController.processSignup);

/** Product */
/** User */
export default routerAdmin;
