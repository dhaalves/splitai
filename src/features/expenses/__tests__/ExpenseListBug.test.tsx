
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { resetDb } from '../../../db/db';
import { resetInit } from '../../../db/init';
import { seedCategories, createProfile } from '../../../db/seed';
import { createFriend } from '../../friends/useFriends';
import { createGroup } from '../../groups/useGroups';
import { getDb } from '../../../db/db';
import { ExpenseList } from '../ExpenseList';

function LocationCapture({ onNavigate }: { onNavigate: (path: string) => void }) {
  const location = useLocation();
  onNavigate(`${location.pathname}${location.search}`);
  return null;
}

describe('ExpenseList empty state navigation', () => {
  beforeEach(async () => {
    resetDb();
    resetInit();
    await seedCategories(getDb());
    const p = await createProfile(getDb(), {
      firstName: 'You', lastName: 'Y', email: 'you@x.com', defaultCurrency: 'USD',
    });
    const a = await createFriend({ firstName: 'Ada', lastName: 'L' });
    await createGroup({ name: 'Trip', type: 'trip', memberIds: [p.id, a.id] });
  });

  it('includes ?group= in the "Add expense" link when groupId is set', async () => {
    const groupId = (await getDb().groups.toArray())[0].id;
    let currentPath = '';

    render(
      <MemoryRouter initialEntries={[`/groups/${groupId}`]}>
        <Routes>
          <Route path="/groups/:id" element={<ExpenseList groupId={groupId} />} />
          <Route path="/expenses/new" element={
            <LocationCapture onNavigate={(p) => { currentPath = p; }} />
          } />
        </Routes>
      </MemoryRouter>
    );

    const addBtn = await screen.findByRole('button', { name: /add expense/i });
    const user = userEvent.setup();
    await user.click(addBtn);

    // FIX: navigation should include ?group=<groupId>
    expect(currentPath).toBe(`/expenses/new?group=${groupId}`);
  });

  it('includes ?friend= in the "Add expense" link when friendId is set', async () => {
    const friendId = (await getDb().contacts.toArray())[0].id;
    let currentPath = '';

    render(
      <MemoryRouter initialEntries={[`/friends/${friendId}`]}>
        <Routes>
          <Route path="/friends/:id" element={<ExpenseList friendId={friendId} />} />
          <Route path="/expenses/new" element={
            <LocationCapture onNavigate={(p) => { currentPath = p; }} />
          } />
        </Routes>
      </MemoryRouter>
    );

    const addBtn = await screen.findByRole('button', { name: /add expense/i });
    const user = userEvent.setup();
    await user.click(addBtn);

    expect(currentPath).toBe(`/expenses/new?friend=${friendId}`);
  });

  it('navigates to /expenses/new with no params when neither groupId nor friendId is set', async () => {
    let currentPath = '';

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ExpenseList limit={10} />} />
          <Route path="/expenses/new" element={
            <LocationCapture onNavigate={(p) => { currentPath = p; }} />
          } />
        </Routes>
      </MemoryRouter>
    );

    const addBtn = await screen.findByRole('button', { name: /add expense/i });
    const user = userEvent.setup();
    await user.click(addBtn);

    expect(currentPath).toBe(`/expenses/new`);
  });
});

