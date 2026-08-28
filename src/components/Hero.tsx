import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Flame,
  Palette,
  Film,
  Code2,
  Zap,
  PackageCheck,
  Search
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface HeroProps {
  onOpenOrderModal: () => void;
  onExploreServices: () => void;
  onExplorePackages: () => void;
  onOpenTrackerModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onOpenOrderModal, 
  onExploreServices,
  onExplorePackages,
  onOpenTrackerModal
}) => {
  const { cms } = useCMS();

  return (
    <section id="hero-section" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-[#0A0A0A] text-white">
      {/* Background ambient lighting effects (Crimson & Royal Blue accents) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[420px] bg-rose-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -top-12 -left-20 w-72 h-72 bg-rose-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-blue-600/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-widest uppercase"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>{cms?.heroBadge || "CREATIVE & DIGITAL GROWTH AGENCY"}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]"
          >
            {cms?.heroTitle || "Crafting High-Converting Digital Presence"}
            <span className="block mt-2 text-rose-500">
              {cms?.heroHighlight || "Beyond Limits & Boundaries"}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            {cms?.heroSubtitle || "We transform visionary brands with world-class Graphic Design, Cinematic Video Editing, Hyper-targeted Digital Marketing, and Next-Gen Web Development."}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Primary Order CTA */}
            <button
              id="hero-primary-cta"
              onClick={onOpenOrderModal}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-rose-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{cms?.ctaPrimaryText || "Place Order / Get Started"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Packages / Ad Boost CTA */}
            <button
              id="hero-packages-cta"
              onClick={onExplorePackages}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-rose-500" />
              <span>15/30-Day Packages & Ad Boost</span>
            </button>

            {/* Track Order Shortcut */}
            <button
              onClick={onOpenTrackerModal}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-transparent hover:bg-neutral-900 text-neutral-300 border border-neutral-800/80 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Track Order</span>
            </button>
          </motion.div>

          {/* Trust Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-neutral-400"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>30% Advance Transparent Policy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dedicated Creative Specialists</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Direct WhatsApp Line: +8801613253301</span>
            </div>
          </motion.div>
        </div>

        {/* 4 Interactive Core Services Pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          <div 
            onClick={onExploreServices}
            className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 hover:border-rose-500/50 hover:bg-[#161616] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Graphic Design</h3>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-1">Branding, Ads & UI</p>
          </div>

          <div 
            onClick={onExploreServices}
            className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 hover:border-blue-500/50 hover:bg-[#161616] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Video Editing</h3>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-1">Reels, Shorts & 4K Ads</p>
          </div>

          <div 
            onClick={onExploreServices}
            className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 hover:border-emerald-500/50 hover:bg-[#161616] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Digital Marketing</h3>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-1">Meta, Google & Funnels</p>
          </div>

          <div 
            onClick={onExploreServices}
            className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 hover:border-rose-500/50 hover:bg-[#161616] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Web Development</h3>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-1">Fast Apps & Portals</p>
          </div>
        </motion.div>

        {/* Dynamic Metric Bar */}
        {cms?.stats && cms.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-12 max-w-5xl mx-auto rounded-3xl bg-[#111111] border border-neutral-800 p-6 md:p-8 shadow-2xl text-white backdrop-blur-xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {cms.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-500">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-neutral-200">{stat.label}</div>
                  <div className="text-[11px] text-neutral-400 hidden sm:block">{stat.description}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
