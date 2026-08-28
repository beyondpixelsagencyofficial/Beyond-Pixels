import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Phone,
  Calendar,
  Layers,
  Receipt
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No matching order found.');
      }
      setOrders(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Could not find any order with this code or phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'In Review':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Confirmed':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-[#0D0D0D] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 my-8 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            id="close-tracker-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Search className="w-3 h-3" />
              Live Order Tracker
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Track Your Production Order
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your Order Code (e.g. <span className="text-rose-400 font-mono font-semibold">BP-9281</span>), bKash/Nagad Transaction ID, or Phone Number.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Enter Order Code (BP-XXXX) or TrxID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#141414] border border-neutral-800 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="px-5 sm:px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Results */}
          {orders && orders.length > 0 && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">Order Reference</span>
                      <span className="text-base font-black text-rose-500 font-mono">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>PDF Invoice</span>
                      </button>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Client</span>
                      <span className="font-semibold text-neutral-200">{order.clientName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Total Price</span>
                      <span className="font-semibold text-neutral-200">৳{order.estimatedTotalBDT?.toLocaleString() || (order as any).estimatedTotal || 0}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">30% Advance</span>
                      <span className="font-semibold text-emerald-400">৳{order.advanceAmountBDT?.toLocaleString() || (order as any).advanceAmount || 0}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Payment Via</span>
                      <span className="font-semibold text-neutral-200">{order.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Transaction ID</span>
                      <span className="font-mono text-neutral-300 font-bold">{order.transactionId}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Created On</span>
                      <span className="text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Services / Package */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {order.packageSelected && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] font-bold">
                        📦 {order.packageSelected}
                      </span>
                    )}
                    {order.services.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Admin Notes */}
                  {order.adminNotes && (
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                      <span className="text-neutral-500 font-semibold block text-[10px] uppercase mb-0.5">Production Status Update:</span>
                      {order.adminNotes}
                    </div>
                  )}

                  {/* Deliveries / Download Links */}
                  {order.deliveries && order.deliveries.length > 0 && (
                    <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Project Deliverables & Files Available:
                      </span>
                      <div className="space-y-1.5">
                        {order.deliveries.map((del) => (
                          <div key={del.id} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{del.title}</p>
                              {del.notes && <p className="text-[11px] text-neutral-400">{del.notes}</p>}
                            </div>
                            <a
                              href={del.linkOrData}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                            >
                              <span>Open / Download</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer Assistance */}
          <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Need urgent help with your order?</span>
            <a
              href="https://wa.me/8801613253301"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              WhatsApp: +8801613253301
            </a>
          </div>
        </motion.div>
      </div>

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </AnimatePresence>
  );
};
