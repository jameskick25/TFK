'use client';

import { useState, useMemo } from 'react';
import { addExpense, deleteExpense, editExpense } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

type Expense = {
  id: string;
  description: string;
  amount: number;
  created_at: string;
};

export default function ExpensesClient({ initialExpenses }: { initialExpenses: Expense[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const now = new Date();
  
  const filteredExpenses = useMemo(() => {
    return initialExpenses.filter(expense => {
      const expDate = new Date(expense.created_at);
      if (filter === 'all') return true;
      if (filter === 'today') {
        return expDate.toDateString() === now.toDateString();
      }
      if (filter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return expDate.toDateString() === yesterday.toDateString();
      }
      if (filter === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return expDate >= startOfWeek;
      }
      return true;
    });
  }, [initialExpenses, filter]);

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await addExpense(formData);
    if (res.success) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert('Erreur: ' + res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) return;
    const res = await deleteExpense(id);
    if (res.success) {
      router.refresh();
    } else {
      alert('Erreur lors de la suppression.');
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const res = await editExpense(editingId, editAmount);
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
          <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Dépenses ({filter})</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginTop: '8px' }}>{filteredExpenses.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#ef4444', color: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>Total Dépenses ({filter})</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{totalExpenses.toLocaleString()} DA</div>
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>+ Ajouter une dépense</h3>
        <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#4b5563' }}>Description</label>
            <input type="text" name="description" required placeholder="Ex: Sponsoring Instagram, Emballages..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#4b5563' }}>Montant (DA)</label>
            <input type="number" name="amount" required min="0" placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', height: '42px' }}>
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
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Montant</th>
              <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563' }}>{new Date(expense.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{expense.description}</td>
                
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ef4444' }}>
                  {editingId === expense.id ? (
                    <input type="number" value={editAmount} onChange={(e) => setEditAmount(parseInt(e.target.value) || 0)} style={{ width: '100px', padding: '4px' }} />
                  ) : (
                    `${expense.amount} DA`
                  )}
                </td>
                
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  {editingId === expense.id ? (
                    <>
                      <button onClick={handleSaveEdit} style={{ padding: '4px 8px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Enregistrer</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Annuler</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(expense)} style={{ padding: '4px 8px', backgroundColor: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Modifier</button>
                      <button onClick={() => handleDelete(expense.id)} style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Supprimer</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Aucune dépense pour cette période.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
