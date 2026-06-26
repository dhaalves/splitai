import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { resetDb } from '../../../db/db';
import { resetInit } from '../../../db/init';
import { seedCategories, createProfile } from '../../../db/seed';
import { createFriend } from '../../friends/useFriends';
import { createGroup } from '../useGroups';
import { createExpense } from '../../expenses/useExpenses';
import { getDb } from '../../../db/db';
import { GroupDetail } from '../GroupDetail';

describe('GroupDetail simplify toggle', () => {
  beforeEach(async () => {
    resetDb();
    resetInit();
    await seedCategories(getDb());
    const p = await createProfile(getDb(), {
      firstName: 'You', lastName: 'Y', email: 'you@x.com', defaultCurrency: 'USD',
    });
    const a = await createFriend({ firstName: 'Ada', lastName: 'L' });
    const b = await createFriend({ firstName: 'Bob', lastName: 'B' });
    const g = await createGroup({ name: 'Home', type: 'home', memberIds: [p.id, a.id, b.id] });
    await createExpense({
      amount: 900, currency: 'USD', description: 'rent', category: 'rent',
      date: Date.now(), groupId: g.id, paidBy: p.id, splitMethod: 'equal',
      splits: [{ userId: p.id, share: 0 }, { userId: a.id, share: 0 }, { userId: b.id, share: 0 }],
      isSettlement: false,
    });
  });

  it('shows simplified debts when toggled', async () => {
    const groupId = (await getDb().groups.toArray())[0].id;
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[`/groups/${groupId}`]}>
        <Routes>
          <Route path="/groups/:id" element={<GroupDetail />} />
        </Routes>
      </MemoryRouter>
    );
    const balancesTab = await screen.findByRole('button', { name: /balances/i });
    await user.click(balancesTab);
    const toggle = await screen.findByRole('button', { name: /simplify/i });
    await user.click(toggle);
    expect(screen.getByText(/ada.*owes you/i)).toBeInTheDocument();
    expect(screen.getByText(/bob.*owes you/i)).toBeInTheDocument();
  });
});
