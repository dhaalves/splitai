import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import type { SearchFilters } from './useSearch';
import { useSearch } from './useSearch';

export function Search() {
  const [text, setText] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const categories = useLiveQuery(() => getDb().categories.toArray(), []);
  const groups = useLiveQuery(() => getDb().groups.toArray(), []);

  const filters: SearchFilters = {
    text, categoryIds: selectedCats, groupId, fromMs: null, toMs: null,
  };
  const results = useSearch(filters);

  function toggleCat(id: string) {
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  return (
    <div>
      <Header title="Search" />
      <div className="p-4 space-y-4">
        <Input
          placeholder="Search descriptions..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <div className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-2">Category</div>
          <div className="flex gap-2 flex-wrap">
            {(categories ?? []).map((c) => (
              <Chip key={c.id} selected={selectedCats.includes(c.id)} onClick={() => toggleCat(c.id)}>
                <span className="mr-1">{c.icon}</span>{c.name}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-2">Group</div>
          <div className="flex gap-2 flex-wrap">
            <Chip selected={groupId === null} onClick={() => setGroupId(null)}>All</Chip>
            {(groups ?? []).filter((g) => g.deletedAt === null).map((g) => (
              <Chip key={g.id} selected={groupId === g.id} onClick={() => setGroupId(g.id)}>
                {g.name}
              </Chip>
            ))}
          </div>
        </div>
        <div className="pt-2">
          {results && results.length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-8">No matches found.</p>
          ) : (
            <div className="space-y-2">
              {results?.map((e) => (
                <Link
                  key={e.id}
                  to={`/expenses/${e.id}`}
                  className="block p-3.5 rounded-2xl bg-bg-card border border-border-color hover:border-border-strong hover:bg-bg-elevated/50 transition-all"
                >
                  <div className="font-semibold">{e.description}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{new Date(e.date).toLocaleDateString()}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}