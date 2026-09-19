'use client';

import { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/admin';
import { getSectionForCategory } from '@/utils/sections';

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order?: number;
  productCount?: number;
}

export default function CategoriesClient({
  initialCategories,
  productCounts
}: {
  initialCategories: Category[];
  productCounts: Record<string, number>;
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setNameInput(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlugInput(generated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('name', nameInput.trim());
    formData.append('slug', slugInput.trim());

    try {
      const res = await createCategory(formData);
      if (res && res.success && res.category) {
        setCategories(prev => [...prev, { ...res.category, productCount: 0 }]);
        setNameInput('');
        setSlugInput('');
        setFeedback({ type: 'success', message: `Catégorie "${res.category.name}" ajoutée avec succès.` });
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la création de la catégorie.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur inattendue.' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    setEditLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', editName.trim());
    formData.append('slug', editSlug.trim());

    try {
      const res = await updateCategory(formData);
      if (res && res.success && res.category) {
        setCategories(prev =>
          prev.map(c => (c.id === id ? { ...c, name: res.category.name, slug: res.category.slug } : c))
        );
        setEditingId(null);
        setFeedback({ type: 'success', message: `Catégorie "${res.category.name}" mise à jour.` });
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la modification.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur inattendue.' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const pCount = productCounts[cat.id] || 0;
    const confirmMessage = pCount > 0
      ? `Attention : ${pCount} produit(s) sont rattachés à "${cat.name}". Si vous la supprimez, ils ne seront plus catégorisés. Voulez-vous vraiment continuer ?`
      : `Voulez-vous vraiment supprimer la catégorie "${cat.name}" ?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingId(cat.id);
    setFeedback(null);

    try {
      const res = await deleteCategory(cat.id);
      if (res && res.success) {
        setCategories(prev => prev.filter(c => c.id !== cat.id));
        setFeedback({ type: 'success', message: `Catégorie "${cat.name}" supprimée.` });
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la suppression.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur inattendue.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
          Gestion des Catégories
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '6px' }}>
          Créez, modifiez ou supprimez les catégories pour organiser votre catalogue de produits.
        </p>
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

      {/* Formulaire d'ajout */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '32px'
        }}
      >
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', marginBottom: '16px', marginTop: 0 }}>
          Ajouter une nouvelle catégorie
        </h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
              Nom de la catégorie *
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Ex: Sweats, Pantalons..."
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
              Slug URL (identifiant web)
            </label>
            <input
              type="text"
              required
              value={slugInput}
              onChange={e => setSlugInput(e.target.value)}
              placeholder="ex: sweats"
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.95rem',
                backgroundColor: '#f9fafb',
                color: '#4b5563'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !nameInput.trim()}
            style={{
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading || !nameInput.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              height: '42px',
              opacity: loading || !nameInput.trim() ? 0.6 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter'}
          </button>
        </form>
      </div>

      {/* Liste des catégories */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>
            Catégories existantes ({categories.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 24px', color: '#4b5563', fontWeight: 600, fontSize: '0.85rem' }}>Nom</th>
                <th style={{ padding: '12px 24px', color: '#4b5563', fontWeight: 600, fontSize: '0.85rem' }}>Slug URL</th>
                <th style={{ padding: '12px 24px', color: '#4b5563', fontWeight: 600, fontSize: '0.85rem' }}>Univers</th>
                <th style={{ padding: '12px 24px', color: '#4b5563', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Produits</th>
                <th style={{ padding: '12px 24px', color: '#4b5563', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 24px', textAlign: 'center', color: '#6b7280' }}>
                    Aucune catégorie enregistrée.
                  </td>
                </tr>
              ) : (
                categories.map(cat => {
                  const isEditing = editingId === cat.id;
                  const isDeleting = deletingId === cat.id;
                  const section = getSectionForCategory(cat.slug);
                  const pCount = productCounts[cat.id] || 0;

                  return (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 24px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #3b82f6',
                              fontSize: '0.9rem',
                              width: '100%'
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 600, color: '#111827' }}>{cat.name}</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 24px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editSlug}
                            onChange={e => setEditSlug(e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #3b82f6',
                              fontSize: '0.85rem',
                              color: '#4b5563',
                              width: '100%'
                            }}
                          />
                        ) : (
                          <code style={{ fontSize: '0.85rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                            {cat.slug}
                          </code>
                        )}
                      </td>

                      <td style={{ padding: '16px 24px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: section === 'accessories' ? '#ecfdf5' : '#eff6ff',
                            color: section === 'accessories' ? '#065f46' : '#1e40af',
                            fontWeight: 600
                          }}
                        >
                          {section === 'accessories' ? 'Accessoires' : 'Vêtements'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 500 }}>
                          {pCount}
                        </span>
                      </td>

                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleUpdate(cat.id)}
                              disabled={editLoading || !editName.trim()}
                              style={{
                                backgroundColor: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {editLoading ? '...' : 'Enregistrer'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => startEdit(cat)}
                              style={{
                                background: 'none',
                                border: '1px solid #d1d5db',
                                color: '#374151',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(cat)}
                              disabled={isDeleting}
                              style={{
                                background: 'none',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: isDeleting ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {isDeleting ? '...' : 'Supprimer'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
