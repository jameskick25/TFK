export const CLOTHES_SLUGS = [
  'tshirts',
  'chemises',
  'pantalons-lin',
  'bobs',
  'pulls',
  'robes',
  'jeans',
  'vestes',
  'ensembles',
  'vetements',
  'pantalon-lin',
  'tshirt-casa',
  'tshirt-basique'
];

export const ACCESSORIES_SLUGS = [
  'coques',
  'coques-telephone',
  'chargeurs',
  'ecouteurs',
  'supports',
  'cables',
  'protecteurs-ecran',
  'accessoires-telephone',
  'accessoires'
];

export function isAccessoriesCategory(categorySlug: string): boolean {
  if (!categorySlug) return false;
  const normalized = categorySlug.toLowerCase().trim();
  return ACCESSORIES_SLUGS.some(slug => normalized.includes(slug) || slug.includes(normalized));
}

export function getSectionForCategory(categorySlug: string): 'clothes' | 'accessories' {
  return isAccessoriesCategory(categorySlug) ? 'accessories' : 'clothes';
}
