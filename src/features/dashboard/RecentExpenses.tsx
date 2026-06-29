import { ExpenseList } from '../expenses/ExpenseList';

export function RecentExpenses() {
  return (
    <div>
      <h3 className="text-sm font-semibold font-display text-text-primary mb-3">Recent</h3>
      <ExpenseList limit={10} />
    </div>
  );
}
