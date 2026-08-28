import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  Zap, 
  Sparkles,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const WhyChooseUs: React.FC = () => {
  const { cms } = useCMS();

  const reasons = cms?.reasonsToChoose || [
    {
      id: "rtc_1",
      title: "Dedicated Creative Squad",
      description: "You work directly with senior designers, video editors, and growth media buyers focused on your business growth goals.",
      icon: "Users"
    },
    {
      id: "rtc_2",
      title: "30% Advance Transparent Policy",
      description: "Start risk-free with an upfront 30% commitment in BDT via bKash or Nagad. Pay remaining 70% only upon final signoff.",
      icon: "ShieldCheck"
    },
    {
      id: "rtc_3",
      title: "Direct WhatsApp Production Line",
      description: "Instant real-time communications without ticketing bottlenecks. Direct squad hotline at +8801613253301.",
      icon: "MessageSquare"
    },
    {
      id: "rtc_4",
      title: "Rapid Turnaround Guarantee",
      description: "Swift milestone deliveries with structured revision rounds to keep your marketing campaigns ahead of competitors.",
      icon: "Zap"
    }
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Users': return <Users className="w-6 h-6 text-rose-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'MessageSquare': return <MessageSquare className="w-6 h-6 text-blue-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-400" />;
      default: return <Award className="w-6 h-6 text-rose-500" />;
    }
  };

  return (
    <section className="py-20 relative bg-[#080808] border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold tracking-widest uppercase">
            The Beyond Pixels Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Built Differently For High-Growth Brands
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Eliminating agency bloat with direct communication, transparent BDT deposits, and senior-led creative execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 rounded-3xl bg-[#0D0D0D] border border-neutral-800 shadow-xl hover:border-rose-500/40 transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#141414] flex items-center justify-center">
                {getIcon(reason.icon)}
              </div>
              <h3 className="text-base font-bold text-white">
                {reason.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
