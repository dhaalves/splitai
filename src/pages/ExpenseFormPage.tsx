import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ExpenseForm } from '../features/expenses/ExpenseForm';

export function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [open] = useState(true);
  const groupId = params.get('group');
  const friendId = params.get('friend');
  return (
    <ExpenseForm
      open={open}
      onClose={() => navigate(-1)}
      onSaved={() => navigate(-1)}
      initialGroupId={groupId}
      initialFriendId={friendId}
      editingId={id}
    />
  );
}
