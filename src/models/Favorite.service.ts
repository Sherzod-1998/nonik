import { ObjectId } from 'mongoose';
import { shapeIntoMongooseObjectId } from '../libs/config';
import Errors, { HttpCode, Message } from '../libs/Errors';
import { Favorite } from '../libs/types/favorite';
import FavoriteModel from '../schema/Favorite.model';

class FavoriteService {
	private readonly favoriteModel;

	constructor() {
		this.favoriteModel = FavoriteModel;
	}

	public async toggleFavorite(memberId: ObjectId | string, productId: string): Promise<{ liked: boolean }> {
		const favoriteMember = shapeIntoMongooseObjectId(memberId);
		const favoriteProduct = shapeIntoMongooseObjectId(productId);

		const exist = await this.favoriteModel.findOne({ favoriteMember, favoriteProduct }).exec();

		if (exist) {
			await this.favoriteModel.deleteOne({ _id: exist._id }).exec();
			return { liked: false };
		}

		try {
			await this.favoriteModel.create({ favoriteMember, favoriteProduct });
			return { liked: true };
		} catch (err) {
			console.error('Error, model:toggleFavorite', err);
			throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
		}
	}

	public async getFavorites(memberId: ObjectId | string): Promise<Favorite[]> {
		const favoriteMember = shapeIntoMongooseObjectId(memberId);

		const result = await this.favoriteModel
			.find({ favoriteMember })
			.populate('favoriteProduct')
			.sort({ createdAt: -1 })
			.exec();

		return result as unknown as Favorite[];
	}
}

export default FavoriteService;
