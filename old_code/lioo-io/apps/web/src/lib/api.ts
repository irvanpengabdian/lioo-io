import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: API_BASE });

// ─── Category type drives which customization options appear in ProductDetailSheet
// BEVERAGE  → Temperature + Sugar Level + Drink extras
// MEAL      → Meal extras only (no temp/sugar)
// SNACK     → Snack extras only (no temp/sugar)
// OTHER     → No customization
export type CategoryType = 'BEVERAGE' | 'MEAL' | 'SNACK' | 'OTHER';

// Mapping from category name → CategoryType
// This is the front-end default. When backend delivers `category_type`, it takes priority.
const CATEGORY_TYPE_MAP: Record<string, CategoryType> = {
  'coffee':      'BEVERAGE',
  'non-coffee':  'BEVERAGE',
  'non coffee':  'BEVERAGE',
  'minuman':     'BEVERAGE',
  'drinks':      'BEVERAGE',
  'beverages':   'BEVERAGE',
  'meals':       'MEAL',
  'makanan':     'MEAL',
  'main course': 'MEAL',
  'food':        'MEAL',
  'snacks':      'SNACK',
  'camilan':     'SNACK',
  'dessert':     'SNACK',
};

export function getCategoryType(categoryName: string): CategoryType {
  const key = categoryName.toLowerCase().trim();
  return CATEGORY_TYPE_MAP[key] ?? 'BEVERAGE';  // default to BEVERAGE (shows all options)
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  category_type?: CategoryType;   // optional — from backend if supported
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
  // Enriched client-side after fetch
  category_name?: string;
  category_type?: CategoryType;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/menu/categories');
  // Prisma returns Decimal as string — convert to number
  // Also enrich each product with its category name + type
  return data.map((cat: Category) => {
    const catType = cat.category_type ?? getCategoryType(cat.name);
    return {
      ...cat,
      category_type: catType,
      products: cat.products.map((p: Product) => ({
        ...p,
        price:         parseFloat(p.price as unknown as string),
        promo_price:   p.promo_price ? parseFloat(p.promo_price as unknown as string) : undefined,
        category_name: cat.name,
        category_type: catType,
      })),
    };
  });
}

export async function createOrder(payload: {
  branch_id:      string;
  table_number?:  string;
  table_id?:      string;
  customer_name?: string;
  payment_method?: string;
  items: { product_id: string; quantity: number; notes?: string }[];
}) {
  const { data } = await api.post('/order', payload);
  return data;
}

export async function fetchOrder(orderId: string) {
  const { data } = await api.get(`/order/${orderId}`);
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data } = await api.patch(`/order/${orderId}/status`, { status });
  return data;
}

export async function createXenditInvoice(orderId: string) {
  const { data } = await api.post('/xendit/invoice', { orderId });
  return data;
}

/**
 * Server-side product search — calls GET /menu/search?q=...
 * Falls back to an empty array on error.
 */
export async function searchProducts(
  query: string,
  categoryId?: string,
): Promise<(Product & { category: { name: string } })[]> {
  try {
    const params: Record<string, string> = { q: query };
    if (categoryId) params.category_id = categoryId;
    const { data } = await api.get('/menu/search', { params });
    return data.map((p: any) => ({
      ...p,
      price:       parseFloat(p.price),
      promo_price: p.promo_price ? parseFloat(p.promo_price) : undefined,
      category_name: p.category?.name,
      category_type: p.category ? getCategoryType(p.category.name) : 'BEVERAGE',
    }));
  } catch {
    return [];
  }
}
