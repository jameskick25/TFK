export const CLOTHES_SLUGS = [
  'tshirts',
  'chemises',
  'pantalons-lin',
  'pulls',
  'robes',
  'jeans',
  'vestes',
  'ensembles',
  'vetements',
  'pantalon-lin',
  'tshirt-casa',
  'tshirt-basique',
  'sweat',
  'sweatshirt',
  'hoodie',
  'polo',
  'manteau',
  'costume',
  'short',
  'bermuda',
  'jogging',
  'survetement'
];

export const ACCESSORIES_SLUGS = [
  // Termes généraux
  'accessoire',
  'accessoires',
  'accecoire',
  'accecoires',
  'accessory',
  'accessories',
  
  // Téléphone & Tech
  'coque',
  'coques',
  'coque-telephone',
  'coques-telephone',
  'chargeur',
  'chargeurs',
  'ecouteur',
  'ecouteurs',
  'casque',
  'casques',
  'airpod',
  'airpods',
  'support',
  'supports',
  'support-telephone',
  'cable',
  'cables',
  'protecteur',
  'protecteurs',
  'protecteurs-ecran',
  'film-protecteur',
  'powerbank',
  'batterie-externe',
  
  // Mode & Maroquinerie & Bijouterie
  'montre',
  'montres',
  'watch',
  'watches',
  'sac',
  'sacs',
  'sacoche',
  'sacoches',
  'bag',
  'bags',
  'backpack',
  'pochette',
  'pochettes',
  'portefeuille',
  'portefeuilles',
  'porte-monnaie',
  'wallet',
  'porte-carte',
  'porte-cartes',
  'porte-cle',
  'porte-cles',
  'keychain',
  'lunette',
  'lunettes',
  'sunglasses',
  'glasses',
  'casquette',
  'casquettes',
  'cap',
  'caps',
  'chapeau',
  'chapeaux',
  'bonnet',
  'bonnets',
  'bob',
  'bobs',
  'ceinture',
  'ceintures',
  'belt',
  'belts',
  'bijou',
  'bijoux',
  'jewelry',
  'jewellery',
  'bracelet',
  'bracelets',
  'collier',
  'colliers',
  'necklace',
  'bague',
  'bagues',
  'ring',
  'rings',
  'boucle',
  'boucles',
  'foulard',
  'foulards',
  'echarpe',
  'echarpes',
  'scarf',
  'gant',
  'gants',
  'cravate',
  'cravates',
  'noeud-papillon',
  'parfum',
  'parfums'
];

export function isAccessoriesCategory(categorySlug: string): boolean {
  if (!categorySlug) return false;
  const normalized = categorySlug.toLowerCase().trim();

  // 1. Préfixe explicite de section
  if (normalized.startsWith('acc--') || normalized.includes('--acc--') || normalized.startsWith('accessoires-') || normalized.startsWith('accessoire-')) {
    return true;
  }
  if (normalized.startsWith('cloth--') || normalized.includes('--cloth--')) {
    return false;
  }

  // 2. Vérification par mots-clés
  return ACCESSORIES_SLUGS.some(slug => normalized.includes(slug) || slug.includes(normalized));
}

export function getSectionForCategory(categorySlug: string): 'clothes' | 'accessories' {
  return isAccessoriesCategory(categorySlug) ? 'accessories' : 'clothes';
}

