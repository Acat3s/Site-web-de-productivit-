import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://thppgtwjjnrlevnwergb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHBndHdqam5ybGV2bndlcmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3OTY1NDEsImV4cCI6MjA1NTM3MjU0MX0.1coSAD46iOwT4m3kMOvC7biSA9XDquXt0FqvLyKd5dk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
