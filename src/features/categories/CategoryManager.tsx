import { useState } from 'react';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { useCategories, createCategory, deleteCategory } from './useCategories';
import { useToasts } from '../../stores/toasts';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function CategoryManager() {
  const categories = useCategories();
  const push = useToasts((s) => s.push);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('#6366f1');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) return;
    await createCategory({ name, icon, color });
    push('Category added', 'success');
    setName(''); setIcon('📦'); setColor('#6366f1');
    setShowForm(false);
  }

  async function doDelete() {
    if (!confirmId) return;
    try {
      await deleteCategory(confirmId);
      push('Category deleted', 'success');
    } catch (e) {
      push(e instanceof Error ? e.message : String(e), 'error');
    }
    setConfirmId(null);
  }

  return (
    <div>
      <Header title="Categories" />
      <div className="p-4 space-y-3">
        <Button size="sm" onClick={() => setShowForm(true)}>+ Add category</Button>
        <ul className="space-y-2">
          {(categories ?? []).map((c) => (
            <li key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-xl">{c.icon}</span>
              <span className="flex-1">{c.name}</span>
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
              {!c.system && (
                <Button size="sm" variant="ghost" onClick={() => setConfirmId(c.id)}>Delete</Button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New category"
        footer={<><Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={submit} disabled={!name.trim()}>Add</Button></>}
      >
        <div className="space-y-3">
          <label className="block"><span className="text-sm text-slate-300">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></label>
          <label className="block"><span className="text-sm text-slate-300">Icon (emoji)</span>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="mt-1" /></label>
          <label className="block"><span className="text-sm text-slate-300">Color (hex)</span>
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="mt-1" /></label>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmId !== null}
        title="Delete category?"
        message="Expenses using this category will be reassigned to General."
        confirmLabel="Delete"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
