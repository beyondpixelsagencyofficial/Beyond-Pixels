/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CMSProvider } from './context/CMSContext';
import { OrderProvider } from './context/OrderContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { PackagesSection } from './components/PackagesSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { OrderSection } from './components/OrderSection';
import { OrderModal } from './components/OrderModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ServiceType, AgencyPackage } from './types';

function MainAppContent() {
  const { user, isAuthenticated, isAdmin, isAuthModalOpen, closeAuthModal } = useAuth();
  
  // Current active view: 'landing' or 'dashboard'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [clientDashboardTab, setClientDashboardTab] = useState<'orders' | 'profile'>('orders');
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [selectedServiceToOrder, setSelectedServiceToOrder] = useState<ServiceType | null>(null);
  const [selectedPackageToOrder, setSelectedPackageToOrder] = useState<AgencyPackage | null>(null);
  const [selectedAdBoostToOrder, setSelectedAdBoostToOrder] = useState<{ dollars: number; totalBDT: number } | null>(null);

  // Auto-route on login as requested in spec:
  // "If logged in with beyondpixelsagency.official@gmail.com, automatically route to the Admin Dashboard.
  // Any other user logging in with Google will automatically be routed to their Client Dashboard/Profile."
  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, user?.email]);

  const handleOpenOrderModal = (
    service?: ServiceType,
    pkg?: AgencyPackage,
    adBoost?: { dollars: number; totalBDT: number }
  ) => {
    setSelectedServiceToOrder(service || null);
    setSelectedPackageToOrder(pkg || null);
    setSelectedAdBoostToOrder(adBoost || null);
    setIsOrderModalOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
    }
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  const handleOrderSubmitted = (orderId: string) => {
    setHighlightedOrderId(orderId);
    setClientDashboardTab('orders');
    setCurrentView('dashboard');
  };

  const handleOpenProfile = () => {
    setClientDashboardTab('profile');
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-rose-500/25 selection:text-rose-400 transition-colors">
      {/* Header Navigation */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenOrderModal={() => handleOpenOrderModal()}
        onOpenTrackerModal={() => setIsTrackerModalOpen(true)}
        onNavigateSection={handleNavigateSection}
        onOpenProfile={handleOpenProfile}
      />

      {/* Main View Router */}
      <main>
        {currentView === 'dashboard' ? (
          isAdmin ? (
            /* Exclusive Admin Dashboard for beyondpixelsagency.official@gmail.com */
            <AdminDashboard onBackToLanding={() => setCurrentView('landing')} />
          ) : (
            /* Client Dashboard for all other logged-in clients */
            <ClientDashboard
              initialTab={clientDashboardTab}
              highlightOrderId={highlightedOrderId}
              onOpenNewOrder={() => handleOpenOrderModal()}
              onBackToLanding={() => setCurrentView('landing')}
            />
          )
        ) : (
          /* High-Converting Modern Agency Landing Page */
          <>
            <Hero
              onOpenOrderModal={() => handleOpenOrderModal()}
              onExploreServices={() => handleNavigateSection('services-section')}
              onExplorePackages={() => handleNavigateSection('packages-section')}
              onOpenTrackerModal={() => setIsTrackerModalOpen(true)}
            />

            <ServicesSection
              onSelectServiceToOrder={(svc) => handleOpenOrderModal(svc)}
            />

            <PackagesSection
              onSelectPackage={(pkg) => handleOpenOrderModal(undefined, pkg)}
              onSelectAdBoost={(dollars, totalBDT) => handleOpenOrderModal(undefined, undefined, { dollars, totalBDT })}
            />

            <WhyChooseUs />

            <OrderSection
              initialService={selectedServiceToOrder}
              initialPackage={selectedPackageToOrder}
              initialAdBoost={selectedAdBoostToOrder}
              onOrderSuccess={handleOrderSubmitted}
            />

            <Footer onNavigateSection={handleNavigateSection} />
          </>
        )}
      </main>

      {/* Floating Persistent WhatsApp Icon (redirects to https://wa.me/8801613253301) */}
      <FloatingWhatsApp />

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={() => setCurrentView('dashboard')}
      />

      {/* Quick Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        initialService={selectedServiceToOrder}
        initialPackage={selectedPackageToOrder}
        initialAdBoost={selectedAdBoostToOrder}
        onOrderSuccess={handleOrderSubmitted}
      />

      {/* Order Status & Deliverables Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CMSProvider>
          <OrderProvider>
            <MainAppContent />
          </OrderProvider>
        </CMSProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
