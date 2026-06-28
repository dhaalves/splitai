import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { createProfile } from '../../db/seed';
import { getDb } from '../../db/db';
import { useToasts } from '../../stores/toasts';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN'];

export function Setup() {
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('USD');

  const valid = Boolean(firstName.trim() && lastName.trim() && email.trim() && currency);

  async function submit() {
    if (!valid) return;
    await createProfile(getDb(), { firstName, lastName, email, defaultCurrency: currency });
    push('Profile created', 'success');
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Welcome to SplitAI</h1>
        <p className="text-text-secondary mb-6">Let's set up your profile.</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-text-secondary">First name</span>
            <Input aria-label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
          </label>
          <label className="block">
            <span className="text-sm text-text-secondary">Last name</span>
            <Input aria-label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
          </label>
          <label className="block">
            <span className="text-sm text-text-secondary">Email</span>
            <Input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </label>
          <label className="block">
            <span className="text-sm text-text-secondary">Currency</span>
            <Select aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </label>
          <Button onClick={submit} disabled={!valid} size="lg" className="w-full">
            Get started
          </Button>
        </div>
      </div>
    </div>
  );
}
