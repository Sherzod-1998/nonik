import Errors, { HttpCode, Message } from '../libs/Errors';
import { Request, Response } from 'express';
import { T } from '../libs/types/common';
import ProductService from '../models/Product.service';
import { AdminRequest } from '../libs/types/member';
import { ProductInput } from '../libs/types/product';

const productService = new ProductService();

const productController: T = {};

productController.getAllProducts = async (req: Request, res: Response) => {
	try {
		console.log('getAllProducts');
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

productController.createNewProduct = async (req: AdminRequest, res: Response) => {
	try {
		console.log('createNewProducts');
		console.log('req.body:', req.body);

		if (!req.files?.length) {
			throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
		}

		const data: ProductInput = req.body;
		data.productImages = req.files.map((ele) => ele.path.replace(/\\/g, '/'));

		await productService.createNewProduct(data);
		res.send(`<script> alert("Successful creation!"); window.location.replace('/admin/product/all') </script>`);
	} catch (err) {
		console.log('Error createNewProducts', err);
		const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
		res.send(`<script> alert("${message}"); window.location.replace('/admin/product/all') </script>`);
	}
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
	try {
		console.log('updateChosenProduct');
	} catch (err) {
		console.log('Error updateChosenProduct', err);
		if (err instanceof Errors) res.status(err.code).json(err);
		else res.status(Errors.standard.code).json(Errors.standard);
	}
};

export default productController;
