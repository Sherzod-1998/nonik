import OrderService from './Order.service';
import Errors, { HttpCode, Message } from '../libs/Errors';
import { Member } from '../libs/types/member';
import { OrderItemInput } from '../libs/types/order';
import ProductModel from '../schema/Product.model';
import OrderModel from '../schema/Order.model';
import OrderItemModel from '../schema/OrderItem.model';

jest.mock('../schema/Product.model');
jest.mock('../schema/Order.model');
jest.mock('../schema/OrderItem.model');

const mockMember = { _id: '507f1f77bcf86cd799439011' } as unknown as Member;

describe('OrderService.createOrder', () => {
	let orderService: OrderService;

	beforeEach(() => {
		jest.clearAllMocks();
		orderService = new OrderService();
	});

	it('throws OUT_OF_STOCK when itemQuantity exceeds productLeftCount', async () => {
		(ProductModel.findById as jest.Mock).mockReturnValue({
			exec: jest.fn().mockResolvedValue({
				_id: 'product1',
				productPrice: 50,
				productLeftCount: 1,
			}),
		});

		const input: OrderItemInput[] = [
			{
				productId: '507f1f77bcf86cd799439012' as any,
				itemQuantity: 5,
				itemPrice: 50,
			},
		];

		await expect(orderService.createOrder(mockMember, input)).rejects.toEqual(
			new Errors(HttpCode.BAD_REQUEST, Message.OUT_OF_STOCK),
		);
	});

	it('throws PRODUCT_NOT_FOUND when the product does not exist', async () => {
		(ProductModel.findById as jest.Mock).mockReturnValue({
			exec: jest.fn().mockResolvedValue(null),
		});

		const input: OrderItemInput[] = [
			{
				productId: '507f1f77bcf86cd799439013' as any,
				itemQuantity: 1,
				itemPrice: 50,
			},
		];

		await expect(orderService.createOrder(mockMember, input)).rejects.toEqual(
			new Errors(HttpCode.BAD_REQUEST, Message.PRODUCT_NOT_FOUND),
		);
	});

	it('uses the DB productPrice, not the client-supplied itemPrice, when computing the order total', async () => {
		const dbPrice = 100;
		const clientSuppliedPrice = 1; // suspicious/mismatched price sent by a malicious client

		(ProductModel.findById as jest.Mock).mockReturnValue({
			exec: jest.fn().mockResolvedValue({
				_id: 'product1',
				productPrice: dbPrice,
				productLeftCount: 10,
			}),
		});

		(OrderModel.create as jest.Mock).mockImplementation((doc: any) =>
			Promise.resolve({ ...doc, _id: 'order1' }),
		);
		(OrderItemModel.create as jest.Mock).mockResolvedValue({});

		const input: OrderItemInput[] = [
			{
				productId: '507f1f77bcf86cd799439014' as any,
				itemQuantity: 2,
				itemPrice: clientSuppliedPrice,
			},
		];

		const result = await orderService.createOrder(mockMember, input);

		// 2 * dbPrice(100) = 200, which is >= 100 so no delivery fee is added
		expect(result.orderTotal).toBe(dbPrice * 2);
		expect(OrderModel.create).toHaveBeenCalledWith(
			expect.objectContaining({ orderTotal: dbPrice * 2 }),
		);
	});
});
