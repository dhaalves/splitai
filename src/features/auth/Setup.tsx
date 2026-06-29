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
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-3xl font-bold font-display">
            Welcome to <span className="text-gradient">SplitAI</span>
          </h1>
          <p className="text-text-secondary mt-2">Let's set up your profile to get started.</p>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border-color p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">First name</span>
            <Input aria-label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Last name</span>
            <Input aria-label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Email</span>
            <Input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Currency</span>
            <Select aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1.5">
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