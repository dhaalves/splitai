import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { Chip } from '../../components/Chip';

interface CategoryPickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  const categories = useLiveQuery(() => getDb().categories.toArray(), []);
  if (!categories) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {categories.map((c) => (
        <Chip key={c.id} selected={selectedId === c.id} onClick={() => onSelect(c.id)}>
          <span className="mr-1" aria-hidden>{c.icon}</span>
          {c.name}
        </Chip>
      ))}
    </div>
  );
}
