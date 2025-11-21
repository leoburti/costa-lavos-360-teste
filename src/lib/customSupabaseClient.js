import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnllgjrgddyuqzddkhfo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubGxnanJnZGR5dXF6ZGRraGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjYxMjMsImV4cCI6MjA3MTgwMjEyM30.b9vsWxYc62r4bd960tW0pgfGyMaz1H024XFfPvdzoDc';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
