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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <Header title="SplitAI" />
      <div className="p-4 space-y-6">
        {count === 0 ? (
          <EmptyState
            icon="🧾"
            title="Welcome to SplitAI"
            description="Add your first expense to start tracking who owes whom."
            action={<Button onClick={() => navigate('/expenses/new')}>Add expense</Button>}
          />
        ) : (
          <>
            {/* Hero greeting */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-bg-card to-transparent border border-border-color p-5">
              <div className="relative z-10">
                <div className="text-sm text-text-secondary font-medium">{greeting} 👋</div>
                <div className="text-2xl font-bold font-display mt-1">Here's your summary</div>
              </div>
              <div className="absolute -right-8 -bottom-8 text-8xl opacity-10">💰</div>
            </div>

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