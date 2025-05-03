/* eslint-disable @typescript-eslint/no-unused-vars */
import router from '../router';
import { T } from '../libs/types/common';
import memberController from './member.controller';

router.get('/member/restaurant', memberController.getRestaurant);

const orderController: T = {};
