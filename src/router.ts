import express from 'express';
import memberController from './controllers/member.controller';
import uploader from './libs/utils/uploader';
import productController from './controllers/product.controller';
import orderController from './controllers/order.controller';
import favoriteController from './controllers/favorite.controller';
import contactController from './controllers/contact.controller';
import { createRateLimiter } from './libs/utils/rateLimiter';
const router = express.Router();

/** LOGIN / SIGNUP RATE LIMITING **/
const loginRateLimiter = createRateLimiter({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 5,
	message: 'Too many login attempts, please try again later.',
});

const signupRateLimiter = createRateLimiter({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10,
	message: 'Too many signup attempts, please try again later.',
});

/** Member */
router.get('/member/seller', memberController.getSeller);
router.post('/member/login', loginRateLimiter, memberController.login);
router.post('/member/signup', signupRateLimiter, memberController.signup);
router.post('/member/logout', memberController.verifyAuth, memberController.logout);
router.get('/member/detail', memberController.verifyAuth, memberController.getMemberDetail);
router.post(
	'/member/update',
	memberController.verifyAuth,
	uploader('members').single('memberImage'),
	memberController.updateMember,
);
router.get('/member/top-users', memberController.getTopUsers);
router.post('/member/change-password', memberController.verifyAuth, memberController.changePassword);
/** Member */

/** Product **/
router.get('/product/all', productController.getProducts);
router.get('/product/:id', memberController.retrieveAuth, productController.getProduct);
router.get('/product/recommend/:productId', productController.recommendProducts);

/** Product **/

/** Order  */
router.post('/order/create', memberController.verifyAuth, orderController.createOrder);
router.get('/order/all', memberController.verifyAuth, orderController.getMyOrders);
router.post('/order/update', memberController.verifyAuth, orderController.updateOrder);
/** Order  */

/** Favorite */
router.post('/favorite/toggle', memberController.verifyAuth, favoriteController.toggleFavorite);
router.get('/favorite/my', memberController.verifyAuth, favoriteController.getMyFavorites);
/** Favorite */

/** Contact */
router.post('/contact/submit', contactController.submitMessage);
/** Contact */

export default router;
