import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

const items = [
  { to: '/settings/profile', label: 'Profile', icon: '👤' },
  { to: '/settings/categories', label: 'Categories', icon: '🏷️' },
  { to: '/settings/backup', label: 'Backup & Data', icon: '💾' },
];

export function MorePage() {
  return (
    <div>
      <Header title="More" />
      <div className="p-4">
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.to}>
              <Link to={it.to} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700/60">
                <span className="text-xl">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
