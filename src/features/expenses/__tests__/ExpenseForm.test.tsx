import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { resetDb } from '../../../db/db';
import { resetInit } from '../../../db/init';
import { seedCategories, createProfile } from '../../../db/seed';
import { createFriend } from '../../friends/useFriends';
import { createGroup } from '../../groups/useGroups';
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

  it('persists groupId when opened from a group context', async () => {
    const ada = (await getDb().contacts.toArray())[0];
    const profile = (await getDb().profiles.toArray())[0];
    const group = await createGroup({
      name: 'Trip',
      type: 'trip',
      memberIds: [profile.id, ada.id],
    });

    const user = userEvent.setup();
    renderForm({ initialGroupId: group.id });
    await user.type(await screen.findByLabelText(/description/i), 'Hotel');
    const amountInput = await screen.findByLabelText(/amount/i);
    await user.type(amountInput, '100');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(async () => {
      const all = await getDb().expenses.toArray();
      expect(all).toHaveLength(1);
      expect(all[0].description).toBe('Hotel');
      expect(all[0].groupId).toBe(group.id);
    });
  });

  it('preserves groupId when editing an existing group expense', async () => {
    const ada = (await getDb().contacts.toArray())[0];
    const profile = (await getDb().profiles.toArray())[0];
    const group = await createGroup({
      name: 'Trip',
      type: 'trip',
      memberIds: [profile.id, ada.id],
    });
    // Seed an existing group expense directly
    const expenseId = (
      await getDb().expenses.add({
        id: 'existing-id',
        amount: 5000,
        currency: 'USD',
        description: 'Cab',
        category: 'general',
        date: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        groupId: group.id,
        paidBy: profile.id,
        splitMethod: 'equal',
        splits: [
          { userId: profile.id, share: 2500 },
          { userId: ada.id, share: 2500 },
        ],
        isSettlement: false,
        recurringId: null,
        deletedAt: null,
      })
    ) as unknown as string;

    const user = userEvent.setup();
    // Edit via the /expenses/:id/edit path: URL has no ?group=, so initialGroupId=null
    renderForm({ editingId: expenseId, initialGroupId: null });
    // Wait for form to populate from existing
    await screen.findByDisplayValue('Cab');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(async () => {
      const all = await getDb().expenses.toArray();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(expenseId);
      // groupId must be preserved across edits
      expect(all[0].groupId).toBe(group.id);
    });
  });

  it('seeds splits with all group members (not the 2-person fallback)', async () => {
    // Regression: when opening the form from a group with >2 members, the
    // initial splits must include every member — not the [profile, first
    // contact] fallback that fires before the group query resolves.
    const ada = (await getDb().contacts.toArray())[0];
    const profile = (await getDb().profiles.toArray())[0];
    const grace = await createFriend({ firstName: 'Grace', lastName: 'H' });
    const group = await createGroup({
      name: 'Roadtrip',
      type: 'trip',
      memberIds: [profile.id, ada.id, grace.id],
    });

    const user = userEvent.setup();
    renderForm({ initialGroupId: group.id });
    await user.type(await screen.findByLabelText(/description/i), 'Gas');
    const amountInput = await screen.findByLabelText(/amount/i);
    await user.type(amountInput, '30');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(async () => {
      const all = await getDb().expenses.toArray();
      expect(all).toHaveLength(1);
      const userIds = all[0].splits.map((s) => s.userId).sort();
      expect(userIds).toEqual([profile.id, ada.id, grace.id].sort());
    });
  });
});
