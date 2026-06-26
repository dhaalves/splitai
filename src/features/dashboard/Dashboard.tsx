import { Header } from '../../components/Header';
import { FAB } from '../../components/FAB';
import { SummaryCards } from './SummaryCards';
import { MonthlyChart } from './MonthlyChart';
import { RecentExpenses } from './RecentExpenses';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const count = useLiveQuery(() => getDb().expenses.count(), []);
  const navigate = useNavigate();
  return (
    <div>
      <Header title="SplitAI" />
      <div className="p-4 space-y-4">
        {count === 0 ? (
          <EmptyState
            icon="🧾"
            title="Welcome to SplitAI"
            description="Add your first expense to start tracking who owes whom."
            action={<Button onClick={() => navigate('/expenses/new')}>Add expense</Button>}
          />
        ) : (
          <>
            <SummaryCards />
            <MonthlyChart />
            <RecentExpenses />
          </>
        )}
      </div>
      <FAB to="/expenses/new" />
    </div>
  );
}
