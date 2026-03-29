import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const api = axios.create({ baseURL: API_BASE });

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_promo: boolean;
  promo_price?: number;
  category_id: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  subtotal: string;
  notes?: string;
  product: Product;
}

export interface Order {
  id: string;
  branch_id: string;
  table_id?: string;
  customer_name?: string;
  total_amount: string;
  tax_amount: string;
  status: string;
  payment_method?: string;
  source: string;
  created_at: string;
  order_items: OrderItem[];
  table?: { id: string; table_number: string; status: string };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/menu/categories');
  return data.map((cat: any) => ({
    ...cat,
    products: cat.products.map((p: any) => ({
      ...p,
      price: parseFloat(p.price),
      promo_price: p.promo_price ? parseFloat(p.promo_price) : undefined,
    })),
  }));
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await api.get('/order');
  return data;
}

export async function createOrder(payload: {
  branch_id: string;
  table_number?: string;
  customer_name?: string;
  payment_method?: string;
  status?: string;
  items: { product_id: string; quantity: number; notes?: string }[];
}): Promise<Order> {
  const { data } = await api.post('/order', payload);
  return data;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const { data } = await api.patch(`/order/${orderId}/status`, { status });
  return data;
}
