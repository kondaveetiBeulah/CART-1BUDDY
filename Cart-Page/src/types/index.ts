// ─── Shared Type Definitions ─────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  customization?: string;
  category: string;
}

export interface CrossSellItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  tag?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'cod';
  label: string;
  subLabel?: string;
  icon: string;
  last4?: string;
  upiId?: string;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  tip: number;
  discount: number;
  grandTotal: number;
}

export interface Order {
  orderId: string;
  estimatedDelivery: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
}

export type DeliveryMode = 'express' | 'scheduled';
export type TipAmount = 0 | 2 | 3 | 5;
