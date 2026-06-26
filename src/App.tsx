import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from './db/db';
import { Layout } from './components/Layout';
import { SetupPage } from './pages/SetupPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FriendsPage } from './pages/FriendsPage';
import { FriendDetailPage } from './pages/FriendDetailPage';
import { ExpenseFormPage } from './pages/ExpenseFormPage';
import { ExpenseDetailPage } from './pages/ExpenseDetailPage';
import { DashboardPage } from './pages/DashboardPage';

function ProfileGate() {
  const hasProfile = useLiveQuery(async () => {
    const count = await getDb().profiles.count();
    return count > 0;
  }, []);
  if (hasProfile === undefined) return null;
  if (!hasProfile) return <Navigate to="/setup" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route element={<ProfileGate />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/groups" element={<div className="p-4">Groups placeholder (Task 24)</div>} />
            <Route path="/groups/:id" element={<div className="p-4">Group detail placeholder (Task 24)</div>} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/friends/:id" element={<FriendDetailPage />} />
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
            <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/search" element={<div className="p-4">Search placeholder (Task 26)</div>} />
            <Route path="/recurring" element={<div className="p-4">Recurring placeholder (Task 27)</div>} />
            <Route path="/more" element={<div className="p-4">More placeholder (Task 28)</div>} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}
