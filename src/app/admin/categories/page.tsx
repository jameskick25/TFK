import { createAdminClient } from '@/utils/supabase/server';
import { createCategory } from '@/app/actions/admin';
import Link from 'next/link';
import { getSectionForCategory } from '@/utils/sections';

export default async function CategoriesPage() {
  const supabase = await createAdminClient();
  const { data: categories } = await supabase.from('categories').select('*').order('display_order', { ascending: true });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1f36', margin: 0 }}>Gestion des Catégories</h1>
      </div>

      {/* Ajout Rapide */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#374151' }}>Ajouter une Catégorie</h2>
        <form action={createCategory} method="POST" encType="multipart/form-data" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Nom de la catégorie</label>
            <input type="text" name="name" required placeholder="Ex: T-shirts d'été" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Image de couverture</label>
            <input type="file" name="image" accept="image/*" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff' }} />
          </div>
          
          <button type="submit" style={{ backgroundColor: '#1e3a5f', color: '#fff', padding: '10px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', height: '42px' }}>
            Ajouter
          </button>
        </form>
      </div>

      {/* Liste des catégories */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500', width: '80px' }}>Image</th>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500' }}>Nom</th>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500' }}>Slug URL</th>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500', width: '220px', textAlign: 'center' }}>Modifier l'image</th>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500', width: '80px', textAlign: 'center' }}>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {categories?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Aucune catégorie pour le moment.
                  </td>
                </tr>
              ) : (
                categories?.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 24px' }}>
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Aucune</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>
                      {cat.name}
                      <span style={{ fontSize: '0.8rem', marginLeft: '8px', padding: '3px 8px', borderRadius: '12px', backgroundColor: getSectionForCategory(cat.slug) === 'accessories' ? '#ecfdf5' : '#eff6ff', color: getSectionForCategory(cat.slug) === 'accessories' ? '#065f46' : '#1e40af', fontWeight: 'bold' }}>
                        {getSectionForCategory(cat.slug) === 'accessories' ? '📱 Accessoires' : '👕 Vêtements'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#6b7280' }}>{cat.slug}</td>
                    <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                      <form action={async (formData) => {
                        'use server';
                        const { updateCategoryImage } = await import('@/app/actions/admin');
                        await updateCategoryImage(formData);
                      }} method="POST" encType="multipart/form-data" style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                        <input type="hidden" name="id" value={cat.id} />
                        <input type="file" name="image" accept="image/*" required style={{ fontSize: '0.75rem', maxWidth: '140px', padding: '4px' }} />
                        <button type="submit" style={{ backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                          Enregistrer
                        </button>
                      </form>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <form action={async (formData) => {
                        'use server';
                        const { deleteCategory } = await import('@/app/actions/admin');
                        await deleteCategory(formData);
                      }}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }} title="Supprimer">
                          🗑️
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
