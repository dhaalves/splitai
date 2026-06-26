import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { resetDb } from '../../../db/db';
import { resetInit } from '../../../db/init';
import { seedCategories, createProfile } from '../../../db/seed';
import { createFriend } from '../../friends/useFriends';
import { createExpense } from '../../expenses/useExpenses';
import { getDb } from '../../../db/db';
import { SettleUp } from '../SettleUp';

describe('SettleUp', () => {
  beforeEach(async () => {
    resetDb();
    resetInit();
    await seedCategories(getDb());
    const p = await createProfile(getDb(), {
      firstName: 'You', lastName: 'Y', email: 'you@x.com', defaultCurrency: 'USD',
    });
    const a = await createFriend({ firstName: 'Ada', lastName: 'L' });
    await createExpense({
      amount: 1000, currency: 'USD', description: 'dinner', category: 'food',
      date: Date.now(), groupId: null, paidBy: a.id, splitMethod: 'equal',
      splits: [{ userId: p.id, share: 0 }, { userId: a.id, share: 0 }],
      isSettlement: false,
    });
  });

  it('shows a settle-up suggestion when you owe someone', async () => {
    render(
      <HashRouter>
        <SettleUp />
      </HashRouter>
    );
    expect(await screen.findByText(/you → ada/i)).toBeInTheDocument();
  });

  it('records a settlement expense when the button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HashRouter>
        <SettleUp />
      </HashRouter>
    );
    const settleBtn = await screen.findByRole('button', { name: /settle/i });
    await user.click(settleBtn);
    await waitFor(async () => {
      const all = await getDb().expenses.toArray();
      const settlements = all.filter((e) => e.isSettlement);
      expect(settlements).toHaveLength(1);
      expect(settlements[0].amount).toBe(500);
    });
  });
});
