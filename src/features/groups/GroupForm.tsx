import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { createGroup } from './useGroups';
import { useProfile } from '../auth/useProfile';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { useToasts } from '../../stores/toasts';
import type { GroupType } from '../../db/schema';

interface GroupFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (id: string) => void;
}

const TYPES: GroupType[] = ['home', 'trip', 'couple', 'other'];

export function GroupForm({ open, onClose, onSaved }: GroupFormProps) {
  const profile = useProfile();
  const contacts = useLiveQuery(() => getDb().contacts.toArray(), []);
  const push = useToasts((s) => s.push);
  const [name, setName] = useState('');
  const [type, setType] = useState<GroupType>('home');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const valid = Boolean(name.trim() && profile);

  async function submit() {
    if (!valid || !profile) return;
    const g = await createGroup({
      name,
      type,
      memberIds: [profile.id, ...selectedContacts],
    });
    push('Group created', 'success');
    setName(''); setSelectedContacts([]);
    onSaved(g.id);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create group"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>Create</Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-slate-300">Name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Type</span>
          <Select value={type} onChange={(e) => setType(e.target.value as GroupType)} className="mt-1">
            {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </Select>
        </label>
        <div>
          <span className="text-sm text-slate-300">Members</span>
          <ul className="mt-1 space-y-1">
            {(contacts ?? []).map((c) => (
              <li key={c.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(c.id)}
                    onChange={(e) => {
                      setSelectedContacts((prev) =>
                        e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                      );
                    }}
                  />
                  {c.firstName} {c.lastName}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
