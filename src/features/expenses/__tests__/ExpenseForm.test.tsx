import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { resetDb } from '../../../db/db';
import { resetInit } from '../../../db/init';
import { seedCategories, createProfile } from '../../../db/seed';
import { createFriend } from '../../friends/useFriends';
import { getDb } from '../../../db/db';
import { ExpenseForm } from '../ExpenseForm';

function renderForm(props: Partial<Parameters<typeof ExpenseForm>[0]> = {}) {
  return render(
    <HashRouter>
      <ExpenseForm
        open={true}
        onClose={() => {}}
        onSaved={() => {}}
        initialGroupId={null}
        initialFriendId={null}
        editingId={undefined}
        {...props}
      />
    </HashRouter>
  );
}

describe('ExpenseForm', () => {
  beforeEach(async () => {
    resetDb();
    resetInit();
    await seedCategories(getDb());
    await createProfile(getDb(), {
      firstName: 'You', lastName: 'Y', email: 'you@x.com', defaultCurrency: 'USD',
    });
    await createFriend({ firstName: 'Ada', lastName: 'L' });
  });

  it('disables save when amount is zero', async () => {
    renderForm();
    const save = await screen.findByRole('button', { name: /save/i });
    expect(save).toBeDisabled();
  });

  it('enables save and creates an expense when valid', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(await screen.findByLabelText(/description/i), 'Dinner');
    const amountInput = await screen.findByLabelText(/amount/i);
    await user.type(amountInput, '20');
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(async () => {
      const all = await getDb().expenses.toArray();
      expect(all).toHaveLength(1);
      expect(all[0].description).toBe('Dinner');
      expect(all[0].amount).toBe(2000);
    });
  });

  it('rejects percent splits not summing to 100', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(await screen.findByLabelText(/description/i), 'Bad split');
    await user.type(await screen.findByLabelText(/amount/i), '10');
    await user.click(screen.getByRole('button', { name: /percent/i }));
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
