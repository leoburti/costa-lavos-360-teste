// NOTE: Create this file only if it does not exist

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// The Deno required headers are automatically handled by the Supabase Edge Functions runtime.
// You do not need to manually pass the `Authorization` and `X-Supabase-Service-Role-Key` headers.
export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);