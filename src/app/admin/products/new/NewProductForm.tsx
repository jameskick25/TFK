'use client';

import { useState } from 'react';
import { createProduct } from '@/app/actions/admin';
import Link from 'next/link';
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
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '500', color: '#374151' }}>Nom du produit *</label>
          <input type="text" name="name" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '500', color: '#374151' }}>Description</label>
          <textarea name="description" rows={4} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Prix (DZD) *</label>
            <input type="number" name="price" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Ancien Prix (DZD)</label>
            <input type="number" name="old_price" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} placeholder="Optionnel" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Catégorie *</label>
            <select name="category_id" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="">Sélectionnez une catégorie</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {getSectionForCategory(cat.slug) === 'accessories' ? '📱 (Accessoires)' : '👕 (Vêtements)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Variants Section */}
        <div style={{ padding: '24px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#111827' }}>Couleurs, Photos et Stock</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#6b7280' }}>
            Ajoutez les couleurs disponibles pour ce produit, uploadez la photo correspondante, et définissez les tailles en stock.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {colorVariants.map((colorVariant, colorIndex) => (
              <div key={colorVariant.id} style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', position: 'relative' }}>
                {colorVariants.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeColorVariant(colorVariant.id)}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    X Supprimer
                  </button>
                )}
                
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Nom de la couleur</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: Bleu Marine"
                        value={colorVariant.colorName}
                        onChange={(e) => updateColorVariant(colorVariant.id, 'colorName', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Photo pour cette couleur</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            updateColorVariant(colorVariant.id, 'image', e.target.files[0]);
                          }
                        }}
                        style={{ padding: '8px', border: '1px dashed #d1d5db', borderRadius: '4px' }} 
                      />
                    </div>
                  </div>

                  <div style={{ flex: '2', minWidth: '300px', borderLeft: '1px solid #e5e7eb', paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Tailles et Stock</label>
                      <button 
                        type="button" 
                        onClick={() => addSize(colorVariant.id)}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        + Ajouter une taille
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
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', flex: 1 }} 
                          />
                          <input 
                            type="number" 
                            required
                            min="0"
                            placeholder="Stock"
                            value={sizeObj.stock}
                            onChange={(e) => updateSize(colorVariant.id, sizeIndex, 'stock', parseInt(e.target.value))}
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', width: '80px' }} 
                          />
                          {colorVariant.sizes.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeSize(colorVariant.id, sizeIndex)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', width: '24px' }}
                            >
                              X
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
            style={{ marginTop: '16px', padding: '10px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            + Ajouter une autre couleur
          </button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button type="submit" disabled={isSubmitting} style={{ backgroundColor: isSubmitting ? '#9ca3af' : '#10b981', color: '#fff', padding: '14px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1.1rem' }}>
            {isSubmitting ? 'Création en cours...' : 'Enregistrer le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
