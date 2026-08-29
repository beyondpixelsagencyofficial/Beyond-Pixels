import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  FileText, 
  PhoneCall, 
  Plus, 
  User as UserIcon, 
  Settings, 
  ShieldCheck, 
  Search,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Layers,
  Flame,
  Building,
  Save,
  Check,
  Zap,
  DollarSign,
  Receipt
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Order, OrderStatus } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface ClientDashboardProps {
  onOpenNewOrder: () => void;
  onBackToLanding: () => void;
  initialTab?: 'orders' | 'profile';
  highlightOrderId?: string | null;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onOpenNewOrder,
  onBackToLanding,
  initialTab = 'orders',
  highlightOrderId
}) => {
  const { user, updateProfile } = useAuth();
  const { orders, isLoadingOrders } = useOrders();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  
  // Profile edit states
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCompany, setEditCompany] = useState(user?.company || '');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(user?.name || 'Client');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditCompany(user.company || '');
      setSelectedAvatarSeed(user.name || 'Client');
    }
  }, [user]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedAvatarSeed)}&backgroundColor=0ea5e9,6366f1,e11d48,10b981`;
    updateProfile({ 
      name: editName.trim(), 
      phone: editPhone.trim(),
      company: editCompany.trim(),
      avatar: newAvatar
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(query) ||
      o.services.some(s => s.toLowerCase().includes(query)) ||
      (o.packageSelected && o.packageSelected.toLowerCase().includes(query)) ||
      o.transactionId.toLowerCase().includes(query) ||
      o.status.toLowerCase().includes(query)
    );
  });

  const activeOrders = orders.filter(o => o.status === 'In Progress' || o.status === 'In Review' || o.status === 'Pending Verification');
  const completedOrders = orders.filter(o => o.status === 'Completed');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending 30% Advance Verification
          </span>
        );
      case 'Confirmed':
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-3 h-3 animate-spin" />
            In Active Production
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <FileText className="w-3 h-3" />
            Milestone Ready For Review
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Completed & Delivered
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const highlightedOrder = highlightOrderId 
    ? orders.find(o => o.id === highlightOrderId) 
    : orders[0];

  return (
    <div className="min-h-screen bg-[#080808] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="rounded-3xl bg-[#0D0D0D] border border-neutral-800 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Client'}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl border-2 border-rose-500/40 object-cover bg-neutral-900 shadow-inner"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  Welcome, {user?.name || 'Client'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                  Client Portal
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                <span>{user?.email}</span>
                {user?.company && <span>• <strong className="text-neutral-300">{user.company}</strong></span>}
                {user?.phone && <span>• {user.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              ← Agency Home
            </button>
            <button
              onClick={onOpenNewOrder}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Place New Order</span>
            </button>
          </div>
        </div>

        {/* Highlight Order Banner (if fresh or active) */}
        {highlightedOrder && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-[#111] to-neutral-900 border border-rose-500/30 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs uppercase font-bold tracking-wider text-rose-400">
                    Active Order Status Spotlight
                  </span>
                  <span className="font-mono text-xs font-bold text-white bg-neutral-800 px-2 py-0.5 rounded">
                    {highlightedOrder.id}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">
                  {highlightedOrder.packageSelected ? `Package: ${highlightedOrder.packageSelected}` : highlightedOrder.services.join(', ')}
                </h3>
                <p className="text-xs text-neutral-400">
                  Total: <strong className="text-white">৳{highlightedOrder.estimatedTotalBDT.toLocaleString()}</strong> • 30% Advance: <strong className="text-emerald-400">৳{highlightedOrder.advanceAmountBDT.toLocaleString()}</strong> via {highlightedOrder.paymentMethod} (TrxID: <span className="font-mono text-white">{highlightedOrder.transactionId}</span>)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge(highlightedOrder.status)}
                <button
                  onClick={() => setSelectedInvoiceOrder(highlightedOrder)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>PDF Invoice</span>
                </button>
                <a
                  href={`https://wa.me/8801613253301?text=Hi%20Beyond%20Pixels,%20checking%20status%20for%20order%20${highlightedOrder.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>WhatsApp Lead</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs & Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
            <div className="text-xs font-semibold text-neutral-400">Total Orders</div>
            <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
            <div className="text-xs font-semibold text-blue-400">In Production</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{activeOrders.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
            <div className="text-xs font-semibold text-emerald-400">Delivered & Complete</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{completedOrders.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-neutral-800">
            <div className="text-xs font-semibold text-neutral-400">Direct WhatsApp</div>
            <a
              href="https://wa.me/8801613253301"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 mt-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+880 1613-253301</span>
            </a>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-500 hover:text-neutral-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders & Live Tracker ({orders.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-500 hover:text-neutral-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Client Profile & Settings</span>
          </button>
        </div>

        {/* Tab 1: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search orders by ID, service, TrxID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {isLoadingOrders ? (
              <div className="p-12 text-center text-neutral-500 text-sm">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0D0D0D] border border-neutral-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Orders Found</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  You have not placed any project orders yet. Pick from our elite services or pre-bundled packages to get started.
                </p>
                <button
                  onClick={onOpenNewOrder}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Place Your First Order
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-3xl bg-[#0D0D0D] border transition-all p-6 sm:p-8 space-y-6 ${
                      highlightOrderId === order.id 
                        ? 'border-rose-500/60 ring-1 ring-rose-500/20' 
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">
                            {order.id}
                          </span>
                          <span className="text-xs text-neutral-500">
                            • {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          {order.packageSelected ? `📦 ${order.packageSelected}` : order.services.join(' + ')}
                        </h4>
                        {order.subServices && order.subServices.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {order.subServices.map((sub, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-[11px] text-neutral-300 flex items-center gap-1"
                              >
                                <span>{sub.title}</span>
                                <span className="text-rose-400 font-semibold font-mono">৳{sub.priceBDT.toLocaleString()}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#141414] border border-neutral-800 text-xs">
                      <div>
                        <div className="text-neutral-400 font-semibold mb-1">Financials</div>
                        <div className="text-white font-bold text-sm">৳{order.estimatedTotalBDT.toLocaleString()}</div>
                        <div className="text-emerald-400 font-semibold mt-0.5">
                          30% Adv: ৳{order.advanceAmountBDT.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-neutral-400 font-semibold mb-1">Advance Payment</div>
                        <div className="text-white font-semibold">{order.paymentMethod}</div>
                        <div className="text-neutral-400 font-mono mt-0.5">TrxID: {order.transactionId}</div>
                      </div>

                      <div>
                        <div className="text-neutral-400 font-semibold mb-1">Timeframe</div>
                        <div className="text-white capitalize font-semibold">{order.deliveryTimeframe} Delivery</div>
                        {order.adBoostBudgetUSD && (
                          <div className="text-rose-400 font-bold mt-0.5">
                            Ad Boost: ${order.adBoostBudgetUSD}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-neutral-400 font-semibold mb-1">Client Contact</div>
                        <div className="text-white">{order.clientName}</div>
                        <div className="text-neutral-400">{order.clientPhone}</div>
                      </div>
                    </div>

                    {/* Brief Note */}
                    {order.projectDescription && (
                      <div className="p-4 rounded-2xl bg-[#111] border border-neutral-800/80 text-xs space-y-1">
                        <div className="font-semibold text-neutral-400">Project Brief & Requirements:</div>
                        <p className="text-neutral-200 leading-relaxed">{order.projectDescription}</p>
                      </div>
                    )}

                    {/* Admin Status Note (if any) */}
                    {order.adminNotes && (
                      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/30 text-xs space-y-1">
                        <div className="font-bold text-blue-400 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Update from Agency Production Team:
                        </div>
                        <p className="text-neutral-200">{order.adminNotes}</p>
                      </div>
                    )}

                    {/* Deliverables Section */}
                    {order.deliveries && order.deliveries.length > 0 && (
                      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            Deliverables & Final Assets Ready
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {order.deliveries.map((delivery) => (
                            <a
                              key={delivery.id}
                              href={delivery.linkOrData}
                              download={delivery.type === 'file' ? delivery.title : undefined}
                              target="_blank"
                              rel="noreferrer"
                              className="p-3 rounded-xl bg-[#141414] border border-neutral-700 hover:border-emerald-500 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                <div>
                                  <span className="text-white font-medium truncate group-hover:text-emerald-400 block">
                                    {delivery.title}
                                  </span>
                                  {delivery.notes && (
                                    <span className="text-[10px] text-neutral-400 truncate block">
                                      {delivery.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {delivery.type === 'file' ? (
                                <Download className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0 ml-2" />
                              ) : (
                                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0 ml-2" />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Action Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <span className="text-[11px] text-neutral-500">
                        Need changes or revision? Reach out to your assigned squad on WhatsApp.
                      </span>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-rose-500" />
                          <span>PDF Invoice</span>
                        </button>

                        <a
                          href={`https://wa.me/8801613253301?text=Hi%20Beyond%20Pixels,%20inquiry%20regarding%20my%20order%20${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>WhatsApp Lead</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl rounded-3xl bg-[#0D0D0D] border border-neutral-800 p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                Client Profile & Account Information
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Keep your contact details up to date so our creative directors can communicate project deliverables without delay.
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-5">
              {/* Verified Google Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Google Account Email (Verified)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] text-neutral-400 text-xs font-mono cursor-not-allowed border border-neutral-800"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    Verified
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Full Name / Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakib Ahmed"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setSelectedAvatarSeed(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* WhatsApp Contact Number */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  WhatsApp Contact Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 017XXXXXXXX / +880 1712 345678"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Brand / Company Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Brand / Organization / Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beyond Pixels Partner / Daraz Store"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Avatar Seed Preview */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800 flex items-center gap-4">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedAvatarSeed || 'Client')}&backgroundColor=0ea5e9,6366f1,e11d48,10b981`}
                  alt="Avatar Preview"
                  className="w-12 h-12 rounded-xl border border-rose-500/40 object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-white">Client Avatar Badge</div>
                  <div className="text-[11px] text-neutral-400">Generated dynamically from your display name</div>
                </div>
              </div>

              {profileSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated & synchronized successfully!</span>
                </motion.div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Invoice Modal for Clients */}
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
        />
      </div>
    </div>
  );
};
