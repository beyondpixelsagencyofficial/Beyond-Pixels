import React, { useState, useEffect, useMemo } from 'react';
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
  Download,
  Palette,
  Video,
  TrendingUp,
  Code,
  DollarSign,
  PackageCheck,
  Plus,
  Trash2,
  Sliders,
  CheckCheck,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { useOrders } from '../context/OrderContext';
import { ServiceType, DeliveryTimeframe, FileAttachment, AgencyPackage, Order, SelectedSubService } from '../types';
import { ALL_SUB_SERVICES } from '../data/subServices';
import { InvoiceModal } from './InvoiceModal';

interface OrderSectionProps {
  initialService?: ServiceType | null;
  initialPackage?: AgencyPackage | null;
  initialAdBoost?: { dollars: number; totalBDT: number } | null;
  onOrderSuccess?: (orderId: string) => void;
  isModal?: boolean;
}

type ServiceCategoryKey = 'Graphic Design' | 'Video Editing' | 'Digital Marketing' | 'Web Development';

interface CategoryConfig {
  key: ServiceCategoryKey;
  label: string;
  labelBn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  tagline: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'Graphic Design',
    label: 'Graphic Design',
    labelBn: 'গ্রাফিক ডিজাইন',
    icon: Palette,
    color: 'from-pink-500/20 to-rose-500/10',
    borderColor: 'border-rose-500',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    tagline: 'লোগো, থাম্বনেইল, সোশ্যাল মিডিয়া ব্যানার, পোস্টার ও প্যাকেজিং'
  },
  {
    key: 'Video Editing',
    label: 'Video Editing',
    labelBn: 'ভিডিও এডিটিং',
    icon: Video,
    color: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'border-amber-500',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    tagline: 'ভাইরাল শর্টস, রিলস, ইউটিউব লং ভিডিও ও কমার্শিয়াল অ্যাড'
  },
  {
    key: 'Digital Marketing',
    label: 'Digital Marketing',
    labelBn: 'ডিজিটাল মার্কেটিং',
    icon: TrendingUp,
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    tagline: 'মেটা ফেসবুক অ্যাড, গুগল অ্যাডস, পেজ ম্যানেজমেন্ট ও পিক্সেল'
  },
  {
    key: 'Web Development',
    label: 'Web Development',
    labelBn: 'ওয়েব ডেভেলপমেন্ট',
    icon: Code,
    color: 'from-sky-500/20 to-blue-500/10',
    borderColor: 'border-sky-500',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    tagline: 'হাই-কনভার্টিং ল্যান্ডিং পেজ, ই-কমার্স ও কাস্টম ওয়েব পোর্টাল'
  }
];

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

  // Active Tab: Category name OR 'packages' OR 'adboost'
  const [activeCategoryTab, setActiveCategoryTab] = useState<ServiceCategoryKey | 'packages' | 'adboost'>('Graphic Design');

  // Client Details State
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');

  // Sub-services and Package State
  const [selectedSubServices, setSelectedSubServices] = useState<SelectedSubService[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>(undefined);
  const [adBoostBudgetUSD, setAdBoostBudgetUSD] = useState<number | undefined>(undefined);
  const [includeAdManagementFee, setIncludeAdManagementFee] = useState<boolean>(true);

  // Delivery & Project Details
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<DeliveryTimeframe>('standard');
  const [projectDescription, setProjectDescription] = useState('');
  const [briefFiles, setBriefFiles] = useState<FileAttachment[]>([]);

  // Payment Verification State
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [transactionId, setTransactionId] = useState('');

  // UI Flow States
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [createdOrderObj, setCreatedOrderObj] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const adRate = cms?.adDollarRateBDT || 148;
  const paymentNumber = cms?.paymentNumber || '01965407715';
  const advancePercentage = cms?.advancePercentage || 30;

  // Sync user details on auth change
  useEffect(() => {
    if (user) {
      if (user.name) setClientName(user.name);
      if (user.email) setClientEmail(user.email);
      if (user.phone) setClientPhone(user.phone);
    }
  }, [user]);

  // Handle Initial Props
  useEffect(() => {
    if (initialService) {
      setActiveCategoryTab(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    if (initialPackage) {
      setSelectedPackage(initialPackage.name);
      setActiveCategoryTab('packages');
    }
  }, [initialPackage]);

  useEffect(() => {
    if (initialAdBoost) {
      setAdBoostBudgetUSD(initialAdBoost.dollars);
      setActiveCategoryTab('adboost');
    }
  }, [initialAdBoost]);

  // Toggle individual Sub-Service
  const handleToggleSubService = (subItem: typeof ALL_SUB_SERVICES[0]) => {
    setSelectedPackage(undefined); // Clear package if selecting individual items
    setSelectedSubServices(prev => {
      const exists = prev.some(item => item.id === subItem.id);
      if (exists) {
        return prev.filter(item => item.id !== subItem.id);
      } else {
        return [
          ...prev,
          {
            id: subItem.id,
            category: subItem.category,
            title: subItem.title,
            priceBDT: subItem.priceBDT,
            quantity: 1
          }
        ];
      }
    });
  };

  // Select all items in current category
  const handleSelectAllCategory = (categoryKey: ServiceCategoryKey) => {
    setSelectedPackage(undefined);
    const categoryItems = ALL_SUB_SERVICES.filter(item => item.category === categoryKey);
    setSelectedSubServices(prev => {
      const otherItems = prev.filter(item => item.category !== categoryKey);
      const newItems: SelectedSubService[] = categoryItems.map(item => ({
        id: item.id,
        category: item.category,
        title: item.title,
        priceBDT: item.priceBDT,
        quantity: 1
      }));
      return [...otherItems, ...newItems];
    });
  };

  // Clear all items in current category
  const handleClearCategory = (categoryKey: ServiceCategoryKey) => {
    setSelectedSubServices(prev => prev.filter(item => item.category !== categoryKey));
  };

  // Select a Monthly Package
  const handleSelectPackage = (packageName: string) => {
    setSelectedPackage(packageName);
    setSelectedSubServices([]); // Clear individual sub-services when package is chosen
    setAdBoostBudgetUSD(undefined);
  };

  // Clear everything
  const handleResetSelections = () => {
    setSelectedSubServices([]);
    setSelectedPackage(undefined);
    setAdBoostBudgetUSD(undefined);
  };

  // Extract active parent services list for backward compatibility & database tagging
  const derivedServicesList = useMemo<ServiceType[]>(() => {
    if (selectedPackage) {
      return ['Graphic Design', 'Video Editing', 'Digital Marketing'];
    }
    const categoriesSet = new Set<ServiceType>();
    selectedSubServices.forEach(item => {
      categoriesSet.add(item.category as ServiceType);
    });
    if (adBoostBudgetUSD && adBoostBudgetUSD > 0) {
      categoriesSet.add('Digital Marketing');
    }
    return Array.from(categoriesSet);
  }, [selectedPackage, selectedSubServices, adBoostBudgetUSD]);

  // Calculate Subtotal & Total
  const { calculatedBaseBDT, estimatedTotalBDT, advanceAmountBDT, remainingDueBDT } = useMemo(() => {
    let baseBDT = 0;

    if (selectedPackage) {
      const pkgObj = cms?.packages?.find(p => p.name === selectedPackage);
      if (pkgObj) {
        baseBDT = pkgObj.priceBDT;
      } else if (selectedPackage === '15-Day Growth Package') {
        baseBDT = 8500;
      } else {
        baseBDT = 16500;
      }
    } else {
      // Sum individual sub-services
      const subServicesSum = selectedSubServices.reduce((sum, item) => sum + item.priceBDT, 0);
      baseBDT += subServicesSum;

      // Add Ad Boost if configured
      if (adBoostBudgetUSD && adBoostBudgetUSD > 0) {
        const adSpendBDT = adBoostBudgetUSD * adRate;
        const managementFee = includeAdManagementFee ? 1500 : 0;
        baseBDT += adSpendBDT + managementFee;
      }
    }

    // Timeframe Multiplier for custom sub-service projects
    let multiplier = 1.0;
    if (!selectedPackage && selectedSubServices.length > 0) {
      if (deliveryTimeframe === 'express') multiplier = 1.25;
      if (deliveryTimeframe === 'rush') multiplier = 1.5;
    }

    const total = Math.round(baseBDT * multiplier);
    const advance = Math.round((total * advancePercentage) / 100);
    const due = Math.max(0, total - advance);

    return {
      calculatedBaseBDT: baseBDT,
      estimatedTotalBDT: total,
      advanceAmountBDT: advance,
      remainingDueBDT: due
    };
  }, [selectedPackage, selectedSubServices, adBoostBudgetUSD, includeAdManagementFee, adRate, deliveryTimeframe, advancePercentage, cms?.packages]);

  // Copy payment number
  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
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
          dataUrl: file.size < 4 * 1024 * 1024 ? dataUrl : undefined,
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

  // Form Submit Handler
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

    if (selectedSubServices.length === 0 && !selectedPackage && (!adBoostBudgetUSD || adBoostBudgetUSD <= 0)) {
      setSubmissionError('Please select at least one service, sub-service item, or monthly package.');
      return;
    }

    if (!transactionId.trim()) {
      setSubmissionError('Transaction ID (TrxID) is required to verify your 30% advance payment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalServices: ServiceType[] = derivedServicesList.length > 0 
        ? derivedServicesList 
        : ['Graphic Design'];

      const res = await createOrder({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        services: finalServices,
        subServices: selectedSubServices,
        packageSelected: selectedPackage,
        adBoostBudgetUSD: adBoostBudgetUSD && adBoostBudgetUSD > 0 ? adBoostBudgetUSD : undefined,
        adDollarBudget: adBoostBudgetUSD && adBoostBudgetUSD > 0 ? adBoostBudgetUSD : undefined,
        adDollarRateBDT: adRate,
        deliveryTimeframe,
        projectDescription: projectDescription.trim(),
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
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        const rawErr = String(res.error || '');
        const cleanMsg = rawErr.includes('NOT_FOUND') || rawErr.includes('<!DOCTYPE') || rawErr.includes('<html')
          ? 'Unable to connect to order server. Please verify your internet and try again.'
          : (rawErr || 'Failed to place order. Please verify your payment details and try again.');
        setSubmissionError(cleanMsg);
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      const raw = String(err?.message || '');
      const cleanMsg = raw.includes('NOT_FOUND') || raw.includes('<!DOCTYPE') || raw.includes('<html')
        ? 'A temporary network interruption occurred. Please try again.'
        : (raw || 'An unexpected error occurred while placing your order.');
      setSubmissionError(cleanMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="order-section" className={`${isModal ? '' : 'py-16 md:py-24'} relative bg-[#070707] text-white border-t border-neutral-800/80`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {!isModal && (
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Client Checkout & Sprints</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Customize & Order <span className="text-rose-500">Your Services</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Select specific sub-services or all-in-one monthly packages. Review real-time pricing and verify with transparent 30% advance in BDT (৳).
            </p>
          </div>
        )}

        {/* ================= SUCCESS SCREEN ================= */}
        <AnimatePresence>
          {submissionSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
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
                  We have received your order details and Transaction ID (<span className="font-mono font-bold text-white">{transactionId.toUpperCase()}</span>). Our team is verifying your 30% advance payment via {paymentMethod}.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 max-w-lg mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Client Name:</span>
                  <span className="font-semibold text-white">{clientName}</span>
                </div>
                
                {selectedPackage ? (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Selected Package:</span>
                    <span className="font-semibold text-rose-400">📦 {selectedPackage}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-neutral-400 block mb-1">Selected Sub-Services ({selectedSubServices.length}):</span>
                    <div className="space-y-1 pl-2 border-l-2 border-rose-500/30">
                      {selectedSubServices.map((sub, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span className="text-neutral-300">• {sub.title}</span>
                          <span className="text-neutral-400 font-mono">৳{sub.priceBDT.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adBoostBudgetUSD && adBoostBudgetUSD > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Meta / Google Ad Dollar Top-up:</span>
                    <span className="font-bold">${adBoostBudgetUSD} USD (৳{(adBoostBudgetUSD * adRate).toLocaleString()})</span>
                  </div>
                )}

                <div className="border-t border-neutral-800 pt-2 flex justify-between">
                  <span className="text-neutral-400">Total Project Price:</span>
                  <span className="font-bold text-white text-sm">৳{estimatedTotalBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">30% Advance Paid:</span>
                  <span className="font-bold text-emerald-400">৳{advanceAmountBDT.toLocaleString()} via {paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Remaining 70% Balance on Delivery:</span>
                  <span className="font-bold text-neutral-300">৳{remainingDueBDT.toLocaleString()}</span>
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
                    href="#order-section"
                    onClick={handleResetSelections}
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
                  <span>Notify on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          ) : (

            /* ================= ORDER FORM ================= */
            <form onSubmit={handleSubmitOrder} className="rounded-3xl bg-[#0D0D0D] border border-neutral-800 shadow-2xl overflow-hidden">
              <div className="p-5 sm:p-8 md:p-10 space-y-8">
                
                {/* Auth Reminder if Not Logged In */}
                {!isAuthenticated && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">Client Account Required to Submit Order</h4>
                        <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                          Please log in with Google to secure your order and view live delivery updates in your client portal.
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

                {/* 1. Client Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                        1
                      </span>
                      Client Information (কন্টাক্ট ইনফরমেশন)
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Required for project tracking
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Full Name / Business Name <span className="text-rose-500">*</span>
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

                {/* 2. Hierarchical Category & Granular Sub-Service Selection */}
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                          2
                        </span>
                        Select Services & Sub-Services (সার্ভিস নির্বাচন)
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        ক্যাটেগরি সিলেক্ট করে নির্দিষ্ট সাব-সার্ভিসগুলো আলাদা আলাদা সিলেক্ট করুন।
                      </p>
                    </div>

                    {/* Reset Button */}
                    {(selectedSubServices.length > 0 || selectedPackage || adBoostBudgetUSD) && (
                      <button
                        type="button"
                        onClick={handleResetSelections}
                        className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All Selections</span>
                      </button>
                    )}
                  </div>

                  {/* Top Category Navigation Pills / Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelectedCategory = activeCategoryTab === cat.key;
                      const selectedCount = selectedSubServices.filter(s => s.category === cat.key).length;

                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setActiveCategoryTab(cat.key)}
                          className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer select-none ${
                            isSelectedCategory
                              ? `bg-neutral-900 ${cat.borderColor} ring-1 ring-rose-500/40 shadow-lg shadow-black/40`
                              : 'bg-[#121212] border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={`p-1.5 rounded-lg ${cat.badgeBg} ${cat.badgeText}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {selectedCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] animate-pulse">
                                {selectedCount}
                              </span>
                            )}
                          </div>
                          <div className="mt-2.5">
                            <div className="font-bold text-xs text-white line-clamp-1">{cat.label}</div>
                            <div className="text-[10px] text-neutral-400 line-clamp-1">{cat.labelBn}</div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Monthly Packages Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab('packages')}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer select-none ${
                        activeCategoryTab === 'packages'
                          ? 'bg-neutral-900 border-rose-500 ring-1 ring-rose-500/40 shadow-lg'
                          : 'bg-[#121212] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                          <PackageCheck className="w-4 h-4" />
                        </div>
                        {selectedPackage && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <div className="font-bold text-xs text-white">Monthly Packs</div>
                        <div className="text-[10px] text-neutral-400">মাসিক প্যাকেজ</div>
                      </div>
                    </button>

                    {/* Meta Ad Boost Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab('adboost')}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer select-none ${
                        activeCategoryTab === 'adboost'
                          ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                          : 'bg-[#121212] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        {adBoostBudgetUSD && adBoostBudgetUSD > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-600 text-white font-black text-[10px]">
                            ${adBoostBudgetUSD}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <div className="font-bold text-xs text-white">Meta Ad Boost</div>
                        <div className="text-[10px] text-neutral-400">ডলার ক্যাম্পেইন</div>
                      </div>
                    </button>
                  </div>

                  {/* Active Tab Panel Content */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-[#111111] border border-neutral-800 space-y-4">
                    
                    {/* If standard Category Tab is Active */}
                    {activeCategoryTab !== 'packages' && activeCategoryTab !== 'adboost' && (
                      <div>
                        {/* Category Header & Batch Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white">
                                {activeCategoryTab} Services
                              </h4>
                              <span className="text-xs text-rose-400">
                                ({CATEGORIES.find(c => c.key === activeCategoryTab)?.labelBn})
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {CATEGORIES.find(c => c.key === activeCategoryTab)?.tagline}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectAllCategory(activeCategoryTab)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-rose-400" />
                              <span>Select All ({ALL_SUB_SERVICES.filter(s => s.category === activeCategoryTab).length})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearCategory(activeCategoryTab)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-white text-[11px] transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Sub-Services Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 pt-3">
                          {ALL_SUB_SERVICES
                            .filter(sub => sub.category === activeCategoryTab)
                            .map((sub) => {
                              const isChecked = selectedSubServices.some(item => item.id === sub.id);

                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => handleToggleSubService(sub)}
                                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                                    isChecked
                                      ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500/50 shadow-md shadow-rose-950/20'
                                      : 'bg-[#151515] border-neutral-800 hover:border-neutral-700 hover:bg-[#1a1a1a]'
                                  }`}
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-bold text-xs sm:text-sm text-white">
                                            {sub.title}
                                          </h5>
                                          {sub.popular && (
                                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                              Popular
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-rose-400/90 font-medium">
                                          {sub.titleBn}
                                        </div>
                                      </div>

                                      {/* Custom Checkbox */}
                                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                                        isChecked 
                                          ? 'bg-rose-600 border-rose-600 text-white' 
                                          : 'border-neutral-600 bg-neutral-900'
                                      }`}>
                                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                      </div>
                                    </div>

                                    <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
                                      {sub.description}
                                    </p>
                                  </div>

                                  <div className="pt-3 mt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                                    <span className="text-[10px] text-neutral-400">
                                      {sub.unit || 'Starting Price'}
                                    </span>
                                    <div className="font-bold text-sm text-white">
                                      ৳{sub.priceBDT.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* If Monthly Packages Tab is Active */}
                    {activeCategoryTab === 'packages' && (
                      <div className="space-y-4">
                        <div className="pb-3 border-b border-neutral-800">
                          <h4 className="font-bold text-sm text-white">
                            All-in-One Monthly Retainer Packages (মাসিক রিটেইনার প্যাকেজ)
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            গ্রাফিক ডিজাইন, ভিডিও এডিটিং এবং ডিজিটাল মার্কেটিং এর কমপ্লিট বান্ডেল প্যাকেজ।
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 15-Day Package */}
                          <div
                            onClick={() => handleSelectPackage('15-Day Growth Package')}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                              selectedPackage === '15-Day Growth Package'
                                ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500 shadow-lg shadow-rose-950/20'
                                : 'bg-[#151515] border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                  Growth Sprint
                                </span>
                                <h5 className="font-black text-base text-white mt-1">15-Day Growth Package</h5>
                                <p className="text-xs text-neutral-400">১৫ দিনের দ্রুত গ্রোথ প্যাকেজ</p>
                              </div>
                              <div className="text-right">
                                <div className="font-black text-xl text-rose-400">৳8,500</div>
                                <div className="text-[10px] text-neutral-400">Fixed Flat Retainer</div>
                              </div>
                            </div>

                            <ul className="space-y-1.5 text-xs text-neutral-300 border-t border-neutral-800 pt-3">
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>8 Custom High-CTR Social Media Creatives</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>2 Reels / TikTok / Shorts Video Edits (9:16)</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-emerald-400 font-bold">FREE 15-Day Page Management & Post Scheduling</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Meta Ad Campaign Strategy & Copywriting</span>
                              </li>
                            </ul>
                          </div>

                          {/* 30-Day Package */}
                          <div
                            onClick={() => handleSelectPackage('30-Day Pro Scale Package')}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 relative ${
                              selectedPackage === '30-Day Pro Scale Package'
                                ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500 shadow-lg shadow-rose-950/20'
                                : 'bg-[#151515] border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider">
                              Most Popular
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                  Enterprise Scale
                                </span>
                                <h5 className="font-black text-base text-white mt-1">30-Day Pro Scale Package</h5>
                                <p className="text-xs text-neutral-400">৩০ দিনের ফুল-স্কেল ব্র্যান্ড প্যাকেজ</p>
                              </div>
                              <div className="text-right">
                                <div className="font-black text-xl text-rose-400">৳16,500</div>
                                <div className="text-[10px] text-neutral-400">Monthly Complete Sprint</div>
                              </div>
                            </div>

                            <ul className="space-y-1.5 text-xs text-neutral-300 border-t border-neutral-800 pt-3">
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>20 Premium Graphics (Banners, Ads, Carousels)</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>3 Viral Reels/Shorts + 1 Commercial Promo Video</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-emerald-400 font-bold">FREE 30-Day Complete Page & Community Management</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Dedicated Senior Art Director & 24/7 VIP Support</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If Meta Ad Boost Tab is Active */}
                    {activeCategoryTab === 'adboost' && (
                      <div className="space-y-4">
                        <div className="pb-3 border-b border-neutral-800">
                          <h4 className="font-bold text-sm text-white">
                            Meta & Google Ad Dollar Boost Campaign (অ্যাড ডলার ক্যাম্পেইন)
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            ফেসবুক, ইনস্টাগ্রাম ও গুগলে পেইড ডলার বুস্টিং ও হাই-কনভার্টিং সেলস ক্যাম্পেইন।
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#151515] border border-neutral-800 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-semibold text-neutral-300">Campaign Ad Dollar Budget ($ USD)</div>
                              <div className="text-[11px] text-neutral-400">Current Rate: $1 USD = ৳{adRate} BDT</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-rose-400">${adBoostBudgetUSD || 50} USD</span>
                              <span className="text-xs text-neutral-400">=</span>
                              <span className="text-xl font-black text-white">৳{((adBoostBudgetUSD || 50) * adRate).toLocaleString()} BDT</span>
                            </div>
                          </div>

                          {/* Preset Quick Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {[30, 50, 100, 200, 500].map((amount) => (
                              <button
                                key={amount}
                                type="button"
                                onClick={() => setAdBoostBudgetUSD(amount)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  adBoostBudgetUSD === amount
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                }`}
                              >
                                ${amount} USD
                              </button>
                            ))}
                          </div>

                          {/* Range Slider */}
                          <div className="space-y-1">
                            <input
                              type="range"
                              min={10}
                              max={1000}
                              step={10}
                              value={adBoostBudgetUSD || 50}
                              onChange={(e) => setAdBoostBudgetUSD(Number(e.target.value))}
                              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                              <span>$10 Min</span>
                              <span>$500</span>
                              <span>$1,000+ Scale</span>
                            </div>
                          </div>

                          {/* Ad Setup and Management Checkbox */}
                          <div 
                            onClick={() => setIncludeAdManagementFee(prev => !prev)}
                            className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                includeAdManagementFee ? 'bg-rose-600 border-rose-600 text-white' : 'border-neutral-600'
                              }`}>
                                {includeAdManagementFee && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-white">Include Ad Account Setup & Audience Retargeting</div>
                                <div className="text-[11px] text-neutral-400">Targeting setup, pixel audit & conversion optimization</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-rose-400">+৳1,500</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Summary of Selected Items Tray */}
                  {(selectedSubServices.length > 0 || selectedPackage || adBoostBudgetUSD) && (
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-rose-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                        <span className="font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                          <PackageCheck className="w-4 h-4 text-rose-400" />
                          Selected Scope Summary ({selectedPackage ? '1 Package' : `${selectedSubServices.length} Items`})
                        </span>
                        <span className="text-rose-400 font-bold">
                          Subtotal: ৳{calculatedBaseBDT.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedPackage && (
                          <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                            <span>📦 {selectedPackage} (৳{calculatedBaseBDT.toLocaleString()})</span>
                            <button
                              type="button"
                              onClick={() => setSelectedPackage(undefined)}
                              className="text-neutral-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {selectedSubServices.map((item) => (
                          <div
                            key={item.id}
                            className="px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-neutral-700 text-xs text-white flex items-center gap-2 shadow-sm"
                          >
                            <span>{item.title}</span>
                            <span className="text-rose-400 font-semibold font-mono">৳{item.priceBDT.toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedSubServices(prev => prev.filter(s => s.id !== item.id))}
                              className="text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {adBoostBudgetUSD && adBoostBudgetUSD > 0 && (
                          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                            <span>⚡ Meta Ad Budget: ${adBoostBudgetUSD} USD (৳{(adBoostBudgetUSD * adRate).toLocaleString()})</span>
                            <button
                              type="button"
                              onClick={() => setAdBoostBudgetUSD(undefined)}
                              className="text-neutral-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Delivery Timeframe & Project Brief */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                        3
                      </span>
                      Delivery Timeframe & Brief (ডেলিভারি সময় ও প্রজেক্ট ব্রিফ)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setDeliveryTimeframe('standard')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        deliveryTimeframe === 'standard'
                          ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-[#141414] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">Standard Delivery</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">5-7 Business Days</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-1">Standard Flat Rate</div>
                    </div>

                    <div
                      onClick={() => setDeliveryTimeframe('express')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        deliveryTimeframe === 'express'
                          ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-[#141414] border-neutral-800 hover:border-neutral-700'
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
                          ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-[#141414] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">Rush / 24-48 Hours</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Direct Dedicated Squad</div>
                      <div className="text-[10px] text-amber-400 font-semibold mt-1">+50% Dedicated Sprint</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Project Description & Requirements (প্রজেক্ট ব্রিফ ও লিংক)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="আপনার কাজের বিবরণ, ব্র্যান্ড কালার, ফন্ট, গুগল ড্রাইভ/ফিগমা লিংক বা বিশেষ কোনো নির্দেশ থাকলে এখানে লিখুন..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* File Upload Area */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Attach Reference Files or Assets (ঐচ্ছিক ফাইল আপলোড)
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); handleFileDrop(e.dataTransfer.files); }}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        isDraggingFile 
                          ? 'border-rose-500 bg-rose-500/10' 
                          : 'border-neutral-800 hover:border-neutral-700 bg-[#121212]'
                      }`}
                    >
                      <input
                        type="file"
                        multiple
                        id="order-brief-files"
                        onChange={(e) => handleFileDrop(e.target.files)}
                        className="hidden"
                      />
                      <label htmlFor="order-brief-files" className="cursor-pointer space-y-1 block">
                        <UploadCloud className="w-7 h-7 text-neutral-400 mx-auto" />
                        <div className="text-xs text-neutral-300 font-medium">
                          Click to upload or drag and drop reference assets
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          PNG, JPG, PDF, AI, PSD, MP4 up to 25MB (or attach Drive link above)
                        </div>
                      </label>
                    </div>

                    {/* Uploaded File Badges */}
                    {briefFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {briefFiles.map((file) => (
                          <div key={file.id} className="px-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-rose-400" />
                            <span className="max-w-[150px] truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-neutral-500 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Payment & 30% Advance Deposit Verification */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                        4
                      </span>
                      Payment & 30% Advance Verification (৩০% অগ্রিম ভেরিফিকেশন)
                    </h3>
                  </div>

                  {/* Pricing Financial Matrix */}
                  <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                      <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                          Total Project Value (মোট মূল্য):
                        </span>
                        <div className="text-xl font-black text-white mt-0.5">
                          ৳{estimatedTotalBDT.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-neutral-500">100% Comprehensive Scope</span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-bold">
                          30% Advance Deposit Required:
                        </span>
                        <div className="text-xl font-black text-emerald-400 mt-0.5">
                          ৳{advanceAmountBDT.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-emerald-300">To start production sprint</span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                          Remaining 70% Balance Due:
                        </span>
                        <div className="text-xl font-black text-neutral-300 mt-0.5">
                          ৳{remainingDueBDT.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-neutral-500">Due upon final deliverable review</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Tabs & TrxID Input */}
                  <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-neutral-300">Select Advance Payment Method:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bKash')}
                          className={`px-4 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                            paymentMethod === 'bKash'
                              ? 'bg-[#D12053] text-white shadow-md shadow-[#D12053]/30'
                              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                          }`}
                        >
                          bKash (Send Money / Merchant)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Nagad')}
                          className={`px-4 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                            paymentMethod === 'Nagad'
                              ? 'bg-[#F7931E] text-white shadow-md shadow-[#F7931E]/30'
                              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                          }`}
                        >
                          Nagad
                        </button>
                      </div>
                    </div>

                    {/* Official Payment Number Box */}
                    <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-neutral-400">
                          Send <strong>৳{advanceAmountBDT.toLocaleString()}</strong> (30% Advance) to official {paymentMethod} number:
                        </div>
                        <div className="font-mono font-black text-lg text-white tracking-widest mt-0.5 flex items-center gap-2">
                          <span>{paymentNumber}</span>
                          <span className="text-[10px] font-sans font-normal px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                            Personal / Send Money
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-700 shrink-0"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Number</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* TrxID Input */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Transaction ID (TrxID) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9J83KLA91Z"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl bg-black/60 border border-neutral-800 text-white font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-rose-500 uppercase tracking-widest transition-colors"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Enter the {paymentMethod} Transaction ID received after sending ৳{advanceAmountBDT.toLocaleString()}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {submissionError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-rose-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying & Placing Order...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirm & Place Order (Pay ৳{advanceAmountBDT.toLocaleString()} Advance)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-neutral-500 text-center mt-2.5">
                    By submitting, your order is registered on our production board and you gain instant access to your client deliverable portal.
                  </p>
                </div>

              </div>
            </form>
          )}
        </AnimatePresence>

      </div>

      {/* Official Tax Invoice Modal */}
      {createdOrderObj && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          order={createdOrderObj}
        />
      )}
    </div>
  );
};
