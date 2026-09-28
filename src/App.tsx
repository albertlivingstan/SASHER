import React, { useState } from 'react';
import { SasherProvider, useSasher } from './context/SasherContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/navigation/Sidebar';
import { TopNavigation } from './components/navigation/TopNavigation';
import { CartDrawer } from './components/navigation/CartDrawer';
import { HeroSection } from './components/hero/HeroSection';
import { ProductGrid } from './components/product/ProductGrid';
import { RecommendationsSection } from './components/recommendations/RecommendationsSection';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { WhyRecommendedModal } from './components/recommendations/WhyRecommendedModal';
import { LiveAdaptationDemo } from './components/session/LiveAdaptationDemo';
import { SessionIntentWidget } from './components/session/SessionIntentWidget';
import { AiInsightsView } from './components/insights/AiInsightsView';
import { ResearchDashboardView } from './components/research/ResearchDashboardView';
import { TrustStatusPanel } from './components/security/TrustStatusPanel';
import { Footer } from './components/footer/Footer';
import { LiveTelemetryHub } from './components/analytics/LiveTelemetryHub';
import { CustomCursor } from './components/ui/CustomCursor';
import { GazeReticleOverlay } from './components/eyetracking/GazeReticleOverlay';
import { GoogleSignInModal } from './components/auth/GoogleSignInModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderTrackingModal } from './components/shipping/OrderTrackingModal';
import { OrderReturnModal } from './components/returns/OrderReturnModal';
import { CustomerSupportModal } from './components/support/CustomerSupportModal';
import { GazeTrackingStudioView } from './components/eyetracking/GazeTrackingStudioView';
import { PlatformAnalyticsView } from './components/analytics/PlatformAnalyticsView';
import { EvaluationAnalyticsView } from './components/analytics/EvaluationAnalyticsView';
import { FashionAssistantChatbot } from './components/assistant/FashionAssistantChatbot';
import { UserProfileModal } from './components/account/UserProfileModal';
import { ShoppingMarketplaceView } from './components/shopping/ShoppingMarketplaceView';
import { BrowseView } from './components/browse/BrowseView';
import { SplashScreen } from './components/ui/SplashScreen';
import { VisualIntentModal } from './components/eyetracking/VisualIntentModal';
import { CalibrationModal } from './components/eyetracking/CalibrationModal';
import { INITIAL_PRODUCTS } from './data/products';
import { RecommendedProduct, CompletedOrder } from './types';
import { Sparkles, Eye, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>('discover');
  const [selectedProductForModal, setSelectedProductForModal] = useState<RecommendedProduct | null>(null);

  const {
    setExplanationModalProduct,
    recentAdaptiveNotification,
    dismissAdaptiveNotification,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    completedOrders
  } = useSasher();

  // Global post-purchase & care modals
  const [isGlobalSupportOpen, setIsGlobalSupportOpen] = useState(false);
  const [isGlobalTrackingOpen, setIsGlobalTrackingOpen] = useState(false);
  const [isGlobalReturnOpen, setIsGlobalReturnOpen] = useState(false);
  const [activeOrderForModal, setActiveOrderForModal] = useState<CompletedOrder | null>(null);

  // User Account Profile & Order History Modal State
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [userProfileTab, setUserProfileTab] = useState<'orders' | 'profile' | 'calibration' | 'security'>('orders');

  const handleOpenUserProfile = (tab: 'orders' | 'profile' | 'calibration' | 'security' = 'orders') => {
    setUserProfileTab(tab);
    setIsUserProfileOpen(true);
  };

  const getResolvedOrder = (): CompletedOrder => {
    if (activeOrderForModal) return activeOrderForModal;
    if (completedOrders.length > 0) return completedOrders[0];
    return {
      id: 'demo-ord-latest',
      orderNumber: 'ORD-SA9428-IN',
      timestamp: Date.now() - (18 * 3600000),
      items: [],
      subtotal: 48500,
      discount: 7275,
      tax: 4947,
      shipping: 0,
      total: 46172,
      currency: '₹',
      paymentMethod: 'CARD',
      paymentReference: 'PAY-SA9428-VERIFIED',
      shippingAddress: {
        fullName: 'Valued Client',
        email: 'concierge@sasher.luxury',
        street: '124 Horizon Boulevard, Suite 8',
        city: 'Bangalore',
        postalCode: '560001',
        country: 'India'
      },
      journalHash: '0x7f9a12c8b0e3f4d1e2a87600b3f5e921d74c0a18'
    };
  };

  const handleOpenGlobalTracking = (order?: CompletedOrder) => {
    if (order) {
      setActiveOrderForModal(order);
    } else {
      setActiveOrderForModal(getResolvedOrder());
    }
    setIsGlobalTrackingOpen(true);
  };

  const handleOpenGlobalReturn = (order?: CompletedOrder) => {
    if (order) {
      setActiveOrderForModal(order);
    } else {
      setActiveOrderForModal(getResolvedOrder());
    }
    setIsGlobalReturnOpen(true);
  };

  const scrollToCatalog = () => {
    setCurrentTab('discover');
    const elem = document.getElementById('catalog-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    setCurrentTab('gaze_studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#f4f4f5] flex font-sans selection:bg-[#d4a373]/20 selection:text-[#faebd7]">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Custom Cursor & Glow with Magnetic Reaction */}
      <CustomCursor />

      {/* Visual Intent Gaze Reticle & Real-Time Dwell Indicator */}
      <GazeReticleOverlay />

      {/* Google Authentication Modal */}
      <GoogleSignInModal />

      {/* Left Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenProfile={handleOpenUserProfile}
        onOpenWishlist={scrollToCatalog}
      />

      {/* Main App Wrapper with Left Padding for Sidebar */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        
        {/* Top Professional Navigation Bar */}
        <TopNavigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenCart={() => setIsCartDrawerOpen(true)}
          onOpenProfile={handleOpenUserProfile}
          onOpenSupport={() => setIsGlobalSupportOpen(true)}
          onOpenWishlist={scrollToCatalog}
        />

        {/* Modals & Slide-out Panels */}
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onSelectSimilarProduct={(p) => setSelectedProductForModal(p as RecommendedProduct)}
          onViewResearch={() => {
            setSelectedProductForModal(null);
            setCurrentTab('research');
            setTimeout(() => {
              const el = document.getElementById('section-product-research');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
        <WhyRecommendedModal />
        <CartDrawer />
        <CheckoutModal />
        <VisualIntentModal />
        <CalibrationModal />

        {/* User Account Profile & Order History Modal */}
        <UserProfileModal
          isOpen={isUserProfileOpen}
          onClose={() => setIsUserProfileOpen(false)}
          initialTab={userProfileTab}
          onOpenTracking={(order) => handleOpenGlobalTracking(order)}
          onOpenReturn={(order) => handleOpenGlobalReturn(order)}
          onSelectProduct={(productId) => {
            setIsUserProfileOpen(false);
            const found = INITIAL_PRODUCTS.find(p => p.id === productId);
            if (found) setSelectedProductForModal(found as RecommendedProduct);
          }}
        />

        {/* Global Live Tracking Modal */}
        <OrderTrackingModal
          order={activeOrderForModal || getResolvedOrder()}
          isOpen={isGlobalTrackingOpen}
          onClose={() => setIsGlobalTrackingOpen(false)}
          onOpenReturn={(order) => {
            setIsGlobalTrackingOpen(false);
            handleOpenGlobalReturn(order);
          }}
          onOpenSupport={() => {
            setIsGlobalTrackingOpen(false);
            setIsGlobalSupportOpen(true);
          }}
        />

        {/* Global Returns Modal */}
        <OrderReturnModal
          order={activeOrderForModal || getResolvedOrder()}
          isOpen={isGlobalReturnOpen}
          onClose={() => setIsGlobalReturnOpen(false)}
          onOpenSupport={() => {
            setIsGlobalReturnOpen(false);
            setIsGlobalSupportOpen(true);
          }}
        />

        {/* Global Customer Support Modal */}
        <CustomerSupportModal
          isOpen={isGlobalSupportOpen}
          onClose={() => setIsGlobalSupportOpen(false)}
          onOpenTracking={(order) => handleOpenGlobalTracking(order)}
          onOpenReturn={(order) => handleOpenGlobalReturn(order)}
          recentOrders={completedOrders.length > 0 ? completedOrders : [getResolvedOrder()]}
        />

        {/* Animated Fashion Assistant Chatbot */}
        <FashionAssistantChatbot
          activeModalProduct={selectedProductForModal}
          onSelectProduct={(p) => setSelectedProductForModal(p as RecommendedProduct)}
        />

        {/* Dynamic Adaptive Notification Toast */}
        {recentAdaptiveNotification && (
          <div className="fixed bottom-22 right-6 z-50 max-w-md bg-[#18181b]/95 border border-[#d4a373]/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping shrink-0" />
              <span className="text-[#f4f4f5] font-medium leading-snug">
                {recentAdaptiveNotification}
              </span>
            </div>
            <button
              onClick={dismissAdaptiveNotification}
              className="text-[#71717a] hover:text-[#f4f4f5] transition-colors p-1"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Routed Views */}
        <main className="flex-1">
          {currentTab === 'discover' && (
            <div>
              {/* Hero Section */}
              <HeroSection
                onExplore={scrollToCatalog}
                onHowItWorks={scrollToHowItWorks}
                onOpenTelemetry={() => setCurrentTab('telemetry')}
              />

              {/* Catalog Grid with Compact Filter Bar & 5 Columns */}
              <div id="catalog-section">
                <ProductGrid
                  onSelectProduct={(p) => setSelectedProductForModal(p)}
                  onExplainProduct={(p) => setExplanationModalProduct(p)}
                />
              </div>

              {/* Recommendations Section */}
              <RecommendationsSection
                onSelectProduct={(p) => setSelectedProductForModal(p)}
                onExplainProduct={(p) => setExplanationModalProduct(p)}
                onSeeAll={scrollToCatalog}
              />

              {/* Session Intent & Security Trust Section */}
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 border-t border-white/[0.06]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7">
                    <SessionIntentWidget />
                  </div>
                  <div className="lg:col-span-5">
                    <TrustStatusPanel />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'telemetry' && (
            <div className="space-y-12 pb-16">
              <LiveTelemetryHub onExploreRecommendations={scrollToCatalog} />
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <LiveAdaptationDemo />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7">
                    <SessionIntentWidget />
                  </div>
                  <div className="lg:col-span-5">
                    <TrustStatusPanel />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'shopping' && (
            <ShoppingMarketplaceView
              onSelectProduct={(p) => setSelectedProductForModal(p)}
              onExplainProduct={(p) => setExplanationModalProduct(p)}
            />
          )}

          {currentTab === 'browse' && (
            <BrowseView
              onSelectProduct={(p) => setSelectedProductForModal(p)}
              onExplainProduct={(p) => setExplanationModalProduct(p)}
            />
          )}

          {currentTab === 'recommendations' && (
            <div className="pt-6">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <SessionIntentWidget />
              </div>
              <ProductGrid
                onSelectProduct={(p) => setSelectedProductForModal(p)}
                onExplainProduct={(p) => setExplanationModalProduct(p)}
              />
            </div>
          )}

          {currentTab === 'gaze_studio' && <GazeTrackingStudioView />}

          {currentTab === 'evaluation_analytics' && <EvaluationAnalyticsView />}

          {currentTab === 'platform_analytics' && <PlatformAnalyticsView />}

          {currentTab === 'insights' && <AiInsightsView />}

          {currentTab === 'research' && <ResearchDashboardView />}
        </main>

        {/* Editorial Footer */}
        <Footer 
          onSelectTab={(tab) => setCurrentTab(tab)} 
          onOpenSupport={() => setIsGlobalSupportOpen(true)}
          onOpenTracking={() => handleOpenGlobalTracking()}
          onOpenReturn={() => handleOpenGlobalReturn()}
          onOpenProfile={handleOpenUserProfile}
          onOpenOrderHistory={() => handleOpenUserProfile('orders')}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SasherProvider>
        <MainLayout />
      </SasherProvider>
    </AuthProvider>
  );
}
