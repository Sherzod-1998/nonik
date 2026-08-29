import { AdminRequest, ExtendedRequest } from '../libs/types/member';
import { T } from '../libs/types/common';
import { Request, Response } from 'express';
import Errors, { HttpCode, logError } from '../libs/Errors';
import OrderService from '../models/Order.service';
import { OrderInquiry, OrderUpdateInput } from '../libs/types/order';
import { OrderStatus } from '../libs/enums/order.enum';
import OrderModel from '../schema/Order.model';
import ProductModel from '../schema/Product.model';
import MemberModel from '../schema/Member.model';
import { MemberType } from '../libs/enums/member.enum';

const orderService = new OrderService();
const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
	try {
		const result = await orderService.createOrder(req.member, req.body);
		res.status(HttpCode.CREATED).json(result); // `-` o'rniga `.` qo'yildi
	} catch (err) {
		logError('Order.controller createOrder:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
	try {
		const { page, limit, orderStatus } = req.query;
		const inquiry: OrderInquiry = {
			page: Number(page),
			limit: Number(limit),
			orderStatus: orderStatus as OrderStatus,
		};
		const result = await orderService.getMyOrders(req.member, inquiry);
		res.status(HttpCode.OK).json(result); // Changed to HttpCode.OK (200)
	} catch (err) {
		logError('Order.controller getMyOrders:', err);

		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
	try {
		const input: OrderUpdateInput = req.body;
		const result = await orderService.updateOrder(req.member, input);
		res.status(HttpCode.CREATED).json(result);
	} catch (err) {
		logError('Order.controller updateOrder:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

orderController.adminGetAllOrders = async (req: Request, res: Response) => {
	try {
		const page = req.query.page ? Number(req.query.page) : 1;
		const statusFilter = req.query.status ? (String(req.query.status) as OrderStatus) : undefined;

		const { orders, total } = await orderService.adminGetAllOrders(page, statusFilter);
		const totalPages = Math.max(Math.ceil(total / 10), 1);

		res.render('orders', { orders, total, page, totalPages, statusFilter, OrderStatus });
	} catch (err) {
		logError('Order.controller adminGetAllOrders:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

orderController.adminUpdateOrderStatus = async (req: Request, res: Response) => {
	try {
		const { orderId, newStatus } = req.body;
		const result = await orderService.adminUpdateOrderStatus(orderId, newStatus);
		res.status(HttpCode.OK).json({ data: result });
	} catch (err) {
		logError('Order.controller adminUpdateOrderStatus:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

orderController.getDashboard = async (req: AdminRequest, res: Response) => {
	try {
		const [totalOrders, revenueResult, totalProducts, totalUsers, recentOrders] = await Promise.all([
			OrderModel.countDocuments().exec(),
			OrderModel.aggregate([
				{ $match: { orderStatus: OrderStatus.FINISH } },
				{ $group: { _id: null, total: { $sum: '$orderTotal' } } },
			]).exec(),
			ProductModel.countDocuments().exec(),
			MemberModel.countDocuments({ memberType: MemberType.USER }).exec(),
			OrderModel.find({}, { orderTotal: 1, orderStatus: 1, updatedAt: 1 }).sort({ updatedAt: -1 }).limit(5).exec(),
		]);

		const totalRevenue = revenueResult[0]?.total ?? 0;

		res.render('home', {
			member: req.session.member,
			stats: { totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders },
		});
	} catch (err) {
		logError('Order.controller getDashboard:', err);
		res.render('home', { member: req.session.member, stats: null });
	}
};

export default orderController;
