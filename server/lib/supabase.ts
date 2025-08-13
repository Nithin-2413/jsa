import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable must be set");
}

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  'https://mcjvcjemyvwgrmiotihq.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Client-side config (for frontend)
export const supabaseConfig = {
  url: 'https://mcjvcjemyvwgrmiotihq.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};