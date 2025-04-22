import dotenv from 'dotenv'; //.env fayllarini o`qishni taminlaydi
dotenv.config(); //dotenv fayllarini ochib beradi

import mongoose from 'mongoose'; //Node.js-da MongoDB bilan ishlashni osonlashtiruvchi kutubxona.
import app from './app';

mongoose
	.connect(process.env.MONGO_URL as string, {})
	.then((data) => {
		console.log('MongoDB connection succeed');
		const PORT = process.env.PORT ?? 3003;
		app.listen(PORT, function () {
			console.log(`The server is successfully running on port: ${PORT}`);
		});
	})
	.catch((err) => console.log('Error on connection MongoDB', err));
