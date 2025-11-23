import { RESEND_SUPABASE_ANON_KEY, RESEND_SUPABASE_URL } from "@/config/secrets";
import { createClient } from "@supabase/supabase-js";

export const resend = createClient(RESEND_SUPABASE_URL, RESEND_SUPABASE_ANON_KEY);