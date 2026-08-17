import path from 'path';
import multer from 'multer';
import { v4 } from 'uuid';

// multer image uploader

function getTargetImageStorage(addres: any) {
	return multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, `./uploads/${addres}`);
		},
		filename: function (req, file, cb) {
			const extension = path.parse(file.originalname).ext;
			const random_name = v4() + extension;
			cb(null, random_name);
		},
	});
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function imageFileFilter(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
	if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'));
	}
}

const makeUploader = (address: string) => {
	const storage = getTargetImageStorage(address);
	return multer({
		storage: storage,
		fileFilter: imageFileFilter,
		limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	});
};

export default makeUploader;

/*
const product_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/products');
  },
  filename: function (req, file, cb) {
  console.log(file);
  const extension = path.parse(file.originalname).ext;
  const random_name = v4() + extension;
  cb(null, random_name);
  },
});

export const uploadProductImage = multer({storage: product_storage});

*/
