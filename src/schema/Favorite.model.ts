import mongoose, { Schema } from 'mongoose';

const favoriteSchema = new Schema(
	{
		favoriteMember: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},

		favoriteProduct: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
			required: true,
		},
	},
	{ timestamps: true },
);

favoriteSchema.index({ favoriteMember: 1, favoriteProduct: 1 }, { unique: true });
export default mongoose.model('Favorite', favoriteSchema);
