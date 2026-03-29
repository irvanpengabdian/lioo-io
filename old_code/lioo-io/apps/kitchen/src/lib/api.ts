import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE,
});

export async function fetchActiveOrders(): Promise<any[]> {
  try {
    const { data } = await api.get('/order');
    // For KDS, we only want PAID or COOKING orders.
    // PENDING is unpaid. SERVED/CANCELLED is done.
    return data.filter((o: any) => o.status === 'PAID' || o.status === 'COOKING');
  } catch (error) {
    console.error('Failed to fetch active orders', error);
    return [];
  }
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const res = await fetch(`${API_BASE}/order/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Failed to update order status', error);
    throw error;
  }
};

export const fetchKdsMetrics = async () => {
  try {
    const res = await fetch(`${API_BASE}/order/kds-metrics`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch KDS metrics', error);
    throw error;
  }
};

export const fetchInventoryAlerts = async () => {
  try {
    const res = await fetch(`${API_BASE}/inventory/alerts`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch inventory alerts', error);
    throw error;
  }
};

let socket: Socket | null = null;
export function getSocket() {
  if (!socket) {
    socket = io(API_BASE);
  }
  return socket;
}
