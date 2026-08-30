import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  ArrowUpRight,
  PackageCheck,
  ChevronDown,
  Search,
  Flame,
  Phone,
  Home,
  Palette,
  ShoppingCart,
  Mail,
  Zap,
  Lock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { useOrders } from '../context/OrderContext';

interface HeaderProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  onOpenOrderModal: () => void;
  onOpenTrackerModal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenOrderModal,
  onOpenTrackerModal,
  onNavigateSection,
  onOpenProfile
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const { cms } = useCMS();
  const { orders } = useOrders();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pendingOrActiveCount = orders.filter(o => o.status !== 'Completed' && o.status !== 'Rejected').length;

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        onNavigateSection(sectionId);
      }, 100);
    } else {
      onNavigateSection(sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-[#080808]/90 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Announcement top-bar */}
      {cms?.showBannerNotice && cms?.bannerNotice && (
        <div className="w-full bg-rose-600 text-white text-xs py-1.5 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm">
          <Flame className="w-3.5 h-3.5 shrink-0" />
          <span>{cms.bannerNotice}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          id="brand-logo-btn"
          onClick={() => { setCurrentView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-lg group-hover:border-rose-500 transition-all">
            <span className="font-black text-rose-500 text-lg tracking-tighter">
              BP
            </span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-neutral-950 dark:text-white">
                Beyond<span className="text-rose-500">Pixels</span>
              </span>
            </div>
            <p className="text-[10px] tracking-widest uppercase font-bold text-neutral-500 dark:text-neutral-400 -mt-1">
              Creative & Growth Agency
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            id="nav-home-btn"
            onClick={() => handleNavClick('hero-section')}
            className="text-xs uppercase font-bold tracking-wider text-neutral-600 hover:text-rose-500 dark:text-neutral-300 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            id="nav-services-btn"
            onClick={() => handleNavClick('services-section')}
            className="text-xs uppercase font-bold tracking-wider text-neutral-600 hover:text-rose-500 dark:text-neutral-300 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            Services
          </button>
          <button
            id="nav-packages-btn"
            onClick={() => handleNavClick('packages-section')}
            className="text-xs uppercase font-bold tracking-wider text-neutral-600 hover:text-rose-500 dark:text-neutral-300 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            Packages & Ad Boost
          </button>
          <button
            id="nav-pricing-btn"
            onClick={() => handleNavClick('order-section')}
            className="text-xs uppercase font-bold tracking-wider text-neutral-600 hover:text-rose-500 dark:text-neutral-300 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            Order / Checkout
          </button>
          <button
            id="nav-contact-btn"
            onClick={() => handleNavClick('contact-section')}
            className="text-xs uppercase font-bold tracking-wider text-neutral-600 hover:text-rose-500 dark:text-neutral-300 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right CTA / Auth / Theme Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Order Tracker Button */}
          <button
            id="header-track-order-btn"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal();
              } else {
                onOpenTrackerModal();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-800 hover:border-rose-500/50 text-neutral-700 dark:text-neutral-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
            title="Track Order Status"
          >
            <Search className="w-3.5 h-3.5 text-rose-500" />
            <span>Track Order</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          {/* Admin Direct Button (When logged in as Admin) */}
          {isAuthenticated && isAdmin && (
            <button
              id="header-admin-direct-cta"
              onClick={() => setCurrentView('dashboard')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/40 text-rose-400 hover:text-rose-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Admin Control Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Admin Panel</span>
              {pendingOrActiveCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingOrActiveCount}
                </span>
              )}
            </button>
          )}

          {/* Client Portal Button (When logged in as standard client) */}
          {isAuthenticated && !isAdmin && (
            <button
              id="header-client-portal-cta"
              onClick={() => setCurrentView('dashboard')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open Client Orders Portal"
            >
              <PackageCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>My Orders</span>
              {pendingOrActiveCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingOrActiveCount}
                </span>
              )}
            </button>
          )}

          {/* Place Order CTA */}
          <button
            id="header-place-order-cta"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal();
              } else {
                if (currentView !== 'landing') setCurrentView('landing');
                onOpenOrderModal();
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Place Order</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* User Auth / User Dropdown */}
          {!isAuthenticated ? (
            <button
              id="user-login-header-btn"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-rose-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>লগইন (Sign In)</span>
            </button>
          ) : (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/90 hover:border-rose-500/60 transition-all cursor-pointer"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-7 h-7 rounded-lg object-cover bg-neutral-800"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                    {user?.name?.split(' ')[0]}
                    {isAdmin && (
                      <span className="bg-rose-500/15 text-rose-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0D0D0D] border border-neutral-200 dark:border-neutral-800 shadow-2xl py-2 z-50 text-neutral-800 dark:text-neutral-200"
                  >
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-bold truncate text-neutral-900 dark:text-white">{user?.name}</p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                    </div>

                    <div className="p-1.5 space-y-1">
                      <button
                        id="dropdown-dashboard-btn"
                        onClick={() => {
                          setCurrentView('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          {isAdmin ? (
                            <ShieldCheck className="w-4 h-4 text-rose-500" />
                          ) : (
                            <PackageCheck className="w-4 h-4 text-blue-400" />
                          )}
                          {isAdmin ? 'Admin Master Control' : 'My Orders & Deliverables'}
                        </span>
                        {!isAdmin && pendingOrActiveCount > 0 && (
                          <span className="bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                            {pendingOrActiveCount}
                          </span>
                        )}
                      </button>

                      {!isAdmin && (
                        <button
                          id="dropdown-profile-btn"
                          onClick={() => {
                            if (onOpenProfile) onOpenProfile();
                            else setCurrentView('dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-rose-400" />
                          <span>My Profile & Settings</span>
                        </button>
                      )}

                      <button
                        id="dropdown-home-view-btn"
                        onClick={() => {
                          setCurrentView('landing');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-neutral-400" />
                        Agency Landing Page
                      </button>

                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          setCurrentView('landing');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile quick action icons */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          {/* Quick Track Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal();
              } else {
                onOpenTrackerModal();
              }
            }}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
            title="Track Order"
            aria-label="Track Order"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            id="mobile-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 bg-neutral-100/80 dark:bg-neutral-900/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl px-4 py-5 space-y-4 shadow-2xl"
          >
            <div className="space-y-1.5">
              <button
                onClick={() => handleNavClick('hero-section')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-left font-bold text-neutral-800 dark:text-neutral-200 hover:text-rose-500 transition-all text-sm"
              >
                <span className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-rose-500" />
                  <span>হোম (Home)</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-400" />
              </button>

              <button
                onClick={() => handleNavClick('services-section')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-left font-bold text-neutral-800 dark:text-neutral-200 hover:text-rose-500 transition-all text-sm"
              >
                <span className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-rose-500" />
                  <span>সার্ভিস সমূহ (Services)</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-400" />
              </button>

              <button
                onClick={() => handleNavClick('packages-section')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-left font-bold text-neutral-800 dark:text-neutral-200 hover:text-rose-500 transition-all text-sm"
              >
                <span className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-rose-500" />
                  <span>প্যাকেজ ও বুস্টিং (Packages & Ad Boost)</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-400" />
              </button>

              <button
                onClick={() => handleNavClick('order-section')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-left font-bold text-neutral-800 dark:text-neutral-200 hover:text-rose-500 transition-all text-sm"
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-rose-500" />
                  <span>অর্ডার ও প্রাইসিং (Order / Pricing)</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-400" />
              </button>

              <button
                onClick={() => handleNavClick('contact-section')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-left font-bold text-neutral-800 dark:text-neutral-200 hover:text-rose-500 transition-all text-sm"
              >
                <span className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-rose-500" />
                  <span>যোগাযোগ (Contact Squad)</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-400" />
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentView !== 'landing') setCurrentView('landing');
                  handleNavClick('order-section');
                }}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider text-center cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                <span>নতুন অর্ডার করুন (Place Order)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!isAuthenticated) {
                    openAuthModal();
                  } else {
                    onOpenTrackerModal();
                  }
                }}
                className="w-full py-3 rounded-2xl border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:border-rose-500/40 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-rose-500" />
                <span>অর্ডার ট্র্যাক করুন (Track Order)</span>
              </button>

              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-3 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <UserIcon className="w-4 h-4 text-rose-500" />
                  <span>লগইন / সাইন আপ (Sign In / Register)</span>
                </button>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-500" />
                      <span>{isAdmin ? '👑 Admin Control Center' : '📁 Client Order Dashboard'}</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile();
                        else setCurrentView('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 font-semibold text-xs flex items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Profile & Settings</span>
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      setCurrentView('landing');
                    }}
                    className="w-full py-2 px-3 text-left text-xs text-rose-500 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট ({user?.name})</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Navigation Dock (Optimized for Phone Clients) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-1.5 safe-area-bottom shadow-2xl">
        <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
          {/* 1. Home */}
          <button
            onClick={() => handleNavClick('hero-section')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-rose-500 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">হোম</span>
          </button>

          {/* 2. Services */}
          <button
            onClick={() => handleNavClick('services-section')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <Palette className="w-4 h-4 text-neutral-300 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">সার্ভিস</span>
          </button>

          {/* 3. Packages */}
          <button
            onClick={() => handleNavClick('packages-section')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-neutral-300 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">প্যাকেজ</span>
          </button>

          {/* 4. Order */}
          <button
            onClick={() => handleNavClick('order-section')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-rose-400 font-bold hover:text-rose-300 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-rose-500 mb-0.5" />
            <span className="text-[10px] font-black tracking-tight">অর্ডার</span>
          </button>

          {/* 5. Track / Account */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal();
              } else {
                onOpenTrackerModal();
              }
            }}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-neutral-300 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">ট্র্যাক</span>
          </button>
        </div>
      </div>
    </header>
  );
};
