import { NavLink } from 'react-router-dom';
import { Avatar } from './Avatar';
import { useProfile } from '../features/auth/useProfile';

const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/groups', label: 'Groups', icon: '👥' },
  { to: '/friends', label: 'Friends', icon: '🤝' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/search', label: 'Search', icon: '🔍' },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  { to: '/more', label: 'More', icon: '⚙️' },
];

export function Sidebar() {
  const profile = useProfile();
  return (
    <aside className="hidden md:flex flex-col w-60 bg-slate-950 border-r border-slate-800 p-4">
      <div className="text-xl font-bold text-slate-100 mb-6 px-2">SplitAI</div>
      <nav className="flex-1 flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg flex items-center gap-3 ${isActive ? 'bg-accent text-white' : 'text-slate-300 hover:bg-slate-800'}`
            }
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      {profile && (
        <div className="flex items-center gap-2 p-2 border-t border-slate-800 pt-3">
          <Avatar name={`${profile.firstName} ${profile.lastName}`} color={profile.avatarColor} size="sm" />
          <div className="text-sm">
            <div className="text-slate-200">{profile.firstName} {profile.lastName}</div>
            <div className="text-slate-500 text-xs">{profile.email}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
