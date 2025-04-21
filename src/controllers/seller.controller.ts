import { Request, Response } from 'express';
import { T } from '../libs/types/common';
import MemberService from '../models/Member.service';

const sellerController: T = {};
sellerController.goHome = (req: Request, res: Response) => {
	try {
		console.log('goHome');
		res.send('Home Page');
	} catch (err) {
		console.log('Error, goHome:', err);
	}
};

sellerController.getLogin = (req: Request, res: Response) => {
	try {
		res.send('Login Page');
	} catch (err) {
		console.log('Error, getLogin:', err);
	}
};

sellerController.getSignup = (req: Request, res: Response) => {
	try {
		res.send('Signup Page');
	} catch (err) {
		console.log('Error, getSignup:', err);
	}
};

sellerController.processLogin = (req: Request, res: Response) => {
	try {
		console.log('processLogin');
		res.send('DONE');
	} catch (err) {
		console.log('Error, processLogin:', err);
	}
};

sellerController.processSignup = (req: Request, res: Response) => {
	try {
		console.log('processSignup');
		res.send('DONE');
	} catch (err) {
		console.log('Error, processSignup:', err);
	}
};

export default sellerController;
