import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../../shared/constants';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable must be set");
}

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Client-side config (for frontend)
export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};