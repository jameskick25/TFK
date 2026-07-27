-- ══════════════════════════════════════════════════════════════
--  REQUIRED: Supabase Storage Bucket Setup
-- ══════════════════════════════════════════════════════════════
--  
--  Creates a public storage bucket called "products" for storing
--  product images. The bucket must be PUBLIC so images can be
--  displayed without authentication tokens.
--
--  Run this in the Supabase SQL Editor or via migrations.
-- ══════════════════════════════════════════════════════════════

-- Create the storage bucket (public = true so images are publicly accessible)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT DO NOTHING;

-- Allow public read access to all files in the bucket
CREATE POLICY "Images publiques" ON storage.objects 
  FOR SELECT USING (bucket_id = 'products');

-- ══════════════════════════════════════════════════════════════
--  NOTE ON UPLOAD PERMISSIONS
-- ══════════════════════════════════════════════════════════════
--  
--  The optimization system uploads files using the Service Role Key
--  via native HTTPS (not the Supabase JS client). The Service Role Key
--  bypasses ALL RLS policies, so no INSERT/UPDATE policies are needed
--  on storage.objects for admin uploads.
--
--  If you also want authenticated users to upload directly (e.g., from
--  a client-side form), you would need additional policies like:
--
--  CREATE POLICY "Authenticated uploads" ON storage.objects 
--    FOR INSERT WITH CHECK (
--      bucket_id = 'products' AND auth.role() = 'authenticated'
--    );
-- ══════════════════════════════════════════════════════════════
