import Errors, { HttpCode, Message } from '../libs/Errors';
import { Request, Response } from 'express';
import { T } from '../libs/types/common';
import ProductService from '../models/Product.service';
import { AdminRequest, ExtendedRequest } from '../libs/types/member';
import { ProductInput, ProductInquiry, ProductUpdateInput } from '../libs/types/product';
import { BrandCollection, ProductCollection } from '../libs/enums/product.enum';

const productService = new ProductService();

const productController: T = {};

productController.getProducts = async (req: Request, res: Response) => {
	try {
		const { page, limit, order, productCollection, brandCollection, minPrice, maxPrice, search } = req.query;

		const inquiry: ProductInquiry = {
			order: String(order),
			page: Number(page),
			limit: Number(limit),
		};

		// ✅ productCollection ni array ko‘rinishida to‘g‘ri tiplab olish
		if (productCollection) {
			if (Array.isArray(productCollection)) {
				inquiry.productCollection = productCollection as ProductCollection[];
			} else if (typeof productCollection === 'string') {
				inquiry.productCollection = [productCollection as ProductCollection];
			}
		}

		// ✅ brandCollection ni array ko‘rinishida to‘g‘ri tiplab olish
		if (brandCollection) {
			if (Array.isArray(brandCollection)) {
				inquiry.brandCollection = brandCollection as BrandCollection[];
			} else if (typeof brandCollection === 'string') {
				inquiry.brandCollection = [brandCollection as BrandCollection];
			}
		}

		// Optional price range
		if (minPrice !== undefined) inquiry.minPrice = Number(minPrice);
		if (maxPrice !== undefined) inquiry.maxPrice = Number(maxPrice);

		// Optional search
		if (search) inquiry.search = String(search);

		const result = await productService.getProducts(inquiry);

		res.set('X-Total-Count', String(result.total));
		res.status(HttpCode.OK).json(result.products);
	} catch (err) {
		console.log('Error, getProducts:', err);

		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
	try {
		const { id } = req.params;

		const memberId = req.member?._id ?? null;
		const result = await productService.getProduct(memberId, id);
		res.status(HttpCode.OK).json(result);
	} catch (err) {
		console.log('Error, getProduct:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

productController.getAllProducts = async (req: Request, res: Response) => {
	try {
		const data = await productService.getAllProducts();
		res.render('products', { products: data });
	} catch (err) {
		console.log('Error getAllProducts', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

productController.recommendProducts = async (req: Request, res: Response) => {
	try {
		const { productId } = req.params;

		const result = await productService.getRecommendedProducts(productId);

		res.status(200).json(result);
	} catch (err) {
		console.log('Error, recommendProducts:', err);
		res.status(500).json({ message: 'Internal server error' });
	}
};

productController.createNewProduct = async (req: AdminRequest, res: Response) => {
	try {
		if (!req.files?.length) {
			throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
		}

		const data: ProductInput = req.body;
		data.productImages = req.files.map((ele) => ele.path.replace(/\\/g, '/'));

		await productService.createNewProduct(data);
		res.send(`<script> alert(${JSON.stringify('Successful creation!')}); window.location.replace('/admin/product/all') </script>`);
	} catch (err) {
		console.log('Error createNewProducts', err);
		const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
		res.send(`<script> alert(${JSON.stringify(message)}); window.location.replace('/admin/product/all') </script>`);
	}
};

productController.updateChosenProduct = async (req: AdminRequest, res: Response) => {
	try {
		const id = req.params.id;
		const {
			productName,
			productPrice,
			productLeftCount,
			productDesc,
			productCollection,
			brandCollection,
			productStatus,
		} = req.body;

		const input: Partial<ProductUpdateInput> = {};
		if (productName !== undefined) input.productName = productName;
		if (productPrice !== undefined) input.productPrice = productPrice;
		if (productLeftCount !== undefined) input.productLeftCount = productLeftCount;
		if (productDesc !== undefined) input.productDesc = productDesc;
		if (productCollection !== undefined) input.productCollection = productCollection;
		if (brandCollection !== undefined) input.brandCollection = brandCollection;
		if (productStatus !== undefined) input.productStatus = productStatus;

		// The route's multer middleware parses new image uploads into req.files
		// (field name "productImage"). Only overwrite productImages when a new
		// file was actually submitted, otherwise keep the product's existing images.
		if (req.files?.length) {
			input.productImages = req.files.map((ele) => ele.path.replace(/\\/g, '/'));
		}

		const result = await productService.updateChosenProduct(id, input as ProductUpdateInput);
		res.status(HttpCode.OK).json({ data: result });
	} catch (err) {
		console.log('Error updateChosenProduct', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

export default productController;
