import { Request, Response } from 'express';
import { T } from '../libs/types/common';
import MemberService from '../models/Member.service';

import { MemberType } from "../libs/enums/member.enum";
import { MemberInput } from '../libs/types/member';

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

sellerController.processSignup = async(req: Request, res: Response) => {
	try {
	  console.log("processSignup");
	  console.log("body:", req.body);
  
	  const newMember:MemberInput = req.body;
	  newMember.memberType = MemberType.SELLER;
	  const memberService = new MemberService();
	  const result = await memberService.processSignup(newMember);
	  res.send(result);
	} catch (err) {
	  console.log("Error, processSignup:", err);
	  res.send(err);
	};

export default sellerController;