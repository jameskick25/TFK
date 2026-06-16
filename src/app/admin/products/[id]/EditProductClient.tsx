'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProductInfo, deleteProduct } from '@/app/actions/admin';

export default function EditProductClient({ product, categories }: { product: any, categories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('productId', product.id);
    
    const result = await updateProductInfo(formData);
    
    if (result?.success) {
      router.push('/admin/products');
      router.refresh();
    } else {
      alert('Erreur lors de la modification : ' + (result?.error || ''));
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce produit ? Cette action supprimera également toutes les images, variantes et stocks associés.')) {
      return;
    }
    
    setIsDeleting(true);
    const result = await deleteProduct(product.id);
    
    if (result?.success) {
      window.location.href = '/admin/products';
    } else {
      alert('Erreur lors de la suppression : ' + (result?.error || ''));
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#111827' }}>Modifier le produit : {product.name}</h2>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ backgroundColor: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isDeleting ? 'Suppression...' : 'Supprimer le produit'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '500', color: '#374151' }}>Nom du produit</label>
          <input type="text" name="name" defaultValue={product.name} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '500', color: '#374151' }}>Description</label>
          <textarea name="description" defaultValue={product.description || ''} rows={4} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Prix (DZD)</label>
            <input type="number" name="price" defaultValue={product.price} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Ancien Prix (DZD) - Optionnel</label>
            <input type="number" name="old_price" defaultValue={product.old_price || ''} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Catégorie</label>
            <select name="category_id" defaultValue={product.category_id} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="">Sélectionnez une catégorie</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Statut</label>
            <select name="is_active" defaultValue={product.is_active ? 'true' : 'false'} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="true">Actif (Visible sur le site)</option>
              <option value="false">Inactif (Masqué)</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#e0e7ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="show_colors_separately" 
              value="true" 
              defaultChecked={product.show_colors_separately}
              style={{ width: '20px', height: '20px', accentColor: '#4f46e5' }}
            />
            <span style={{ fontWeight: 600, color: '#312e81', fontSize: '0.95rem' }}>
              🎨 Afficher chaque couleur comme un produit distinct dans le catalogue
            </span>
          </label>
          <p style={{ margin: '8px 0 0 32px', fontSize: '0.85rem', color: '#4f46e5' }}>
            Si coché, les couleurs cachées apparaîtront séparément dans la page "Produits" et la page d'accueil.
          </p>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>
            <strong>Note :</strong> Pour modifier le stock et les variantes, veuillez utiliser l'onglet <strong>Gestion de Stock</strong> dans le menu latéral. Les images ne peuvent pas être modifiées après création pour le moment.
          </p>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button type="submit" disabled={isSubmitting} style={{ backgroundColor: isSubmitting ? '#9ca3af' : '#4f46e5', color: '#fff', padding: '14px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1.1rem' }}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
