import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Settings, 
  Package, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  ExternalLink, 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  MessageSquare, 
  FileText, 
  Users, 
  Layers, 
  TrendingUp,
  RefreshCw,
  Send,
  X,
  PhoneCall,
  DollarSign,
  Flame,
  BadgeDollarSign,
  Receipt
} from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { useOrders } from '../context/OrderContext';
import { Order, OrderStatus, CMSContent, ServiceItem, AgencyPackage, User } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface AdminDashboardProps {
  onBackToLanding: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToLanding }) => {
  const { user, fetchRegisteredUsers } = useAuth();
  const { cms, updateCMS, refreshCMS } = useCMS();
  const { 
    orders, 
    stats, 
    messages, 
    updateOrderStatus, 
    addDelivery, 
    deleteOrder, 
    refreshOrders 
  } = useOrders();

  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'cms' | 'messages' | 'users'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  
  // Delivery Upload Modal state
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<Order | null>(null);
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryLink, setDeliveryLink] = useState('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  // Status update modal / notes state
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('In Progress');
  const [adminNotesText, setAdminNotesText] = useState('');

  // CMS Form State
  const [cmsForm, setCmsForm] = useState<Partial<CMSContent>>({});
  const [cmsSaving, setCmsSaving] = useState(false);
  const [cmsSaveMessage, setCmsSaveMessage] = useState<string | null>(null);

  // Initialize CMS form with current data
  React.useEffect(() => {
    if (cms) {
      setCmsForm(cms);
    }
  }, [cms]);

  // Load Registered Users / Clients from server and Supabase
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await fetchRegisteredUsers();
      setUsersList(list);
    } catch (e) {
      console.warn('Error loading users in admin:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  React.useEffect(() => {
    if (activeAdminTab === 'users') {
      loadUsers();
    }
  }, [activeAdminTab]);

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsSaving(true);
    setCmsSaveMessage(null);
    try {
      const ok = await updateCMS(cmsForm);
      if (ok) {
        setCmsSaveMessage('Landing page CMS content & pricing updated live!');
        setTimeout(() => setCmsSaveMessage(null), 4000);
      } else {
        setCmsSaveMessage('Failed to save CMS changes.');
      }
    } catch (e: any) {
      setCmsSaveMessage(e.message || 'Error updating CMS');
    } finally {
      setCmsSaving(false);
    }
  };

  const handleOpenDeliveryModal = (order: Order) => {
    setDeliveryModalOrder(order);
    setDeliveryTitle(`Final Deliverable - ${order.packageSelected || order.services.join(' & ')}`);
    setDeliveryNotes('Completed high-resolution creative deliverables ready for your review. Let us know if you need any adjustments!');
    setDeliveryLink('');
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalOrder || !deliveryLink.trim()) return;

    setIsSubmittingDelivery(true);
    try {
      const ok = await addDelivery(deliveryModalOrder.id, {
        title: deliveryTitle.trim() || 'Milestone Delivery',
        notes: deliveryNotes.trim(),
        linkOrData: deliveryLink.trim(),
        type: 'link'
      });

      if (ok) {
        setDeliveryModalOrder(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  const handleSaveOrderStatus = async () => {
    if (!statusModalOrder) return;
    await updateOrderStatus(statusModalOrder.id, newStatus, adminNotesText);
    setStatusModalOrder(null);
  };

  // Quick 1-click verify 30% advance
  const handleQuickVerifyAdvance = async (orderId: string) => {
    await updateOrderStatus(
      orderId, 
      'In Progress', 
      '30% Advance Verified & Recorded on ledger. Production sprint commenced.'
    );
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const query = orderSearch.toLowerCase();
    const matchesSearch = 
      o.id.toLowerCase().includes(query) ||
      o.clientName.toLowerCase().includes(query) ||
      o.clientEmail.toLowerCase().includes(query) ||
      o.transactionId.toLowerCase().includes(query) ||
      (o.packageSelected && o.packageSelected.toLowerCase().includes(query)) ||
      o.services.some(s => s.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  // Calculate live financial stats in BDT
  const totalPipelineBDT = orders.reduce((sum, o) => sum + (o.estimatedTotalBDT || (o as any).estimatedTotal || 0), 0);
  const totalAdvanceCollectedBDT = orders
    .filter(o => o.status !== 'Rejected' && o.status !== 'Pending Verification')
    .reduce((sum, o) => sum + (o.advanceAmountBDT || (o as any).advanceAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#080808] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Bar Header */}
        <div className="rounded-3xl bg-[#0D0D0D] border border-neutral-800 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Agency Control Center & CMS</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                  Master Admin
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Authenticated as <span className="text-rose-400 font-mono font-bold">{ADMIN_EMAIL}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              ← View Live Site
            </button>
            <button
              onClick={() => { refreshOrders(); refreshCMS(); }}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 space-y-1">
            <div className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
              <span>Pipeline Total</span>
              <span className="text-rose-500 font-bold">৳</span>
            </div>
            <div className="text-2xl font-black text-white">৳{totalPipelineBDT.toLocaleString()}</div>
            <div className="text-[11px] text-neutral-500">Total gross value across all orders</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 space-y-1">
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
              <span>30% Advance Inflow</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">৳{totalAdvanceCollectedBDT.toLocaleString()}</div>
            <div className="text-[11px] text-neutral-500">Verified via bKash / Nagad</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 space-y-1">
            <div className="text-xs font-semibold text-amber-400 flex items-center justify-between">
              <span>Pending Advance TrxIDs</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{stats?.pendingOrders || 0}</div>
            <div className="text-[11px] text-neutral-500">Awaiting SMS statement confirmation</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 space-y-1">
            <div className="text-xs font-semibold text-blue-400 flex items-center justify-between">
              <span>Active Production</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">{stats?.inProgressOrders || 0}</div>
            <div className="text-[11px] text-neutral-500">Live projects in design & video</div>
          </div>
        </div>

        {/* Master Tabs Switcher */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`pb-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'orders'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Client Orders & Deliveries ({orders.length})
          </button>
          
          <button
            onClick={() => setActiveAdminTab('cms')}
            className={`pb-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'cms'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Dynamic CMS & Pricing Editor
          </button>

          <button
            onClick={() => setActiveAdminTab('messages')}
            className={`pb-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'messages'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Leads & Inquiries ({messages.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`pb-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'users'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Registered Clients & Users ({usersList.length})
          </button>
        </div>

        {/* TAB 1: CLIENT ORDERS & DELIVERY MANAGEMENT */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Filter by Order ID (BP-XXXX), Client Name, Email, TrxID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0D0D0D] p-1 rounded-xl border border-neutral-800 text-xs">
                {['all', 'Pending Verification', 'In Progress', 'In Review', 'Completed', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      orderStatusFilter === st
                        ? 'bg-rose-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Cards / Table */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#0D0D0D] border border-neutral-800 text-neutral-400 text-xs">
                No orders match your filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const totalBDT = order.estimatedTotalBDT || (order as any).estimatedTotal || 0;
                  const advanceBDT = order.advanceAmountBDT || (order as any).advanceAmount || 0;

                  return (
                    <div
                      key={order.id}
                      className="p-6 rounded-2xl bg-[#0D0D0D] border border-neutral-800 hover:border-neutral-700 transition-all space-y-4 shadow-2xl"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-black text-rose-500">
                            {order.id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            order.status === 'Pending Verification'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : order.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'In Progress' || order.status === 'In Review'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-neutral-400 capitalize font-medium">
                            ({order.deliveryTimeframe} delivery)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status === 'Pending Verification' && (
                            <button
                              onClick={() => handleQuickVerifyAdvance(order.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify 30% Advance & Start</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 border border-neutral-700 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-rose-500" />
                            <span>PDF Invoice</span>
                          </button>
                          <button
                            onClick={() => {
                              setStatusModalOrder(order);
                              setNewStatus(order.status);
                              setAdminNotesText(order.adminNotes || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 border border-neutral-700 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Status / Notes</span>
                          </button>
                          <button
                            onClick={() => handleOpenDeliveryModal(order)}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Release Delivery Link</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete order ${order.id}?`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-neutral-400 uppercase text-[10px] font-bold block mb-1">Client Profile</span>
                          <div className="font-bold text-white text-sm">{order.clientName}</div>
                          <div className="text-neutral-300 font-mono text-[11px]">{order.clientEmail}</div>
                          <div className="text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
                            <PhoneCall className="w-3 h-3" />
                            {order.clientPhone}
                          </div>
                        </div>

                        <div>
                          <span className="text-neutral-400 uppercase text-[10px] font-bold block mb-1">Package & Pricing (BDT)</span>
                          {order.packageSelected && (
                            <div className="mb-1">
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold">
                                📦 {order.packageSelected}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mb-1">
                            {order.services.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-[#1A1A1A] text-neutral-200 text-[11px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                          {order.subServices && order.subServices.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5">
                              {order.subServices.map((sub, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[10px] text-neutral-300">
                                  {sub.title} (৳{sub.priceBDT.toLocaleString()})
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="font-bold text-white">
                            Total: ৳{totalBDT.toLocaleString()} • <span className="text-emerald-400">30% Adv: ৳{advanceBDT.toLocaleString()}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-neutral-400 uppercase text-[10px] font-bold block mb-1">Payment Verification</span>
                          <div className="p-2.5 rounded-lg bg-[#050505] border border-neutral-800 space-y-0.5">
                            <div className="font-bold text-rose-400 flex items-center justify-between">
                              <span>{order.paymentMethod}</span>
                              <span className="font-mono text-white text-[11px]">{order.transactionId}</span>
                            </div>
                            <div className="text-[10px] text-neutral-500">Sent to: {order.paymentNumber}</div>
                          </div>
                        </div>

                        <div>
                          <span className="text-neutral-400 uppercase text-[10px] font-bold block mb-1">Deliveries Released</span>
                          {order.deliveries && order.deliveries.length > 0 ? (
                            <div className="space-y-1">
                              {order.deliveries.map((deliv) => (
                                <a
                                  key={deliv.id}
                                  href={deliv.linkOrData}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-1.5 rounded bg-[#1A1A1A] text-[11px] font-medium text-emerald-400 hover:underline truncate"
                                >
                                  🔗 {deliv.title}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-neutral-500 italic text-[11px]">No delivery released yet</span>
                          )}
                        </div>
                      </div>

                      {/* Brief & Notes */}
                      {order.projectDescription && (
                        <div className="p-3 rounded-xl bg-[#050505] border border-neutral-800 text-xs">
                          <span className="text-neutral-400 font-bold uppercase text-[10px] block mb-1">Client Project Brief:</span>
                          <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{order.projectDescription}</p>
                        </div>
                      )}

                      {order.adminNotes && (
                        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
                          <span className="text-rose-400 font-bold uppercase text-[10px] block mb-0.5">Internal Agency Note:</span>
                          <p className="text-neutral-200">{order.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DYNAMIC CMS & PRICING EDITOR */}
        {activeAdminTab === 'cms' && (
          <form onSubmit={handleSaveCMS} className="space-y-8">
            {cmsSaveMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-bold flex items-center justify-between">
                <span>{cmsSaveMessage}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            )}

            {/* 1. Monthly Retainer Packages & Ad Dollar Exchange Rate */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-neutral-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5 text-rose-500" />
                Monthly Packages & Ad Dollar Rate Settings (BDT)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    15-Day Package Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    value={cmsForm.packages?.[0]?.priceBDT || 8500}
                    onChange={(e) => {
                      const pkgs = [...(cmsForm.packages || [])];
                      if (pkgs[0]) pkgs[0].priceBDT = Number(e.target.value);
                      setCmsForm({ ...cmsForm, packages: pkgs });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                  <span className="text-[10px] text-neutral-500">Includes 8 Designs + 2 Videos + Page Mgmt</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    30-Day Package Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    value={cmsForm.packages?.[1]?.priceBDT || 16500}
                    onChange={(e) => {
                      const pkgs = [...(cmsForm.packages || [])];
                      if (pkgs[1]) pkgs[1].priceBDT = Number(e.target.value);
                      setCmsForm({ ...cmsForm, packages: pkgs });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                  <span className="text-[10px] text-neutral-500">Includes 20 Images + 3 Videos + Page Mgmt</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Meta / Google Ad Rate (BDT per $1 USD) *
                  </label>
                  <input
                    type="number"
                    value={cmsForm.adDollarRateBDT || 148}
                    onChange={(e) => setCmsForm({ ...cmsForm, adDollarRateBDT: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                  <span className="text-[10px] text-neutral-500">Suggested: 145 - 150 BDT / $</span>
                </div>
              </div>
            </div>

            {/* 2. Hero & Top Banner Content */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-neutral-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-500" />
                Landing Page Hero & Top Banner Content
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Hero Eyebrow / Badge</label>
                  <input
                    type="text"
                    value={cmsForm.heroBadge || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, heroBadge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Hero Title Line</label>
                  <input
                    type="text"
                    value={cmsForm.heroTitle || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Hero Highlight Text (Red Accent)</label>
                  <input
                    type="text"
                    value={cmsForm.heroHighlight || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, heroHighlight: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Top Announcement Banner</label>
                  <input
                    type="text"
                    value={cmsForm.bannerNotice || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, bannerNotice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Hero Subtitle Description</label>
                <textarea
                  rows={2}
                  value={cmsForm.heroSubtitle || ''}
                  onChange={(e) => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                />
              </div>
            </div>

            {/* 3. Agency Contact & Payment Number CMS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-neutral-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                Payment Gateways & Agency Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Official bKash / Nagad Number *
                  </label>
                  <input
                    type="text"
                    value={cmsForm.paymentNumber || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, paymentNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs font-mono focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Advance Payment Policy (%)
                  </label>
                  <input
                    type="number"
                    value={cmsForm.advancePercentage || 30}
                    onChange={(e) => setCmsForm({ ...cmsForm, advancePercentage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Official Agency Email
                  </label>
                  <input
                    type="email"
                    value={cmsForm.agencyEmail || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, agencyEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    WhatsApp Support Number
                  </label>
                  <input
                    type="text"
                    value={cmsForm.agencyWhatsApp || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, agencyWhatsApp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="text"
                    value={cmsForm.agencyFacebook || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, agencyFacebook: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 sticky bottom-6 z-20 bg-[#080808]/90 backdrop-blur-md p-3 rounded-2xl border border-neutral-800">
              <button
                type="submit"
                disabled={cmsSaving}
                className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl shadow-rose-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{cmsSaving ? 'Saving Changes...' : 'Save & Publish Live to Landing Page'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: CONTACT FORM LEADS */}
        {activeAdminTab === 'messages' && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#0D0D0D] border border-neutral-800 text-neutral-400 text-xs">
                No inquiries received yet.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <span>{msg.name}</span>
                        <span className="text-neutral-400 font-normal">({msg.email})</span>
                        {msg.phone && (
                          <span className="text-rose-400 font-normal font-mono">• {msg.phone}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-semibold text-rose-400">{msg.subject}</div>
                    <p className="text-neutral-300 leading-relaxed bg-[#050505] p-3 rounded-xl border border-neutral-800">
                      {msg.message}
                    </p>
                    <div className="flex justify-end pt-1">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)} - Beyond Pixels`}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-400 font-semibold text-xs transition-colors"
                      >
                        Reply via Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REGISTERED CLIENTS & USERS (সুপারভাইজার ইউজার ম্যানেজমেন্ট) */}
        {activeAdminTab === 'users' && (
          <div className="space-y-6">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search clients by name, email, phone, company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Supabase Cloud Synced</span>
                </div>
                <button
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="px-3 py-2 rounded-xl bg-[#0D0D0D] border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                  <span>{loadingUsers ? 'Syncing...' : 'Refresh Users'}</span>
                </button>
              </div>
            </div>

            {/* Users Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
                <div className="text-xs font-semibold text-neutral-400">Total User Accounts</div>
                <div className="text-xl font-black text-white mt-1">{usersList.length}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Persisted in Supabase & Local</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
                <div className="text-xs font-semibold text-rose-400">Active Clients</div>
                <div className="text-xl font-black text-rose-400 mt-1">
                  {usersList.filter(u => u.role === 'client' || !u.role).length}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Authenticated via Google</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
                <div className="text-xs font-semibold text-emerald-400">Clients with Orders</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {usersList.filter(u => (u.ordersCount || 0) > 0).length}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Commercial project history</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
                <div className="text-xs font-semibold text-blue-400">Total Client Value</div>
                <div className="text-xl font-black text-blue-400 mt-1">
                  ৳{usersList.reduce((sum, u) => sum + (u.totalSpentBDT || 0), 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Lifetime gross booking value</div>
              </div>
            </div>

            {/* Users List Table / Cards */}
            {usersList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#0D0D0D] border border-neutral-800 text-neutral-400 text-xs">
                {loadingUsers ? 'Loading registered accounts...' : 'No registered users found yet.'}
              </div>
            ) : (
              <div className="space-y-3">
                {usersList
                  .filter(u => {
                    const q = userSearch.toLowerCase();
                    return (
                      !q ||
                      (u.name && u.name.toLowerCase().includes(q)) ||
                      (u.email && u.email.toLowerCase().includes(q)) ||
                      (u.phone && u.phone.toLowerCase().includes(q)) ||
                      (u.company && u.company.toLowerCase().includes(q))
                    );
                  })
                  .map((usr) => {
                    const isAdmin = usr.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                    const cleanPhone = (usr.phone || '').replace(/[^0-9+]/g, '');
                    const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone.startsWith('880') ? cleanPhone : `880${cleanPhone.replace(/^0+/, '')}`;

                    return (
                      <div
                        key={usr.id || usr.email}
                        className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 hover:border-neutral-700 transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Client Identity */}
                        <div className="flex items-center gap-4 min-w-[280px]">
                          <img
                            src={usr.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(usr.name || 'User')}`}
                            alt={usr.name || 'User'}
                            className="w-12 h-12 rounded-2xl border border-neutral-700 object-cover bg-neutral-900"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{usr.name || 'Unnamed Client'}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  isAdmin ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                                }`}
                              >
                                {isAdmin ? 'Master Supervisor' : 'Client Account'}
                              </span>
                            </div>
                            <div className="text-neutral-400 font-mono text-[11px] mt-0.5 flex items-center gap-1.5">
                              <span>{usr.email}</span>
                            </div>
                            {usr.company && (
                              <div className="text-rose-400 text-[11px] font-medium mt-0.5">
                                🏢 {usr.company}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contact & Phone */}
                        <div className="space-y-1 min-w-[160px]">
                          <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                            Contact / Phone
                          </div>
                          {usr.phone ? (
                            <div className="text-white font-mono text-xs flex items-center gap-2">
                              <span>{usr.phone}</span>
                            </div>
                          ) : (
                            <div className="text-neutral-600 italic text-[11px]">No phone on file</div>
                          )}
                        </div>

                        {/* Activity & Dates */}
                        <div className="space-y-1 min-w-[150px]">
                          <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                            Activity & Registration
                          </div>
                          <div className="text-neutral-300 text-[11px]">
                            Joined: <span className="text-neutral-400">{usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'Active'}</span>
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            Last Active: <span className="text-rose-400 font-mono">{usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                          </div>
                        </div>

                        {/* Financial History */}
                        <div className="space-y-1 min-w-[130px]">
                          <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                            Orders & Spend
                          </div>
                          <div className="text-white font-bold text-xs">
                            {usr.ordersCount || 0} Project{(usr.ordersCount || 0) === 1 ? '' : 's'}
                          </div>
                          <div className="text-emerald-400 font-bold text-xs">
                            ৳{(usr.totalSpentBDT || 0).toLocaleString()} <span className="text-[10px] text-neutral-500 font-normal">BDT</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                          {usr.ordersCount && usr.ordersCount > 0 ? (
                            <button
                              onClick={() => {
                                setOrderSearch(usr.email);
                                setActiveAdminTab('orders');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="View this client's orders in the orders tab"
                            >
                              <Package className="w-3.5 h-3.5 text-rose-500" />
                              <span>Orders</span>
                            </button>
                          ) : null}

                          {usr.phone && (
                            <a
                              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${usr.name || ''}, this is Beyond Pixels Creative Agency supervisor team.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-colors flex items-center gap-1.5"
                              title="Chat on WhatsApp"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <a
                            href={`mailto:${usr.email}?subject=Beyond Pixels Creative Agency Project Update`}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                            title="Send Email"
                          >
                            <Send className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Email</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD DELIVERY LINK */}
      <AnimatePresence>
        {deliveryModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeliveryModalOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0D0D0D] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Release Delivery to Client</h3>
                  <p className="text-xs text-neutral-400">Order: {deliveryModalOrder.id} ({deliveryModalOrder.clientName})</p>
                </div>
                <button
                  onClick={() => setDeliveryModalOrder(null)}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDelivery} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Delivery Milestone Title *</label>
                  <input
                    type="text"
                    required
                    value={deliveryTitle}
                    onChange={(e) => setDeliveryTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Deliverable URL (Google Drive / Figma / Dropbox / WeTransfer / Github) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={deliveryLink}
                    onChange={(e) => setDeliveryLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Special Notes for Client</label>
                  <textarea
                    rows={3}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryModalOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDelivery}
                    className="flex-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {isSubmittingDelivery ? 'Publishing...' : 'Release to Client Dashboard'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: UPDATE STATUS & ADMIN NOTES */}
      <AnimatePresence>
        {statusModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusModalOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0D0D0D] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Update Order Status ({statusModalOrder.id})</h3>
                <button onClick={() => setStatusModalOrder(null)} className="text-neutral-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Project Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white"
                >
                  <option value="Pending Verification">Pending Advance Verification</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress (Production)</option>
                  <option value="In Review">In Review (Files Shared)</option>
                  <option value="Completed">Completed & Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Internal / Client Status Note</label>
                <textarea
                  rows={3}
                  value={adminNotesText}
                  onChange={(e) => setAdminNotesText(e.target.value)}
                  placeholder="e.g. 30% advance verified on Nagad. First draft scheduled for Friday 5 PM."
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrderStatus}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </div>
  );
};
