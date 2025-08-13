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
		const { hugid } = req.query as { hugid?: string };
		
		if (!hugid) {
			return res.status(400).json({ success: false, message: 'hugid required' });
		}

		// Get the hug
		const { data: hug, error: hugError } = await supabaseAdmin
			.from('written hug')
			.select('*')
			.eq('id', hugid)
			.single();

		if (hugError) throw hugError;

		// Get replies (note: table name has space)
		const { data: replies, error: repliesError } = await supabaseAdmin
			.from('hug replies')
			.select('*')
			.eq('hugid', hugid)
			.order('created_at', { ascending: true });

		if (repliesError) throw repliesError;

		res.setHeader('Access-Control-Allow-Origin', '*');
		return res.json({ success: true, hug, replies });
	} catch (error: any) {
		console.error('Get conversation error:', error);
		res.status(500).json({ 
			success: false, 
			message: error instanceof Error ? error.message : 'Failed to fetch conversation' 
		});
	}
}