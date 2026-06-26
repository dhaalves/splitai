import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Money } from '../../components/Money';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useState } from 'react';
import { useRecurring, deleteRecurring, updateRecurring, generateNow } from './useRecurring';
import { useProfile } from '../auth/useProfile';
import { useToasts } from '../../stores/toasts';
import { formatDate } from '../../lib/dates';

export function RecurringDetail() {
  const { id } = useParams<{ id: string }>();
  const r = useRecurring(id);
  const profile = useProfile();
  const push = useToasts((s) => s.push);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!r || !profile) return null;

  return (
    <div>
      <Header title={r.description} action={<Link to="/recurring"><Button size="sm" variant="ghost">Back</Button></Link>} />
      <div className="p-4 space-y-4">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
          <div className="text-2xl font-bold"><Money cents={r.amount} currency={profile.defaultCurrency} /></div>
          <dl className="mt-3 text-sm space-y-1">
            <div className="flex justify-between"><dt className="text-slate-400">Frequency</dt><dd className="capitalize">{r.frequency}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Next due</dt><dd>{formatDate(r.nextDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Status</dt><dd>{r.active ? 'Active' : 'Paused'}</dd></div>
          </dl>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={async () => { await generateNow(r.id); push('Expense generated', 'success'); }}>
            Generate now
          </Button>
          <Button size="sm" variant="secondary" onClick={async () => {
            await updateRecurring(r.id, { active: !r.active });
            push(r.active ? 'Paused' : 'Resumed', 'success');
          }}>
            {r.active ? 'Pause' : 'Resume'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>Delete</Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete recurring?"
        message="Future instances will no longer generate. Past expenses remain."
        confirmLabel="Delete"
        danger
        onConfirm={async () => { await deleteRecurring(r.id); push('Recurring deleted', 'success'); navigate('/recurring'); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
