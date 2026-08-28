import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Building, 
  Mail, 
  Phone, 
  ExternalLink,
  Sparkles,
  DollarSign,
  Receipt
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../types';
import { useCMS } from '../context/CMSContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  const { cms } = useCMS();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen || !order) return null;

  const agencyEmail = cms?.agencyEmail || 'beyondpixelsagency.official@gmail.com';
  const agencyWhatsApp = cms?.agencyWhatsApp || '+8801613253301';
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const remainingDue = Math.max(0, order.estimatedTotalBDT - order.advanceAmountBDT);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPDF(true);

    try {
      // Temporarily ensure background colors render well
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BeyondPixels_Invoice_${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl rounded-3xl bg-[#111111] border border-neutral-800 text-white shadow-2xl overflow-hidden my-8 print:my-0 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Modal Actions Bar (Hidden on print) */}
        <div className="p-4 sm:px-6 bg-[#181818] border-b border-neutral-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Official Tax Invoice</h3>
              <p className="text-[11px] text-neutral-400">Order ID: {order.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-rose-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Invoice'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#222] hover:bg-[#333] text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable / PDF Capture Canvas (Light themed for crisp professional printing) */}
        <div className="p-4 sm:p-8 bg-[#0a0a0a] text-white print:bg-white print:text-black">
          <div
            ref={invoiceRef}
            className="bg-white text-neutral-900 p-6 sm:p-10 rounded-2xl shadow-xl space-y-8 font-sans border border-neutral-200 print:shadow-none print:border-none print:p-0"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-neutral-200 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-black text-base flex items-center justify-center shadow-md">
                    BP
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-neutral-900 tracking-tight">
                      BEYOND PIXELS AGENCY
                    </h1>
                    <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-widest">
                      Elite Digital Creative & Growth Studio
                    </p>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 space-y-0.5 pt-2">
                  <p>Email: {agencyEmail}</p>
                  <p>WhatsApp: {agencyWhatsApp}</p>
                  <p>Dhaka, Bangladesh • www.beyondpixels.agency</p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1.5">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 tracking-wider uppercase">
                  INVOICE & RECEIPT
                </span>
                <div className="text-xs text-neutral-600 space-y-0.5 pt-1">
                  <p><strong>Invoice No:</strong> INV-{order.id}</p>
                  <p><strong>Date:</strong> {invoiceDate}</p>
                  <p><strong>Order Status:</strong> <span className="text-emerald-600 font-bold">{order.status}</span></p>
                </div>
              </div>
            </div>

            {/* Billed To & Payment Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-50 p-4 sm:p-5 rounded-xl border border-neutral-200/80 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Billed To (Client):
                </span>
                <h4 className="font-bold text-sm text-neutral-900">{order.clientName}</h4>
                <p className="text-neutral-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {order.clientEmail}
                </p>
                <p className="text-neutral-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {order.clientPhone}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-neutral-200 sm:pl-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Payment Verification:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-800">Method:</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-semibold">
                    {order.paymentMethod}
                  </span>
                </div>
                <p className="text-neutral-600">
                  <strong>TrxID:</strong> <span className="font-mono font-bold text-neutral-900">{order.transactionId}</span>
                </p>
                <p className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  30% Advance Deposit Received
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-800 text-neutral-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 font-bold">Item / Project Scope</th>
                    <th className="py-2.5 font-bold text-center">Delivery Time</th>
                    <th className="py-2.5 font-bold text-right">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="py-3.5">
                      <div className="font-bold text-neutral-900 text-sm">
                        {order.packageSelected 
                          ? `Package: ${order.packageSelected}` 
                          : order.services.join(' + ')}
                      </div>
                      {order.projectDescription && (
                        <p className="text-neutral-500 text-[11px] mt-0.5 max-w-md line-clamp-2">
                          {order.projectDescription}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 text-center capitalize text-neutral-700 font-medium">
                      {order.deliveryTimeframe}
                    </td>
                    <td className="py-3.5 text-right font-bold text-neutral-900 text-sm">
                      ৳{order.estimatedTotalBDT.toLocaleString()}
                    </td>
                  </tr>

                  {order.adBoostBudgetUSD && order.adBoostBudgetUSD > 0 && (
                    <tr>
                      <td className="py-3 text-neutral-700">
                        <span className="font-bold">Meta / Google Ad Dollar Top-up</span> (${order.adBoostBudgetUSD} USD @ ৳148/$)
                      </td>
                      <td className="py-3 text-center text-neutral-500">Same Day</td>
                      <td className="py-3 text-right font-semibold text-neutral-800">
                        Included in Total
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-neutral-200 pt-4 flex flex-col sm:flex-row sm:justify-between items-start gap-4">
              <div className="text-xs text-neutral-500 max-w-xs space-y-1">
                <span className="font-bold text-neutral-800 block text-[11px] uppercase tracking-wider">
                  Payment Terms:
                </span>
                <p>
                  • 30% Advance Deposit paid upfront via {order.paymentMethod}.
                </p>
                <p>
                  • Remaining balance is due upon review & final deliverables release.
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Total Project Value:</span>
                  <span className="font-bold text-neutral-900">৳{order.estimatedTotalBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                  <span>30% Advance Paid:</span>
                  <span>- ৳{order.advanceAmountBDT.toLocaleString()}</span>
                </div>
                <div className="border-t border-neutral-300 pt-2 flex justify-between font-black text-sm text-neutral-900">
                  <span>Remaining Due (70%):</span>
                  <span className="text-rose-600">৳{remainingDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stamp & Authorized Seal */}
            <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-rose-600/40 flex items-center justify-center text-rose-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                    Beyond Pixels Operations
                  </div>
                  <div className="text-[10px] text-neutral-500">Official Computer-Generated Tax Invoice</div>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-serif italic text-sm text-neutral-800">Beyond Pixels Agency</div>
                <div className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider">
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close / Action */}
        <div className="p-4 bg-[#141414] border-t border-neutral-800 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Invoice
          </button>
        </div>
      </motion.div>
    </div>
  );
};
