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
        <div className="grid grid-cols-2 gap-2.5">
          {(categories ?? []).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-border-color hover:border-border-strong transition-all"
              style={{ borderLeft: `3px solid ${c.color}` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${c.color}20` }}
              >
                {c.icon}
              </div>
              <span className="flex-1 font-semibold truncate">{c.name}</span>
              {!c.system && (
                <Button size="sm" variant="ghost" onClick={() => setConfirmId(c.id)}>Del</Button>
              )}
            </div>
          ))}
        </div>
      </div>
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New category"
        footer={<><Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={submit} disabled={!name.trim()}>Add</Button></>}
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Category name" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Icon (emoji)</span>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Color (hex)</span>
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="mt-1.5" />
          </label>
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