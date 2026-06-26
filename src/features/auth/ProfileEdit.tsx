import { useState } from 'react';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
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
      <div className="p-4 space-y-3 max-w-md">
        <label className="block"><span className="text-sm text-slate-300">First name</span>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" /></label>
        <label className="block"><span className="text-sm text-slate-300">Last name</span>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" /></label>
        <label className="block"><span className="text-sm text-slate-300">Email</span>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></label>
        <label className="block"><span className="text-sm text-slate-300">Currency</span>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select></label>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
}
