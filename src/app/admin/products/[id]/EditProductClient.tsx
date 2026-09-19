'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  updateProductComplete, 
  deleteProduct, 
  deleteProductImage, 
  setMainProductImage 
} from '@/app/actions/admin';
import { getSectionForCategory } from '@/utils/sections';

type EditSize = {
  id?: string;
  size: string;
  stock: number;
};

type EditColorGroup = {
  colorName: string;
  sizes: EditSize[];
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

export default function EditProductClient({ 
  product, 
  categories 
}: { 
  product: any; 
  categories: any[]; 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageActionLoading, setImageActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Existing images state
  const [existingImages, setExistingImages] = useState<any[]>(product.product_images || []);

  // New images to upload state
  const [newImages, setNewImages] = useState<Array<{ file: File; color: string }>>([]);

  // Variants state grouped by color
  const [colorGroups, setColorGroups] = useState<EditColorGroup[]>(() => {
    const rawVariants = product.product_variants || [];
    if (rawVariants.length === 0) {
      return [{
        colorName: '',
        sizes: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 10 }
        ]
      }];
    }

    // Group variants by color
    const groups: Record<string, EditSize[]> = {};
    for (const v of rawVariants) {
      const color = v.color || '';
      if (!groups[color]) groups[color] = [];
      groups[color].push({
        id: v.id,
        size: v.size || '',
        stock: v.stock ?? 0
      });
    }

    return Object.entries(groups).map(([colorName, sizes]) => ({
      colorName,
      sizes
    }));
  });

  // ── Color Groups Management ──
  const addColorGroup = () => {
    setColorGroups([
      ...colorGroups,
      {
        colorName: '',
        sizes: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 10 }
        ]
      }
    ]);
  };

  const removeColorGroup = (index: number) => {
    setColorGroups(colorGroups.filter((_, i) => i !== index));
  };

  const updateColorName = (index: number, newName: string) => {
    setColorGroups(colorGroups.map((g, i) => i === index ? { ...g, colorName: newName } : g));
  };

  const addSize = (colorIndex: number) => {
    setColorGroups(colorGroups.map((g, i) => {
      if (i === colorIndex) {
        return {
          ...g,
          sizes: [...g.sizes, { size: '', stock: 10 }]
        };
      }
      return g;
    }));
  };

  const removeSize = (colorIndex: number, sizeIndex: number) => {
    setColorGroups(colorGroups.map((g, i) => {
      if (i === colorIndex) {
        const nextSizes = [...g.sizes];
        nextSizes.splice(sizeIndex, 1);
        return { ...g, sizes: nextSizes };
      }
      return g;
    }));
  };

  const updateSize = (colorIndex: number, sizeIndex: number, field: 'size' | 'stock', value: any) => {
    setColorGroups(colorGroups.map((g, i) => {
      if (i === colorIndex) {
        const nextSizes = [...g.sizes];
        nextSizes[sizeIndex] = { ...nextSizes[sizeIndex], [field]: value };
        return { ...g, sizes: nextSizes };
      }
      return g;
    }));
  };

  // ── Photos Management ──
  const handleSetMainImage = async (imageId: string) => {
    setImageActionLoading(imageId);
    try {
      const res = await setMainProductImage(product.id, imageId);
      if (res?.success) {
        setExistingImages(prev => prev.map(img => ({
          ...img,
          is_main: img.id === imageId
        })));
        setFeedback({ type: 'success', message: 'Photo principale définie avec succès.' });
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la mise à jour.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Erreur inattendue.' });
    } finally {
      setImageActionLoading(null);
    }
  };

  const handleDeleteExistingImage = async (imageId: string, imageUrl: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette photo ?')) return;
    setImageActionLoading(imageId);
    try {
      const res = await deleteProductImage(imageId, imageUrl);
      if (res?.success) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setFeedback({ type: 'success', message: 'Photo supprimée avec succès.' });
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la suppression.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Erreur inattendue.' });
    } finally {
      setImageActionLoading(null);
    }
  };

  const handleAddNewImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const defaultColor = colorGroups[0]?.colorName || '';
    const newItems = Array.from(files).map(f => ({
      file: f,
      color: defaultColor
    }));
    setNewImages(prev => [...prev, ...newItems]);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateNewImageColor = (index: number, color: string) => {
    setNewImages(prev => prev.map((item, i) => i === index ? { ...item, color } : item));
  };

  // ── Form Submission ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.append('productId', product.id);

      // Append structured variants
      const variantsData = colorGroups.map(g => ({
        color: g.colorName,
        sizes: g.sizes
      }));
      formData.append('variantsData', JSON.stringify(variantsData));

      // Compress and append new images
      for (const item of newImages) {
        let fileToSend = item.file;
        try {
          fileToSend = await compressImage(item.file);
        } catch (e) {
          console.warn('Compression échouée, envoi fichier original:', e);
        }
        formData.append('new_images', fileToSend);
        formData.append('new_image_colors', item.color);
      }
      
      const result = await updateProductComplete(formData);
      
      if (result && result.success) {
        setFeedback({ type: 'success', message: 'Toutes les modifications ont été enregistrées avec succès !' });
        setNewImages([]); // clear queued images
        setTimeout(() => {
          router.refresh();
        }, 600);
      } else {
        setFeedback({ type: 'error', message: result?.error || 'Erreur lors de la modification.' });
      }
    } catch (err: any) {
      console.error('Erreur handleSubmit:', err);
      setFeedback({ type: 'error', message: err.message || 'Erreur inattendue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce produit ? Cette action supprimera également toutes les images, variantes et stocks associés.')) {
      return;
    }
    
    setIsDeleting(true);
    setFeedback(null);

    try {
      const result = await deleteProduct(product.id);
      
      if (result?.success) {
        window.location.href = '/admin/products';
      } else {
        setFeedback({ type: 'error', message: result?.error || 'Erreur lors de la suppression.' });
        setIsDeleting(false);
      }
    } catch (err: any) {
      console.error('Erreur deleteProduct:', err);
      setFeedback({ type: 'error', message: err.message || 'Erreur inattendue.' });
      setIsDeleting(false);
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
      {/* Header with Title and Delete */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              display: 'block',
              marginBottom: '4px'
            }}
          >
            Modifier le Produit
          </span>
          <h1
            style={{
              margin: 0,
              color: '#09090b',
              fontSize: '1.6rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em'
            }}
          >
            {product.name}
          </h1>
        </div>

        <button 
          type="button"
          onClick={handleDeleteProduct}
          disabled={isDeleting}
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #fecaca',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          {isDeleting ? 'Suppression...' : 'Supprimer le produit'}
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* SECTION 1: Informations Générales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#09090b', borderBottom: '1px solid #f4f4f5', paddingBottom: '8px' }}>
            1. Informations Générales
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
              Nom du produit *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={product.name}
              required
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
              Description
            </label>
            <textarea
              name="description"
              defaultValue={product.description || ''}
              rows={4}
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

          <div className="admin-form-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '160px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
                Prix (DZD) *
              </label>
              <input
                type="number"
                name="price"
                defaultValue={product.price}
                required
                min="0"
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
                Ancien Prix (DZD) <span style={{ color: '#a1a1aa', fontWeight: 400 }}>(Optionnel)</span>
              </label>
              <input
                type="number"
                name="old_price"
                defaultValue={product.old_price || ''}
                min="0"
                placeholder="Ex: 4000"
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

            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
                Catégorie *
              </label>
              <select
                name="category_id"
                defaultValue={product.category_id || ''}
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
                {categories?.map(cat => {
                  const isSub = cat.slug?.startsWith('sub--');
                  return (
                    <option key={cat.id} value={cat.id}>
                      {isSub ? `  ↳ ${cat.name}` : cat.name} ({getSectionForCategory(cat.slug) === 'accessories' ? 'Accessoires' : 'Vêtements'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
                Statut d'affichage *
              </label>
              <select
                name="is_active"
                defaultValue={product.is_active ? 'true' : 'false'}
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
                <option value="true">Actif (Visible sur le site)</option>
                <option value="false">Inactif (Masqué)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Photos du Produit (Existantes & Nouvelles) */}
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fafafa',
            border: '1px solid #e4e4e7',
            borderRadius: '12px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>
              2. Photos du Produit ({existingImages.length} existante{existingImages.length > 1 ? 's' : ''})
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#71717a' }}>
              Gérez les photos du produit. Définissez la photo principale, supprimez des photos ou ajoutez-en de nouvelles.
            </p>
          </div>

          {/* Grille des photos existantes */}
          {existingImages.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              {existingImages.map(img => (
                <div
                  key={img.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: img.is_main ? '2px solid #09090b' : '1px solid #e4e4e7',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', height: '130px', backgroundColor: '#f4f4f5' }}>
                    <img
                      src={img.url}
                      alt="Produit"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {img.is_main && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          backgroundColor: '#09090b',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        Principale
                      </span>
                    )}
                    {img.color && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: '#09090b',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #e4e4e7'
                        }}
                      >
                        {img.color}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#ffffff' }}>
                    {!img.is_main && (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(img.id)}
                        disabled={imageActionLoading === img.id}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#f4f4f5',
                          border: '1px solid #d4d4d8',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#09090b'
                        }}
                      >
                        {imageActionLoading === img.id ? '...' : 'Définir principale'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id, img.url)}
                      disabled={imageActionLoading === img.id}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#b91c1c'
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#71717a', fontStyle: 'italic', marginBottom: '16px' }}>
              Aucune photo enregistrée pour ce produit.
            </p>
          )}

          {/* Upload de nouvelles photos */}
          <div style={{ borderTop: '1px dashed #d4d4d8', paddingTop: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b', display: 'block', marginBottom: '6px' }}>
              + Ajouter de nouvelles photos
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleAddNewImages(e.target.files)}
              style={{
                padding: '10px',
                border: '1px dashed #d4d4d8',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '0.85rem',
                cursor: 'pointer',
                width: '100%'
              }}
            />

            {newImages.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3f3f46' }}>
                  {newImages.length} nouvelle{newImages.length > 1 ? 's' : ''} photo{newImages.length > 1 ? 's' : ''} prête{newImages.length > 1 ? 's' : ''} à être téléversée{newImages.length > 1 ? 's' : ''} :
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                  {newImages.map((item, idx) => {
                    const previewUrl = URL.createObjectURL(item.file);
                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e4e4e7',
                          borderRadius: '8px',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ position: 'relative', height: '100px', backgroundColor: '#f4f4f5', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        <select
                          value={item.color}
                          onChange={(e) => handleUpdateNewImageColor(idx, e.target.value)}
                          style={{
                            padding: '4px 6px',
                            fontSize: '0.78rem',
                            border: '1px solid #d4d4d8',
                            borderRadius: '4px'
                          }}
                        >
                          <option value="">Générale / Toutes</option>
                          {colorGroups.map((g, gIdx) => (
                            <option key={gIdx} value={g.colorName || `Couleur ${gIdx + 1}`}>
                              Couleur: {g.colorName || `#${gIdx + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Couleurs, Tailles & Stocks */}
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fafafa',
            border: '1px solid #e4e4e7',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>
                3. Couleurs, Tailles & Stocks
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#71717a' }}>
                Modifiez les couleurs, ajoutez ou retirez des tailles et ajustez les quantités en stock.
              </p>
            </div>
            
            <button
              type="button"
              onClick={addColorGroup}
              style={{
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #d4d4d8',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              + Ajouter une couleur
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {colorGroups.map((group, colorIdx) => (
              <div
                key={colorIdx}
                style={{
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '350px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3f3f46', whiteSpace: 'nowrap' }}>
                      Couleur #{colorIdx + 1} :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Noir Mat, Blanc, Kaki..."
                      value={group.colorName}
                      onChange={(e) => updateColorName(colorIdx, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #d4d4d8',
                        fontSize: '0.9rem',
                        width: '100%'
                      }}
                    />
                  </div>

                  {colorGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColorGroup(colorIdx)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        color: '#b91c1c',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      Supprimer cette couleur
                    </button>
                  )}
                </div>

                {/* Sizes and stocks list */}
                <div style={{ borderTop: '1px solid #f4f4f5', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Tailles & Quantités en stock
                    </span>
                    <button
                      type="button"
                      onClick={() => addSize(colorIdx)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        backgroundColor: '#f4f4f5',
                        border: '1px solid #e4e4e7',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      + Ajouter taille
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {group.sizes.map((sizeObj, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#fafafa',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e4e4e7'
                        }}
                      >
                        <input
                          type="text"
                          required
                          placeholder="Taille (S, 42...)"
                          value={sizeObj.size}
                          onChange={(e) => updateSize(colorIdx, sIdx, 'size', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #d4d4d8',
                            fontSize: '0.85rem',
                            flex: 1
                          }}
                        />
                        <div style={{ position: 'relative', width: '75px' }}>
                          <input
                            type="number"
                            required
                            min="0"
                            placeholder="Stock"
                            value={sizeObj.stock}
                            onChange={(e) => updateSize(colorIdx, sIdx, 'stock', parseInt(e.target.value) || 0)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              border: '1px solid #d4d4d8',
                              fontSize: '0.85rem',
                              textAlign: 'right'
                            }}
                          />
                        </div>
                        {group.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSize(colorIdx, sIdx)}
                            style={{
                              background: '#f4f4f5',
                              border: '1px solid #d4d4d8',
                              color: '#71717a',
                              borderRadius: '4px',
                              width: '26px',
                              height: '26px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
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
            ))}
          </div>
        </div>

        {/* Submit Button */}
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
              letterSpacing: '0.02em',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
                Enregistrement de toutes les modifications...
              </>
            ) : (
              'Enregistrer toutes les modifications'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
