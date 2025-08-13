import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { signJwt } from '../shared/auth';

const adminLoginSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ success: false, message: 'Method not allowed' });
	}

	try {
		const { username, password } = adminLoginSchema.parse(req.body);
		
		const expectedUser = process.env.ADMIN_USERNAME || '';
		const expectedPass = process.env.ADMIN_PASSWORD || '';
		if (!expectedUser || !expectedPass) {
			return res.status(500).json({ success: false, message: 'Admin credentials not configured' });
		}

		if (username === expectedUser && password === expectedPass) {
			const token = signJwt({ sub: username });
			res.json({ success: true, message: 'Login successful', token });
		} else {
			res.status(401).json({ success: false, message: 'Invalid credentials' });
		}
	} catch (error: any) {
		console.error('Admin login error:', error);
		res.status(400).json({ 
			success: false, 
			message: error instanceof Error ? error.message : 'Login failed' 
		});
	}
}