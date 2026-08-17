import mongoose, { Schema } from 'mongoose';

const contactMessageSchema = new Schema(
	{
		senderName: {
			type: String,
			required: true,
		},

		senderEmail: {
			type: String,
			required: true,
		},

		message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }, //updatedAt, createdAt
);

export default mongoose.model('ContactMessage', contactMessageSchema);
