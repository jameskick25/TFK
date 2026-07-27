-- ══════════════════════════════════════════════════════════════
--  REQUIRED TABLE: product_images
-- ══════════════════════════════════════════════════════════════
--  
--  This table stores image URLs for products.
--  Each image belongs to a product and optionally has a color.
--  The optimization system reads/writes to this table.
--
--  Prerequisites:
--    - A "products" table with at least: id (UUID PK), name (TEXT)
--    - The products table must exist before running this script
-- ══════════════════════════════════════════════════════════════

-- Create the product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  color TEXT,                        -- Optional: color name for this image variant
  is_main BOOLEAN DEFAULT false,     -- Is this the main/primary product image?
  display_order INTEGER DEFAULT 0    -- For ordering images in a gallery
);

-- Enable Row Level Security
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access (images need to be visible to everyone)
CREATE POLICY "Images publiques" ON product_images 
  FOR SELECT USING (true);

-- NOTE: Write operations (INSERT, UPDATE, DELETE) are handled by the
-- Service Role Key in server actions, which bypasses RLS entirely.
-- No additional write policies are needed for admin operations.
