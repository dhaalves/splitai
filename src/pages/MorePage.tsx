import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

const items = [
  { to: '/settings/profile', label: 'Profile', icon: '👤', desc: 'Name, email, currency', color: 'rgba(16,185,129,0.12)' },
  { to: '/settings/categories', label: 'Categories', icon: '🏷️', desc: 'Manage expense categories', color: 'rgba(234,179,8,0.12)' },
  { to: '/settings/backup', label: 'Backup & Data', icon: '💾', desc: 'Export and import data', color: 'rgba(6,182,212,0.12)' },
];

export function MorePage() {
  return (
    <div>
      <Header title="More" />
      <div className="p-4">
        <div className="space-y-2.5">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="flex items-center gap-3 p-4 rounded-2xl bg-bg-card border border-border-color hover:border-border-strong hover:bg-bg-elevated/50 transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: it.color }}
              >
                {it.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{it.label}</div>
                <div className="text-xs text-text-secondary mt-0.5">{it.desc}</div>
              </div>
              <span className="text-text-muted">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}