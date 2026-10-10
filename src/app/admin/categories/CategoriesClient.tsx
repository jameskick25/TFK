'use client';

import { useState, useMemo } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { getSectionForCategory, isAccessoriesCategory } from '@/utils/sections';

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order?: number;
  productCount?: number;
}

interface ParsedCategory extends Category {
  parentId: string | null;
  cleanSlug: string;
  isSub: boolean;
  section: 'clothes' | 'accessories';
}

function parseCategory(cat: Category): ParsedCategory {
  let parentId: string | null = null;
  let cleanSlug = cat.slug || '';
  let isSub = false;

  if (cat.slug?.startsWith('sub--')) {
    const withoutPrefix = cat.slug.slice(5);
    const splitIndex = withoutPrefix.indexOf('--');
    if (splitIndex !== -1) {
      parentId = withoutPrefix.slice(0, splitIndex);
      cleanSlug = withoutPrefix.slice(splitIndex + 2);
      isSub = true;
    }
  }

  // Nettoyer les préfixes explicites d'univers pour l'affichage
  if (cleanSlug.startsWith('acc--')) {
    cleanSlug = cleanSlug.replace(/^acc--/, '');
  } else if (cleanSlug.startsWith('cloth--')) {
    cleanSlug = cleanSlug.replace(/^cloth--/, '');
  }

  const section = getSectionForCategory(cat.slug);

  return {
    ...cat,
    parentId,
    cleanSlug,
    isSub,
    section
  };
}

