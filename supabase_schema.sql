-- Supprimer les tables si elles existent déjà (pour pouvoir relancer le script)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 1. Catégories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 100
);

-- 2. Produits
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  old_price INTEGER,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  badge TEXT,
  material TEXT,
  care TEXT,
  style TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Images des produits
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  color TEXT,
  is_main BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- 4. Variantes (Stock précis par taille/couleur)
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  stock INTEGER DEFAULT 0,
  UNIQUE(product_id, color, size)
);

-- 5. Commandes clients
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  bureau_stopdesk TEXT,
  status TEXT DEFAULT 'nouvelle', -- nouvelle, expédiée, livrée, annulée
  items_total INTEGER NOT NULL,
  delivery_cost INTEGER NOT NULL,
  order_total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Lignes de commande (articles achetés)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_info TEXT NOT NULL, -- ex: "Noir - M"
  quantity INTEGER NOT NULL,
  price_at_time INTEGER NOT NULL
);

-- ========== SECURITE (Row Level Security) ==========

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Lecture publique (Tout le monde peut voir le catalogue)
CREATE POLICY "Catalogue public" ON categories FOR SELECT USING (true);
CREATE POLICY "Produits actifs publics" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Images publiques" ON product_images FOR SELECT USING (true);
CREATE POLICY "Stocks publics" ON product_variants FOR SELECT USING (true);

-- Les clients peuvent créer des commandes (mais pas les lire)
CREATE POLICY "Insertion commandes" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Insertion items" ON order_items FOR INSERT WITH CHECK (true);

-- Le rôle Administrateur (Toi) a tous les droits
-- (Ce sera géré par le statut Authentifié du Dashboard plus tard, 
--  en attendant la clé Service Role passe outre ces règles).

-- ========== BUCKET POUR LES PHOTOS ==========
-- Crée un dossier public "products" pour uploader les photos
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Images publiques" ON storage.objects FOR SELECT USING (bucket_id = 'products');
