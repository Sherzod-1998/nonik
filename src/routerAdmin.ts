import express from 'express';
const routerAdmin = express.Router();
import sellerController from './controllers/seller.controller';
import productController from './controllers/product.controller';

/* Restaurant */
routerAdmin.get('/', sellerController.goHome);

routerAdmin.get('/login', sellerController.getLogin).post('/login', sellerController.processLogin);

routerAdmin.get('/signup', sellerController.getSignup).post('/signup', sellerController.processSignup);

routerAdmin.get('/logout', sellerController.logout);
routerAdmin.get('/check-me', sellerController.checkAuthSession);
/** Product */

// Product
routerAdmin.get('/product/all', productController.getAllProducts);
routerAdmin.post('/product/create', productController.createNewProduct);
routerAdmin.post('/product/:id', productController.updateChosenProduct);

// User
/** User */
export default routerAdmin;
