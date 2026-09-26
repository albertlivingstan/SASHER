import React, { useState } from 'react';
import { CompletedOrder } from '../../types';
import { orderService, ReturnRequest } from '../../services/orderService';
import { 
  X, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Package, 
  Truck, 
  MapPin, 
  Download, 
  QrCode, 
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface OrderReturnModalProps {
  order: CompletedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: () => void;
}

export const OrderReturnModal: React.FC<OrderReturnModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenSupport
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState<string>('Fit / Silhouette adjustment needed');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [returnMethod, setReturnMethod] = useState<'courier_pickup' | 'hub_dropoff'>('courier_pickup');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [generatedRequest, setGeneratedRequest] = useState<ReturnRequest | null>(null);

  if (!isOpen || !order) return null;

  const items = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : [
        {
          product: {
            id: 'item-01',
            name: 'Atelier Tailored Architecture Coat',
            category: 'Outerwear',
            price: order.total,
            currency: '₹',
            imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80'
          },
          quantity: 1,
          size: 'M'
        }
      ];

  const handleToggleItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateRefundTotal = () => {
    if (selectedItems.length === 0) return order.total;
    const selected = items.filter(i => selectedItems.includes(i.product.id));
    return selected.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const returnItems = items
      .filter(i => selectedItems.length === 0 || selectedItems.includes(i.product.id))
      .map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        reason: returnReason,
        condition: 'Security Tag Intact'
      }));

    const addr = order.shippingAddress 
      ? `${order.shippingAddress.street}, ${order.shippingAddress.city}`
      : 'Registered Delivery Address';

    const req = orderService.createReturnRequest(
      order.orderNumber,
      returnItems,
      returnMethod,
      addr,
      calculateRefundTotal()
    );

    setGeneratedRequest(req);
    setIsSubmitted(true);
  };

  const handleDownloadReturnLabel = () => {
    if (!generatedRequest) return;
    const text = `=======================================================\n           SASHER LUXURY PRE-PAID RETURN LABEL\n=======================================================\nRMA NUMBER: ${generatedRequest.returnRmaNumber}\nORDER REF:  ${generatedRequest.orderNumber}\nDATE:       ${new Date().toLocaleDateString()}\nCARRIER:    SASHER Express Complimentary Return Fleet\n-------------------------------------------------------\nPICKUP ADDRESS:\n${generatedRequest.pickupAddress}\n\nRETURN TO:\nSASHER Luxury Atelier - Returns Verification Center\nCargo Terminal Hub 4, Kempegowda Logistics Zone, Bangalore 560300\n-------------------------------------------------------\nITEMS AUTHORIZED FOR RETURN:\n${generatedRequest.items.map(i => `- ${i.productName} (Qty: ${i.quantity}) - Reason: ${i.reason}`).join('\n')}\n-------------------------------------------------------\nREFUND METHOD: ${generatedRequest.refundMethod}\nESTIMATED REFUND: ₹${generatedRequest.refundAmount.toLocaleString('en-IN')}\n\n* INSTRUCTIONS: Affix this label to your luxury reusable packaging.\nOur white-glove courier will verify the NFC security tag upon pickup.\n=======================================================`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SASHER-RETURN-LABEL-${generatedRequest.returnRmaNumber}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans">
      <div 
        className="relative w-full max-w-2xl bg-[#121316] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Brand Hairline */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b1a] via-[#e2a876] to-[#ff3d7f]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-[#18191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6b1a]/15 text-[#ff6b1a] border border-[#ff6b1a]/30 flex items-center justify-center shadow-lg">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#ff6b1a] font-bold">
                  30-DAY COMPLIMENTARY RETURNS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] font-mono">
                  Zero Restocking Fees
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#f5f5f7] mt-0.5">
                {isSubmitted ? 'Return Authorization Confirmed' : `Return Request for ${order.orderNumber}`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717a] hover:text-[#f5f5f7] bg-[#121316] hover:bg-[#27272a] rounded-xl transition-colors cursor-pointer border border-[#27272a]"
            aria-label="Close returns modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {isSubmitted && generatedRequest ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/15 text-[#10b981] border-2 border-[#10b981]/40 mx-auto flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#10b981] font-bold">
                RETURN RMA AUTHORIZED & SCHEDULED
              </span>
              <h4 className="text-xl font-bold text-[#f5f5f7]">
                RMA #{generatedRequest.returnRmaNumber}
              </h4>
              <p className="text-xs text-[#a1a1aa] max-w-md mx-auto">
                Your pre-paid complimentary pickup has been registered. Our courier will arrive at your address with custom protective packaging.
              </p>
            </div>

            {/* RMA Card */}
            <div className="p-5 bg-[#18191d] rounded-2xl border border-[#27272a] text-left space-y-3 font-mono text-xs max-w-md mx-auto">
              <div className="flex justify-between pb-2 border-b border-[#27272a]">
                <span className="text-[#71717a]">Order Reference:</span>
                <span className="text-[#f5f5f7] font-semibold">{generatedRequest.orderNumber}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#27272a]">
                <span className="text-[#71717a]">Pickup Service:</span>
                <span className="text-[#ff6b1a] font-semibold">White-Glove Home Collection</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#27272a]">
                <span className="text-[#71717a]">Refund Method:</span>
                <span className="text-[#10b981] font-semibold">Direct Original Account Credit</span>
              </div>
              <div className="flex justify-between text-sm pt-1 font-bold">
                <span className="text-[#f5f5f7]">Authorized Refund:</span>
                <span className="text-[#ff6b1a]">₹{generatedRequest.refundAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadReturnLabel}
                className="w-full sm:w-auto px-5 py-3 bg-[#ff6b1a] hover:bg-[#e05a10] text-[#09090b] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Pre-Paid Return Label</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-[#27272a] hover:bg-[#323236] text-[#f5f5f7] rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReturn} className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Step 1: Select Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#ff6b1a]" />
                  <span>1. Select Garments for Return / Exchange</span>
                </label>
                <span className="text-[10px] text-[#71717a] font-mono">
                  {selectedItems.length === 0 ? 'All items selected' : `${selectedItems.length} item(s) selected`}
                </span>
              </div>

              <div className="space-y-2">
                {items.map(item => {
                  const isChecked = selectedItems.length === 0 || selectedItems.includes(item.product.id);
                  return (
                    <div 
                      key={item.product.id}
                      onClick={() => handleToggleItem(item.product.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked 
                          ? 'bg-[#18191d] border-[#ff6b1a]/60 shadow-md' 
                          : 'bg-[#121316] border-[#27272a] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 accent-[#ff6b1a] rounded cursor-pointer"
                        />
                        {item.product.imageUrl && (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            className="w-10 h-12 object-cover rounded-lg bg-[#27272a]"
                          />
                        )}
                        <div>
                          <h5 className="text-xs font-semibold text-[#f5f5f7]">
                            {item.product.name}
                          </h5>
                          <span className="text-[10px] font-mono text-[#a1a1aa]">
                            Size: {item.size || 'M'} · Qty: {item.quantity} · Category: {item.product.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#ff6b1a]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Return Reason */}
            <div className="space-y-3 pt-2 border-t border-[#27272a]">
              <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-semibold block">
                2. Reason for Return
              </label>

              <select
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-xs text-[#f5f5f7] outline-none cursor-pointer focus:border-[#ff6b1a]"
              >
                <option value="Fit / Silhouette adjustment needed">Fit / Silhouette adjustment needed</option>
                <option value="Exchange for different color / aesthetic variant">Exchange for different color / aesthetic variant</option>
                <option value="Material & drape preference difference">Material & drape preference difference</option>
                <option value="Ordered multiple sizes for curation">Ordered multiple sizes for curation</option>
                <option value="Changed mind / Wardrobe adjustment">Changed mind / Wardrobe adjustment</option>
              </select>

              <textarea
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="Optional notes for our atelier team (e.g. preferred exchange size or specific fit feedback)..."
                rows={2}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-3 text-xs text-[#f5f5f7] outline-none placeholder:text-[#71717a] focus:border-[#ff6b1a]"
              />
            </div>

            {/* Step 3: Return Method */}
            <div className="space-y-3 pt-2 border-t border-[#27272a]">
              <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-semibold block">
                3. Pickup & Handover Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnMethod('courier_pickup')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    returnMethod === 'courier_pickup'
                      ? 'bg-[#18191d] border-[#ff6b1a] text-[#f5f5f7] shadow-lg ring-1 ring-[#ff6b1a]/30'
                      : 'bg-[#141416] border-[#27272a] text-[#a1a1aa]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-[#ff6b1a]" />
                    <span className="text-xs font-bold text-[#f5f5f7]">White-Glove Home Pickup</span>
                  </div>
                  <p className="text-[11px] text-[#71717a]">
                    Courier brings protective garment eco-box directly to your doorstep. Free.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReturnMethod('hub_dropoff')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    returnMethod === 'hub_dropoff'
                      ? 'bg-[#18191d] border-[#ff6b1a] text-[#f5f5f7] shadow-lg ring-1 ring-[#ff6b1a]/30'
                      : 'bg-[#141416] border-[#27272a] text-[#a1a1aa]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-[#2997ff]" />
                    <span className="text-xs font-bold text-[#f5f5f7]">Luxury Partner Hub Drop</span>
                  </div>
                  <p className="text-[11px] text-[#71717a]">
                    Drop off at any DHL or SASHER Partner Atelier terminal at your convenience.
                  </p>
                </button>
              </div>
            </div>

            {/* Policy & Refund Summary */}
            <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#71717a] uppercase">ESTIMATED REFUND</span>
                <div className="text-base font-bold text-[#ff6b1a]">
                  ₹{calculateRefundTotal().toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#10b981]">
                  Zero processing deduction · 100% Guaranteed
                </span>
              </div>

              <div className="text-right text-[11px] text-[#a1a1aa] max-w-[200px]">
                Credited within 3 business days of courier pickup scan.
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#27272a]">
              {onOpenSupport && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSupport();
                  }}
                  className="text-xs font-mono text-[#a1a1aa] hover:text-[#ff6b1a] transition-colors cursor-pointer"
                >
                  Need stylist consultation first?
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#ff6b1a] to-[#e2a876] hover:opacity-95 text-[#09090b] rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-lg cursor-pointer flex items-center gap-2"
              >
                <span>Authorize Return & Generate Label</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
