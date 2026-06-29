import { ExpenseList } from '../expenses/ExpenseList';

export function RecentExpenses() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold font-display text-text-primary">Recent expenses</h3>
      </div>
      <ExpenseList limit={10} />
    </div>
  );
}