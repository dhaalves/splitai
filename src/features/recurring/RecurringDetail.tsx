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

const freqColors: Record<string, string> = {
  weekly: 'rgba(6,182,212,0.12)',
  monthly: 'rgba(139,92,246,0.12)',
  yearly: 'rgba(234,179,8,0.12)',
};

export function RecurringDetail() {
  const { id } = useParams<{ id: string }>();
  const r = useRecurring(id);
  const profile = useProfile();
  const push = useToasts((s) => s.push);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!r || !profile) return null;
  const color = freqColors[r.frequency] ?? 'rgba(148,163,184,0.12)';

  return (
    <div>
      <Header title={r.description} action={<Link to="/recurring"><Button size="sm" variant="ghost">← Back</Button></Link>} />
      <div className="p-4 space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-bg-card border border-border-color p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold font-display"><Money cents={r.amount} currency={profile.defaultCurrency} /></div>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color }}>
              🔁
            </div>
          </div>
          <dl className="mt-4 text-sm space-y-2 border-t border-border-color pt-4">
            <div className="flex justify-between"><dt className="text-text-secondary">Frequency</dt><dd className="font-medium capitalize">{r.frequency}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Next due</dt><dd className="font-medium">{formatDate(r.nextDate)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Status</dt>
              <dd className="font-medium">
                {r.active ? (
                  <span className="inline-flex items-center gap-1.5 text-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Active
                  </span>
                ) : 'Paused'}
              </dd>
            </div>
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
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)} className="ml-auto">Delete</Button>
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