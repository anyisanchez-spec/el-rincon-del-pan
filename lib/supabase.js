import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzrqgpbhffwlxckrxfsj.supabase.co';
const supabaseAnonKey = 'sb_publishable_f8j5o1aENfaYIRBfBERt8g_P3Q8Pqc-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);