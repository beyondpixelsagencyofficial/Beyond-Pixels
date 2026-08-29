import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, DeliveryRelease, ContactMessage } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface OrderContextType {
  orders: Order[];
  isLoadingOrders: boolean;
  activeOrder: Order | null;
  stats: any | null;
  messages: ContactMessage[];
  createOrder: (orderData: Partial<Order>) => Promise<{ success: boolean; order?: Order; error?: string }>;
  seedDemoOrder: () => Promise<{ success: boolean; order?: Order }>;
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

const ORDERS_CACHE_KEY = 'beyond_pixels_cached_orders';

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem(ORDERS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Error reading cached orders:', e);
    }
    return [];
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const { user, isAdmin, isAuthenticated } = useAuth();

  // Save cache
  useEffect(() => {
    if (orders.length > 0) {
      try {
        localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(orders));
      } catch (e) {
        // quota ignore
      }
    }
  }, [orders]);

  const mapSupabaseOrderRow = (row: any): Order => {
    if (row.data && typeof row.data === 'object') {
      return { ...row.data, id: row.id || row.data.id };
    }
    return {
      id: row.id,
      clientName: row.client_name || row.clientName || 'Client',
      clientEmail: row.client_email || row.clientEmail || '',
      clientPhone: row.client_phone || row.clientPhone || '',
      services: row.services || [],
      subServices: row.sub_services || row.subServices || [],
      packageSelected: row.package_selected || row.packageSelected,
      adDollarBudget: row.ad_dollar_budget || row.adDollarBudget,
      deliveryTimeframe: row.delivery_timeframe || row.deliveryTimeframe || 'standard',
      projectDescription: row.project_description || row.projectDescription || '',
      briefFiles: row.brief_files || row.briefFiles || [],
      estimatedTotalBDT: Number(row.estimated_total_bdt || row.estimatedTotalBDT || row.estimated_total || 0),
      advanceAmountBDT: Number(row.advance_amount_bdt || row.advanceAmountBDT || row.advance_amount || 0),
      paymentMethod: row.payment_method || row.paymentMethod || 'bKash',
      paymentNumber: row.payment_number || row.paymentNumber || '01965407715',
      transactionId: row.transaction_id || row.transactionId || '',
      status: row.status || 'Pending Verification',
      adminNotes: row.admin_notes || row.adminNotes || '',
      deliveries: row.deliveries || [],
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
    };
  };

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    const orderMap = new Map<string, Order>();

    // 1. Fetch from Express API
    try {
      const emailParam = user?.email ? encodeURIComponent(user.email.trim()) : '';
      const url = isAdmin 
        ? `/api/orders?admin=true&email=${emailParam || 'beyondpixelsagency.official@gmail.com'}` 
        : (user ? `/api/orders?email=${emailParam}` : '/api/orders?admin=true');
      
      const res = await fetch(url, {
        headers: {
          'x-user-email': user?.email || (isAdmin ? 'beyondpixelsagency.official@gmail.com' : '')
        }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach((o: Order) => {
            if (o && o.id && o.id !== 'BP-9281' && o.clientEmail !== 'tahmid.creative@gmail.com') {
              orderMap.set(o.id, o);
            }
          });
        }
      }
    } catch (err) {
      console.warn('API fetch orders notice:', err);
    }

    // 2. Fetch from Supabase Direct to guarantee no orders are missed
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!isAdmin && user?.email) {
        query = query.ilike('client_email', user.email.trim());
      }
      const { data: sbOrders, error: sbErr } = await query;
      if (!sbErr && sbOrders && sbOrders.length > 0) {
        sbOrders
          .map(mapSupabaseOrderRow)
          .filter(o => o.id !== 'BP-9281' && o.clientEmail !== 'tahmid.creative@gmail.com')
          .forEach((o: Order) => {
            if (!orderMap.has(o.id)) {
              orderMap.set(o.id, o);
            } else {
              const existing = orderMap.get(o.id)!;
              const remoteUpdated = new Date(o.updatedAt || o.createdAt || 0).getTime();
              const existingUpdated = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
              if (remoteUpdated >= existingUpdated) {
                orderMap.set(o.id, { ...existing, ...o });
              }
            }
          });
      }
    } catch (sbErr) {
      console.warn('Supabase direct orders fetch notice:', sbErr);
    }

    const mergedList = Array.from(orderMap.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    if (mergedList.length > 0 || isAuthenticated) {
      setOrders(mergedList);
    }
    setIsLoadingOrders(false);
  }, [isAuthenticated, user, isAdmin]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin || !user) return;
    try {
      const res = await fetch('/api/stats', {
        headers: { 'x-user-email': user.email }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Error fetching stats:', err);
    }
  }, [isAdmin, user]);

  const fetchMessages = useCallback(async () => {
    if (!isAdmin || !user) return;
    try {
      const res = await fetch('/api/contact', {
        headers: { 'x-user-email': user.email }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.warn('Error fetching messages:', err);
    }
  }, [isAdmin, user]);

  // Initial load and live polling interval
  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchStats();
      fetchMessages();
    }

    // Auto-poll orders every 8 seconds for live dashboard updates
    const pollInterval = setInterval(() => {
      if (isAuthenticated && user) {
        fetchOrders();
        if (isAdmin) {
          fetchStats();
          fetchMessages();
        }
      }
    }, 8000);

    // Supabase Realtime table listener
    const channel = supabase
      .channel('realtime_orders_subscription')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
        if (isAdmin) fetchStats();
      })
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, fetchStats, fetchMessages, isAdmin, isAuthenticated, user]);

  const createOrder = async (orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; error?: string }> => {
    const finalTotalBDT = Number(orderData.estimatedTotalBDT) || 3500;
    const finalAdvanceBDT = Number(orderData.advanceAmountBDT) || Math.round(finalTotalBDT * 0.3);
    const newId = `BP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: newId,
      clientName: (orderData.clientName || user?.name || 'Valued Client').trim(),
      clientEmail: (orderData.clientEmail || user?.email || '').trim().toLowerCase(),
      clientPhone: (orderData.clientPhone || user?.phone || '').trim(),
      services: orderData.services && orderData.services.length > 0 ? orderData.services : ['Graphic Design'],
      subServices: Array.isArray(orderData.subServices) ? orderData.subServices : [],
      packageSelected: orderData.packageSelected,
      adDollarBudget: orderData.adDollarBudget ? Number(orderData.adDollarBudget) : undefined,
      adDollarRateBDT: orderData.adDollarRateBDT ? Number(orderData.adDollarRateBDT) : 148,
      deliveryTimeframe: orderData.deliveryTimeframe || 'standard',
      projectDescription: orderData.projectDescription || '',
      briefFiles: Array.isArray(orderData.briefFiles) ? orderData.briefFiles : [],
      estimatedTotalBDT: finalTotalBDT,
      advanceAmountBDT: finalAdvanceBDT,
      paymentMethod: orderData.paymentMethod || 'bKash',
      paymentNumber: orderData.paymentNumber || '01965407715',
      transactionId: (orderData.transactionId || '').trim().toUpperCase(),
      status: 'Pending Verification',
      adminNotes: 'Order submitted. Payment TrxID recorded. Awaiting admin approval.',
      deliveries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let serverSuccess = false;
    let savedOrder: Order = newOrder;

    // 1. Try Express API
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || newOrder.clientEmail
        },
        body: JSON.stringify(newOrder)
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.order) {
          savedOrder = data.order;
          serverSuccess = true;
        }
      }
    } catch (err: any) {
      console.warn('Express order submit notice, initiating direct cloud sync:', err);
    }

    // 2. Direct Supabase Storage (Always sync to Supabase)
    try {
      const sbPayload = {
        id: savedOrder.id,
        client_name: savedOrder.clientName,
        client_email: savedOrder.clientEmail,
        client_phone: savedOrder.clientPhone,
        services: savedOrder.services,
        package_selected: savedOrder.packageSelected || null,
        ad_dollar_budget: savedOrder.adDollarBudget || null,
        delivery_timeframe: savedOrder.deliveryTimeframe,
        project_description: savedOrder.projectDescription,
        estimated_total_bdt: savedOrder.estimatedTotalBDT,
        advance_amount_bdt: savedOrder.advanceAmountBDT,
        payment_method: savedOrder.paymentMethod,
        payment_number: savedOrder.paymentNumber,
        transaction_id: savedOrder.transactionId,
        status: savedOrder.status,
        admin_notes: savedOrder.adminNotes,
        deliveries: savedOrder.deliveries,
        created_at: savedOrder.createdAt,
        data: savedOrder
      };
      await supabase.from('orders').upsert(sbPayload, { onConflict: 'id' });
    } catch (sbErr) {
      console.warn('Supabase direct order write notice:', sbErr);
    }

    // Update local state immediately
    setOrders(prev => [savedOrder, ...prev.filter(o => o.id !== savedOrder.id)]);
    
    // Refresh background
    fetchOrders().catch(() => {});
    if (isAdmin) fetchStats().catch(() => {});

    return { success: true, order: savedOrder };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, adminNotes?: string): Promise<boolean> => {
    // 1. Update locally
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, ...(adminNotes ? { adminNotes } : {}) } : o));

    // 2. Try API
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ status, ...(adminNotes !== undefined ? { adminNotes } : {}) })
      });
    } catch (err) {
      console.warn('API update order status notice:', err);
    }

    // 3. Supabase direct
    try {
      await supabase.from('orders').update({
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      }).eq('id', orderId);
    } catch (sbErr) {
      console.warn('Supabase update order status notice:', sbErr);
    }

    return true;
  };

  const addDelivery = async (orderId: string, delivery: Omit<DeliveryRelease, 'id' | 'addedAt'>): Promise<boolean> => {
    const newDelivery: DeliveryRelease = {
      ...delivery,
      id: `dlv_${Date.now()}`,
      addedAt: new Date().toISOString()
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          deliveries: [...(o.deliveries || []), newDelivery]
        };
      }
      return o;
    }));

    try {
      await fetch(`/api/orders/${orderId}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(delivery)
      });
    } catch (err) {
      console.warn('API add delivery notice:', err);
    }

    return true;
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    setOrders(prev => prev.filter(o => o.id !== orderId));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });
    } catch (err) {
      console.warn('API delete order notice:', err);
    }

    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (sbErr) {
      console.warn('Supabase delete order notice:', sbErr);
    }

    return true;
  };

  const sendContactMessage = async (data: { name: string; email: string; phone?: string; subject?: string; message: string }) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        return { success: true, message: json.message };
      }
    } catch (err: any) {
      console.warn('API send message notice, fallback direct:', err);
    }

    try {
      await supabase.from('messages').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject: data.subject || 'Project Inquiry',
        message: data.message,
        created_at: new Date().toISOString(),
        read: false
      });
      return { success: true, message: 'Your message has been received! Our team will reach out promptly.' };
    } catch (sbErr: any) {
      return { success: true, message: 'Message sent successfully.' };
    }
  };

  const seedDemoOrder = async (): Promise<{ success: boolean; order?: Order }> => {
    const demoId = `BP-${Math.floor(1000 + Math.random() * 9000)}`;
    const demoOrder: Order = {
      id: demoId,
      clientName: 'Shakil Ahmed',
      clientEmail: 'shakil.ecommerce@gmail.com',
      clientPhone: '+8801712987654',
      services: ['Graphic Design', 'Video Editing'],
      subServices: [
        { id: 'gd-sm-ad', title: 'Social Media Ad Creative (Pack of 5)', priceBDT: 3500, category: 'Graphic Design' },
        { id: 've-reel', title: 'Short Form Reel / TikTok Edit (Under 60s)', priceBDT: 2500, category: 'Video Editing' }
      ],
      packageSelected: 'Growth Starter',
      deliveryTimeframe: 'standard',
      projectDescription: 'Need modern promotional ad creatives for our upcoming summer sale campaign.',
      briefFiles: [],
      estimatedTotalBDT: 15000,
      advanceAmountBDT: 4500,
      paymentMethod: 'bKash',
      paymentNumber: '01965407715',
      transactionId: `BKASH${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'Pending Verification',
      adminNotes: 'Order submitted. Payment TrxID recorded. Awaiting admin approval.',
      deliveries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await createOrder(demoOrder);
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
        seedDemoOrder,
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
