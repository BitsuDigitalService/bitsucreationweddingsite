import dotenv from 'dotenv';
dotenv.config();

global.WebSocket = class {};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'video/mp4'
];

async function testMimeTypes() {
  const dummyBuffer = Buffer.from('dummy content');
  
  for (const mime of mimeTypes) {
    const ext = mime.split('/')[1].replace('+xml', '');
    const fileName = `test-${Date.now()}.${ext}`;
    const filePath = `gallery/test_folder/${fileName}`;
    
    console.log(`Trying ${mime}...`);
    try {
      const { data, error } = await supabase.storage
        .from('bag-management')
        .upload(filePath, dummyBuffer, {
          contentType: mime,
          upsert: true
        });
      if (error) {
        console.log(`  -> Error: ${error.message} (${error.statusCode || error.status})`);
      } else {
        console.log(`  -> SUCCESS! Uploaded to ${data.path}`);
        // Cleanup
        await supabase.storage.from('bag-management').remove([filePath]);
      }
    } catch (e) {
      console.log(`  -> Exception: ${e.message}`);
    }
  }
}

testMimeTypes();
