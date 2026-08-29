import express from 'express';

/** RATE LIMITING **/
interface RateLimiterOptions {
	windowMs: number;
	max: number;
	message: string;
}

export function createRateLimiter(options: RateLimiterOptions) {
	const attempts = new Map<string, { count: number; resetAt: number }>();

	return function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
		const key = req.ip ?? 'unknown';
		const now = Date.now();
		const entry = attempts.get(key);

		if (!entry || entry.resetAt < now) {
			attempts.set(key, { count: 1, resetAt: now + options.windowMs });
			next();
			return;
		}

		if (entry.count >= options.max) {
			res.status(429).json({ message: options.message });
			return;
		}

		entry.count += 1;
		next();
	};
}

export default createRateLimiter;
