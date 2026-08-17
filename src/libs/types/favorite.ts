import { Types } from 'mongoose';
import { Product } from './product';
type ObjectId = Types.ObjectId;

export interface Favorite {
	_id: ObjectId;
	favoriteMember: ObjectId;
	favoriteProduct: ObjectId | Product;
	createdAt: Date;
	updatedAt: Date;
}
