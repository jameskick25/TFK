import { createAdminClient } from '@/utils/supabase/server';
import { createCategory } from '@/app/actions/admin';
import Link from 'next/link';

export default async function CategoriesPage() {
  const supabase = await createAdminClient();
  const { data: categories } = await supabase.from('categories').select('*').order('display_order', { ascending: true });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1f36', margin: 0 }}>Gestion des Catégories</h1>
      </div>

      {/* Ajout Rapide */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#374151' }}>Ajouter une Catégorie</h2>
        <form action={createCategory} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Nom de la catégorie</label>
            <input type="text" name="name" required placeholder="Ex: T-shirts d'été" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <button type="submit" style={{ backgroundColor: '#1e3a5f', color: '#fff', padding: '10px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', height: '42px' }}>
            Ajouter
          </button>
        </form>
      </div>

      {/* Liste des catégories */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500' }}>Nom</th>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500' }}>Slug URL</th>
                <th style={{ padding: '12px 24px', color: '#6b7280', fontWeight: '500', width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories?.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Aucune catégorie pour le moment.
                  </td>
                </tr>
              ) : (
                categories?.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{cat.name}</td>
                    <td style={{ padding: '16px 24px', color: '#6b7280' }}>{cat.slug}</td>
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
