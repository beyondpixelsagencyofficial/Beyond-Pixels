import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Film, 
  TrendingUp, 
  Code2, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { ServiceItem, ServiceType } from '../types';

interface ServicesSectionProps {
  onSelectServiceToOrder: (service: ServiceType) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectServiceToOrder }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { cms } = useCMS();
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(null);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette':
        return <Palette className="w-6 h-6" />;
      case 'Film':
        return <Film className="w-6 h-6" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6" />;
      case 'Code2':
        return <Code2 className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const services = cms?.services || [];

  return (
    <section id="services-section" className="py-20 md:py-28 relative bg-[#0A0A0A] text-white border-t border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold tracking-widest uppercase">
            Core Production Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Precision Services Engineered <span className="text-rose-500">For Authority</span>
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            From viral video retention editing to high-CTR graphic design and custom web platforms, all priced transparently in Bangladeshi Taka (৳).
          </p>
        </div>

        {/* 4 Core Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const priceBDT = service.basePriceBDT || (service as any).basePrice || 3500;
            return (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative flex flex-col justify-between rounded-3xl bg-[#111111] border border-neutral-800 p-6 md:p-7 shadow-xl hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  {/* Top Bar: Icon + Popular Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all">
                      {getServiceIcon(service.icon)}
                    </div>
                    {service.popularBadge && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-400 mt-1 mb-4">
                    {service.tagline}
                  </p>

                  {/* Short Description */}
                  <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                    {service.shortDesc}
                  </p>

                  {/* Features checklist */}
                  <div className="space-y-2 mb-6">
                    {service.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <Check className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Starting from</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">৳{priceBDT.toLocaleString()}</span>
                      <span className="text-[10px] text-neutral-400 ml-1">/ project</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`view-details-${service.key.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setSelectedServiceDetail(service)}
                      className="py-2.5 px-3 rounded-xl border border-neutral-800 text-[11px] font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Deliverables
                    </button>
                    <button
                      id={`order-service-${service.key.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => {
                        if (!isAuthenticated) {
                          openAuthModal();
                        } else {
                          onSelectServiceToOrder(service.key);
                        }
                      }}
                      className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md shadow-rose-600/20 cursor-pointer"
                    >
                      <span>Order</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Deliverables / Detailed Service Modal */}
      <AnimatePresence>
        {selectedServiceDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedServiceDetail(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#0D0D0D] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                    {getServiceIcon(selectedServiceDetail.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedServiceDetail.title}</h3>
                    <p className="text-xs text-neutral-400">{selectedServiceDetail.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedServiceDetail(null)}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5 my-6 text-xs text-neutral-300">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1.5">
                    Service Scope & Methodology
                  </h4>
                  <p className="leading-relaxed">{selectedServiceDetail.fullDesc}</p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-rose-500" />
                    Guaranteed Deliverables Included
                  </h4>
                  <div className="space-y-1.5 bg-[#141414] p-3.5 rounded-2xl border border-neutral-800">
                    {selectedServiceDetail.deliverables?.map((deliv, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <span className="font-semibold">30% Advance Required to Start</span>
                  <span className="font-bold text-sm">৳{Math.round((selectedServiceDetail.basePriceBDT || 3500) * 0.3).toLocaleString()} Advance</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedServiceDetail(null)}
                  className="flex-1 py-3 rounded-xl border border-neutral-800 text-xs font-semibold cursor-pointer text-neutral-300 hover:bg-neutral-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const svc = selectedServiceDetail.key;
                    setSelectedServiceDetail(null);
                    if (!isAuthenticated) {
                      openAuthModal();
                    } else {
                      onSelectServiceToOrder(svc);
                    }
                  }}
                  className="flex-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <span>Select & Place Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