export default function CategoriesClient({
  initialCategories,
  productCounts
}: {
  initialCategories: Category[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // Create form state
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [parentInput, setParentInput] = useState('none');
  const [sectionInput, setSectionInput] = useState<'clothes' | 'accessories'>('clothes');
  const [userTouchedSection, setUserTouchedSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter state for category list
  const [activeTab, setActiveTab] = useState<'all' | 'clothes' | 'accessories'>('all');

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<ParsedCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editParentId, setEditParentId] = useState('none');
  const [editSection, setEditSection] = useState<'clothes' | 'accessories'>('clothes');
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Parse all categories
  const parsedCategories = useMemo(() => {
    return categories.map(c => parseCategory(c));
  }, [categories]);

  // Main / Parent categories
  const parentCategories = useMemo(() => {
    return parsedCategories.filter(c => !c.isSub);
  }, [parsedCategories]);

  // Hierarchical ordered list (Parent followed by its subcategories)
  const orderedList = useMemo(() => {
    const list: { category: ParsedCategory; isSub: boolean; parentName?: string }[] = [];
    const parents = parsedCategories.filter(c => !c.isSub);
    const subs = parsedCategories.filter(c => c.isSub);

    parents.forEach(parent => {
      list.push({ category: parent, isSub: false });
      // Find subs of this parent
      const children = subs.filter(s => s.parentId === parent.id || s.parentId === parent.slug);
      children.forEach(child => {
        list.push({ category: child, isSub: true, parentName: parent.name });
      });
    });

    // Add any orphan subcategories whose parent might have been deleted
    subs.forEach(sub => {
      const alreadyAdded = list.some(item => item.category.id === sub.id);
      if (!alreadyAdded) {
        list.push({ category: sub, isSub: true, parentName: 'Inconnu' });
      }
    });

    return list;
  }, [parsedCategories]);

  // Filtered list based on active tab
  const filteredList = useMemo(() => {
    if (activeTab === 'all') return orderedList;
    return orderedList.filter(item => item.category.section === activeTab);
  }, [orderedList, activeTab]);

  const clothesCount = useMemo(() => {
    return orderedList.filter(item => item.category.section === 'clothes').length;
  }, [orderedList]);

  const accessoriesCount = useMemo(() => {
    return orderedList.filter(item => item.category.section === 'accessories').length;
  }, [orderedList]);

  const handleNameChange = (val: string) => {
    setNameInput(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlugInput(generated);

    // Si l'utilisateur n'a pas encore choisi manuellement l'univers, auto-détecter
    if (!userTouchedSection && val.trim().length > 1) {
      if (isAccessoriesCategory(generated)) {
        setSectionInput('accessories');
      } else {
        setSectionInput('clothes');
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('name', nameInput.trim());
    formData.append('slug', slugInput.trim());
    formData.append('section', sectionInput);
    if (parentInput !== 'none') {
      formData.append('parent_id', parentInput);
    }

    try {
      const res = await createCategory(formData);
      if (res && res.success && res.category) {
        setCategories(prev => [...prev, { ...res.category, productCount: 0 }]);
        setNameInput('');
        setSlugInput('');
        setParentInput('none');
        setUserTouchedSection(false);
        setFeedback({ type: 'success', message: `Catégorie "${res.category.name}" (${sectionInput === 'accessories' ? 'Accessoires' : 'Vêtements'}) ajoutée avec succès.` });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la création de la catégorie.' });
      }
    } catch (err: any) {
      console.error('Erreur handleCreate:', err);
      setFeedback({ type: 'error', message: err.message || 'Erreur inattendue.' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: ParsedCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.cleanSlug);
    setEditParentId(cat.parentId || 'none');
    setEditSection(cat.section);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditSlug('');
    setEditParentId('none');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setEditLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('id', editingCategory.id);
    formData.append('name', editName.trim());
    formData.append('slug', editSlug.trim());
    formData.append('section', editSection);
    if (editParentId !== 'none') {
      formData.append('parent_id', editParentId);
    }

    try {
      const res = await updateCategory(formData);
      if (res && res.success && res.category) {
        setCategories(prev =>
          prev.map(c => (c.id === editingCategory.id ? { ...c, name: res.category.name, slug: res.category.slug } : c))
        );
        setEditingCategory(null);
        setFeedback({ type: 'success', message: `Catégorie "${res.category.name}" mise à jour avec succès.` });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la modification.' });
      }
    } catch (err: any) {
      console.error('Erreur handleUpdate:', err);
      setFeedback({ type: 'error', message: err.message || 'Erreur inattendue.' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const pCount = productCounts[cat.id] || 0;
    const confirmMessage = pCount > 0
      ? `Attention : ${pCount} produit(s) sont rattachés à "${cat.name}". Si vous la supprimez, ils ne seront plus catégorisés. Continuer ?`
      : `Voulez-vous vraiment supprimer "${cat.name}" ?`;

    if (!window.confirm(confirmMessage)) return;

    setDeletingId(cat.id);
    setFeedback(null);

    try {
      const res = await deleteCategory(cat.id);
      if (res && res.success) {
        setCategories(prev => prev.filter(c => c.id !== cat.id));
        setFeedback({ type: 'success', message: `Catégorie "${cat.name}" supprimée.` });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res?.error || 'Erreur lors de la suppression.' });
      }
    } catch (err: any) {
      console.error('Erreur handleDelete:', err);
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
          Structure du Catalogue
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
          Gestion des Catégories (Vêtements & Accessoires)
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.92rem', marginTop: '6px' }}>
          Organisez les rayons de votre boutique : mode vêtements et univers accessoires (maroquinerie, bijoux, high-tech, casquettes...).
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
          borderRadius: '14px',
          padding: '22px',
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
            {/* Nom */}
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1.5, minWidth: '180px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                Nom de la catégorie *
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Ex: Montres, Casquettes, T-Shirts..."
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

            {/* Univers / Rayon */}
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1.2, minWidth: '170px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                Rayon / Univers *
              </label>
              <select
                value={sectionInput}
                onChange={e => {
                  setSectionInput(e.target.value as 'clothes' | 'accessories');
                  setUserTouchedSection(true);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d4d4d8',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  height: '44px',
                  fontWeight: 600,
                  color: sectionInput === 'accessories' ? '#065f46' : '#1e40af'
                }}
              >
                <option value="clothes">👗 Vêtements</option>
                <option value="accessories">🎒 Accessoires</option>
              </select>
            </div>

            {/* Catégorie parente */}
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1.5, minWidth: '180px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                Type / Catégorie Parente
              </label>
              <select
                value={parentInput}
                onChange={e => setParentInput(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d4d4d8',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  height: '44px'
                }}
              >
                <option value="none">-- Aucune (Catégorie Principale) --</option>
                {parentCategories.map(p => (
                  <option key={p.id} value={p.id}>
                    Sous-catégorie de : {p.name} ({p.section === 'accessories' ? 'Accessoires' : 'Vêtements'})
                  </option>
                ))}
              </select>
            </div>

            {/* Slug URL */}
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                Slug URL
              </label>
              <input
                type="text"
                required
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                placeholder="ex: montres"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d4d4d8',
                  fontSize: '0.95rem',
                  backgroundColor: '#f4f4f5',
                  color: '#52525b',
                  height: '44px'
                }}
              />
            </div>

            {/* Bouton Ajouter */}
            <div className="admin-form-col" style={{ minWidth: '130px' }}>
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
                  height: '44px',
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

      {/* Modal d'édition */}
      {editingCategory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#09090b', fontWeight: 800 }}>
              Modifier la catégorie : {editingCategory.name}
            </h3>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '1rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
                  Rayon / Univers *
                </label>
                <select
                  value={editSection}
                  onChange={e => setEditSection(e.target.value as 'clothes' | 'accessories')}
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid #d4d4d8', 
                    fontSize: '0.95rem', 
                    backgroundColor: '#ffffff', 
                    height: '44px',
                    fontWeight: 600,
                    color: editSection === 'accessories' ? '#065f46' : '#1e40af'
                  }}
                >
                  <option value="clothes">👗 Vêtements</option>
                  <option value="accessories">🎒 Accessoires</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
                  Catégorie Parente
                </label>
                <select
                  value={editParentId}
                  onChange={e => setEditParentId(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '0.95rem', backgroundColor: '#ffffff', height: '44px' }}
                >
                  <option value="none">-- Aucune (Catégorie Principale) --</option>
                  {parentCategories
                    .filter(p => p.id !== editingCategory.id)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        Sous-catégorie de : {p.name} ({p.section === 'accessories' ? 'Accessoires' : 'Vêtements'})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3f3f46' }}>
                  Slug URL
                </label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={e => setEditSlug(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '0.9rem', backgroundColor: '#f4f4f5', color: '#52525b' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d4d4d8', backgroundColor: '#f4f4f5', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#09090b', color: '#ffffff', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
                >
                  {editLoading ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onglets de filtrage par Univers */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'all' ? '1px solid #09090b' : '1px solid #e4e4e7',
            backgroundColor: activeTab === 'all' ? '#09090b' : '#ffffff',
            color: activeTab === 'all' ? '#ffffff' : '#52525b',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Toutes ({orderedList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clothes')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'clothes' ? '1px solid #1e40af' : '1px solid #e4e4e7',
            backgroundColor: activeTab === 'clothes' ? '#eff6ff' : '#ffffff',
            color: activeTab === 'clothes' ? '#1e40af' : '#52525b',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          👗 Vêtements ({clothesCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accessories')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'accessories' ? '1px solid #065f46' : '1px solid #e4e4e7',
            backgroundColor: activeTab === 'accessories' ? '#ecfdf5' : '#ffffff',
            color: activeTab === 'accessories' ? '#065f46' : '#52525b',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🎒 Accessoires ({accessoriesCount})
        </button>
      </div>

      {/* ── MOBILE CARDS VIEW (< 768px) ── */}
      <div className="admin-mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>
            Structure du catalogue ({filteredList.length})
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#71717a', border: '1px solid #e4e4e7' }}>
            Aucune catégorie dans ce rayon.
          </div>
        ) : (
          filteredList.map(({ category: cat, isSub, parentName }) => {
            const pCount = productCounts[cat.id] || 0;
            const isDeleting = deletingId === cat.id;

            return (
              <div
                key={cat.id}
                style={{
                  backgroundColor: isSub ? '#fafafa' : '#ffffff',
                  borderRadius: '12px',
                  border: isSub ? '1px dashed #d4d4d8' : '1px solid #e4e4e7',
                  padding: '14px 16px',
                  marginLeft: isSub ? '16px' : '0px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: isSub ? 600 : 800, color: '#09090b' }}>
                      {isSub ? `↳ ${cat.name}` : cat.name}
                    </h3>
                    <code style={{ fontSize: '0.75rem', color: '#71717a', backgroundColor: '#f4f4f5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                      /{cat.cleanSlug}
                    </code>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: cat.section === 'accessories' ? '#ecfdf5' : '#eff6ff',
                        color: cat.section === 'accessories' ? '#065f46' : '#1e40af',
                        fontWeight: 700
                      }}
                    >
                      {cat.section === 'accessories' ? '🎒 Accessoires' : '👗 Vêtements'}
                    </span>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isSub ? '#f4f4f5' : '#ffffff',
                        color: '#71717a',
                        fontWeight: 500,
                        border: '1px solid #e4e4e7'
                      }}
                    >
                      {isSub ? `Sous-catégorie (${parentName})` : 'Principale'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f4f4f5' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 500 }}>
                    <strong>{pCount}</strong> produit(s)
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
            );
          })
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= 768px) ── */}
      <div
        className="admin-desktop-view"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#09090b' }}>
            Structure du catalogue ({filteredList.length})
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rayon / Univers</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug URL</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Produits</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px 24px', textAlign: 'center', color: '#71717a' }}>
                  Aucune catégorie trouvée dans ce rayon.
                </td>
              </tr>
            ) : (
              filteredList.map(({ category: cat, isSub, parentName }) => {
                const pCount = productCounts[cat.id] || 0;
                const isDeleting = deletingId === cat.id;

                return (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #f4f4f5', backgroundColor: isSub ? '#fafafa' : '#ffffff' }}>
                    <td style={{ padding: '14px 20px', paddingLeft: isSub ? '40px' : '20px' }}>
                      <span style={{ fontWeight: isSub ? 500 : 700, color: '#09090b', fontSize: '0.92rem' }}>
                        {isSub ? `↳ ${cat.name}` : cat.name}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          backgroundColor: cat.section === 'accessories' ? '#ecfdf5' : '#eff6ff',
                          color: cat.section === 'accessories' ? '#065f46' : '#1e40af',
                          fontWeight: 700
                        }}
                      >
                        {cat.section === 'accessories' ? '🎒 Accessoires' : '👗 Vêtements'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          backgroundColor: isSub ? '#f4f4f5' : '#fafafa',
                          color: '#3f3f46',
                          fontWeight: 600,
                          border: '1px solid #e4e4e7'
                        }}
                      >
                        {isSub ? `Sous-catégorie (${parentName})` : 'Principale'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <code style={{ fontSize: '0.82rem', color: '#71717a', backgroundColor: '#f4f4f5', padding: '2px 8px', borderRadius: '4px' }}>
                        {cat.cleanSlug}
                      </code>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#3f3f46', fontWeight: 600 }}>
                        {pCount}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
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
