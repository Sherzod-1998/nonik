/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import memberController from './controllers/member.controller';
import uploader from './libs/utils/uploader';
import productController from './controllers/product.controller';
const router = express.Router();

router.get('/member/seller', memberController.getSeller);
router.post('/member/signup', memberController.signup);

export default router;
