import { useState } from 'react';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Avatar } from '../../components/Avatar';
import { useProfile } from './useProfile';
import { getDb } from '../../db/db';
import { useToasts } from '../../stores/toasts';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN'];

export function ProfileEdit() {
  const profile = useProfile();
  const push = useToasts((s) => s.push);
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [currency, setCurrency] = useState(profile?.defaultCurrency ?? 'USD');

  if (!profile) return null;

  async function save() {
    await getDb().profiles.update(profile!.id, { firstName, lastName, email, defaultCurrency: currency });
    push('Profile updated', 'success');
  }

  return (
    <div>
      <Header title="Profile" />
      <div className="p-4 space-y-4 max-w-md">
        {/* Avatar preview */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-bg-card border border-border-color">
          <Avatar name={`${firstName} ${lastName}`} color={profile.avatarColor} size="lg" />
          <div>
            <div className="text-lg font-bold font-display">{firstName} {lastName}</div>
            <div className="text-sm text-text-secondary">{email}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border-color p-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">First name</span>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Last name</span>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Currency</span>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1.5">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </label>
          <Button onClick={save} className="w-full">Save changes</Button>
        </div>
      </div>
    </div>
  );
}