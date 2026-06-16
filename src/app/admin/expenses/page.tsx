import { createAdminClient } from '@/utils/supabase/server';
import ExpensesClient from './ExpensesClient';

export const revalidate = 0;

export default async function ExpensesPage() {
  const supabase = await createAdminClient();
  
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#111827' }}>📉 Dépenses</h1>
      </div>
      <ExpensesClient initialExpenses={expenses || []} />
    </div>
  );
}
