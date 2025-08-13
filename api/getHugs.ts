import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../shared/constants';

// Initialize Supabase client
const supabaseAdmin = createClient(
	SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === 'OPTIONS') {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		return res.status(204).end();
	}

	if (req.method !== 'GET') {
		return res.status(405).json({ success: false, message: 'Method not allowed' });
	}

	try {
		const { data: hugs, error } = await supabaseAdmin
			.from('written hug')
			.select('*')
			.order('Date', { ascending: false });

		if (error) throw error;

		res.setHeader('Access-Control-Allow-Origin', '*');
		return res.json({ success: true, hugs });
	} catch (error: any) {
		console.error('Get hugs error:', error);
		res.status(500).json({ 
			success: false, 
			message: error instanceof Error ? error.message : 'Failed to fetch hugs' 
		});
	}
}