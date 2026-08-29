import path from 'path';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 } from 'uuid';

// multer image uploader

// In production, uploads go straight to S3 (bucket configured via S3_BUCKET_NAME,
// e.g. "nonik-uploads-205930613434"). Auth relies on the EC2 instance's IAM role
// (default AWS SDK credential provider chain) — no static access keys here.
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-northeast-2' });

function getTargetImageStorage(addres: any) {
	if (process.env.NODE_ENV === 'production') {
		return multerS3({
			s3: s3Client,
			bucket: process.env.S3_BUCKET_NAME as string,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			key: function (req, file, cb) {
				const extension = path.parse(file.originalname).ext;
				const random_name = v4() + extension;
				cb(null, `uploads/${addres}/${random_name}`);
			},
		});
	}

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
