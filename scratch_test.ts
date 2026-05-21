import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

async function tryUpdateBucket() {
  console.log('--- Attempting to update bucket settings via REST ---');
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/bucket/bag-management`, {
      method: 'PUT',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'bag-management',
        name: 'bag-management',
        public: true,
        allowed_mime_types: null // Allow all MIME types (or we can specify them)
      })
    });
    console.log('Update Bucket Status:', res.status, res.statusText);
    const json = await res.json();
    console.log('Update Bucket Response:', json);
  } catch (err) {
    console.error('Exception during updateBucket:', err);
  }
}

tryUpdateBucket();
