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
      <div className="p-4 space-y-3">
        <Input
          placeholder="Search descriptions..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Category</div>
          <div className="flex gap-2 flex-wrap">
            {(categories ?? []).map((c) => (
              <Chip key={c.id} selected={selectedCats.includes(c.id)} onClick={() => toggleCat(c.id)}>
                <span className="mr-1">{c.icon}</span>{c.name}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Group</div>
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
            <p className="text-slate-400 text-sm">No matches.</p>
          ) : (
            <ul className="space-y-2">
              {results?.map((e) => (
                <li key={e.id} className="list-none">
                  <Link to={`/expenses/${e.id}`} className="block p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700/60">
                    {e.description} · {new Date(e.date).toLocaleDateString()}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
