import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  monthly_credits: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  topic: string;
  target_audience: string | null;
  tone: string | null;
  keywords: string[] | null;
  status: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiUsage {
  id: string;
  user_id: string;
  tokens_used: number;
  cost: number;
  model: string;
  created_at: string;
}
