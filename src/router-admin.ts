import express from 'express';
const routerAdmin = express.Router();
import productController from './controllers/product.controller';
import sellerController from './controllers/seller.controller';

/* Restaurant */
routerAdmin.get('/', sellerController.goHome);

routerAdmin.get('/login', sellerController.getLogin).post('/login', sellerController.processLogin);

routerAdmin.get('/signup', sellerController.getSignup).post('/signup', sellerController.processSignup);

routerAdmin.get('/logout', sellerController.logout);
routerAdmin.get('/check-me', sellerController.checkAuthSession);
/** Product */

// Product
routerAdmin.get('/product/all', sellerController.verifySeller, productController.getAllProducts);

routerAdmin.post('/product/create', sellerController.verifySeller, productController.createNewProduct);

routerAdmin.post('/product/:id', sellerController.verifySeller, productController.updateChosenProduct);

// User
/** User */
export default routerAdmin;
