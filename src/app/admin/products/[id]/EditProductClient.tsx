'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProductInfo, deleteProduct } from '@/app/actions/admin';

export default function EditProductClient({ product, categories }: { product: any; categories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.append('productId', product.id);
      
      const result = await updateProductInfo(formData);
      
      if (result && result.success) {
        setFeedback({ type: 'success', message: 'Modifications enregistrées avec succès !' });
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 800);
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

  const handleDelete = async () => {
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
            Fiche Produit
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
          onClick={handleDelete}
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
            Fermer
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
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

          <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
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
        </div>

        <div className="admin-form-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
              Catégorie *
            </label>
            <select
              name="category_id"
              defaultValue={product.category_id}
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
                    {isSub ? `  ↳ ${cat.name}` : cat.name}
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

        <div style={{ padding: '14px 16px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f4f4f5' }}>
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.85rem' }}>
            <strong>Note :</strong> Pour modifier le stock par taille et couleur, rendez-vous dans l&apos;onglet <strong>Gestion de Stock</strong> du menu.
          </p>
        </div>

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
                Enregistrement en cours...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
