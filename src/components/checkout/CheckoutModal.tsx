import React, { useState, useRef, useEffect } from 'react';
import { useSasher } from '../../context/SasherContext';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Building2, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  RotateCw,
  ArrowRight,
  Check,
  Printer,
  Scissors,
  Copy,
  Download,
  FileText,
  Truck,
  RotateCcw,
  Headphones,
  FileDown
} from 'lucide-react';
import { PaymentMethodType, CompletedOrder } from '../../types';
import { downloadInvoicePdf, openPrintInvoicePdf } from '../../services/invoicePdfService';
import { OrderTrackingModal } from '../shipping/OrderTrackingModal';
import { OrderReturnModal } from '../returns/OrderReturnModal';
import { CustomerSupportModal } from '../support/CustomerSupportModal';

export const CheckoutModal: React.FC = () => {
  const { 
    cart, 
    isCheckoutModalOpen, 
    closeCheckout, 
    completeOrder,
    clearCart
  } = useSasher();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CARD');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('1534 3453 4534 3457');
  const [cardName, setCardName] = useState('CODEXR');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('842');
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeField, setActiveField] = useState<string>('number');

  // Strictly mask digits in card display e.g. '1534 **** **** 3457'
  const getMaskedCardNumber = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    if (cleaned.length < 8) return num;
    const first = cleaned.slice(0, 4);
    const last = cleaned.slice(-4);
    return `${first} **** **** ${last}`;
  };

  // 3D Tilt state for card
  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleCardMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-in-out'
    });
  };

  // UPI State
  const [upiId, setUpiId] = useState('codexr@okhdfcbank');
  const [upiVerified, setUpiVerified] = useState(true);

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // BNPL State
  const [selectedInstallmentPlan, setSelectedInstallmentPlan] = useState<'3_months' | '6_months'>('3_months');

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: 'CODEXR User',
    email: 'codexr@research.ai',
    street: '124 Horizon Boulevard, Suite 8',
    city: 'Bangalore',
    postalCode: '560001',
    country: 'India'
  });

  // Promo code
  const [promoCode, setPromoCode] = useState('RESEARCH15');
  const [promoApplied, setPromoApplied] = useState(true);

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<CompletedOrder | null>(null);
  const [showInvoiceSlide, setShowInvoiceSlide] = useState(false);

  // Post-purchase modals
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  if (!isCheckoutModalOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = promoApplied ? Math.round(subtotal * 0.15) : 0;
  const shippingCost = subtotal >= 25000 ? 0 : 450;
  const taxAmount = Math.round((subtotal - discountAmount) * 0.12);
  const finalTotal = subtotal - discountAmount + shippingCost + taxAmount;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const steps = [
      'Establishing 256-Bit SSL Gateway Session...',
      'Verifying Tokenized Payment Credentials...',
      'Synthesizing Cryptographic Research Journal Hash...',
      'Authorizing Ledger Transaction...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      await new Promise(r => setTimeout(r, 650));
    }

    const orderNum = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const journalHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newOrder: CompletedOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      timestamp: Date.now(),
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shipping: shippingCost,
      total: finalTotal,
      currency: cart[0]?.product.currency || '₹',
      paymentMethod,
      paymentReference: `PAY-${Date.now().toString(36).toUpperCase()}`,
      shippingAddress: { ...shippingAddress },
      journalHash
    };

    completeOrder(newOrder);
    setConfirmedOrder(newOrder);
    setIsProcessing(false);
    clearCart();

    // Trigger sliding invoice document animation after short delay
    setTimeout(() => {
      setShowInvoiceSlide(true);
    }, 100);
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setShowInvoiceSlide(false);
    closeCheckout();
  };

  const handleDownloadInvoice = () => {
    if (!confirmedOrder) return;
    downloadInvoicePdf(confirmedOrder);
  };

  const handlePrintInvoice = () => {
    if (!confirmedOrder) return;
    openPrintInvoicePdf(confirmedOrder);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="relative w-full max-w-5xl bg-[#121316] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Gradient Accent */}
          <div className="h-1.5 w-full" style={{ background: 'var(--brand-gradient)' }} />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-[#27272a] flex items-center justify-between bg-[#18191d]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b1a]/20 to-[#e2a876]/20 border border-[#ff6b1a]/40 text-[#ff6b1a] flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#ff6b1a]/15 text-[#ff6b1a] font-bold">
                    SASHER ATELIER CHECKOUT
                  </span>
                  <span className="text-xs text-[#10b981] font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span>Secure 256-Bit SSL</span>
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[#f5f5f7] mt-0.5">
                  {confirmedOrder ? 'Transaction Authorized & Official Tax Invoice Generated' : 'Secure Luxury Checkout & Gateway'}
                </h2>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-[#71717a] hover:text-[#f5f5f7] bg-[#121316] hover:bg-[#27272a] rounded-xl transition-colors cursor-pointer border border-[#27272a]"
              aria-label="Close checkout"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CONFIRMATION SCREEN WITH SLIDING INVOICE DOCUMENT ANIMATION */}
          {confirmedOrder ? (
            <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[580px] relative overflow-hidden bg-[#0c0d0f] space-y-6">
              
              <div className="text-center z-20 space-y-2">
                <div className="w-16 h-16 rounded-full bg-[#10b981]/15 text-[#10b981] border-2 border-[#10b981]/40 mx-auto flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="text-xs font-mono uppercase text-[#10b981] font-bold tracking-wider">
                  Payment Successful & Cryptographically Sealed
                </span>
                <h3 className="text-2xl font-semibold text-[#f5f5f7]">Thank You, {shippingAddress.fullName}!</h3>
                <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto">
                  Your luxury order of <strong className="text-[#ff6b1a]">₹{confirmedOrder.total.toLocaleString('en-IN')}</strong> was authorized. An official branded PDF invoice has been generated.
                </p>
              </div>

              {/* Sliding Invoice Document Animation Container */}
              <div className="relative w-full max-w-md h-76 flex items-center justify-center z-10 overflow-hidden">
                <div 
                  className={`absolute w-84 bg-[#fafaf8] text-[#1a1a1a] rounded-2xl shadow-2xl p-6 font-mono border border-gray-300 transition-all duration-700 ease-out ${
                    showInvoiceSlide ? 'translate-y-0 opacity-100 scale-100 rotate-0' : '-translate-y-36 opacity-0 scale-90 -rotate-2'
                  }`}
                >
                  <div className="absolute top-3 right-3 border-2 border-[#10b981] rounded px-2 py-0.5 text-[#10b981] font-bold text-[9px] rotate-6 bg-[#10b981]/10">
                    PAID IN FULL ✓
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dashed border-gray-300">
                    <FileText className="w-5 h-5 text-[#ff6b1a]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#141416] tracking-wider">SASHER ATELIER INVOICE</h4>
                      <span className="text-[9px] text-gray-500">{confirmedOrder.orderNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-gray-700">
                    <div className="flex justify-between">
                      <span>Billed To:</span>
                      <span className="font-semibold text-gray-900 truncate max-w-[140px]">{shippingAddress.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-semibold">{String(confirmedOrder.paymentMethod).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courier Service:</span>
                      <span className="text-[#ff6b1a] font-semibold">Express Air Priority</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200">
                      <span>Total Paid:</span>
                      <span className="text-[#ff6b1a]">₹{confirmedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-gray-300 flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 font-mono">NFC Authenticated</span>
                    <button
                      onClick={handleDownloadInvoice}
                      className="px-3 py-1.5 bg-[#ff6b1a] hover:bg-[#e05a10] text-[#09090b] rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all hover:scale-105"
                      title="Download Vector PDF Invoice"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Post-Purchase Live Services Grid: Shipping, Returns, Support */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl z-20">
                {/* 1. Track Live */}
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="p-3 bg-[#18191d] hover:bg-[#202227] border border-[#27272a] hover:border-[#ff6b1a] rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1 text-[#ff6b1a]">
                    <Truck className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">Live Tracking</span>
                  </div>
                  <span className="text-[10px] text-[#71717a] block leading-tight">
                    Real-time carrier milestones & flight tracking
                  </span>
                </button>

                {/* 2. 30-Day Returns */}
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(true)}
                  className="p-3 bg-[#18191d] hover:bg-[#202227] border border-[#27272a] hover:border-[#10b981] rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1 text-[#10b981]">
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">30-Day Returns</span>
                  </div>
                  <span className="text-[10px] text-[#71717a] block leading-tight">
                    Free home pickup & zero restocking fee
                  </span>
                </button>

                {/* 3. Customer Care */}
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="p-3 bg-[#18191d] hover:bg-[#202227] border border-[#27272a] hover:border-[#2997ff] rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1 text-[#2997ff]">
                    <Headphones className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">Client Care</span>
                  </div>
                  <span className="text-[10px] text-[#71717a] block leading-tight">
                    24/7 Concierge, tickets & hotlines
                  </span>
                </button>
              </div>

              {/* Bottom Actions */}
              <div className="z-20 flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadInvoice}
                  className="px-4 py-2.5 bg-[#ff6b1a] hover:bg-[#e05a10] text-[#09090b] rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Invoice</span>
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-2.5 bg-[#1e2026] hover:bg-[#2a2d35] border border-[#3f3f46] text-[#f5f5f7] rounded-xl text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer shadow"
                >
                  <Printer className="w-4 h-4 text-[#ff6b1a]" />
                  <span>Print Official Invoice</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-[#27272a] hover:bg-[#323236] text-[#f5f5f7] rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
          /* CHECKOUT FORM SCREEN WITH 3D CARD FLIP & FIELD SWITCH ANIMATION */
          <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
            
            {/* Left Column: Animated 3D Turning Card & Payment Methods */}
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#27272a] flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Payment Method Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-semibold">
                      Payment Method
                    </label>
                    <span className="text-[10px] font-mono text-[#10b981]">PCI-DSS Level 1 Compliant</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'CARD', label: 'Credit Card', icon: CreditCard },
                      { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                      { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
                      { id: 'BNPL', label: '0% EMI', icon: Clock }
                    ].map(method => {
                      const isSelected = paymentMethod === method.id;
                      const Icon = method.icon;
                      return (
                        <button
                          type="button"
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as PaymentMethodType)}
                          data-magnetic
                          className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#18181b] border-[#ff6b1a] text-[#f5f5f7] shadow-lg ring-1 ring-[#ff6b1a]/30 scale-[1.02]'
                              : 'bg-[#141416] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ff6b1a]' : 'text-[#71717a]'}`} />
                          <span className="text-[11px] font-medium">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* METHOD 1: 3D FLIP CREDIT CARD */}
                {paymentMethod === 'CARD' && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    
                    {/* Interactive 3D Turning Card Container */}
                    <div className="w-full flex flex-col items-center">
                      <div 
                        className="w-full max-w-[360px] cursor-pointer perspective-1000"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <div
                          ref={cardRef}
                          onMouseMove={handleCardMouseMove}
                          onMouseLeave={handleCardMouseLeave}
                          style={{
                            ...tiltStyle,
                            transformStyle: 'preserve-3d',
                            transform: `perspective(1000px) rotateY(${isFlipped ? 180 : 0}deg)`,
                            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                            background: 'linear-gradient(135deg, #18191d 0%, #0d0e12 50%, #15161a 100%)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
                          }}
                          className="relative w-full aspect-[1.8/1] rounded-2xl text-white shadow-2xl border border-white/15 select-none"
                        >
                          {/* FRONT OF CARD */}
                          <div 
                            className="absolute inset-0 p-5 flex flex-col justify-between rounded-2xl overflow-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            {/* Card Glow FX */}
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#ff6b1a]/20 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center justify-between relative z-10">
                              <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 shadow-md flex items-center justify-center p-1 border border-amber-500/30">
                                <div className="w-full h-full border border-amber-700/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                                  <div className="bg-amber-800/30 rounded-2xs" />
                                  <div className="bg-amber-800/30 rounded-2xs" />
                                </div>
                              </div>
                              <span className="font-mono text-xs tracking-widest font-extrabold text-[#f5f5f7]">
                                VISA PLATINUM
                              </span>
                            </div>

                            <div className="py-1 relative z-10">
                              <span className="font-mono text-base tracking-[0.22em] font-medium text-white/95 drop-shadow">
                                {getMaskedCardNumber(cardNumber) || '1534 **** **** 3457'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono text-white/80 uppercase relative z-10">
                              <div>
                                <span className="text-[8px] block text-white/40 tracking-wider">CARDHOLDER</span>
                                <span className="font-semibold text-white">{cardName || 'CODEXR'}</span>
                              </div>
                              <div>
                                <span className="text-[8px] block text-white/40 tracking-wider">EXPIRES</span>
                                <span className="font-semibold text-white">{cardExpiry || '12/28'}</span>
                              </div>
                            </div>
                          </div>

                          {/* BACK OF CARD */}
                          <div 
                            className="absolute inset-0 p-5 flex flex-col justify-between rounded-2xl overflow-hidden bg-gradient-to-br from-[#121316] to-[#0a0a0c]"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <div className="w-full h-10 bg-black -mx-5 mt-2" />
                            <div className="px-3 py-1.5 bg-white/90 rounded text-black font-mono text-right text-xs font-bold tracking-widest">
                              CVV {cardCvv ? cardCvv.replace(/./g, '•') : '•••'}
                            </div>
                            <p className="text-[9px] text-white/50 font-mono leading-tight">
                              Authorized signature. Use in accordance with issuer terms. Protected by 256-bit biometrics.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#a1a1aa]">
                        <RotateCw className="w-3 h-3 text-[#ff6b1a]" />
                        <span>Flipped automatically on field focus or click</span>
                      </div>
                    </div>

                    {/* Card Form Inputs with automatic field-switch flip animation */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-mono text-[#a1a1aa] block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onFocus={() => {
                            setActiveField('name');
                            setIsFlipped(false);
                          }}
                          onChange={e => setCardName(e.target.value)}
                          placeholder="CARDHOLDER NAME"
                          className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#ff6b1a] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f5f7] font-mono outline-none uppercase"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-[#a1a1aa] block mb-1">Card Number (Strictly Masked Display)</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onFocus={() => {
                            setActiveField('number');
                            setIsFlipped(false);
                          }}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="1534 3453 4534 3457"
                          className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#ff6b1a] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f5f7] font-mono outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono text-[#a1a1aa] block mb-1">Valid Thru (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onFocus={() => {
                              setActiveField('expiry');
                              setIsFlipped(false);
                            }}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#ff6b1a] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f5f7] font-mono outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-mono text-[#a1a1aa] block mb-1">Security Code (CVV)</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onFocus={() => {
                              setActiveField('cvv');
                              setIsFlipped(true); // Automatically flip to back when focusing CVV!
                            }}
                            onChange={e => setCardCvv(e.target.value)}
                            placeholder="842"
                            maxLength={4}
                            className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#ff6b1a] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f5f7] font-mono outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* METHOD 2: UPI / QR SCAN */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 bg-[#18181b] rounded-xl border border-[#27272a] flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-28 h-28 p-2 rounded-xl bg-white flex items-center justify-center shrink-0">
                        <div className="w-full h-full border-2 border-black grid grid-cols-5 gap-0.5 p-1">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`rounded-xs ${
                                (i % 2 === 0 || i % 3 === 0) ? 'bg-black' : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-center sm:text-left">
                        <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-[#10b981]/15 text-[#10b981] font-bold">
                          Scan & Pay via UPI App
                        </span>
                        <p className="text-xs text-[#a1a1aa]">
                          Supports Google Pay, PhonePe, Paytm, BHIM. Zero-fee secure transfer.
                        </p>
                        <span className="text-[11px] font-mono text-[#71717a] block">
                          Dynamic QR expires in 04:48 min
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#a1a1aa] block mb-1">Virtual Payment Address (VPA)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="codexr@okhdfcbank"
                          className="flex-1 bg-[#18181b] border border-[#27272a] focus:border-[#ff6b1a] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f5f7] font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setUpiVerified(true)}
                          className="px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#10b981] rounded-xl text-xs font-mono font-semibold"
                        >
                          {upiVerified ? 'Verified ✓' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* METHOD 3: NET BANKING */}
                {paymentMethod === 'NET_BANKING' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <label className="text-[11px] font-mono text-[#a1a1aa] block">Select Preferred Bank</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank'].map(bank => (
                        <button
                          type="button"
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                            selectedBank === bank
                              ? 'bg-[#18181b] border-[#ff6b1a] text-[#f5f5f7] shadow'
                              : 'bg-[#141416] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* METHOD 4: BNPL */}
                {paymentMethod === 'BNPL' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <label className="text-[11px] font-mono text-[#a1a1aa] block">0% Interest EMI Schedule</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedInstallmentPlan('3_months')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedInstallmentPlan === '3_months'
                            ? 'bg-[#18181b] border-[#ff6b1a] text-[#f5f5f7] ring-1 ring-[#ff6b1a]/30'
                            : 'bg-[#141416] border-[#27272a] text-[#a1a1aa]'
                        }`}
                      >
                        <span className="text-xs font-bold block text-[#f5f5f7]">3 Monthly Installments</span>
                        <span className="text-sm font-mono font-semibold text-[#10b981] mt-1 block">
                          ₹{Math.round(finalTotal / 3).toLocaleString('en-IN')} / mo
                        </span>
                        <span className="text-[10px] text-[#71717a] mt-1 block">0% Interest · Instant approval</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedInstallmentPlan('6_months')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedInstallmentPlan === '6_months'
                            ? 'bg-[#18181b] border-[#ff6b1a] text-[#f5f5f7] ring-1 ring-[#ff6b1a]/30'
                            : 'bg-[#141416] border-[#27272a] text-[#a1a1aa]'
                        }`}
                      >
                        <span className="text-xs font-bold block text-[#f5f5f7]">6 Monthly Installments</span>
                        <span className="text-sm font-mono font-semibold text-[#10b981] mt-1 block">
                          ₹{Math.round(finalTotal / 6).toLocaleString('en-IN')} / mo
                        </span>
                        <span className="text-[10px] text-[#71717a] mt-1 block">0% Interest · Instant approval</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                <div className="pt-4 border-t border-[#27272a] space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block font-semibold">
                    Delivery Destination
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-[#71717a] block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={e => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-[#f5f5f7] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-[#71717a] block mb-1">Email</label>
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={e => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-[#f5f5f7] outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Order Summary & Authorize Button */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-[#0f1012] flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block font-semibold">
                  Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </span>

                {/* Items preview */}
                <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
                  {cart.map(item => (
                    <div key={`${item.product.id}-${item.size}`} className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-10 h-12 object-cover rounded-lg bg-[#18181b]"
                        />
                        <div>
                          <h4 className="text-[#f5f5f7] font-medium line-clamp-1 max-w-[180px]">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-[#71717a]">
                            Qty: {item.quantity} · Size: {item.size}
                          </span>
                        </div>
                      </div>
                      <span className="text-[#f5f5f7] font-semibold">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Box */}
                <div className="pt-3 border-t border-[#27272a]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Promo Code"
                      className="flex-1 bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-[#f5f5f7] font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setPromoApplied(true)}
                      className="px-4 py-2 bg-[#27272a] text-[#ff6b1a] rounded-xl text-xs font-mono font-semibold"
                    >
                      {promoApplied ? 'Applied ✓' : 'Apply'}
                    </button>
                  </div>
                  {promoApplied && (
                    <span className="text-[10px] font-mono text-[#10b981] mt-1.5 block">
                      RESEARCH15 Applied: 15% Academic Project Discount
                    </span>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs font-mono pt-3 border-t border-[#27272a]">
                  <div className="flex justify-between text-[#a1a1aa]">
                    <span>Cart Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-[#10b981]">
                      <span>Project Discount (15%)</span>
                      <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#a1a1aa]">
                    <span>Express Courier</span>
                    <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between text-[#a1a1aa]">
                    <span>Estimated GST (12%)</span>
                    <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base text-[#f5f5f7] font-bold pt-3 border-t border-[#27272a]">
                    <span>Payment amount</span>
                    <span className="text-[#ff6b1a]">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Authorize & Pay Button with Animated Processing State */}
              <div className="pt-4 border-t border-[#27272a] space-y-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  data-magnetic
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#ff6b1a] via-[#e2a876] to-[#ff6b1a] hover:opacity-95 text-[#09090b] rounded-2xl text-xs font-bold tracking-widest uppercase transition-all shadow-2xl cursor-pointer flex items-center justify-center gap-2 group"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
                      <span>{processingStep}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#09090b]" />
                      <span>PAY ₹{finalTotal.toLocaleString('en-IN')} NOW</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#71717a] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>256-Bit SSL Encrypted &middot; PCI-DSS Compliant</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>

    {/* Post-Purchase Tracking Modal */}
    <OrderTrackingModal
      order={confirmedOrder}
      isOpen={isTrackingModalOpen}
      onClose={() => setIsTrackingModalOpen(false)}
      onOpenReturn={(order) => setIsReturnModalOpen(true)}
      onOpenSupport={() => setIsSupportModalOpen(true)}
    />

    {/* Post-Purchase Returns Modal */}
    <OrderReturnModal
      order={confirmedOrder}
      isOpen={isReturnModalOpen}
      onClose={() => setIsReturnModalOpen(false)}
      onOpenSupport={() => setIsSupportModalOpen(true)}
    />

    {/* Post-Purchase Customer Support Modal */}
    <CustomerSupportModal
      isOpen={isSupportModalOpen}
      onClose={() => setIsSupportModalOpen(false)}
      onOpenTracking={(order) => setIsTrackingModalOpen(true)}
      onOpenReturn={(order) => setIsReturnModalOpen(true)}
      recentOrders={confirmedOrder ? [confirmedOrder] : []}
    />
  </>
  );
};
