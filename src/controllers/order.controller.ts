import { ExtendedRequest } from '../libs/types/member';
import { T } from '../libs/types/common';
import { Request, Response } from 'express';
import Errors, { HttpCode } from '../libs/Errors';
import OrderService from '../models/Order.service';
import { OrderInquiry, OrderUpdateInput } from '../libs/types/order';
import { OrderStatus } from '../libs/enums/order.enum';

const orderService = new OrderService();
const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
	try {
		const result = await orderService.createOrder(req.member, req.body);
		res.status(HttpCode.CREATED).json(result); // `-` o'rniga `.` qo'yildi
	} catch (err) {
		console.log('Error, createOrder:', err);
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
		console.log('Error, getMyOrders:', err);

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
		console.log('Error, updateOrder:', err);
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
		console.log('Error, adminGetAllOrders:', err);
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
		console.log('Error, adminUpdateOrderStatus:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

export default orderController;
