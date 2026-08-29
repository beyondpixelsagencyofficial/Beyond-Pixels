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
  Phone
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

          {/* Google Auth / User Dropdown */}
          {!isAuthenticated ? (
            <button
              id="google-login-header-btn"
              onClick={openAuthModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-900 border border-neutral-700 hover:border-rose-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login</span>
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

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal();
              } else {
                onOpenTrackerModal();
              }
            }}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-rose-500"
            title="Track Order"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            id="mobile-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl px-4 py-6 space-y-4"
          >
            <div className="space-y-2">
              <button
                onClick={() => handleNavClick('hero-section')}
                className="w-full text-left py-2 text-sm font-bold text-neutral-800 dark:text-neutral-200"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('services-section')}
                className="w-full text-left py-2 text-sm font-bold text-neutral-800 dark:text-neutral-200"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick('packages-section')}
                className="w-full text-left py-2 text-sm font-bold text-neutral-800 dark:text-neutral-200"
              >
                Packages & Ad Boost
              </button>
              <button
                onClick={() => handleNavClick('order-section')}
                className="w-full text-left py-2 text-sm font-bold text-neutral-800 dark:text-neutral-200"
              >
                Order / Checkout
              </button>
              <button
                onClick={() => handleNavClick('contact-section')}
                className="w-full text-left py-2 text-sm font-bold text-neutral-800 dark:text-neutral-200"
              >
                Contact
              </button>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!isAuthenticated) {
                    openAuthModal();
                  } else {
                    if (currentView !== 'landing') setCurrentView('landing');
                    onOpenOrderModal();
                  }
                }}
                className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider text-center cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Place Order / Get Started
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
                className="w-full py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-rose-500" />
                <span>Track Existing Order</span>
              </button>

              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-rose-500" />
                  Sign In with Google
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold text-xs flex items-center justify-between"
                  >
                    <span>{isAdmin ? '👑 Admin Control Panel' : '📁 My Orders & Deliveries'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile();
                        else setCurrentView('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-neutral-100/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-white font-semibold text-xs flex items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-rose-500" />
                        My Profile & Settings
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      setCurrentView('landing');
                    }}
                    className="w-full py-2 px-3 text-left text-xs text-rose-500 font-medium"
                  >
                    Sign Out ({user?.name})
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
