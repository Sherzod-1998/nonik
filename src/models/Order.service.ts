import { ObjectId } from 'mongoose';
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from '../libs/types/order';
import Errors, { HttpCode, Message } from '../libs/Errors';
import { Member } from '../libs/types/member';
import MemberService from './Member.service';
import OrderModel from '../schema/Order.model';
import OrderItemModel from '../schema/OrderItem.model';
import ProductModel from '../schema/Product.model';
import { shapeIntoMongooseObjectId } from '../libs/config';
import { OrderStatus } from '../libs/enums/order.enum';
import { T } from '../libs/types/common';

class OrderService {
	private readonly orderModel;
	private readonly orderItemModel;
	private readonly productModel;
	private readonly memberService;

	constructor() {
		this.orderModel = OrderModel;
		this.orderItemModel = OrderItemModel;
		this.productModel = ProductModel;
		this.memberService = new MemberService();
	}

	public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> {
		const memberId = shapeIntoMongooseObjectId(member._id);

		// Har bir item uchun haqiqiy mahsulotni bazadan olib, narxini serverda hisoblaymiz
		// (client yuborgan itemPrice'ga ishonmaymiz)
		const verifiedItems = await Promise.all(
			input.map(async (item: OrderItemInput) => {
				const productId = shapeIntoMongooseObjectId(item.productId);
				const product = await this.productModel.findById(productId).exec();

				if (!product) throw new Errors(HttpCode.BAD_REQUEST, Message.PRODUCT_NOT_FOUND);
				if (product.productLeftCount < item.itemQuantity) {
					throw new Errors(HttpCode.BAD_REQUEST, Message.OUT_OF_STOCK);
				}

				return {
					...item,
					productId,
					itemPrice: product.productPrice,
				};
			}),
		);

		const amount = verifiedItems.reduce((accumulator, item) => {
			console.log('Processing Item:', item);
			console.log(`Price: ${item.itemPrice}, Quantity: ${item.itemQuantity}`);

			return accumulator + item.itemPrice * item.itemQuantity;
		}, 0);

		const delivery = amount < 100 ? 5 : 0;

		try {
			// Order yaratish
			const newOrder = await this.orderModel.create({
				orderTotal: amount + delivery, // amount = 787, delivery = 0, kutilgan natija: 787
				orderDelivery: delivery,
				memberId: memberId,
			});

			const orderId = newOrder._id;
			console.log('orderId', orderId);
			await this.recordOrderItem(orderId, verifiedItems);

			return newOrder;
		} catch (err) {
			console.log('Error, model: createOrder:', err);
			if (err instanceof Errors) throw err;
			throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED); // Xato yuzaga keldi
		}
	}

	private async recordOrderItem(orderId: ObjectId, input: OrderItemInput[]): Promise<void> {
		const promisedList = input.map(async (item: OrderItemInput) => {
			item.orderId = orderId;
			item.productId = shapeIntoMongooseObjectId(item.productId);
			await this.orderItemModel.create(item);
			return 'INSERTED';
		});

		console.log('promisedList:', promisedList);

		const orderItemsState = await Promise.all(promisedList);

		console.log('orderItemsState:', orderItemsState);
	}

	public async getMyOrders(member: Member, inquiry: OrderInquiry): Promise<Order[]> {
		const memberId = shapeIntoMongooseObjectId(member._id);
		const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

		const result = await this.orderModel
			.aggregate([
				{ $match: matches },
				{ $sort: { updatedAt: -1 } },
				{ $skip: (inquiry.page - 1) * inquiry.limit },
				{ $limit: inquiry.limit },
				{
					$lookup: {
						from: 'orderItems',
						localField: '_id',
						foreignField: 'orderId',
						as: 'orderItems',
					},
				},
				{
					$lookup: {
						from: 'products',
						localField: 'orderItems.productId',
						foreignField: '_id',
						as: 'productData',
					},
				},
			])
			.exec();

		return result ?? [];
	}

	public async adminGetAllOrders(page = 1, statusFilter?: OrderStatus): Promise<{ orders: Order[]; total: number }> {
		const limit = 10;
		const matches: T = {};
		if (statusFilter) matches.orderStatus = statusFilter;

		const [orders, total] = await Promise.all([
			this.orderModel
				.aggregate([
					{ $match: matches },
					{ $sort: { updatedAt: -1 } },
					{ $skip: (page - 1) * limit },
					{ $limit: limit },
					{
						$lookup: {
							from: 'orderItems',
							localField: '_id',
							foreignField: 'orderId',
							as: 'orderItems',
						},
					},
					{
						$lookup: {
							from: 'products',
							localField: 'orderItems.productId',
							foreignField: '_id',
							as: 'productData',
						},
					},
					{
						$lookup: {
							from: 'members',
							localField: 'memberId',
							foreignField: '_id',
							as: 'memberData',
						},
					},
				])
				.exec(),
			this.orderModel.countDocuments(matches).exec(),
		]);

		return { orders: orders ?? [], total };
	}

	public async adminUpdateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
		const id = shapeIntoMongooseObjectId(orderId);
		const result = await this.orderModel.findByIdAndUpdate(id, { orderStatus: newStatus }, { new: true }).exec();

		if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
		return result;
	}

	public async updateOrder(member: Member, input: OrderUpdateInput): Promise<Order> {
		const memberId = shapeIntoMongooseObjectId(member._id);
		const orderId = shapeIntoMongooseObjectId(input.orderId);
		const orderStatus = input.orderStatus;

		// Points faqat status haqiqatan ham boshqa holatdan PROCESS'ga o'tganda beriladi,
		// aks holda foydalanuvchi bir xil statusni qayta-qayta yuborib point yig'ib olishi mumkin
		const existingOrder = await this.orderModel.findOne({ memberId: memberId, _id: orderId }).exec();
		if (!existingOrder) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
		const currentStatus = existingOrder.orderStatus;

		const result = await this.orderModel
			.findOneAndUpdate({ memberId: memberId, _id: orderId }, { orderStatus: orderStatus }, { new: true })
			.exec();

		if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
		if (orderStatus === OrderStatus.PROCESS && currentStatus !== OrderStatus.PROCESS) {
			await this.memberService.addUserPoint(member, 1);
		}
		return result;
	}
}

export default OrderService;
