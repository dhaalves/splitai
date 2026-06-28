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
    <aside className="hidden md:flex flex-col w-60 bg-bg-dark border-r border-border-color p-4">
      <div className="text-xl font-bold text-text-primary mb-6 px-2">SplitAI</div>
      <nav className="flex-1 flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg flex items-center gap-3 ${isActive ? 'bg-accent-500 text-white' : 'text-text-secondary hover:bg-bg-card'}`
            }
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      {profile && (
        <div className="flex items-center gap-2 p-2 border-t border-border-color pt-3">
          <Avatar name={`${profile.firstName} ${profile.lastName}`} color={profile.avatarColor} size="sm" />
          <div className="text-sm">
            <div className="text-text-primary">{profile.firstName} {profile.lastName}</div>
            <div className="text-text-muted text-xs">{profile.email}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
