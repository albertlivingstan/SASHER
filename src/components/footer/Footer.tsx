import React from 'react';
import { Truck, RotateCcw, Headphones, ShieldCheck, FileText } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenSupport?: () => void;
  onOpenTracking?: () => void;
  onOpenReturn?: () => void;
  onOpenProfile?: (initialTab?: 'orders' | 'profile') => void;
  onOpenOrderHistory?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectTab,
  onOpenSupport,
  onOpenTracking,
  onOpenReturn,
  onOpenProfile,
  onOpenOrderHistory
}) => {
  return (
    <footer className="border-t border-[#27272a]/60 bg-[#090a0c] py-12 text-[#a1a1aa] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Tier: Brand & E-Commerce Service Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#27272a]/40">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-2">
            <span className="font-editorial text-2xl text-[#f4f4f5] tracking-tight block">
              SASHER
            </span>
            <span className="text-[10px] font-mono text-[#ff6b1a] uppercase tracking-wider block">
              ADAPTIVE FASHION ATELIER & RESEARCH LABS
            </span>
            <p className="text-[#71717a] text-xs leading-relaxed max-w-sm">
              Secure Adaptive Session-Aware Hybrid E-Commerce Recommendation System combining eye-gaze visual attention, sequential Transformer modeling, and explainable luxury styling.
            </p>
          </div>

          {/* Luxury E-Commerce Services */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <span className="text-[#f5f5f7] font-semibold text-xs tracking-wider uppercase block">
              Client Care & Order Services
            </span>
            <ul className="space-y-2 text-[#a1a1aa]">
              {onOpenProfile && (
                <li>
                  <button
                    onClick={() => onOpenProfile('orders')}
                    className="hover:text-[#ff6b1a] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#ff6b1a]" />
                    <span>Order History & PDF Tax Invoices</span>
                  </button>
                </li>
              )}
              {onOpenTracking && (
                <li>
                  <button
                    onClick={onOpenTracking}
                    className="hover:text-[#ff6b1a] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#ff6b1a]" />
                    <span>Track Shipment & Courier Dispatch</span>
                  </button>
                </li>
              )}
              {onOpenReturn && (
                <li>
                  <button
                    onClick={onOpenReturn}
                    className="hover:text-[#10b981] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>30-Day Complimentary Luxury Returns</span>
                  </button>
                </li>
              )}
              {onOpenSupport && (
                <li>
                  <button
                    onClick={onOpenSupport}
                    className="hover:text-[#2997ff] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Headphones className="w-3.5 h-3.5 text-[#2997ff]" />
                    <span>24/7 Concierge Hotline & Help Desk</span>
                  </button>
                </li>
              )}
              <li>
                <div className="text-[11px] text-[#71717a]">
                  Toll-Free: +1 (800) 727-4371 · concierge@sasher.luxury
                </div>
              </li>
            </ul>
          </div>

          {/* Platform Navigation */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <span className="text-[#f5f5f7] font-semibold text-xs tracking-wider uppercase block">
              Curated Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs uppercase tracking-wider">
              <button
                onClick={() => onSelectTab('discover')}
                className="text-left text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                Discover
              </button>
              <button
                onClick={() => onSelectTab('gaze_studio')}
                className="text-left text-[#ff6b1a] hover:text-[#f4f4f5] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] animate-pulse" />
                <span>Gaze AI Studio</span>
              </button>
              <button
                onClick={() => onSelectTab('platform_analytics')}
                className="text-left text-[#2997ff] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                Analytics
              </button>
              <button
                onClick={() => onSelectTab('recommendations')}
                className="text-left text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                Recommendations
              </button>
              <button
                onClick={() => onSelectTab('insights')}
                className="text-left text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                AI Insights
              </button>
              <button
                onClick={() => onSelectTab('research')}
                className="text-left text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                Research
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Tier: Copyright & Trust Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[#71717a] text-[11px] font-mono">
          <div>
            &copy; {new Date().getFullYear()} SASHER Adaptive Fashion Atelier & Research Consortium. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
              <span>PCI-DSS Level 1 &middot; 256-Bit SSL</span>
            </span>
            <span>·</span>
            <span>Zero Biometric Telemetry Stored</span>
            <span>·</span>
            <span>Carbon-Neutral Air Priority</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
