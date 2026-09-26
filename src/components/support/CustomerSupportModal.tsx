import React, { useState } from 'react';
import { 
  X, 
  Headphones, 
  MessageSquare, 
  Truck, 
  RotateCcw, 
  FileText, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Send, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Download
} from 'lucide-react';
import { CompletedOrder } from '../../types';
import { downloadInvoicePdf } from '../../services/invoicePdfService';
import { OrderHistory } from '../account/OrderHistory';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTracking?: (order: CompletedOrder) => void;
  onOpenReturn?: (order: CompletedOrder) => void;
  recentOrders?: CompletedOrder[];
}

type SupportTab = 'faq' | 'ticket' | 'contact' | 'orders';

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenTracking,
  onOpenReturn,
  recentOrders = []
}) => {
  const [activeTab, setActiveTab] = useState<SupportTab>('faq');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('Order & Delivery Status');
  const [ticketOrderNumber, setTicketOrderNumber] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How fast is SASHER Express shipping, and are import duties included?',
      a: 'All orders are shipped via climate-controlled SASHER Express Air Priority with international DHL Luxury Logistics. Delivery arrives within 2-4 business days worldwide. All applicable GST and import customs tariffs are pre-calculated and covered in full by SASHER at checkout.'
    },
    {
      q: 'What is your 30-Day Complimentary Luxury Returns Policy?',
      a: 'We offer an unconditional 30-day return and exchange policy on all unworn items with security tags attached. We provide free white-glove doorstep courier pickup or drop-off at luxury partner hubs. Full refunds are processed to your original payment method within 3 business days.'
    },
    {
      q: 'How does SASHER verify the authenticity of each garment?',
      a: 'Each piece crafted in our atelier includes an embedded encrypted NFC authenticity tag that links directly to the cryptographic ledger proof recorded at checkout. This guarantees provenance, fabric origin, and limited edition numbering.'
    },
    {
      q: 'How does the eye-tracking recommendation engine protect my visual privacy?',
      a: 'All optical eye-gaze and saccade tracking calculations are processed 100% locally on your device hardware using client-side algorithms. Video frames are analyzed in transient memory and immediately cleared—no camera recordings or biometric imagery are ever sent to our servers.'
    },
    {
      q: 'Which payment methods are accepted and how secure is checkout?',
      a: 'We support all major Credit Cards (Visa, Mastercard, Amex), UPI / QR, Net Banking across major banks, and 0% interest Buy-Now-Pay-Later (BNPL) 3-month and 6-month installment plans. All transactions are protected by 256-bit SSL encryption and PCI-DSS Level 1 certification.'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `SASHER-SUP-${Math.floor(10000 + Math.random() * 90000)}`;
    setCreatedTicketId(id);
    setTicketSubmitted(true);
  };

  const filteredOrders = recentOrders.filter(o => 
    !orderSearchQuery || 
    o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    o.shippingAddress?.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans">
      <div 
        className="relative w-full max-w-3xl bg-[#121316] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Brand Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b1a] via-[#e2a876] to-[#10b981]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-[#18191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6b1a]/15 text-[#ff6b1a] border border-[#ff6b1a]/30 flex items-center justify-center shadow-lg">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#ff6b1a] font-bold">
                  SASHER LUXURY CONCIERGE & CLIENT CARE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] font-mono">
                  24/7 Dedicated SLA
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#f5f5f7] mt-0.5">
                How may we assist your fashion journey today?
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717a] hover:text-[#f5f5f7] bg-[#121316] hover:bg-[#27272a] rounded-xl transition-colors cursor-pointer border border-[#27272a]"
            aria-label="Close support dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#27272a] bg-[#141416] overflow-x-auto text-xs font-mono">
          {[
            { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
            { id: 'orders', label: 'My Orders & Tracking', icon: Truck },
            { id: 'ticket', label: 'Submit Support Ticket', icon: MessageSquare },
            { id: 'contact', label: 'Direct Concierge Hotlines', icon: Phone }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SupportTab)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#ff6b1a] text-[#f5f5f7] bg-[#18191d]'
                    : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff6b1a]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Views */}
        <div className="p-6 sm:p-7 max-h-[68vh] overflow-y-auto space-y-6">
          {/* TAB 1: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] flex items-center justify-between text-xs font-mono">
                <span className="text-[#a1a1aa]">Need immediate personal help?</span>
                <button
                  onClick={() => setActiveTab('ticket')}
                  className="text-[#ff6b1a] hover:underline font-semibold cursor-pointer"
                >
                  Create a Support Request &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx}
                      className="rounded-2xl border border-[#27272a] bg-[#141416] overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#18191d]"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-[#f5f5f7]">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#ff6b1a] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#71717a] shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4.5 pb-4.5 pt-1 text-xs text-[#a1a1aa] leading-relaxed border-t border-[#27272a]/40 bg-[#121316]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS & LIVE TRACKING */}
          {activeTab === 'orders' && (
            <OrderHistory
              orders={recentOrders}
              onOpenTracking={(order) => {
                onClose();
                if (onOpenTracking) onOpenTracking(order);
              }}
              onOpenReturn={(order) => {
                onClose();
                if (onOpenReturn) onOpenReturn(order);
              }}
            />
          )}

          {/* TAB 3: SUBMIT SUPPORT TICKET */}
          {activeTab === 'ticket' && (
            <div>
              {ticketSubmitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#10b981] font-bold">
                      TICKET CREATED & ASSIGNED
                    </span>
                    <h4 className="text-lg font-bold text-[#f5f5f7]">
                      Ticket #{createdTicketId}
                    </h4>
                    <p className="text-xs text-[#a1a1aa] max-w-md mx-auto">
                      Our Senior Atelier Stylist & Logistics Specialist has received your inquiry. We typically reply in under 15 minutes.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setTicketSubmitted(false);
                      setTicketMessage('');
                    }}
                    className="px-4 py-2 bg-[#27272a] hover:bg-[#323236] text-[#f5f5f7] rounded-xl text-xs font-mono transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#a1a1aa] block mb-1 font-semibold">Inquiry Topic</label>
                      <select
                        value={ticketSubject}
                        onChange={e => setTicketSubject(e.target.value)}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2.5 text-[#f5f5f7] outline-none cursor-pointer focus:border-[#ff6b1a]"
                      >
                        <option value="Order & Delivery Status">Order & Delivery Status</option>
                        <option value="Return or Exchange Assistance">Return or Exchange Assistance</option>
                        <option value="Size, Silhouette & Styling Advice">Size, Silhouette & Styling Advice</option>
                        <option value="Billing & Invoice Verification">Billing & Invoice Verification</option>
                        <option value="Eye-Tracking / Technical Feature">Eye-Tracking / Technical Feature</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#a1a1aa] block mb-1 font-semibold">Order Number (Optional)</label>
                      <input
                        type="text"
                        value={ticketOrderNumber}
                        onChange={e => setTicketOrderNumber(e.target.value)}
                        placeholder="e.g. ORD-M7A8K9..."
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2.5 text-[#f5f5f7] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#a1a1aa] block mb-1 font-semibold">Your Email Address</label>
                    <input
                      type="email"
                      value={ticketEmail}
                      onChange={e => setTicketEmail(e.target.value)}
                      placeholder="client@luxury.com"
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2.5 text-[#f5f5f7] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[#a1a1aa] block mb-1 font-semibold">Message & Request Details</label>
                    <textarea
                      rows={4}
                      value={ticketMessage}
                      onChange={e => setTicketMessage(e.target.value)}
                      placeholder="Describe your inquiry in detail. Include garment preferences, sizing, or urgent dispatch requests..."
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-3 text-[#f5f5f7] outline-none focus:border-[#ff6b1a]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#ff6b1a] to-[#e2a876] hover:opacity-95 text-[#09090b] rounded-xl font-bold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Priority Support Ticket</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: DIRECT CONCIERGE HOTLINES */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {/* Telephone */}
                <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-2">
                  <div className="flex items-center gap-2 text-[#ff6b1a]">
                    <Phone className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-wider">Telephone Concierge</span>
                  </div>
                  <div className="text-base font-bold text-[#f5f5f7]">
                    +1 (800) 727-4371
                  </div>
                  <p className="text-[11px] text-[#71717a]">
                    24/7 Toll-Free Global Luxury Helpline. Immediate response with zero IVR queues.
                  </p>
                </div>

                {/* Email */}
                <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-2">
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <Mail className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-wider">Email Concierge</span>
                  </div>
                  <div className="text-base font-bold text-[#f5f5f7] truncate">
                    concierge@sasher.luxury
                  </div>
                  <p className="text-[11px] text-[#71717a]">
                    Guaranteed response within 15 minutes by Senior Atelier Specialists.
                  </p>
                </div>
              </div>

              {/* Physical Headquarters */}
              <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#2997ff]">
                  <MapPin className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider">Global Atelier Headquarters</span>
                </div>
                <div className="text-[#f5f5f7] font-semibold">
                  SASHER Adaptive Fashion Atelier & Research Labs
                </div>
                <p className="text-[11px] text-[#71717a] leading-relaxed">
                  124 Horizon Boulevard, Suite 8, Tech Architecture District, Bangalore, 560001, India.
                  Private appointments available for bespoke tailoring and eye-tracking styling calibrations.
                </p>
              </div>

              {/* Trust & Guarantee */}
              <div className="p-4 bg-[#10b981]/10 rounded-2xl border border-[#10b981]/30 flex items-center gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0" />
                <span className="text-[#a1a1aa]">
                  Every interaction is backed by the SASHER 100% Client Satisfaction Guarantee and encrypted communication protocols.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#27272a] flex items-center justify-between bg-[#141416] text-xs font-mono">
          <span className="text-[#71717a] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#ff6b1a]" />
            <span>Average Concierge Response: 8 Minutes</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#f4f4f5] hover:bg-white text-[#09090b] rounded-xl font-bold font-mono tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
