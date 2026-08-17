import Errors, { HttpCode, Message } from '../libs/Errors';
import { Request, Response } from 'express';
import { T } from '../libs/types/common';
import ContactMessageService from '../models/ContactMessage.service';
import { ContactMessageInput } from '../libs/types/contact';

const contactMessageService = new ContactMessageService();

const contactController: T = {};

contactController.submitMessage = async (req: Request, res: Response) => {
	try {
		const { senderName, senderEmail, message } = req.body;

		if (!senderName || !senderEmail || !message) {
			throw new Errors(HttpCode.BAD_REQUEST, Message.INSUFFICIENT_DATA);
		}

		const input: ContactMessageInput = { senderName, senderEmail, message };
		await contactMessageService.submitMessage(input);

		res.status(HttpCode.CREATED).json({ message: 'Message sent successfully!' });
	} catch (err) {
		console.log('Error, submitMessage:', err);
		if (err instanceof Errors) {
			res.status(err.code).json(err);
		} else {
			res.status(Errors.standard.code).json(Errors.standard);
		}
	}
};

export default contactController;
