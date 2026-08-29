/* eslint-disable prettier/prettier */
import express from 'express';
const routerAdmin = express.Router();
import productController from './controllers/product.controller';
import sellerController from './controllers/seller.controller';
import orderController from './controllers/order.controller';
import makeUploader from './libs/utils/uploader';
import { createRateLimiter } from './libs/utils/rateLimiter';
import { T } from './libs/types/common';
import fs from 'fs';

/** CSRF PROTECTION **/
function verifyCsrf(req: express.Request, res: express.Response, next: express.NextFunction) {
    const sessionInstance = req.session as T;
    if (req.body?.csrfToken !== sessionInstance.csrfToken) {
        // Clean up any files multer already wrote to disk before rejecting the request.
        const files: Express.Multer.File[] = req.file
            ? [req.file]
            : Array.isArray(req.files)
              ? req.files
              : req.files
                ? Object.values(req.files).flat()
                : [];
        files.forEach((file) => {
            if (file?.path) {
                fs.unlink(file.path, () => {});
            }
        });
        res.status(403).json({ message: 'Invalid or missing CSRF token' });
        return;
    }
    next();
}

/** LOGIN RATE LIMITING **/
const loginRateLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
});

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
