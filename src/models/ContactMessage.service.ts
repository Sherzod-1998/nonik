import Errors, { HttpCode, Message } from '../libs/Errors';
import { ContactMessageInput } from '../libs/types/contact';
import ContactMessageModel from '../schema/ContactMessage.model';

class ContactMessageService {
	private readonly contactMessageModel;

	constructor() {
		this.contactMessageModel = ContactMessageModel;
	}

	public async submitMessage(input: ContactMessageInput): Promise<void> {
		try {
			await this.contactMessageModel.create(input);
		} catch (err) {
			console.log('Error, model:submitMessage', err);
			throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
		}
	}
}

export default ContactMessageService;
