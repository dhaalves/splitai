import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { resetDb } from '../../../db/db';
import { resetInit } from '../../../db/init';
import { seedCategories } from '../../../db/seed';
import { Setup } from '../Setup';
import { getDb } from '../../../db/db';

function renderSetup() {
  return render(
    <HashRouter>
      <Setup />
    </HashRouter>
  );
}

describe('Setup', () => {
  beforeEach(async () => {
    resetDb();
    resetInit();
    await seedCategories(getDb());
  });

  it('renders first name, last name, email, currency fields', () => {
    renderSetup();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
  });

  it('disables submit until required fields are filled', () => {
    renderSetup();
    expect(screen.getByRole('button', { name: /get started/i })).toBeDisabled();
  });

  it('enables submit and saves profile when fields are filled', async () => {
    const user = userEvent.setup();
    renderSetup();
    await user.type(screen.getByLabelText(/first name/i), 'Ada');
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace');
    await user.type(screen.getByLabelText(/email/i), 'ada@x.com');
    await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
    await user.click(screen.getByRole('button', { name: /get started/i }));
    await waitFor(async () => {
      const p = await getDb().profiles.toArray();
      expect(p).toHaveLength(1);
      expect(p[0].firstName).toBe('Ada');
    });
  });
});
