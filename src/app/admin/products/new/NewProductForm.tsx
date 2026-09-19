'use client';

import { useState } from 'react';
import { createProduct } from '@/app/actions/admin';
import { getSectionForCategory } from '@/utils/sections';

type SizeVariant = {
  size: string;
  stock: number;
};

type ColorVariant = {
  id: string; // for internal tracking
  colorName: string;
  image: File | null;
  sizes: SizeVariant[];
};

const compressImage = async (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function NewProductForm({ categories }: { categories: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultSizes: SizeVariant[] = [
    { size: 'S', stock: 10 },
    { size: 'M', stock: 10 },
    { size: 'L', stock: 10 },
    { size: 'XL', stock: 10 }
  ];

  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
    { id: '1', colorName: '', image: null, sizes: defaultSizes }
  ]);

  const addColorVariant = () => {
    setColorVariants([...colorVariants, { id: Date.now().toString(), colorName: '', image: null, sizes: defaultSizes }]);
  };

  const removeColorVariant = (id: string) => {
    setColorVariants(colorVariants.filter(v => v.id !== id));
  };

  const updateColorVariant = (id: string, field: keyof ColorVariant, value: any) => {
    setColorVariants(colorVariants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addSize = (colorId: string) => {
    setColorVariants(colorVariants.map(v => {
      if (v.id === colorId) {
        return { ...v, sizes: [...v.sizes, { size: '', stock: 10 }] };
      }
      return v;
    }));
  };

  const removeSize = (colorId: string, index: number) => {
    setColorVariants(colorVariants.map(v => {
      if (v.id === colorId) {
        const newSizes = [...v.sizes];
        newSizes.splice(index, 1);
        return { ...v, sizes: newSizes };
      }
      return v;
    }));
  };

  const updateSize = (colorId: string, index: number, field: keyof SizeVariant, value: any) => {
    setColorVariants(colorVariants.map(v => {
      if (v.id === colorId) {
        const newSizes = [...v.sizes];
        newSizes[index] = { ...newSizes[index], [field]: value };
        return { ...v, sizes: newSizes };
      }
      return v;
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Add the complex structure as a string
    const variantsData = colorVariants.map(v => ({
      color: v.colorName,
      sizes: v.sizes
    }));
    formData.append('variantsData', JSON.stringify(variantsData));

    // Append all images
    for (const v of colorVariants) {
      if (v.image && v.colorName) {
        try {
          const compressed = await compressImage(v.image);
          formData.append(`image_${v.colorName}`, compressed);
        } catch (e) {
          // Fallback if compression fails
          formData.append(`image_${v.colorName}`, v.image);
        }
      }
    }

    try {
      const result = await createProduct(formData);
      if (result && result.success) {
        window.location.href = '/admin/products';
      } else {
        setIsSubmitting(false);
        alert('Erreur: ' + (result?.error || 'Veuillez remplir tous les champs obligatoires.'));
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Une erreur est survenue (peut-être l\'image est trop volumineuse).');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid #e4e4e7',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: '40px'
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Nom du produit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
            Nom du produit *
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Ex: T-Shirt Oversize Signature Noir"
            style={{
              padding: '11px 14px',
              borderRadius: '8px',
              border: '1px solid #d4d4d8',
              fontSize: '1rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Détails du produit, coupe, conseils d'entretien..."
            style={{
              padding: '11px 14px',
              borderRadius: '8px',
              border: '1px solid #d4d4d8',
              fontSize: '0.95rem',
              outline: 'none',
              backgroundColor: '#ffffff',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Prix, Ancien Prix, Catégorie */}
        <div className="admin-form-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
              Prix de vente (DZD) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              placeholder="3500"
              style={{
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #d4d4d8',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
              Ancien Prix (DZD) <span style={{ color: '#a1a1aa', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              type="number"
              name="old_price"
              min="0"
              placeholder="4500"
              style={{
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #d4d4d8',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
              Catégorie *
            </label>
            <select
              name="category_id"
              required
              style={{
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #d4d4d8',
                fontSize: '0.95rem',
                outline: 'none',
                backgroundColor: '#ffffff',
                height: '46px'
              }}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({getSectionForCategory(cat.slug) === 'accessories' ? 'Accessoires' : 'Vêtements'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Variants Section */}
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fafafa',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            marginTop: '8px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>
              Couleurs, Photos et Stock par Taille
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#71717a' }}>
              Définissez les couleurs disponibles, uploadez la photo pour chaque couleur et ajustez les stocks.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {colorVariants.map((colorVariant, colorIndex) => (
              <div
                key={colorVariant.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  position: 'relative'
                }}
              >
                {colorVariants.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeColorVariant(colorVariant.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#fee2e2',
                      border: 'none',
                      color: '#b91c1c',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Supprimer
                  </button>
                )}
                
                <div className="admin-form-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {/* Left Column: Color and Photo */}
                  <div className="admin-form-col" style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                        Couleur #{colorIndex + 1} *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: Noir Mat, Kaki, Blanc..."
                        value={colorVariant.colorName}
                        onChange={(e) => updateColorVariant(colorVariant.id, 'colorName', e.target.value)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '6px',
                          border: '1px solid #d4d4d8',
                          fontSize: '0.95rem'
                        }} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                        Photo du produit ({colorVariant.colorName || 'cette couleur'})
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            updateColorVariant(colorVariant.id, 'image', e.target.files[0]);
                          }
                        }}
                        style={{
                          padding: '8px',
                          border: '1px dashed #d4d4d8',
                          borderRadius: '6px',
                          backgroundColor: '#fafafa',
                          fontSize: '0.82rem'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Right Column: Sizes & Stock */}
                  <div className="admin-form-col" style={{ flex: '1.4', minWidth: '240px', borderTop: '1px solid #f4f4f5', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Tailles & Stocks
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addSize(colorVariant.id)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          backgroundColor: '#f4f4f5',
                          border: '1px solid #e4e4e7',
                          color: '#09090b',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        + Ajouter taille
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {colorVariant.sizes.map((sizeObj, sizeIndex) => (
                        <div key={sizeIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            required
                            placeholder="Taille (S, M, 42...)"
                            value={sizeObj.size}
                            onChange={(e) => updateSize(colorVariant.id, sizeIndex, 'size', e.target.value)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '1px solid #d4d4d8',
                              flex: 1,
                              fontSize: '0.9rem'
                            }} 
                          />
                          <div style={{ position: 'relative', width: '90px' }}>
                            <input 
                              type="number" 
                              required
                              min="0"
                              placeholder="Stock"
                              value={sizeObj.stock}
                              onChange={(e) => updateSize(colorVariant.id, sizeIndex, 'stock', parseInt(e.target.value) || 0)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #d4d4d8',
                                fontSize: '0.9rem',
                                textAlign: 'right'
                              }} 
                            />
                          </div>
                          {colorVariant.sizes.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeSize(colorVariant.id, sizeIndex)}
                              style={{
                                background: '#f4f4f5',
                                border: '1px solid #e4e4e7',
                                color: '#71717a',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                flexShrink: 0
                              }}
                              title="Supprimer la taille"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addColorVariant}
            style={{
              marginTop: '16px',
              padding: '10px 18px',
              backgroundColor: '#ffffff',
              color: '#09090b',
              border: '1px solid #d4d4d8',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter une autre couleur
          </button>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '8px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#a1a1aa' : '#09090b',
              color: '#ffffff',
              padding: '14px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              width: '100%',
              fontSize: '1rem',
              letterSpacing: '0.03em',
              transition: 'background-color 0.2s ease',
              minHeight: '48px'
            }}
          >
            {isSubmitting ? 'Publication en cours...' : 'Enregistrer et publier le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
