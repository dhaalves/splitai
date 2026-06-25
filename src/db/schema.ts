export type SplitMethod = 'equal' | 'exact' | 'percent' | 'shares';

export type GroupType = 'home' | 'trip' | 'couple' | 'other';

export type Frequency = 'weekly' | 'monthly' | 'yearly';

export interface SplitEntry {
  userId: string;
  share: number;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  defaultCurrency: string;
  avatarColor: string;
  createdAt: number;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatarColor: string;
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  memberIds: string[];
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: number;
  createdAt: number;
  updatedAt: number;
  groupId: string | null;
  paidBy: string;
  splitMethod: SplitMethod;
  splits: SplitEntry[];
  isSettlement: boolean;
  recurringId: string | null;
  deletedAt: number | null;
}

export interface Recurring {
  id: string;
  description: string;
  amount: number;
  category: string;
  groupId: string | null;
  paidBy: string;
  splitMethod: SplitMethod;
  splits: SplitEntry[];
  frequency: Frequency;
  startDate: number;
  nextDate: number;
  lastGenerated: number | null;
  active: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  system: boolean;
}

export interface Meta {
  key: string;
  value: unknown;
}
