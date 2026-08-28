import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { OrderSection } from './OrderSection';
import { ServiceType, AgencyPackage } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType | null;
  initialPackage?: AgencyPackage | null;
  initialAdBoost?: { dollars: number; totalBDT: number } | null;
  onOrderSuccess?: (orderId: string) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  initialService,
  initialPackage,
  initialAdBoost,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

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
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-[#0D0D0D] border border-neutral-800 rounded-3xl shadow-2xl z-10 my-8 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Bar with Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0D0D0D]/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                Beyond Pixels — Fast Client Checkout
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto p-2 sm:p-4">
            <OrderSection
              isModal={true}
              initialService={initialService}
              initialPackage={initialPackage}
              initialAdBoost={initialAdBoost}
              onOrderSuccess={(orderId) => {
                if (onOrderSuccess) onOrderSuccess(orderId);
                onClose();
              }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
