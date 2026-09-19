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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
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
          Taxonomie Catalogue
        </span>
        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#09090b',
            margin: 0,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em'
          }}
        >
          Gestion des Catégories
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.92rem', marginTop: '6px' }}>
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

      {/* Formulaire d'ajout responsive */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '28px'
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09090b', marginBottom: '16px', marginTop: 0 }}>
          Ajouter une nouvelle catégorie
        </h2>
        <form onSubmit={handleCreate}>
          <div className="admin-form-row" style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '220px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
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
                  borderRadius: '8px',
                  border: '1px solid #d4d4d8',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
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
                  borderRadius: '8px',
                  border: '1px solid #d4d4d8',
                  fontSize: '1rem',
                  backgroundColor: '#f4f4f5',
                  color: '#52525b'
                }}
              />
            </div>

            <div className="admin-form-col" style={{ minWidth: '140px' }}>
              <button
                type="submit"
                disabled={loading || !nameInput.trim()}
                style={{
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading || !nameInput.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  height: '42px',
                  width: '100%',
                  opacity: loading || !nameInput.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── MOBILE CARDS VIEW (< 768px) ── */}
      <div className="admin-mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>
            Catégories existantes ({categories.length})
          </span>
        </div>

        {categories.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#71717a', border: '1px solid #e4e4e7' }}>
            Aucune catégorie enregistrée.
          </div>
        ) : (
          categories.map(cat => {
            const isEditing = editingId === cat.id;
            const isDeleting = deletingId === cat.id;
            const section = getSectionForCategory(cat.slug);
            const pCount = productCounts[cat.id] || 0;

            return (
              <div
                key={cat.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e4e4e7',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: '4px' }}>
                        Nom de la catégorie
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #3b82f6',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: '4px' }}>
                        Slug URL
                      </label>
                      <input
                        type="text"
                        value={editSlug}
                        onChange={e => setEditSlug(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #d4d4d8',
                          fontSize: '0.9rem',
                          backgroundColor: '#f4f4f5'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        disabled={editLoading || !editName.trim()}
                        style={{
                          backgroundColor: '#09090b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 14px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {editLoading ? '...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          backgroundColor: '#f4f4f5',
                          color: '#3f3f46',
                          border: '1px solid #e4e4e7',
                          borderRadius: '6px',
                          padding: '8px 14px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#09090b' }}>
                          {cat.name}
                        </h3>
                        <code style={{ fontSize: '0.78rem', color: '#71717a', backgroundColor: '#f4f4f5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                          /{cat.slug}
                        </code>
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: section === 'accessories' ? '#ecfdf5' : '#eff6ff',
                          color: section === 'accessories' ? '#065f46' : '#1e40af',
                          fontWeight: 600
                        }}
                      >
                        {section === 'accessories' ? 'Accessoires' : 'Vêtements'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f4f4f5' }}>
                      <span style={{ fontSize: '0.82rem', color: '#71717a', fontWeight: 500 }}>
                        <strong>{pCount}</strong> produit(s) rattaché(s)
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => startEdit(cat)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #d4d4d8',
                            color: '#09090b',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={isDeleting}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: isDeleting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isDeleting ? '...' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= 768px) ── */}
      <div
        className="admin-desktop-view"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#09090b' }}>
            Catégories existantes ({categories.length})
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug URL</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Univers</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Produits</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px 24px', textAlign: 'center', color: '#71717a' }}>
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
                  <tr key={cat.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                    <td style={{ padding: '14px 20px' }}>
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
                        <span style={{ fontWeight: 600, color: '#09090b', fontSize: '0.92rem' }}>{cat.name}</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
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
                            color: '#52525b',
                            width: '100%'
                          }}
                        />
                      ) : (
                        <code style={{ fontSize: '0.82rem', color: '#71717a', backgroundColor: '#f4f4f5', padding: '2px 8px', borderRadius: '4px' }}>
                          {cat.slug}
                        </code>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: section === 'accessories' ? '#ecfdf5' : '#eff6ff',
                          color: section === 'accessories' ? '#065f46' : '#1e40af',
                          fontWeight: 600
                        }}
                      >
                        {section === 'accessories' ? 'Accessoires' : 'Vêtements'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#3f3f46', fontWeight: 600 }}>
                        {pCount}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            disabled={editLoading || !editName.trim()}
                            style={{
                              backgroundColor: '#09090b',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {editLoading ? '...' : 'Enregistrer'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              backgroundColor: '#f4f4f5',
                              color: '#3f3f46',
                              border: '1px solid #e4e4e7',
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            onClick={() => startEdit(cat)}
                            style={{
                              background: '#fff',
                              border: '1px solid #d4d4d8',
                              color: '#09090b',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            disabled={isDeleting}
                            style={{
                              background: '#fff',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
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
  );
}
