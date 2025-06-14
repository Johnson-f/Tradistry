import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = "https://xzzpqryqndcfrwltlfpj.supabase.co";
const supabaseKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6enBxcnlxbmRjZnJ3bHRsZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDYwODEsImV4cCI6MjA2NDg4MjA4MX0.xc6dyc7ThqoV0wxkpPXs04t4rUvvL593FA1DR6LTZq4";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    global: {
        headers: {
            // Add any global headers here
            'X-Client-Info': 'supabase-js-client',
        },
    },
});

/* The realtime option is not part of the createClient configuration in the @supabase/supabase-js library. Supabase handles 
realtime functionality internally,
 and you can use the supabase.channel API for realtime subscriptions.*/


 /* const channel = supabase.channel('my_channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'my_table' }, (payload) => {
    console.log('Realtime event received:', payload);
  })
  .subscribe();*/