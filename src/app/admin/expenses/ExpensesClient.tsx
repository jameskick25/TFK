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
      const expenseDate = new Date(expense.created_at);
      if (filter === 'all') return true;
      if (filter === 'today') {
        return expenseDate.toDateString() === now.toDateString();
      }
      if (filter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return expenseDate.toDateString() === yesterday.toDateString();
      }
      if (filter === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
        return expenseDate >= startOfWeek;
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
      alert('Erreur: ' + res.error);
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
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
          Gestion Financière
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
          Charges & Dépenses
        </h1>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nombre de Dépenses</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#09090b', marginTop: '6px' }}>{filteredExpenses.length}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total des Charges ({filter})</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b91c1c', marginTop: '6px' }}>{totalExpenses.toLocaleString()} DA</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'today', label: "Aujourd'hui" },
          { id: 'yesterday', label: 'Hier' },
          { id: 'week', label: 'Cette Semaine' },
          { id: 'all', label: 'Toutes les dépenses' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #d4d4d8',
              background: filter === f.id ? '#09090b' : '#ffffff',
              color: filter === f.id ? '#ffffff' : '#3f3f46',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e4e4e7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>
          Enregistrer une nouvelle dépense
        </h3>
        <form onSubmit={handleAddExpense}>
          <div className="admin-form-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="admin-form-col" style={{ flex: 3, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#3f3f46' }}>Description / Motif *</label>
              <input type="text" name="description" required placeholder="Ex: Sponsoring Instagram, Emballage, Transport..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '1rem', outline: 'none' }} />
            </div>

            <div className="admin-form-col" style={{ flex: 1.5, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#3f3f46' }}>Montant (DA) *</label>
              <input type="number" name="amount" required min="0" placeholder="0 DA" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '1rem', outline: 'none' }} />
            </div>

            <div className="admin-form-col" style={{ minWidth: '130px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {isSubmitting ? '...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── MOBILE CARDS VIEW (< 768px) ── */}
      <div className="admin-mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e4e4e7',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#09090b' }}>
                  {expense.description}
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#71717a' }}>
                  {new Date(expense.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {editingId === expense.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f4f4f5' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717a' }}>Montant (DA)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #3b82f6', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={handleSaveEdit} style={{ backgroundColor: '#09090b', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
                  <button onClick={() => setEditingId(null)} style={{ backgroundColor: '#f4f4f5', color: '#3f3f46', border: '1px solid #e4e4e7', borderRadius: '6px', padding: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>Annuler</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f4f4f5' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#b91c1c' }}>
                  -{expense.amount?.toLocaleString()} DA
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => startEdit(expense)}
                    style={{ background: '#ffffff', border: '1px solid #d4d4d8', color: '#09090b', padding: '5px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    style={{ background: '#ffffff', border: '1px solid #fecaca', color: '#dc2626', padding: '5px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Suppr.
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#71717a', border: '1px solid #e4e4e7' }}>
            Aucune dépense pour cette période.
          </div>
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= 768px) ── */}
      <div className="admin-desktop-view" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e4e4e7', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
              <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
              <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant</th>
              <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#71717a' }}>
                  {new Date(expense.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '14px 18px', fontWeight: 600, color: '#09090b', fontSize: '0.92rem' }}>{expense.description}</td>
                
                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#b91c1c', fontSize: '0.92rem' }}>
                  {editingId === expense.id ? (
                    <input type="number" value={editAmount} onChange={(e) => setEditAmount(parseInt(e.target.value) || 0)} style={{ width: '100px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #3b82f6' }} />
                  ) : (
                    `${expense.amount?.toLocaleString()} DA`
                  )}
                </td>
                
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  {editingId === expense.id ? (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button onClick={handleSaveEdit} style={{ padding: '5px 12px', backgroundColor: '#09090b', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Enregistrer</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '5px 12px', backgroundColor: '#f4f4f5', color: '#3f3f46', border: '1px solid #e4e4e7', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Annuler</button>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button onClick={() => startEdit(expense)} style={{ padding: '5px 12px', backgroundColor: '#ffffff', color: '#09090b', border: '1px solid #d4d4d8', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Modifier</button>
                      <button onClick={() => handleDelete(expense.id)} style={{ padding: '5px 12px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Supprimer</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: '#71717a' }}>Aucune dépense pour cette période.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
