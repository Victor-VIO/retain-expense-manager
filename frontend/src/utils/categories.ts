import type { PaymentMethod } from '../types';

// Each built-in category keeps the same colour slot and icon everywhere in the app,
// so "Transport" is always the same colour whatever else is on screen.
// Categories an admin adds later share the neutral colour and a tag icon.
const CATEGORY_STYLES: Record<string, { slot: number; icon: string }> = {
  'housing & rent': { slot: 1, icon: 'house-door' },
  'food & dining': { slot: 2, icon: 'cup-hot' },
  transport: { slot: 3, icon: 'car-front' },
  utilities: { slot: 4, icon: 'lightning-charge' },
  shopping: { slot: 5, icon: 'bag' },
  health: { slot: 6, icon: 'heart-pulse' },
  entertainment: { slot: 7, icon: 'film' },
  education: { slot: 8, icon: 'mortarboard' },
};

export function categoryStyle(name: string) {
  const style = CATEGORY_STYLES[name.trim().toLowerCase()];
  return {
    icon: style?.icon ?? 'tag',
    color: style ? `var(--cat-${style.slot})` : 'var(--cat-other)',
  };
}

export const paymentIcons: Record<PaymentMethod, string> = {
  cash: 'cash-stack',
  debit_card: 'credit-card',
  credit_card: 'credit-card-2-front',
  bank_transfer: 'bank',
  mobile_money: 'phone',
  other: 'three-dots',
};
