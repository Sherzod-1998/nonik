import Errors, { HttpCode, logError } from '../libs/Errors';
import { Response } from 'express';
import { T } from '../libs/types/common';
import FavoriteService from '../models/Favorite.service';
import { ExtendedRequest } from '../libs/types/member';

const favoriteService = new FavoriteService();

const favoriteController: T = {};

favoriteController.toggleFavorite = async (req: ExtendedRequest, res: Response) => {
	try {
		const { productId } = req.body;
		const result = await favoriteService.toggleFavorite(req.member._id, productId);
		res.status(HttpCode.OK).json(result);
	} catch (err) {
		logError('Favorite.controller toggleFavorite:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

favoriteController.getMyFavorites = async (req: ExtendedRequest, res: Response) => {
	try {
		const result = await favoriteService.getFavorites(req.member._id);
		res.status(HttpCode.OK).json(result);
	} catch (err) {
		logError('Favorite.controller getMyFavorites:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

export default favoriteController;
