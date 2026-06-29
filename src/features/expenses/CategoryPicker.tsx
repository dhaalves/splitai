import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';

interface CategoryPickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  const categories = useLiveQuery(() => getDb().categories.toArray(), []);
  if (!categories) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mobile-no-scrollbar">
      {categories.map((c) => {
        const selected = selectedId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
              selected
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-bg-card border-border-color text-text-secondary hover:border-border-strong'
            }`}
          >
            <span aria-hidden>{c.icon}</span>
            {c.name}
          </button>
        );
      })}
    </div>
  );
}