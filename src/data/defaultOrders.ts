import { CompletedOrder } from '../types';
import { INITIAL_PRODUCTS } from './products';

export const DEFAULT_PAST_ORDERS: CompletedOrder[] = [
  {
    id: 'ord-past-01',
    orderNumber: 'ORD-SA9428-IN',
    timestamp: Date.now() - (28 * 3600000), // ~28 hours ago
    items: [
      {
        product: INITIAL_PRODUCTS[0], // The Imperial Cashmere Atelier Trench
        quantity: 1,
        size: 'L'
      },
      {
        product: INITIAL_PRODUCTS[1], // Oversized Double-Breasted Wool Coat
        quantity: 1,
        size: 'M'
      }
    ],
    subtotal: 51498,
    discount: 7724,
    tax: 5252,
    shipping: 0,
    total: 49026,
    currency: '₹',
    paymentMethod: 'CARD',
    paymentReference: 'PAY-SA9428-VERIFIED',
    shippingAddress: {
      fullName: 'Valued Client',
      email: 'concierge@sasher.luxury',
      street: '124 Horizon Boulevard, Suite 8',
      city: 'Bangalore',
      postalCode: '560001',
      country: 'India'
    },
    journalHash: '0x7f9a12c8b0e3f4d1e2a87600b3f5e921d74c0a18'
  },
  {
    id: 'ord-past-02',
    orderNumber: 'ORD-AT8812-IN',
    timestamp: Date.now() - (11 * 86400000), // 11 days ago
    items: [
      {
        product: INITIAL_PRODUCTS[2] || INITIAL_PRODUCTS[0], // Sculptural Lambskin Biker Jacket
        quantity: 1,
        size: 'M'
      }
    ],
    subtotal: 24999,
    discount: 3750,
    tax: 2550,
    shipping: 0,
    total: 23799,
    currency: '₹',
    paymentMethod: 'UPI',
    paymentReference: 'UPI-AT8812-OKAXIS',
    shippingAddress: {
      fullName: 'Valued Client',
      email: 'concierge@sasher.luxury',
      street: '124 Horizon Boulevard, Suite 8',
      city: 'Bangalore',
      postalCode: '560001',
      country: 'India'
    },
    journalHash: '0x3c2e109d784a9f5b61e2049d587c12f04e76a911'
  },
  {
    id: 'ord-past-03',
    orderNumber: 'ORD-LN5504-IN',
    timestamp: Date.now() - (24 * 86400000), // 24 days ago
    items: [
      {
        product: INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[1], // Tailored Trousers / Minimalist piece
        quantity: 2,
        size: '32'
      }
    ],
    subtotal: 19800,
    discount: 2970,
    tax: 2019,
    shipping: 0,
    total: 18849,
    currency: '₹',
    paymentMethod: 'CARD',
    paymentReference: 'PAY-LN5504-AUTH',
    shippingAddress: {
      fullName: 'Valued Client',
      email: 'concierge@sasher.luxury',
      street: '124 Horizon Boulevard, Suite 8',
      city: 'Bangalore',
      postalCode: '560001',
      country: 'India'
    },
    journalHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b'
  }
];
