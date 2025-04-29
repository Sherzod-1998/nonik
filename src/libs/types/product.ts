import { ProductStatus, ProductCollection, BrandCollection } from '../enums/product.enum';
import { Types } from 'mongoose';
type ObjectId = Types.ObjectId;

export interface Product {
	_id: ObjectId;
	productStatus: ProductStatus;
	productCollection: ProductCollection;
	brandCollection: BrandCollection;
	productName: string;
	productPrice: number;
	productLeftCount: number;
	productVolume: number;
	productDesc?: string;
	productImages: string[];
	productView: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ProductInput {
	productStatus?: ProductStatus;
	productCollection: ProductCollection;
	brandCollection: BrandCollection;
	productName: string;
	productPrice: number;
	productLeftCount: number;
	productVolume?: number;
	productDesc?: string;
	productImages?: string[];
	productViews?: number;
}
