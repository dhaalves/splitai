import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { AmountInput } from '../../components/AmountInput';
import { CategoryPicker } from '../expenses/CategoryPicker';
import { SplitEditor } from '../expenses/SplitEditor';
import { useProfile } from '../auth/useProfile';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { createRecurring, type RecurringInput } from './useRecurring';
import { useToasts } from '../../stores/toasts';
import type { Frequency, SplitEntry, SplitMethod } from '../../db/schema';

interface RecurringFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const FREQUENCIES: Frequency[] = ['weekly', 'monthly', 'yearly'];

export function RecurringForm({ open, onClose, onSaved }: RecurringFormProps) {
  const profile = useProfile();
  const contacts = useLiveQuery(() => getDb().contacts.toArray(), []);
  const push = useToasts((s) => s.push);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string | null>('general');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [paidBy, setPaidBy] = useState('');
  const [method, setMethod] = useState<SplitMethod>('equal');
  const [splits, setSplits] = useState<SplitEntry[]>([]);

  if (!profile) return null;
  const participantIds = [profile.id, ...(contacts ?? []).slice(0, 1).map((c) => c.id)];
  const participants = participantIds.map((id) => {
    if (id === profile.id) return { id, name: `${profile.firstName} ${profile.lastName}`, color: profile.avatarColor };
    const c = (contacts ?? []).find((x) => x.id === id);
    return { id, name: c ? `${c.firstName} ${c.lastName}` : 'Unknown', color: c?.avatarColor ?? '#64748b' };
  });
  if (splits.length === 0 && participantIds.length > 0) {
    setSplits(participantIds.map((id) => ({ userId: id, share: 0 })));
  }

  const valid = Boolean(description.trim() && amount > 0 && category && paidBy);

  async function submit() {
    if (!valid || !profile || !category) return;
    const input: RecurringInput = {
      description: description.trim(),
      amount,
      category,
      groupId: null,
      paidBy,
      splitMethod: method,
      splits,
      frequency,
      startDate: new Date(startDate).getTime(),
    };
    await createRecurring(input);
    push('Recurring expense created', 'success');
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New recurring expense"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={!valid}>Create</Button></>}
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-slate-300">Description</span>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Amount</span>
          <AmountInput valueCents={amount} onChange={setAmount} currency={profile.defaultCurrency} className="mt-1" />
        </label>
        <div>
          <span className="text-sm text-slate-300">Category</span>
          <div className="mt-1"><CategoryPicker selectedId={category} onSelect={setCategory} /></div>
        </div>
        <label className="block">
          <span className="text-sm text-slate-300">Frequency</span>
          <Select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="mt-1">
            {FREQUENCIES.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
          </Select>
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Start date</span>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Paid by</span>
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100">
            {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <SplitEditor
          amount={amount}
          currency={profile.defaultCurrency}
          method={method}
          splits={splits}
          participants={participants}
          onMethodChange={setMethod}
          onShareChange={(uid, share) => setSplits((prev) => prev.map((s) => s.userId === uid ? { ...s, share } : s))}
        />
      </div>
    </Modal>
  );
}
