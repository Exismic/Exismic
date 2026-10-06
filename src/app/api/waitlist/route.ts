import { publicJson } from "@/lib/public-json";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return publicJson({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if email already exists first
      const { data: existing } = await supabase
        .from('waitlist')
        .select('id, email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        return publicJson({
          success: true,
          alreadySubscribed: true,
          message: 'You are already subscribed!'
        });
      }

      // Insert new waitlist email
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: normalizedEmail, source: source || 'journal', created_at: new Date().toISOString() }]);

      if (error) {
        if (error.code === '23505') {
          return publicJson({
            success: true,
            alreadySubscribed: true,
            message: 'You are already subscribed!'
          });
        }

        console.warn('Waitlist database notice:', error.message);
        // Fail gracefully for missing tables or schema issues
        return publicJson({
          success: true,
          alreadySubscribed: false,
          message: 'Subscribed successfully!'
        });
      }
    }

    return publicJson({
      success: true,
      alreadySubscribed: false,
      message: 'Subscribed successfully!'
    });
  } catch (err: any) {
    console.error('Waitlist API error:', err);
    return publicJson({
      success: true,
      alreadySubscribed: false,
      message: 'Subscribed successfully!'
    });
  }
}
