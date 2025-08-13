import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

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
    
    // Simple hardcoded admin credentials
    if (username === 'SonuHoney' && password === 'Chipmunk@15#') {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Login failed' 
    });
  }
}