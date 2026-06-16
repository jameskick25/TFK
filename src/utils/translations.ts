export const translations = {
  fr: {
    // Navigation
    home: "Accueil",
    products: "Produits",
    about: "À propos",
    delivery_returns: "Livraison & Retours",
    size_guide: "Guide des tailles",
    faq: "FAQ",
    contact: "Contactez-nous",
    language: "Langue",
    
    // Actions
    order: "Commander",
    add_to_cart: "Ajoutez au panier 🛍️",
    choose_options: "Choisir les options",
    filter_category: "Filtrer par catégorie",
    all: "Tous",
    showing_products: "Affichage de",
    products_count: "produit(s)",
    no_products: "Aucun produit dans cette catégorie.",
    added: "✓ Ajouté !",
    out_of_stock: "Rupture",
    loading: "⏳ Chargement en cours...",
    
    // Product Page
    quantity: "Quantité :",
    sizes_colors: "Pointures & Tailles :",
    article: "Article",
    color: "Couleurs :",
    size: "Tailles :",
    
    // Checkout Form
    form_title: "أدخل معلوماتك أسفله للطلب", // keeping it in Arabic since the user wrote it manually, but we should make it toggleable
    form_title_fr: "Entrez vos informations ci-dessous pour commander",
    fullname: "Nom et prénom",
    phone: "Téléphone",
    select_wilaya: "Sélectionner une Wilaya",
    home_delivery: "🏠 À domicile",
    desk_delivery: "🏢 Bureau NOEST",
    select_commune: "Sélectionner une Commune",
    select_desk: "Sélectionner un Bureau NOEST",
    address: "Adresse complète",
    articles: "Articles",
    delivery: "Livraison",
    total_to_pay: "Total à payer",
    currency: "DA",
    currency_ar: "دج",
    
    // Cart & Checkout
    cart: "Panier",
    total: "Total",
    checkout: "Valider la commande",
    empty_cart: "Votre panier est vide",
    explore_catalog: "Explorer le catalogue",
    subtotal: "Sous-total",
    view_cart_checkout: "Voir le panier & Commander",
    
    // Footer
    delivery_everywhere: "Livraison dans toutes les wilayas — Paiement à la livraison",
    rights: "Tous droits réservés."
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    products: "المنتجات",
    about: "من نحن",
    delivery_returns: "التوصيل والاسترجاع",
    size_guide: "دليل المقاسات",
    faq: "الأسئلة الشائعة",
    contact: "اتصل بنا",
    language: "اللغة",
    
    // Actions
    order: "اطلب الآن",
    add_to_cart: "أضف إلى السلة 🛍️",
    choose_options: "اختر الخيارات",
    filter_category: "تصفية حسب الفئة",
    all: "الكل",
    showing_products: "عرض",
    products_count: "منتج",
    no_products: "لا توجد منتجات في هذه الفئة.",
    added: "✓ تم الإضافة !",
    out_of_stock: "نفدت الكمية",
    loading: "⏳ جاري التحميل...",
    
    // Product Page
    quantity: "الكمية:",
    sizes_colors: "المقاسات والألوان:",
    article: "القطعة",
    color: "الألوان:",
    size: "المقاسات:",
    
    // Checkout Form
    form_title: "أدخل معلوماتك أسفله للطلب",
    form_title_fr: "أدخل معلوماتك أسفله للطلب",
    fullname: "الاسم واللقب",
    phone: "رقم الهاتف",
    select_wilaya: "اختر الولاية",
    home_delivery: "🏠 إلى المنزل",
    desk_delivery: "🏢 مكتب نويست",
    select_commune: "اختر البلدية",
    select_desk: "اختر مكتب نويست",
    address: "العنوان الكامل",
    articles: "المنتجات",
    delivery: "التوصيل",
    total_to_pay: "المبلغ الإجمالي",
    currency: "DA",
    currency_ar: "دج",
    
    // Cart & Checkout
    cart: "السلة",
    total: "المجموع",
    checkout: "تأكيد الطلب",
    empty_cart: "سلتك فارغة",
    explore_catalog: "استكشف المنتجات",
    subtotal: "المجموع الفرعي",
    view_cart_checkout: "عرض السلة وإتمام الطلب",
    
    // Footer
    delivery_everywhere: "التوصيل لجميع الولايات — الدفع عند الاستلام",
    rights: "جميع الحقوق محفوظة."
  }
};

export type TranslationKey = keyof typeof translations.fr;

export function useTranslation(lang: 'fr' | 'ar') {
  return (key: TranslationKey) => translations[lang][key];
}
