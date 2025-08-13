import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../../../shared/constants';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);