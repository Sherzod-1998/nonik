import { Request, Response } from 'express';
import { T } from '../libs/types/common';
import MemberService from '../models/Member.service';
import { AdminRequest, LoginInput, MemberInput } from '../libs/types/member';
import { MemberType } from '../libs/enums/member.enum';

const memberService = new MemberService();

const sellerController: T = {};
sellerController.goHome = (req: Request, res: Response) => {
	try {
		console.log('goHome');
		res.render('Home');
	} catch (err) {
		console.log('Error, goHome:', err);
	}
};

sellerController.getSignup = (req: Request, res: Response) => {
	try {
		res.render('signup');
	} catch (err) {
		console.log('Error, getSignup:', err);
	}
};

sellerController.getLogin = (req: Request, res: Response) => {
	try {
		res.render('Login');
	} catch (err) {
		console.log('Error, getLogin:', err);
	}
};

sellerController.processSignup = async (req: AdminRequest, res: Response) => {
	try {
		console.log('processSignup');
		const newMember: MemberInput = req.body;
		newMember.memberType = MemberType.SELLER;
		const result = await memberService.processSignup(newMember);

		req.session.member = result;
		req.session.save(function () {
			res.send(result);
		});
	} catch (err) {
		console.log('Error, processSignup:', err);
		res.send(err);
	}
};

sellerController.processLogin = async (req: AdminRequest, res: Response) => {
	try {
		console.log('processLogin');
		console.log('body:', req.body);
		const input: LoginInput = req.body;

		const result = await memberService.processLogin(input);

		res.send(result);
	} catch (err) {
		console.log('Error, processLogin:', err);
		res.send(err);
	}
};

export default sellerController;
