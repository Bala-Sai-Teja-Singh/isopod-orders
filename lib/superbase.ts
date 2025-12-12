// lib/supabase.ts
// This file creates a Supabase client that we'll use throughout the app
// to communicate with our database

import { createClient } from '@supabase/supabase-js';

// Get the URL and API key from environment variables
// These are stored in .env.local file and kept secret
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export the Supabase client
// This client is used to make database queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
