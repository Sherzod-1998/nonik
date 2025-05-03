/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import memberController from './controllers/member.controller';
import uploader from './libs/utils/uploader';
import productController from './controllers/product.controller';
const router = express.Router();

router.get('/member/seller', memberController.getSeller);
router.post('/member/login', memberController.login);
router.post('/member/signup', memberController.signup);
router.post('/member/logout', memberController.verifyAuth, memberController.logout);
router.get('/member/detail', memberController.verifyAuth, memberController.getMemberDetail);
export default router;
