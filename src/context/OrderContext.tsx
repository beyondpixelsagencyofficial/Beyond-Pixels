import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, DeliveryRelease, ContactMessage } from '../types';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  isLoadingOrders: boolean;
  activeOrder: Order | null;
  stats: any | null;
  messages: ContactMessage[];
  createOrder: (orderData: Partial<Order>) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => Promise<boolean>;
  addDelivery: (orderId: string, delivery: Omit<DeliveryRelease, 'id' | 'addedAt'>) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  sendContactMessage: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshOrders: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const { user, isAdmin, isAuthenticated } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setOrders([]);
      return;
    }
    try {
      setIsLoadingOrders(true);
      const res = await fetch('/api/orders', {
        headers: {
          'x-user-email': user.email
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [isAuthenticated, user]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin || !user) return;
    try {
      const res = await fetch('/api/stats', {
        headers: { 'x-user-email': user.email }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [isAdmin, user]);

  const fetchMessages = useCallback(async () => {
    if (!isAdmin || !user) return;
    try {
      const res = await fetch('/api/contact', {
        headers: { 'x-user-email': user.email }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchStats();
      fetchMessages();
    }
  }, [fetchOrders, fetchStats, fetchMessages, isAdmin]);

  const createOrder = async (orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; error?: string }> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || orderData.clientEmail || ''
        },
        body: JSON.stringify(orderData)
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        return { success: false, error: text || 'Server returned a non-JSON response. Please try again.' };
      }

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit order' };
      }

      await fetchOrders();
      if (isAdmin) fetchStats();
      return { success: true, order: data.order };
    } catch (err: any) {
      console.error('Error submitting order:', err);
      return { success: false, error: err.message || 'Network error submitting order' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, adminNotes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ status, ...(adminNotes !== undefined ? { adminNotes } : {}) })
      });

      if (res.ok) {
        await fetchOrders();
        if (isAdmin) fetchStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update order status:', err);
      return false;
    }
  };

  const addDelivery = async (orderId: string, delivery: Omit<DeliveryRelease, 'id' | 'addedAt'>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(delivery)
      });

      if (res.ok) {
        await fetchOrders();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add delivery:', err);
      return false;
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user?.email || ''
        }
      });

      if (res.ok) {
        await fetchOrders();
        if (isAdmin) fetchStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete order:', err);
      return false;
    }
  };

  const sendContactMessage = async (data: { name: string; email: string; phone?: string; subject?: string; message: string }) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to send message' };
      }
      return { success: true, message: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error sending message' };
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoadingOrders,
        activeOrder,
        stats,
        messages,
        createOrder,
        updateOrderStatus,
        addDelivery,
        deleteOrder,
        sendContactMessage,
        refreshOrders: fetchOrders,
        refreshStats: fetchStats,
        refreshMessages: fetchMessages,
        setActiveOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
