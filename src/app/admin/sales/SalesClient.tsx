'use client';

import { useState, useMemo } from 'react';
import { addManualSale, deleteManualSale, editManualSale } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

type Sale = {
  id: string;
  product_name: string;
  price: number;
  benefice: number;
  client_info: string;
  wilaya: string;
  created_at: string;
};

export default function SalesClient({ initialSales }: { initialSales: Sale[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editBenefice, setEditBenefice] = useState<number>(0);

  const now = new Date();
  
  const filteredSales = useMemo(() => {
    return initialSales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      if (filter === 'all') return true;
      if (filter === 'today') {
        return saleDate.toDateString() === now.toDateString();
      }
      if (filter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return saleDate.toDateString() === yesterday.toDateString();
      }
      if (filter === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
        return saleDate >= startOfWeek;
      }
      return true;
    });
  }, [initialSales, filter]);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.price, 0);
  const totalBenefice = filteredSales.reduce((sum, sale) => sum + (sale.benefice || 0), 0);

  const handleAddSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await addManualSale(formData);
    if (res.success) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert('Erreur: ' + res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette vente ?')) return;
    const res = await deleteManualSale(id);
    if (res.success) {
      router.refresh();
    } else {
      alert('Erreur lors de la suppression.');
    }
  };

  const startEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setEditPrice(sale.price);
    setEditBenefice(sale.benefice || 0);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const res = await editManualSale(editingId, editPrice, editBenefice);
    if (res.success) {
      setEditingId(null);
      router.refresh();
    } else {
      alert('Erreur: ' + res.error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Ventes ({filter})</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginTop: '8px' }}>{filteredSales.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#10b981', color: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>Chiffre d'Affaires ({filter})</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{totalRevenue.toLocaleString()} DA</div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#3b82f6', color: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>Bénéfice Total ({filter})</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{totalBenefice.toLocaleString()} DA</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {[
          { id: 'today', label: "Aujourd'hui" },
          { id: 'yesterday', label: 'Hier' },
          { id: 'week', label: 'Cette Semaine' },
          { id: 'all', label: 'Total' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #d1d5db',
              background: filter === f.id ? '#111827' : '#fff',
              color: filter === f.id ? '#fff' : '#374151',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>+ Ajouter une vente</h3>
        <form onSubmit={handleAddSale} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#4b5563' }}>Produit</label>
            <input type="text" name="product_name" required placeholder="Ex: T-shirt Nike Bleu" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#4b5563' }}>Prix Vente</label>
            <input type="number" name="price" required min="0" placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#4b5563' }}>Bénéfice</label>
            <input type="number" name="benefice" min="0" placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ flex: 2, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#4b5563' }}>Infos Client</label>
            <input type="text" name="client_info" placeholder="Insta: @user / Tel..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#4b5563' }}>Wilaya</label>
            <input type="text" name="wilaya" placeholder="Ex: Alger" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', height: '42px' }}>
            {isSubmitting ? '...' : 'Ajouter'}
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Produit</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Infos Client</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Wilaya</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Prix</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Bénéfice</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563' }}>{new Date(sale.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{sale.product_name}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563' }}>{sale.client_info || '-'}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563' }}>{sale.wilaya || '-'}</td>
                
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#10b981' }}>
                  {editingId === sale.id ? (
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '4px' }} />
                  ) : (
                    `${sale.price} DA`
                  )}
                </td>
                
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>
                  {editingId === sale.id ? (
                    <input type="number" value={editBenefice} onChange={(e) => setEditBenefice(parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '4px' }} />
                  ) : (
                    `${sale.benefice || 0} DA`
                  )}
                </td>
                
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  {editingId === sale.id ? (
                    <>
                      <button onClick={handleSaveEdit} style={{ padding: '4px 8px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Enregistrer</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Annuler</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(sale)} style={{ padding: '4px 8px', backgroundColor: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Modifier</button>
                      <button onClick={() => handleDelete(sale.id)} style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Supprimer</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Aucune vente pour cette période.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
