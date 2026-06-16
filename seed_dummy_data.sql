-- 1. Nettoyer les anciennes données (Optionnel, mais utile pour un nouveau départ propre)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM product_variants;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;

-- 2. Créer les Catégories
INSERT INTO categories (id, name, slug, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'T-shirts', 'tshirts', 1),
  ('22222222-2222-2222-2222-222222222222', 'Chemises', 'chemises', 2),
  ('33333333-3333-3333-3333-333333333333', 'Pantalons en lin', 'pantalons-lin', 3),
  ('44444444-4444-4444-4444-444444444444', 'Bobs', 'bobs', 4);

-- 3. Créer les Produits
INSERT INTO products (id, name, slug, description, price, category_id, featured, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'T-shirt Basique Premium', 'tshirt-basique', 'T-shirt 100% coton, coupe parfaite.', 3500, '11111111-1111-1111-1111-111111111111', true, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'T-shirt Casablanca', 'tshirt-casa', 'T-shirt motif imprimé Casablanca.', 4500, '11111111-1111-1111-1111-111111111111', true, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Chemise Classique', 'chemise', 'Chemise coupe cintrée.', 6500, '22222222-2222-2222-2222-222222222222', true, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Pantalon en Lin', 'pantalon-lin', 'Pantalon été fluide et léger.', 7000, '33333333-3333-3333-3333-333333333333', true, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Bob Jacquemus', 'bob-jacquemus', 'Bob élégant design Jacquemus.', 2500, '44444444-4444-4444-4444-444444444444', false, true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'T-shirt Col V', 'tshirt-col-v', 'T-shirt col en V.', 3500, '11111111-1111-1111-1111-111111111111', false, true);

-- 4. Assigner les Images (en utilisant les images locales du dossier public/images)
INSERT INTO product_images (product_id, url, is_main) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '/images/photo_1_2026-06-02_20-42-37.jpg', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '/images/photo_2_2026-06-02_20-42-37.jpg', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '/images/photo_1_2026-06-02_20-50-06.jpg', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '/images/photo_3_2026-06-02_20-42-37.jpg', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '/images/photo_4_2026-06-02_20-42-37.jpg', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '/images/photo_5_2026-06-02_20-42-37.jpg', true);

-- 5. Assigner le Stock et les Tailles
INSERT INTO product_variants (product_id, color, size, stock) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Noir', 'M', 10),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Noir', 'L', 15),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Blanc', 'M', 5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Blanc', 'L', 8),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bleu', 'S', 3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bleu', 'M', 10),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Beige', '38', 12),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Beige', '40', 8),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Beige', 'Unique', 20),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Gris', 'M', 25);
