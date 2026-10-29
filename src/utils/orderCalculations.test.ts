import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderPricing,
  calculateQueueWaitTime,
  generateTokenCode,
  formatINR,
} from './orderCalculations';
import { MenuItem } from '../types';

const mockMenu: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe with potato filling',
    price: 60,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc',
    isVeg: true,
    isAvailable: true,
    prepTimeMinutes: 8,
  },
  {
    id: 'item-2',
    name: 'Paneer Grilled Sandwich',
    description: 'Spiced cottage cheese sandwich',
    price: 70,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
    isVeg: true,
    isAvailable: true,
    prepTimeMinutes: 6,
  },
  {
    id: 'item-3',
    name: 'Special Cold Coffee',
    description: 'Chilled creamy coffee',
    price: 45,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
    isVeg: true,
    isAvailable: false, // Out of stock!
    prepTimeMinutes: 3,
  },
];

test('calculateOrderPricing computes correct subtotal, 5% tax, ₹2 fee, and total', () => {
  const result = calculateOrderPricing(
    [
      { menuItemId: 'item-1', quantity: 2 }, // 60 * 2 = 120
      { menuItemId: 'item-2', quantity: 1 }, // 70 * 1 = 70
    ],
    mockMenu
  );

  assert.equal(result.subtotal, 190);
  assert.equal(result.tax, Math.round(190 * 0.05)); // 10
  assert.equal(result.serviceFee, 2);
  assert.equal(result.totalAmount, 190 + 10 + 2); // 202
  assert.equal(result.orderItems.length, 2);
  assert.equal(result.orderItems[0].name, 'Masala Dosa');
});

test('calculateOrderPricing rejects out-of-stock items', () => {
  assert.throws(
    () => {
      calculateOrderPricing([{ menuItemId: 'item-3', quantity: 1 }], mockMenu);
    },
    {
      message: /currently sold out/,
    }
  );
});

test('calculateOrderPricing rejects invalid quantities or non-existent items', () => {
  assert.throws(
    () => {
      calculateOrderPricing([{ menuItemId: 'item-1', quantity: 0 }], mockMenu);
    },
    {
      message: /Invalid quantity/,
    }
  );

  assert.throws(
    () => {
      calculateOrderPricing([{ menuItemId: 'item-999', quantity: 1 }], mockMenu);
    },
    {
      message: /not found/,
    }
  );
});

test('calculateQueueWaitTime computes queuePosition and wait minutes', () => {
  const wait0 = calculateQueueWaitTime(0, 8);
  assert.equal(wait0.queuePosition, 1);
  assert.equal(wait0.estimatedWaitMinutes, 8);

  const wait3 = calculateQueueWaitTime(3, 8);
  assert.equal(wait3.queuePosition, 4);
  assert.ok(wait3.estimatedWaitMinutes > 8);
});

test('generateTokenCode creates formatted token codes', () => {
  assert.equal(generateTokenCode(1), 'CB-001');
  assert.equal(generateTokenCode(42), 'CB-042');
  assert.equal(generateTokenCode(105), 'CB-105');
});

test('formatINR formats currency symbol', () => {
  const formatted = formatINR(150);
  assert.ok(formatted.includes('150'));
});
