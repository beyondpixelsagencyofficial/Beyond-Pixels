import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Zap, 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Flame, 
  Share2, 
  DollarSign,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { AgencyPackage, ServiceType } from '../types';

interface PackagesSectionProps {
  onSelectPackage: (pkg: AgencyPackage) => void;
  onOpenAdBoostOrder: (dollarBudget: number, totalBDT: number) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({ 
  onSelectPackage, 
  onOpenAdBoostOrder 
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { cms } = useCMS();
  const [adDollars, setAdDollars] = useState(50);
  const adRate = cms?.adDollarRateBDT || 148; // 145-150 BDT per dollar

  const packages: AgencyPackage[] = cms?.packages && cms.packages.length > 0 ? cms.packages : [
    {
      id: "pkg_15_days",
      name: "15-Day Growth Package",
      duration: "15 Days",
      tagline: "Ideal for regular social media presence and consistent client engagement",
      priceBDT: 8500,
      designsCount: 8,
      videosCount: 2,
      pageManagementFree: true,
      features: [
        "8 Premium Social Media Graphic Designs / Ads",
        "2 High-Retention Viral Reels / Video Edits",
        "FREE Complete Facebook/Instagram Page Management",
        "Strategic Content Calendar & Copywriting",
        "Priority Revisions & 24/7 WhatsApp Support"
      ],
      popularBadge: false
    },
    {
      id: "pkg_30_days",
      name: "30-Day Pro Scale Package",
      duration: "30 Days (Full Month)",
      tagline: "Complete month-long domination & viral brand growth across all channels",
      priceBDT: 16500,
      designsCount: 20,
      videosCount: 3,
      pageManagementFree: true,
      features: [
        "20 High-Converting Graphic Designs / Carousel Ads",
        "3 Cinematic Viral Reels / Product Video Edits",
        "FREE Complete Page Management & Post Scheduling",
        "Dedicated Creative Lead & Growth Manager",
        "Hashtag & Audience Research + Bi-Weekly Performance Report"
      ],
      popularBadge: true
    }
  ];

  const calculatedAdBDT = adDollars * adRate;
  const calculatedAdvanceBDT = Math.round(calculatedAdBDT * 0.3);

  return (
    <section id="packages-section" className="py-24 bg-[#080808] border-t border-neutral-800/80 relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-rose-600/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Monthly Retainer Packages
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            High-Impact Packages <span className="text-rose-500">Built for Growth</span>
          </h2>
          
          <p className="text-sm text-neutral-400 leading-relaxed">
            Choose our battle-tested 15-Day or 30-Day monthly agency packages with <span className="text-white font-semibold">FREE full page management</span>, or calculate your custom Meta & Google Ad Boost budget in BDT (৳).
          </p>
        </div>

        {/* 15-Day & 30-Day Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ y: -4 }}
              className={`relative rounded-3xl p-8 flex flex-col justify-between border transition-all ${
                pkg.popularBadge
                  ? 'bg-[#111111] border-rose-500/50 shadow-2xl shadow-rose-900/20'
                  : 'bg-[#0D0D0D] border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {pkg.popularBadge && (
                <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-600/30">
                  <Sparkles className="w-3 h-3" />
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-black text-white">{pkg.name}</h3>
                    <span className="px-3 py-1 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold">
                      {pkg.duration}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{pkg.tagline}</p>
                </div>

                {/* Key Deliverables Highlight Pill */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#171717] border border-neutral-800">
                  <div className="text-center">
                    <span className="text-lg font-black text-rose-400">{pkg.designsCount}</span>
                    <span className="block text-[11px] text-neutral-400">Graphic Designs</span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-black text-blue-400">{pkg.videosCount}</span>
                    <span className="block text-[11px] text-neutral-400">Video Edits</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-center">
                    <span className="text-xs font-black text-emerald-400 uppercase">100% FREE</span>
                    <span className="block text-[11px] text-neutral-400">Page Management</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">৳{pkg.priceBDT?.toLocaleString()}</span>
                    <span className="text-xs text-neutral-400">/ {pkg.duration}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    30% Advance: <span className="text-emerald-400 font-semibold">৳{Math.round(pkg.priceBDT * 0.3).toLocaleString()}</span> (Secure via bKash / Nagad)
                  </p>
                </div>

                {/* Feature List */}
                <ul className="space-y-3 pt-2">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-neutral-300">
                      <div className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Button */}
              <div className="pt-8 mt-6 border-t border-neutral-800/80">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal();
                    } else {
                      onSelectPackage(pkg);
                    }
                  }}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    pkg.popularBadge
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-md'
                  }`}
                >
                  <span>Book {pkg.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ad Boost Budget & Dollar Rate Calculator */}
        <div className="rounded-3xl bg-[#0D0D0D] border border-neutral-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Info & Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                Live Ad Boost & Dollar Rate Calculator
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Meta & Google Paid Ad Boost Budget
              </h3>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Whether you need a $10, $20, $50, or $100+ ad campaign boost, our fixed rate is locked at <span className="text-white font-bold">{adRate} ৳ / Dollar</span> with full targeting setup, pixel integration, and weekly ROI tracking.
              </p>

              {/* Quick Dollar Selector Buttons */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Select Ad Dollar Budget ($):
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {[10, 20, 50, 100, 200, 500].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAdDollars(val)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        adDollars === val
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                          : 'bg-[#171717] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                      }`}
                    >
                      ${val} USD
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div className="pt-2">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="5"
                    value={adDollars}
                    onChange={(e) => setAdDollars(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                    <span>Min $10</span>
                    <span>Selected: ${adDollars}</span>
                    <span>Max $1,000+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Calculated Summary Card */}
            <div className="lg:col-span-5 rounded-2xl bg-[#141414] border border-neutral-800 p-6 space-y-5">
              <div className="border-b border-neutral-800 pb-4">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                  Calculated Ad Spend Breakdown
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-rose-500 font-mono">
                    ৳{calculatedAdBDT.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    (${adDollars} × {adRate} ৳)
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Ad Dollar Rate:</span>
                  <span className="font-semibold text-white">৳{adRate} / 1 USD</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Meta / Google Spend:</span>
                  <span className="font-semibold text-white">${adDollars} USD</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>30% Initial Advance:</span>
                  <span className="font-semibold text-emerald-400">৳{calculatedAdvanceBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Targeting & Setup:</span>
                  <span className="font-semibold text-blue-400">Included</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal();
                  } else {
                    onOpenAdBoostOrder(adDollars, calculatedAdBDT);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                <span>Launch ${adDollars} Ad Campaign</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
