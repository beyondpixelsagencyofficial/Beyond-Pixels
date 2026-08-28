import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Heart,
  Globe,
  Sparkles,
  ShieldCheck,
  Facebook
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { useOrders } from '../context/OrderContext';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection }) => {
  const { cms } = useCMS();
  const { sendContactMessage } = useOrders();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const agencyEmail = cms?.agencyEmail || "beyondpixelsagency.official@gmail.com";
  const agencyWhatsApp = cms?.agencyWhatsApp || "+8801613253301";
  const agencyFacebook = cms?.agencyFacebook || "https://www.facebook.com/beyondpixels.offical";

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    setFeedback(null);
    try {
      const res = await sendContactMessage({ name, email, phone, subject, message });
      if (res.success) {
        setFeedback({ type: 'success', msg: 'Thank you! Your message has been routed to our senior team.' });
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        setFeedback({ type: 'error', msg: res.error || 'Failed to send message.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: 'Network error sending inquiry.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <footer id="contact-section" className="relative bg-[#050505] text-white border-t border-neutral-800 pt-20 pb-12 overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Contact Us Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold tracking-widest uppercase">
              Get in Touch
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Let’s Build Something <span className="text-rose-500">Extraordinary</span> Together.
            </h2>
            
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Have a custom project or looking for monthly retainer partnerships? Connect directly with our team in Dhaka or worldwide.
            </p>

            <div className="space-y-4 pt-2">
              {/* Email */}
              <a
                href={`mailto:${agencyEmail}`}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 hover:border-rose-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                    Official Email
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-rose-400 transition-colors truncate">
                    {agencyEmail}
                  </span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${agencyWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 hover:border-emerald-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                    WhatsApp Direct Line
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {agencyWhatsApp}
                  </span>
                </div>
              </a>

              {/* Facebook Page Link */}
              <a
                href={agencyFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0D0D0D] border border-neutral-800 hover:border-blue-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                    Facebook Page
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    facebook.com/beyondpixels.offical
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0D0D0D] border border-neutral-800 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Send Direct Inquiry</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Fill out the form below and our agency leads will get back to you promptly.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakib Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Your Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="shakib@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+880 17..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Project Scope / Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. 30-Day Package Retainer"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Message / Requirements *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about your timeline, deliverables, or creative direction..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {feedback && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{feedback.msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <span>Dispatching Message...</span>
                ) : (
                  <>
                    <span>Send Message to Beyond Pixels</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-12 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-rose-600/20">
              BP
            </div>
            <span className="font-bold text-neutral-300">Beyond Pixels Agency</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-neutral-400">
            <button onClick={() => onNavigateSection('hero-section')} className="hover:text-rose-400 transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => onNavigateSection('services-section')} className="hover:text-rose-400 transition-colors cursor-pointer">
              Services
            </button>
            <button onClick={() => onNavigateSection('packages-section')} className="hover:text-rose-400 transition-colors cursor-pointer">
              Packages & Ad Rates
            </button>
            <button onClick={() => onNavigateSection('order-section')} className="hover:text-rose-400 transition-colors cursor-pointer">
              Checkout
            </button>
            <a href={agencyFacebook} target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">
              Facebook Page
            </a>
          </div>

          <div className="text-center md:text-right font-medium">
            <p>© Beyond Pixels. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
