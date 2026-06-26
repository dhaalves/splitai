import { ExpenseList } from '../expenses/ExpenseList';

export function RecentExpenses() {
  return (
    <div>
      <h3 className="text-sm uppercase text-slate-500 mb-2">Recent</h3>
      <ExpenseList limit={10} />
    </div>
  );
}
