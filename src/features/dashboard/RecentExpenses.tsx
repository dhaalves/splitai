import { ExpenseList } from '../expenses/ExpenseList';

export function RecentExpenses() {
  return (
    <div>
      <h3 className="text-sm uppercase text-text-muted mb-2">Recent</h3>
      <ExpenseList limit={10} />
    </div>
  );
}
