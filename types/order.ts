// types/order.ts
// This file defines the structure of our Order data
// TypeScript uses these to catch errors before they happen

// Individual item in an order (like "Blue Isopods" or "Springtails")
export interface OrderItem {
  name: string; // Item name (e.g., "Dairy Cow Isopods")
  quantity: number; // How many
  price: number; // Price per unit
}

// Main Order structure - matches our database table
export interface Order {
  id: string; // Unique ID (auto-generated)
  created_at: string; // When order was created
  updated_at: string; // Last update time

  // Customer details
  customer_name: string;
  phone: string;
  email?: string; // Optional (? means not required)
  social_media_handle?: string;

  // Address
  address: string;

  // Order items and totals
  items: OrderItem[]; // Array of items
  quantity_total: number; // Total quantity of all items

  // Shipping information
  courier_service: string; // e.g., "Blue Dart", "DTDC"
  courier_receipt?: string; // Tracking number
  sent_date?: string; // When package was sent
  shipping_charges?: number;

  // Payment
  payment_amount: number;

  // Order status
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';

  // Additional notes
  notes?: string;
}

// For creating a new order (without auto-generated fields)
export type CreateOrderInput = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
