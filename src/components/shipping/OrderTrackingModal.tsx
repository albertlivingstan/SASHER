import React, { useState } from 'react';
import { CompletedOrder } from '../../types';
import { orderService, ShippingTrackingInfo } from '../../services/orderService';
import { downloadInvoicePdf } from '../../services/invoicePdfService';
import { 
  X, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Package, 
  ShieldCheck, 
  RotateCcw, 
  Headphones, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: CompletedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReturn?: (order: CompletedOrder) => void;
  onOpenSupport?: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenReturn,
  onOpenSupport
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const tracking: ShippingTrackingInfo = orderService.getTrackingDetails(order);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(tracking.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans">
      <div 
        className="relative w-full max-w-2xl bg-[#121316] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gradient Hairline */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b1a] via-[#e2a876] to-[#2997ff]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-[#18191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6b1a]/15 text-[#ff6b1a] border border-[#ff6b1a]/30 flex items-center justify-center shadow-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#ff6b1a] font-bold">
                  LIVE SHIPMENT DISPATCH
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>En Route</span>
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#f5f5f7] mt-0.5">
                Tracking: {tracking.trackingNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadInvoicePdf(order)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ff6b1a]/40 bg-[#ff6b1a]/10 hover:bg-[#ff6b1a]/20 text-xs font-mono text-[#ff6b1a] transition-all cursor-pointer font-medium"
              title="Download Official Tax Invoice PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Invoice PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#71717a] hover:text-[#f5f5f7] bg-[#121316] hover:bg-[#27272a] rounded-xl transition-colors cursor-pointer border border-[#27272a]"
              aria-label="Close tracking modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Estimated Delivery Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18191d] to-[#121316] border border-[#ff6b1a]/30 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#a1a1aa] block uppercase tracking-wider">
                ESTIMATED WHITE-GLOVE ARRIVAL
              </span>
              <div className="text-xl font-bold text-[#f5f5f7] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ff6b1a]" />
                <span>{tracking.estimatedDeliveryDate}</span>
              </div>
              <span className="text-xs text-[#10b981] font-mono block">
                On Schedule · Carbon-Neutral Express Courier
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTracking}
                className="px-3.5 py-2 bg-[#27272a] hover:bg-[#323236] text-[#f5f5f7] rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer border border-[#3f3f46]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5 text-[#a1a1aa]" />}
                <span>{copied ? 'Copied' : 'Copy Tracking'}</span>
              </button>
              <button
                onClick={() => downloadInvoicePdf(order)}
                className="px-3.5 py-2 bg-[#ff6b1a]/15 hover:bg-[#ff6b1a]/25 text-[#ff6b1a] rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-[#ff6b1a]/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Waybill PDF</span>
              </button>
            </div>
          </div>

          {/* Carrier & Location Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-[#18191d] rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-[#71717a] block">CARRIER FLEET</span>
              <span className="text-[#f5f5f7] font-semibold mt-0.5 block truncate">
                {tracking.carrier.split(' ')[0]} {tracking.carrier.split(' ')[1]}
              </span>
            </div>
            <div className="p-3.5 bg-[#18191d] rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-[#71717a] block">CURRENT POSITION</span>
              <span className="text-[#10b981] font-semibold mt-0.5 block truncate">
                Cargo Flight SA-402
              </span>
            </div>
            <div className="p-3.5 bg-[#18191d] rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-[#71717a] block">DELIVERY VERIFICATION</span>
              <span className="text-[#ff6b1a] font-semibold mt-0.5 block">
                Signature Required
              </span>
            </div>
          </div>

          {/* Interactive Delivery Milestones Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-[#ff6b1a]" />
              <span>Shipment Journey Milestones</span>
            </h4>

            <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#27272a]">
              {tracking.milestones.map((m, idx) => {
                const isDone = m.status === 'completed';
                const isCurrent = m.status === 'in_progress';
                return (
                  <div key={m.id} className="relative group">
                    {/* Dot Indicator */}
                    <div 
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone 
                          ? 'bg-[#10b981] border-[#10b981] text-[#09090b]'
                          : isCurrent
                          ? 'bg-[#ff6b1a] border-[#ff6b1a] text-[#09090b] ring-4 ring-[#ff6b1a]/20 animate-pulse'
                          : 'bg-[#18191d] border-[#3f3f46] text-[#71717a]'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${isCurrent ? 'text-[#ff6b1a]' : isDone ? 'text-[#f5f5f7]' : 'text-[#71717a]'}`}>
                          {m.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#a1a1aa]">
                          {m.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                        {m.description}
                      </p>
                      <span className="text-[10px] font-mono text-[#71717a] flex items-center gap-1 pt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#ff6b1a]" />
                        <span>{m.location}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Destination Address */}
          <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-1 text-xs">
            <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">
              FINAL DESTINATION ADDRESS
            </span>
            <div className="text-[#f5f5f7] font-medium">
              {tracking.recipientName}
            </div>
            <div className="text-[#a1a1aa] text-[11px]">
              {tracking.destinationAddress}
            </div>
          </div>

          {/* Support and Returns Trigger Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#27272a]">
            <div className="flex items-center gap-2">
              {onOpenReturn && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReturn(order);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#3f3f46] hover:border-[#ff6b1a] text-xs font-mono text-[#f5f5f7] hover:text-[#ff6b1a] transition-colors flex items-center gap-1.5 cursor-pointer bg-[#18191d]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Initiate Return / Exchange</span>
                </button>
              )}
              {onOpenSupport && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSupport();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#3f3f46] hover:border-[#10b981] text-xs font-mono text-[#f5f5f7] hover:text-[#10b981] transition-colors flex items-center gap-1.5 cursor-pointer bg-[#18191d]"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Delivery Support</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-[#f4f4f5] hover:bg-white text-[#09090b] rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
