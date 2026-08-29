/* eslint-disable prettier/prettier */
import express from 'express';
const routerAdmin = express.Router();
import productController from './controllers/product.controller';
import sellerController from './controllers/seller.controller';
import orderController from './controllers/order.controller';
import makeUploader from './libs/utils/uploader';
import { T } from './libs/types/common';

/** CSRF PROTECTION **/
function verifyCsrf(req: express.Request, res: express.Response, next: express.NextFunction) {
    const sessionInstance = req.session as T;
    if (req.body?.csrfToken !== sessionInstance.csrfToken) {
        res.status(403).json({ message: 'Invalid or missing CSRF token' });
        return;
    }
    next();
}

/** LOGIN RATE LIMITING **/
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_RATE_LIMIT_WINDOW = 1000 * 60 * 10; // 10 minutes
const LOGIN_RATE_LIMIT_MAX = 5;

function loginRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = loginAttempts.get(key);

    if (!entry || entry.resetAt < now) {
        loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW });
        next();
        return;
    }

    if (entry.count >= LOGIN_RATE_LIMIT_MAX) {
        res.status(429).json({ message: 'Too many login attempts, please try again later.' });
        return;
    }

    entry.count += 1;
    next();
}

/* Seller */
routerAdmin.get('/', orderController.getDashboard);

routerAdmin
    .get('/login', sellerController.getLogin)
    .post('/login', loginRateLimiter, verifyCsrf, sellerController.processLogin);

routerAdmin
	.get('/signup', sellerController.getSignup)
	.post('/signup', makeUploader('members').single('memberImage'), verifyCsrf, sellerController.processSignup);

routerAdmin.get('/logout', sellerController.logout);
/** Product */

// Product
routerAdmin.get('/product/all', sellerController.verifySeller, productController.getAllProducts);

routerAdmin.post("/product/create",
    sellerController.verifySeller,
    makeUploader("products").array("productImages", 5),
    verifyCsrf,
    productController.createNewProduct);

routerAdmin.post('/product/:id',
     sellerController.verifySeller,
     makeUploader("products").array("productImage", 5),
     verifyCsrf,
     productController.updateChosenProduct);

// User
routerAdmin.get(
    "/user/all",
    sellerController.verifySeller,
    sellerController.getUsers);

    routerAdmin.post(
        "/user/edit",
        sellerController.verifySeller,
        verifyCsrf,
        sellerController.updateChosenUser);
/** User */

/** Order */
routerAdmin.get('/orders', sellerController.verifySeller, orderController.adminGetAllOrders);
routerAdmin.post('/order/status', sellerController.verifySeller, verifyCsrf, orderController.adminUpdateOrderStatus);
/** Order */

export default routerAdmin;
