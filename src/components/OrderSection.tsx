import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Check, 
  UploadCloud, 
  FileText, 
  X, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Sparkles, 
  ArrowRight,
  Clock,
  HelpCircle,
  PhoneCall,
  ShieldAlert,
  Layers,
  Flame,
  Search,
  Receipt,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { useOrders } from '../context/OrderContext';
import { ServiceType, DeliveryTimeframe, FileAttachment, AgencyPackage, Order } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface OrderSectionProps {
  initialService?: ServiceType | null;
  initialPackage?: AgencyPackage | null;
  initialAdBoost?: { dollars: number; totalBDT: number } | null;
  onOrderSuccess?: (orderId: string) => void;
  isModal?: boolean;
}

export const OrderSection: React.FC<OrderSectionProps> = ({ 
  initialService, 
  initialPackage,
  initialAdBoost,
  onOrderSuccess,
  isModal = false 
}) => {
  const { user, isAuthenticated, loginWithGoogle, openAuthModal } = useAuth();
  const { cms } = useCMS();
  const { createOrder } = useOrders();

  // Form State - Auto-populate from logged-in user profile
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>(undefined);
  const [adBoostBudgetUSD, setAdBoostBudgetUSD] = useState<number | undefined>(undefined);
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<DeliveryTimeframe>('standard');
  const [projectDescription, setProjectDescription] = useState('');
  const [briefFiles, setBriefFiles] = useState<FileAttachment[]>([]);

  // Update client info when auth state changes
  useEffect(() => {
    if (user) {
      if (user.name) setClientName(user.name);
      if (user.email) setClientEmail(user.email);
      if (user.phone) setClientPhone(user.phone);
    }
  }, [user]);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  
  // UI states
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [createdOrderObj, setCreatedOrderObj] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const adRate = cms?.adDollarRateBDT || 148;

  // Handle pre-selected service / package / adboost
  useEffect(() => {
    if (initialService) {
      setSelectedServices(prev => 
        prev.includes(initialService) ? prev : [...prev, initialService]
      );
    }
  }, [initialService]);

  useEffect(() => {
    if (initialPackage) {
      setSelectedPackage(initialPackage.name);
      // Auto tag services
      setSelectedServices(['Graphic Design', 'Video Editing', 'Digital Marketing']);
    }
  }, [initialPackage]);

  useEffect(() => {
    if (initialAdBoost) {
      setAdBoostBudgetUSD(initialAdBoost.dollars);
      if (!selectedServices.includes('Digital Marketing')) {
        setSelectedServices(prev => [...prev, 'Digital Marketing']);
      }
    }
  }, [initialAdBoost]);

  // Calculate pricing in BDT
  const servicesList = cms?.services || [];
  
  let calculatedBDT = 0;

  if (selectedPackage) {
    const pkgObj = cms?.packages?.find(p => p.name === selectedPackage);
    calculatedBDT = pkgObj ? pkgObj.priceBDT : 16500;
  } else if (adBoostBudgetUSD) {
    calculatedBDT = adBoostBudgetUSD * adRate;
  } else {
    calculatedBDT = selectedServices.reduce((sum, sType) => {
      const sObj = servicesList.find(s => s.key === sType);
      return sum + (sObj ? (sObj.basePriceBDT || 3500) : 3500);
    }, 0);
  }

  // Timeframe multiplier for custom projects
  let timeframeMultiplier = 1.0;
  if (!selectedPackage && !adBoostBudgetUSD) {
    if (deliveryTimeframe === 'express') timeframeMultiplier = 1.25;
    if (deliveryTimeframe === 'rush') timeframeMultiplier = 1.5;
  }

  const estimatedTotalBDT = Math.round(calculatedBDT * timeframeMultiplier);
  const advancePercentage = cms?.advancePercentage || 30;
  const advanceAmountBDT = Math.round((estimatedTotalBDT * advancePercentage) / 100);

  const paymentNumber = cms?.paymentNumber || '01965407715';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const toggleService = (serviceKey: ServiceType) => {
    setSelectedPackage(undefined); // unselect package if toggling individual services
    setSelectedServices(prev => 
      prev.includes(serviceKey) 
        ? prev.filter(s => s !== serviceKey)
        : [...prev, serviceKey]
    );
  };

  // Handle file uploads
  const handleFileDrop = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const attachment: FileAttachment = {
          id: `file_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: file.size < 5 * 1024 * 1024 ? dataUrl : undefined,
          uploadedAt: new Date().toISOString()
        };
        setBriefFiles(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setBriefFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!isAuthenticated) {
      setSubmissionError('Please sign in or create an account with Google to place and track your order.');
      openAuthModal();
      return;
    }

    if (!clientName.trim()) {
      setSubmissionError('Please enter your full name');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setSubmissionError('Please provide a valid email address');
      return;
    }
    if (!clientPhone.trim()) {
      setSubmissionError('Please provide your active WhatsApp / Phone number');
      return;
    }
    if (selectedServices.length === 0 && !selectedPackage) {
      setSubmissionError('Please select at least one service or retainer package');
      return;
    }
    if (!transactionId.trim()) {
      setSubmissionError('Transaction ID (TrxID) is required to verify your 30% advance payment');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createOrder({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        services: selectedServices.length > 0 ? selectedServices : ['Graphic Design'],
        packageSelected: selectedPackage,
        adBoostBudgetUSD,
        deliveryTimeframe,
        projectDescription,
        briefFiles,
        estimatedTotalBDT,
        advanceAmountBDT,
        paymentMethod,
        paymentNumber,
        transactionId: transactionId.trim().toUpperCase()
      });

      if (res.success && res.order) {
        setSubmissionSuccess(res.order.id);
        setCreatedOrderObj(res.order);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Auto-authenticate client if not logged in so they seamlessly see their new order dashboard
        if (!isAuthenticated && clientEmail) {
          try {
            await loginWithGoogle(clientEmail.trim(), clientName.trim() || undefined);
          } catch (e) {
            console.error('Auto client auth error:', e);
          }
        }
      } else {
        setSubmissionError(res.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setSubmissionError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="order-section" className={`${isModal ? '' : 'py-20 md:py-28'} relative bg-[#080808] text-white border-t border-neutral-800/80`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {!isModal && (
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold tracking-widest uppercase">
              Start Your Production Sprint
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Client Order & <span className="text-rose-500">Checkout</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Select your services or monthly packages, submit your requirements, and verify with transparent 30% advance in BDT (৳).
            </p>
          </div>
        )}

        {/* Success Screen */}
        <AnimatePresence>
          {submissionSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 md:p-12 rounded-3xl bg-[#0D0D0D] border border-rose-500/40 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 text-rose-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-widest">
                  Order Successfully Registered
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Order Code: <span className="text-rose-500 font-mono">{submissionSuccess}</span>
                </h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto mt-2 leading-relaxed">
                  We have received your order details and Transaction ID (<span className="font-mono font-bold text-white">{transactionId.toUpperCase()}</span>). Our team is verifying the 30% advance payment via {paymentMethod}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Client Name:</span>
                  <span className="font-semibold text-white">{clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Services / Package:</span>
                  <span className="font-semibold text-rose-400">
                    {selectedPackage ? `📦 ${selectedPackage}` : selectedServices.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Project Price:</span>
                  <span className="font-bold text-white">৳{estimatedTotalBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">30% Advance Paid:</span>
                  <span className="font-bold text-emerald-400">৳{advanceAmountBDT.toLocaleString()} via {paymentMethod}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Download PDF Invoice</span>
                </button>

                {onOrderSuccess ? (
                  <button
                    type="button"
                    onClick={() => onOrderSuccess(submissionSuccess)}
                    className="px-6 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-neutral-700"
                  >
                    View in Client Portal
                  </button>
                ) : (
                  <a
                    href="#hero-section"
                    onClick={() => setSubmissionSuccess(null)}
                    className="px-6 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-neutral-700"
                  >
                    Place Another Order
                  </a>
                )}
                <a
                  href={`https://wa.me/8801613253301?text=Hi%20Beyond%20Pixels,%20I%20just%20placed%20order%20${submissionSuccess}%20with%20TrxID%20${transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Notify on WhatsApp
                </a>
              </div>
            </motion.div>
          ) : (
            /* Order Form */
            <form onSubmit={handleSubmitOrder} className="rounded-3xl bg-[#0D0D0D] border border-neutral-800 shadow-2xl overflow-hidden">
              {/* Form Content */}
              <div className="p-6 sm:p-8 md:p-10 space-y-8">
                
                {/* Auth Gate Notification Banner if Not Logged In */}
                {!isAuthenticated && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">Client Account Required to Place Order</h4>
                        <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                          Please log in with Google to secure your order and access real-time file deliveries.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openAuthModal}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md shadow-rose-600/30 transition-all w-full sm:w-auto text-center"
                    >
                      Sign In with Google
                    </button>
                  </div>
                )}

                {/* 1. Client Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                        1
                      </span>
                      Client Information
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Enter your project contact details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shakib Ahmed"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. shakib@brand.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        WhatsApp / Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 017XXXXXXXX"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Package / Services Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                        2
                      </span>
                      Select Package or Services
                    </h3>
                  </div>

                  {/* Monthly Packages Quick Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    <div
                      onClick={() => {
                        setSelectedPackage('15-Day Growth Package');
                        setSelectedServices(['Graphic Design', 'Video Editing', 'Digital Marketing']);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedPackage === '15-Day Growth Package'
                          ? 'bg-rose-500/10 border-rose-500 shadow-md shadow-rose-900/20'
                          : 'bg-[#141414] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">📦 15-Day Growth Package</span>
                        <span className="font-black text-rose-400 text-xs">৳8,500</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">8 Designs + 2 Videos + FREE Page Management</p>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedPackage('30-Day Pro Scale Package');
                        setSelectedServices(['Graphic Design', 'Video Editing', 'Digital Marketing']);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedPackage === '30-Day Pro Scale Package'
                          ? 'bg-rose-500/10 border-rose-500 shadow-md shadow-rose-900/20'
                          : 'bg-[#141414] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">🔥 30-Day Pro Scale Package</span>
                        <span className="font-black text-rose-400 text-xs">৳16,500</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">20 Images + 3 Videos + FREE Page Management</p>
                    </div>
                  </div>

                  {/* Individual Services */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(['Graphic Design', 'Video Editing', 'Digital Marketing', 'Web Development'] as ServiceType[]).map((svcKey) => {
                      const isSelected = selectedServices.includes(svcKey) && !selectedPackage;
                      const svcObj = servicesList.find(s => s.key === svcKey);
                      const price = svcObj ? (svcObj.basePriceBDT || 3500) : 3500;

                      return (
                        <div
                          key={svcKey}
                          onClick={() => toggleService(svcKey)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all select-none flex flex-col justify-between ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-500 shadow-md shadow-rose-500/10'
                              : 'bg-[#141414] border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-white">{svcKey}</span>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-neutral-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                          <div className="mt-4 flex items-baseline justify-between text-xs">
                            <span className="text-[10px] text-neutral-400">Starting</span>
                            <span className="font-bold text-white">৳{price.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Delivery Timeframe & Project Brief */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    Delivery Timeframe & Project Brief
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setDeliveryTimeframe('standard')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        deliveryTimeframe === 'standard'
                          ? 'bg-rose-500/10 border-rose-500'
                          : 'bg-[#141414] border-neutral-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">Standard Delivery</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">5-7 Business Days</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-1">Standard Rate</div>
                    </div>

                    <div
                      onClick={() => setDeliveryTimeframe('express')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        deliveryTimeframe === 'express'
                          ? 'bg-rose-500/10 border-rose-500'
                          : 'bg-[#141414] border-neutral-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">Express Delivery</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">2-3 Business Days</div>
                      <div className="text-[10px] text-rose-400 font-semibold mt-1">+25% Priority Queue</div>
                    </div>

                    <div
                      onClick={() => setDeliveryTimeframe('rush')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        deliveryTimeframe === 'rush'
                          ? 'bg-rose-500/10 border-rose-500'
                          : 'bg-[#141414] border-neutral-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">Rush / 24-48 Hours</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Direct Squad Focus</div>
                      <div className="text-[10px] text-amber-400 font-semibold mt-1">+50% Dedicated Sprint</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Project Description / Brief Guidelines
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your goals, brand style, reference links (Google Drive / Figma / YouTube), or specific requirements..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* File Upload Area */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Attach Brief Files or Assets (Optional)
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        handleFileDrop(e.dataTransfer.files);
                      }}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors ${
                        isDraggingFile
                          ? 'border-rose-500 bg-rose-500/10'
                          : 'border-neutral-800 bg-[#141414]/50'
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 mx-auto text-neutral-400 mb-1.5" />
                      <p className="text-xs text-neutral-300">
                        Drag and drop brief documents, logos, or assets here, or{' '}
                        <label className="text-rose-400 hover:underline font-bold cursor-pointer">
                          browse files
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileDrop(e.target.files)}
                          />
                        </label>
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1">PDF, DOCX, ZIP, PNG, JPG, MP4 supported</p>
                    </div>

                    {/* Uploaded Files list */}
                    {briefFiles.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {briefFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#141414] border border-neutral-800 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate font-medium text-neutral-200">{file.name}</span>
                              {file.size && (
                                <span className="text-[10px] text-neutral-500">
                                  ({Math.round(file.size / 1024)} KB)
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-neutral-400 hover:text-rose-500 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Payment Policy & 30% Advance Verification */}
                <div className="space-y-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                        4
                      </span>
                      Payment Policy & 30% Advance Verification
                    </h3>
                  </div>

                  {/* Explicit Policy Banner */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3 text-xs">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wide block mb-0.5">
                        Policy: 30% Advance Payment Required to Start Production
                      </span>
                      <p className="text-neutral-300 leading-relaxed text-[11px]">
                        To allocate senior designers, video editors, and media buyers, an initial 30% advance deposit is mandatory. The remaining 70% balance is payable only after your review & final delivery satisfaction.
                      </p>
                    </div>
                  </div>

                  {/* Payment Number & Instructions Card */}
                  <div className="p-5 rounded-2xl bg-[#050505] text-white border border-neutral-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                          Official Merchant / Send Money Number (bKash / Nagad)
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-mono text-xl sm:text-2xl font-black text-rose-500 tracking-wider">
                            {paymentNumber}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyNumber}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedNumber ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-neutral-300" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Payment Method Switcher */}
                      <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bKash')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            paymentMethod === 'bKash'
                              ? 'bg-[#D12053] text-white shadow-xs'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          bKash
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Nagad')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            paymentMethod === 'Nagad'
                              ? 'bg-[#F26522] text-white shadow-xs'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Nagad
                        </button>
                      </div>
                    </div>

                    {/* Price Breakdown Calculation */}
                    <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-400 text-[11px]">Total Project Price:</span>
                        <div className="font-bold text-white text-base">৳{estimatedTotalBDT.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-rose-400 text-[11px] font-bold">30% Advance Deposit Due:</span>
                        <div className="font-black text-emerald-400 text-base">৳{advanceAmountBDT.toLocaleString()}</div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-neutral-400 text-[11px]">Remaining 70% on Signoff:</span>
                        <div className="font-semibold text-neutral-300 text-base">৳{(estimatedTotalBDT - advanceAmountBDT).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      bKash / Nagad Transaction ID (TrxID) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. BK9X872610A or 8H29KLA0"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-[#141414] border-2 border-neutral-800 text-white font-mono uppercase tracking-wider text-sm focus:outline-none focus:border-rose-500"
                      />
                      <CreditCard className="w-5 h-5 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Sent ৳{advanceAmountBDT.toLocaleString()} via {paymentMethod}? Copy the SMS Transaction ID and paste it here.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {submissionError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                {/* Final Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || (isAuthenticated && selectedServices.length === 0 && !selectedPackage)}
                    className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Verifying & Submitting Order...</span>
                    ) : !isAuthenticated ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-300" />
                        <span>Sign In with Google to Complete Order (৳{advanceAmountBDT.toLocaleString()})</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Order & Verify 30% Advance (৳{advanceAmountBDT.toLocaleString()})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-neutral-500 mt-2">
                    Protected by Beyond Pixels Guarantee. Urgent questions? WhatsApp +8801613253301.
                  </p>
                </div>
              </div>
            </form>
          )}
        </AnimatePresence>
      </div>

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={createdOrderObj}
      />
    </div>
  );
};
