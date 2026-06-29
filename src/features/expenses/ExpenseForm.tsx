import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AmountInput } from '../../components/AmountInput';
import { CategoryPicker } from './CategoryPicker';
import { SplitEditor } from './SplitEditor';
import { useProfile } from '../auth/useProfile';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { createExpense, updateExpense, useExpense, type ExpenseInput } from './useExpenses';
import type { SplitEntry, SplitMethod } from '../../db/schema';
import { useToasts } from '../../stores/toasts';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialGroupId: string | null;
  initialFriendId: string | null;
  editingId?: string;
}

function todayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function ExpenseForm({
  open, onClose, onSaved, initialGroupId, initialFriendId, editingId,
}: ExpenseFormProps) {
  const profile = useProfile();
  const existing = useExpense(editingId);
  const contacts = useLiveQuery(() => getDb().contacts.toArray(), []);
  const group = useLiveQuery(
    async () => (initialGroupId ? getDb().groups.get(initialGroupId) : undefined),
    [initialGroupId]
  );
  const push = useToasts((s) => s.push);

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState(todayMs());
  const [paidBy, setPaidBy] = useState<string>('');
  const [method, setMethod] = useState<SplitMethod>('equal');
  const [splits, setSplits] = useState<SplitEntry[]>([]);
  const [isSettlement, setIsSettlement] = useState(false);

  // Stable participant id list. Memoised because every value of this list is
  // referenced in the init `useEffect` deps; without memoisation, branches
  // that build a new array (no `group` yet) would change identity on every
  // render and the effect would loop.
  const participantIds = useMemo<string[]>(() => {
    if (group) return group.memberIds;
    if (initialFriendId && profile) return [profile.id, initialFriendId];
    if (profile) return [profile.id, ...(contacts ?? []).slice(0, 1).map((c) => c.id)];
    return [];
  }, [group, initialFriendId, profile, contacts]);

  const participants = participantIds.map((id) => {
    if (profile && id === profile.id) {
      return { id, name: `${profile.firstName} ${profile.lastName}`, color: profile.avatarColor };
    }
    const c = (contacts ?? []).find((x) => x.id === id);
    return { id, name: c ? `${c.firstName} ${c.lastName}` : 'Unknown', color: c?.avatarColor ?? '#64748b' };
  });

  // Re-init the form whenever the user opens it, switches between create/edit,
  // or — in create mode — once the asynchronously-loaded group / contacts data
  // has resolved. Without the extra deps below, opening the form from a group
  // (e.g. `/expenses/new?group=<id>`) would initialise `splits` with the
  // fallback `[profile, firstContact]` before the group query resolves, and
  // the splits would never be rebuilt to include the full member list.
  useEffect(() => {
    if (!open || !profile) return;
    if (existing) {
      setAmount(existing.amount);
      setDescription(existing.description);
      setCategory(existing.category);
      setDate(existing.date);
      setPaidBy(existing.paidBy);
      setMethod(existing.splitMethod);
      setSplits(existing.splits);
      setIsSettlement(existing.isSettlement);
    } else if (participantIds.length > 0) {
      // Only seed splits once we actually know who the participants are.
      // `participantIds` may be `[]` on the very first render while group
      // / contacts are still loading — re-running on the next render is fine.
      setAmount(0);
      setDescription('');
      setCategory('general');
      setDate(todayMs());
      setPaidBy(profile.id);
      setMethod('equal');
      setSplits(participantIds.map((id) => ({ userId: id, share: 0 })));
      setIsSettlement(false);
    }
  }, [open, existing, profile?.id, initialGroupId, initialFriendId, participantIds]);

  function updateShare(userId: string, share: number) {
    setSplits((prev) => prev.map((s) => (s.userId === userId ? { ...s, share } : s)));
  }

  const splitsValid = (() => {
    if (isSettlement) return amount > 0;
    if (amount <= 0) return false;
    if (method === 'percent') return splits.reduce((a, s) => a + s.share, 0) === 100;
    if (method === 'exact') return splits.reduce((a, s) => a + s.share, 0) === amount;
    if (method === 'shares') return splits.some((s) => s.share > 0);
    return true;
  })();
  const valid = Boolean(
    profile &&
    amount > 0 &&
    description.trim() &&
    category &&
    paidBy &&
    splits.length > 0 &&
    splitsValid
  );

  async function save() {
    if (!valid || !profile || !category) return;
    const otherId = participantIds.find((id) => id !== paidBy);
    const input: ExpenseInput = {
      amount,
      currency: profile.defaultCurrency,
      description: description.trim(),
      category,
      date,
      // Preserve the original groupId when editing; otherwise scope to the
      // group passed in the URL (`initialGroupId`). Without this, editing a
      // group expense (no `?group=` in the edit URL) would silently drop the
      // group association.
      groupId: editingId ? (existing?.groupId ?? null) : initialGroupId,
      paidBy,
      splitMethod: isSettlement ? 'exact' : method,
      splits: isSettlement
        ? [{ userId: paidBy, share: 0 }, ...(otherId ? [{ userId: otherId, share: amount }] : [])]
        : splits,
      isSettlement,
    };
    if (editingId) {
      await updateExpense(editingId, input);
      push('Expense updated', 'success');
    } else {
      await createExpense(input);
      push('Expense added', 'success');
    }
    onSaved();
  }

  if (!profile) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit expense' : 'Add expense'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!valid}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-text-secondary">Amount</span>
          <AmountInput
            aria-label="Amount"
            valueCents={amount}
            onChange={setAmount}
            currency={profile.defaultCurrency}
            className="mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm text-text-secondary">Description</span>
          <Input
            aria-label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </label>
        <div>
          <span className="text-sm text-text-secondary">Category</span>
          <div className="mt-1">
            <CategoryPicker selectedId={category} onSelect={setCategory} />
          </div>
        </div>
        <label className="block">
          <span className="text-sm text-text-secondary">Date</span>
          <Input
            type="date"
            aria-label="Date"
            value={new Date(date).toISOString().slice(0, 10)}
            onChange={(e) => setDate(new Date(e.target.value).getTime())}
            className="mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm text-text-secondary">Paid by</span>
          <select
            aria-label="Paid by"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="mt-1 w-full rounded-xl bg-bg-card border border-border-color px-3 py-2 text-text-primary"
          >
            {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={isSettlement}
            onChange={(e) => setIsSettlement(e.target.checked)}
          />
          This is a settlement payment
        </label>
        {!isSettlement && (
          <SplitEditor
            amount={amount}
            currency={profile.defaultCurrency}
            method={method}
            splits={splits}
            participants={participants}
            onMethodChange={setMethod}
            onShareChange={updateShare}
          />
        )}
      </div>
    </Modal>
  );
}
