import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { createFriend } from './useFriends';
import { useToasts } from '../../stores/toasts';

interface FriendFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function FriendForm({ open, onClose, onSaved }: FriendFormProps) {
  const push = useToasts((s) => s.push);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const valid = Boolean(firstName.trim() && lastName.trim());

  async function submit() {
    if (!valid) return;
    await createFriend({ firstName, lastName, email });
    push('Friend added', 'success');
    setFirstName(''); setLastName(''); setEmail('');
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add friend"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>Save</Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-slate-300">First name</span>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Last name</span>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Email (optional)</span>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        </label>
      </div>
    </Modal>
  );
}
