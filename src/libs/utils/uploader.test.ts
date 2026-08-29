describe('makeUploader', () => {
	const originalNodeEnv = process.env.NODE_ENV;

	afterEach(() => {
		process.env.NODE_ENV = originalNodeEnv;
		jest.resetModules();
	});

	it('uses local disk storage in development (does not touch S3)', async () => {
		process.env.NODE_ENV = 'development';
		jest.resetModules();
		const makeUploader = (await import('./uploader')).default;

		const uploader = makeUploader('products');

		// multer's built-in disk storage engine is an instance of the (unexported)
		// DiskStorage class; confirming that name here proves we took the local
		// disk-storage code path instead of the multer-s3 one, without needing to
		// touch S3 at all.
		expect((uploader as any).storage.constructor.name).toBe('DiskStorage');
	});

	it('switches to S3 storage in production without requiring AWS credentials at construction time', async () => {
		process.env.NODE_ENV = 'production';
		process.env.S3_BUCKET_NAME = 'nonik-uploads-205930613434';
		process.env.AWS_REGION = 'ap-northeast-2';
		jest.resetModules();
		const makeUploader = (await import('./uploader')).default;

		expect(() => makeUploader('products')).not.toThrow();
	});
});
