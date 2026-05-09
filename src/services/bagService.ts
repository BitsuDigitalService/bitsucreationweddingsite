/**
 * SUPABASE SETUP SQL:
 * 
 * -- 1. Create a public bucket named 'bag-management' in Storage dashboard.
 * 
 * -- 2. Create tables:
 * CREATE TABLE IF NOT EXISTS tag_templates (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
 *   name TEXT,
 *   front_url TEXT,
 *   back_url TEXT
 * );
 * 
 * CREATE TABLE IF NOT EXISTS tag_layouts (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
 *   template_id UUID REFERENCES tag_templates(id),
 *   name TEXT UNIQUE,
 *   front_config JSONB,
 *   back_config JSONB
 * );
 * 
 * -- 3. Enable RLS or add policies (Simplest for demo):
 * ALTER TABLE tag_templates DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE tag_layouts DISABLE ROW LEVEL SECURITY;
 * 
 * -- For Storage bucket 'bag-management', add these policies:
 * -- 1. Policy Name: "Public Select" | Allowed operations: SELECT | Target: All Users
 * -- 2. Policy Name: "Public Insert" | Allowed operations: INSERT | Target: All Users
 */

import { getSupabase } from '../lib/supabase';
import { WeddingBag, BagStatus } from '../types';

export const bagService = {
  async getBagByCode(code: string): Promise<WeddingBag | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('bags')
      .select('*')
      .eq('unique_tag_code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Expected: bag doesn't exist
        return null;
      }
      
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        const msg = 'Supabase Permission Error on "bags": RLS is blocking this read.';
        console.error(msg);
        throw new Error(msg);
      } else {
        console.error('Error fetching bag:', error);
        throw new Error(`Database Error: ${error.message || JSON.stringify(error)}`);
      }
    }

    return data;
  },

  async registerBag(bag: Omit<WeddingBag, 'id' | 'created_at' | 'updated_at' | 'bag_status' | 'print_status' | 'scan_count'>): Promise<WeddingBag | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase is not configured. Please check your environment variables.");

    const { data, error } = await supabase
      .from('bags')
      .insert([
        {
          ...bag,
          bag_status: 'active',
          print_status: 'pending',
          scan_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        const msg = 'Supabase Permission Error on "bags": RLS is blocking this insert. Please ensure "bags" table has an "INSERT" policy enabled.';
        console.error(msg);
        throw new Error(msg);
      } else {
        console.error('Error registering bag:', error);
        throw new Error(`Database Error: ${error.message || JSON.stringify(error)}`);
      }
    }

    return data ? data[0] : null;
  },

  async updateBagStatus(id: string, status: BagStatus): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const updateData: any = {
      bag_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'collected') {
      updateData.collected_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('bags')
      .update(updateData)
      .eq('id', id);

    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        const msg = 'Supabase Permission Error on "bags": RLS is blocking this update. Please check policies.';
        console.error(msg);
        throw new Error(msg);
      } else {
        console.error('Error updating bag status:', error);
        return false;
      }
    }

    return true;
  },

  async deleteBag(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from('bags')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        console.error('Supabase Permission Error on "bags": RLS is blocking this delete. Please check policies.');
      } else {
        console.error('Error deleting bag:', error);
      }
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('Delete operation succeeded but no rows were affected. This is typically caused by Row Level Security (RLS) policies blocking the DELETE operation silently.');
      alert('Failed to delete bag: Database Row Level Security (RLS) prevented the deletion. Please contact the administrator or check your Supabase policies.');
      return false;
    }
    
    return true;
  },

  async incrementScanCount(code: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    const bag = await this.getBagByCode(code);
    if (!bag) return;

    const { error } = await supabase
      .from('bags')
      .update({ 
        scan_count: (bag.scan_count || 0) + 1, 
        last_scanned_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      })
      .eq('id', bag.id);
    
    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        console.error('Supabase Permission Error on "bags": RLS is blocking scan count update.');
      } else {
        console.error('Error incrementing scan count:', error);
      }
    }
  },

  async updatePrintStatus(id: string, status: 'pending' | 'printed'): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('bags')
      .update({ print_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        console.error('Supabase Permission Error on "bags": RLS is blocking print status update.');
      } else {
        console.error('Error updating print status:', error);
      }
    }
  },

  async saveTagTemplate(template: { name: string, front_url: string, back_url: string }): Promise<any> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('tag_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        const msg = 'Supabase Permission Error on "tag_templates": RLS is blocking this operation. Please run the SQL in SUPABASE_SCHEMA.sql.';
        console.error(msg);
        throw new Error(msg);
      } else {
        console.error('Error saving template:', error);
        return null;
      }
    }
    return data;
  },

  async deleteTagTemplate(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    // First delete associated layouts
    const { error: layoutError } = await supabase
      .from('tag_layouts')
      .delete()
      .eq('template_id', id);

    if (layoutError) {
      console.error('Error deleting layouts:', layoutError);
      return false;
    }

    // Then delete the template
    const { error: templateError } = await supabase
      .from('tag_templates')
      .delete()
      .eq('id', id);

    if (templateError) {
      console.error('Error deleting template:', templateError);
      return false;
    }

    return true;
  },

  async saveTagLayout(layout: { template_id: string, name: string, front_config: any, back_config: any }): Promise<any> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('tag_layouts')
      .upsert([layout], { onConflict: 'name' })
      .select()
      .single();

    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        const msg = 'Supabase Permission Error on "tag_layouts": RLS is blocking this operation. Please ensure table has a policy allowing ALL.';
        console.error(msg);
        throw new Error(msg);
      } else {
        console.error('Error saving layout:', error);
        return null;
      }
    }
    return data;
  },

  async getTagTemplates(): Promise<any[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('tag_templates')
      .select('*, tag_layouts(*)');

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
    return (data || []).map(tpl => ({
      ...tpl,
      layout: tpl.tag_layouts?.[0] || null
    }));
  },

  async getNextTagNumber(): Promise<number> {
    const supabase = getSupabase();
    if (!supabase) return 100;

    // We can use the count of bags or a dedicated settings table
    // For simplicity and reliability, we check the highest tag number in 'bags'
    const { data, error } = await supabase
      .from('bags')
      .select('unique_tag_code')
      .order('unique_tag_code', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 100;
    }

    const lastCode = data[0].unique_tag_code;
    const lastNum = parseInt(lastCode.replace(/^\D+/g, ''));
    return isNaN(lastNum) ? 100 : lastNum + 1;
  },

  async getAllBags(): Promise<WeddingBag[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('bags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const isPermissionError = error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied');
      if (isPermissionError) {
        const msg = 'Supabase Permission Error on "bags": RLS is blocking this read. Please ensure "bags" table has an "Enable all access" policy.';
        console.error(msg);
        throw new Error(msg);
      } else {
        console.error('Error listing bags:', error);
        return [];
      }
    }

    return data || [];
  },

  async uploadBagImage(file: File): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `bag-images/${fileName}`;

    const bucketName = 'bag-management';

    // Try to ensure bucket exists (ignore errors if creator doesn't have permission)
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg'],
        });
      }
    } catch (e) {
      // Ignored - bucket might already exist or permission denied
    }

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        console.warn('Storage bucket "bag-management" not found. Falling back to local preview. Please create it in Supabase and set to "Public".');
      } else if (uploadError.message.toLowerCase().includes('row-level security') || uploadError.message.toLowerCase().includes('policy') || uploadError.message.toLowerCase().includes('permission denied')) {
        const errorMsg = 'Supabase Storage Permission Error: RLS is blocking the upload to "bag-management". Ensure the bucket is Public and has INSERT/SELECT policies.';
        console.error(errorMsg);
        const customError = new Error(errorMsg);
        (customError as any).isRlsError = true;
        throw customError;
      } else {
        console.error('Error uploading image:', uploadError);
      }
      return URL.createObjectURL(file); 
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadImageAndUpdateBag(bagId: string, file: File): Promise<void> {
    try {
      const publicUrl = await this.uploadBagImage(file);
      if (publicUrl && !publicUrl.startsWith('blob:')) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase
            .from('bags')
            .update({ bag_image: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', bagId);
        }
      }
    } catch (e) {
      console.error('Background upload failed:', e);
    }
  }
};
