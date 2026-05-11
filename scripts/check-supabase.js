const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'syedrayangames@gmail.com';
  console.log(`Checking Supabase for email: ${email}`);
  
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('User data from Supabase Client:', JSON.stringify(data, null, 2));
  }
}

main();
