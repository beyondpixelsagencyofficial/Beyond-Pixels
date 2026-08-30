import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const FloatingWhatsApp: React.FC = () => {
  const { cms } = useCMS();
  const [isOpenPrompt, setIsOpenPrompt] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const whatsAppNumber = "8801613253301";
  const defaultHref = `https://wa.me/${whatsAppNumber}`;

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const text = customMsg.trim() || 'Hi Beyond Pixels, I would like to discuss a new creative project!';
    window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(text)}`, '_blank');
    setIsOpenPrompt(false);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Quick Prompt Popover */}
      <AnimatePresence>
        {isOpenPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="mb-3 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 text-white text-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Beyond Pixels Live Chat</span>
              </div>
              <button
                onClick={() => setIsOpenPrompt(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              Have questions about Graphic Design, Video Editing, Marketing or Web Dev? Chat directly with our production squad.
            </p>

            <form onSubmit={handleSendPrompt} className="space-y-2">
              <input
                type="text"
                placeholder="Type your question..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Start WhatsApp Chat</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Persistent Floating Button */}
      <div className="relative group">
        <a
          id="floating-whatsapp-btn"
          href={defaultHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            // If click directly, standard link works
          }}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
          aria-label="Contact Beyond Pixels on WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>

        {/* Pulse Ripple */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none -z-10" />

        {/* Tooltip on hover */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-slate-700 shadow-md">
          Chat on WhatsApp
        </div>
      </div>
    </div>
  );
};
