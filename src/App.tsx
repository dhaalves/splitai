import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from './db/db';
import { Layout } from './components/Layout';
import { SetupPage } from './pages/SetupPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
            <Route path="/" element={<div className="p-4">Home placeholder</div>} />
            <Route path="/groups" element={<div className="p-4">Groups placeholder</div>} />
            <Route path="/friends" element={<div className="p-4">Friends placeholder</div>} />
            <Route path="/dashboard" element={<div className="p-4">Dashboard placeholder</div>} />
            <Route path="/search" element={<div className="p-4">Search placeholder</div>} />
            <Route path="/recurring" element={<div className="p-4">Recurring placeholder</div>} />
            <Route path="/more" element={<div className="p-4">More placeholder</div>} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}
