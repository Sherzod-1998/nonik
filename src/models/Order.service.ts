/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'mongoose';
import { Order, OrderItemInput } from '../libs/types/order';
import Errors, { HttpCode, Message } from '../libs/Errors';
import { Member } from '../libs/types/member';
import MemberService from './Member.service';
import OrderModel from '../schema/Order.model';
import OrderItemModel from '../schema/OrderItem.model';
import { shapeIntoMongooseObjectId } from '../libs/config';

class OrderService {
	private readonly orderModel;
	private readonly orderItemModel;
	private readonly memberService;

	constructor() {
		this.orderModel = OrderModel;
		this.orderItemModel = OrderItemModel;
		this.memberService = new MemberService();
	}

	public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> {
		const memberId = shapeIntoMongooseObjectId(member._id);
		const amount = input.reduce((accumulator, item) => {
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
			await this.recordOrderItem(orderId, input);

			return newOrder;
		} catch (err) {
			console.log('Error, model: createOrder:', err);
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
}

export default OrderService;
