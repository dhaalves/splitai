import { useExpenses } from './useExpenses';
import { ExpenseRow } from './ExpenseRow';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

interface ExpenseListProps {
  groupId?: string | null;
  friendId?: string | null;
  limit?: number;
}

export function ExpenseList({ groupId = null, friendId = null, limit }: ExpenseListProps) {
  const all = useExpenses();
  const navigate = useNavigate();
  if (!all) return null;
  let filtered = all.filter((e) => e.deletedAt === null);
  if (groupId !== undefined) filtered = filtered.filter((e) => e.groupId === groupId);
  if (friendId !== undefined && friendId !== null) {
    filtered = filtered.filter(
      (e) => e.groupId === null && e.splits.some((s) => s.userId === friendId)
    );
  }
  if (limit) filtered = filtered.slice(0, limit);

  if (filtered.length === 0) {
    const newExpenseUrl = `/expenses/new${groupId ? `?group=${groupId}` : friendId ? `?friend=${friendId}` : ''}`;
    return (
      <EmptyState
        icon="🧾"
        title="No expenses yet"
        description="Add your first expense to start tracking."
        action={<Button onClick={() => navigate(newExpenseUrl)}>Add expense</Button>}
      />
    );
  }
  return <ul className="space-y-2">{filtered.map((e) => <ExpenseRow key={e.id} expense={e} />)}</ul>;
}
