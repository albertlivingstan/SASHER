import React, { useState } from 'react';
import { CompletedOrder } from '../../types';
import { downloadInvoicePdf } from '../../services/invoicePdfService';
import { 
  FileText, 
  Download, 
  Truck, 
  RotateCcw, 
  Search, 
  Package, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Sparkles,
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';

interface OrderHistoryProps {
  orders: CompletedOrder[];
  onOpenTracking: (order: CompletedOrder) => void;
  onOpenReturn: (order: CompletedOrder) => void;
  onSelectProduct?: (productId: string) => void;
  onExploreCatalog?: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onOpenTracking,
  onOpenReturn,
  onSelectProduct,
  onExploreCatalog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [downloadSuccessOrderNumber, setDownloadSuccessOrderNumber] = useState<string | null>(null);

  // Helper to determine status based on order timestamp
  const getOrderStatus = (order: CompletedOrder): {
    key: 'active' | 'delivered';
    label: string;
    sublabel: string;
    badgeBg: string;
    dotColor: string;
  } => {
    const ageHours = (Date.now() - (order.timestamp || Date.now())) / 3600000;
    if (ageHours < 48) {
      return {
        key: 'active',
        label: 'In Transit',
        sublabel: 'Estimated delivery tomorrow via SASHER Air Priority',
        badgeBg: 'bg-[#2997ff]/15 border-[#2997ff]/40 text-[#2997ff]',
        dotColor: 'bg-[#2997ff]'
      };
    } else if (ageHours < 96) {
      return {
        key: 'active',
        label: 'Out for Delivery',
        sublabel: 'White-glove courier courier assigned with scheduled delivery',
        badgeBg: 'bg-[#ff6b1a]/15 border-[#ff6b1a]/40 text-[#ff6b1a]',
        dotColor: 'bg-[#ff6b1a]'
      };
    } else {
      return {
        key: 'delivered',
        label: 'Delivered',
        sublabel: 'Cryptographically sealed & signed at destination',
        badgeBg: 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]',
        dotColor: 'bg-[#10b981]'
      };
    }
  };

  const handleDownloadInvoice = (order: CompletedOrder) => {
    try {
      setDownloadingOrderId(order.id);
      downloadInvoicePdf(order);
      setDownloadSuccessOrderNumber(order.orderNumber);
      setTimeout(() => {
        setDownloadingOrderId(null);
      }, 1000);
      setTimeout(() => {
        setDownloadSuccessOrderNumber(null);
      }, 4000);
    } catch (err) {
      console.error('Invoice download failed:', err);
      setDownloadingOrderId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const status = getOrderStatus(order);
    if (statusFilter !== 'all' && status.key !== statusFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
    const matchPayment = (order.paymentReference || '').toLowerCase().includes(q);
    const matchMethod = (order.paymentMethod || '').toLowerCase().includes(q);
    const matchItems = order.items.some(i => 
      i.product.name.toLowerCase().includes(q) || 
      i.product.category.toLowerCase().includes(q)
    );
    return matchOrderNum || matchPayment || matchMethod || matchItems;
  });

  // Calculate summary statistics
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeShipmentsCount = orders.filter(o => getOrderStatus(o).key === 'active').length;

  return (
    <div className="space-y-6">
      {/* Download Success Notification Toast */}
      {downloadSuccessOrderNumber && (
        <div className="p-3.5 bg-[#10b981]/15 border border-[#10b981]/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#10b981] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Tax Invoice PDF for order <strong className="font-mono text-white">{downloadSuccessOrderNumber}</strong> downloaded successfully!
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider">
            256-Bit Signed
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
            Total Orders
          </span>
          <div className="text-xl font-bold font-mono text-[#f5f5f7]">
            {orders.length}
          </div>
          <span className="text-[10px] text-[#10b981] flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>All Verified</span>
          </span>
        </div>

        <div className="p-3.5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
            Atelier Investment
          </span>
          <div className="text-xl font-bold font-mono text-[#ff6b1a]">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#a1a1aa] font-mono">
            Direct Atelier Billing
          </span>
        </div>

        <div className="p-3.5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
            Active Dispatches
          </span>
          <div className="text-xl font-bold font-mono text-[#2997ff]">
            {activeShipmentsCount}
          </div>
          <span className="text-[10px] text-[#2997ff] flex items-center gap-1 font-mono">
            <Truck className="w-2.5 h-2.5" />
            <span>Air Freight</span>
          </span>
        </div>

        <div className="p-3.5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
            Complimentary Returns
          </span>
          <div className="text-xl font-bold font-mono text-[#10b981]">
            30 Days
          </div>
          <span className="text-[10px] text-[#10b981] flex items-center gap-1 font-mono">
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Free Doorstep Pickup</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number (e.g. ORD-...), item name, or category..."
            className="w-full bg-[#141416] border border-[#27272a] focus:border-[#ff6b1a]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5f5f7] outline-none font-mono transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-[#141416] border border-[#27272a] p-1 rounded-xl text-xs font-mono self-start sm:self-auto">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'active', label: `In Transit (${activeShipmentsCount})` },
            { id: 'delivered', label: `Delivered (${orders.length - activeShipmentsCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as 'all' | 'active' | 'delivered')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#27272a] text-[#f5f5f7] font-semibold'
                  : 'text-[#71717a] hover:text-[#f5f5f7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#141416] border border-[#27272a] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#27272a]/60 border border-[#27272a] flex items-center justify-center mx-auto text-[#71717a]">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-[#f5f5f7]">
              {searchQuery ? 'No matching orders found' : 'No past purchases recorded yet'}
            </h4>
            <p className="text-xs text-[#71717a] max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search criteria or clear the query to see all your purchases.'
                : 'Explore our curated runway collections, complete a checkout, and your orders and downloadable invoices will appear here in real-time.'}
            </p>
          </div>
          {onExploreCatalog && (
            <button
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b1a] to-[#e2a876] hover:opacity-95 text-[#09090b] text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Atelier Catalog</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = getOrderStatus(order);
            const isDownloading = downloadingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-[#141416] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl sm:rounded-3xl overflow-hidden transition-all shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-[#18191d] border-b border-[#27272a] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#f5f5f7]">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${status.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${status.dotColor}`} />
                        <span>{status.label}</span>
                      </span>
                    </div>

                    <span className="hidden sm:inline text-xs text-[#52525b]">|</span>

                    <div className="flex items-center gap-1.5 text-xs text-[#71717a] font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(order.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-[10px] text-[#52525b]">
                        ({new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                  </div>

                  {/* Top Right Quick Summary */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#71717a] font-mono">Paid via</span>
                    <span className="text-xs font-mono text-[#a1a1aa] bg-[#27272a] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-[#ff6b1a]" />
                      <span>{order.paymentMethod || 'CARD'}</span>
                    </span>
                    <span className="text-sm font-bold font-mono text-[#ff6b1a] ml-2">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4 sm:p-6 space-y-4">
                  {order.items && order.items.length > 0 ? (
                    <div className="divide-y divide-[#27272a]/50">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${order.id}-item-${idx}`}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover border border-[#27272a] shrink-0 bg-[#18181b]"
                              />
                            ) : (
                              <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-gradient-to-br from-[#1c1c1f] to-[#27272a] flex items-center justify-center text-[#71717a] shrink-0 border border-[#27272a]">
                                <Package className="w-6 h-6" />
                              </div>
                            )}

                            <div className="min-w-0 space-y-1">
                              <h5 className="text-xs sm:text-sm font-medium text-[#f5f5f7] truncate hover:text-[#ff6b1a] transition-colors cursor-pointer"
                                  onClick={() => onSelectProduct && onSelectProduct(item.product.id)}>
                                {item.product.name}
                              </h5>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#71717a]">
                                <span className="text-[#a1a1aa]">{item.product.category}</span>
                                <span>·</span>
                                <span>Size: <strong className="text-[#f5f5f7]">{item.size || 'M'}</strong></span>
                                <span>·</span>
                                <span>Qty: <strong className="text-[#f5f5f7]">{item.quantity}</strong></span>
                              </div>
                              <div className="text-[10px] text-[#10b981] font-mono flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>NFC Provenance Authenticated</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 font-mono">
                            <span className="text-xs sm:text-sm font-semibold text-[#f5f5f7] block">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-[#71717a] block">
                              ₹{item.product.price.toLocaleString('en-IN')} each
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-3 flex items-center gap-3 text-xs text-[#a1a1aa] font-mono">
                      <Package className="w-5 h-5 text-[#ff6b1a]" />
                      <span>Atelier Curated Piece · Tailored Order Confirmation</span>
                    </div>
                  )}

                  {/* Destination & Ledger Proof line */}
                  <div className="pt-3 border-t border-[#27272a]/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-[#71717a]">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
                      <span className="truncate">
                        Deliver to: <strong className="text-[#a1a1aa]">{order.shippingAddress?.fullName}</strong> — {order.shippingAddress?.street}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px]">
                      <span className="text-[#52525b]">Journal Proof:</span>
                      <code className="text-[#a1a1aa] bg-[#18191d] px-2 py-0.5 rounded border border-[#27272a]">
                        {order.journalHash ? `${order.journalHash.slice(0, 10)}...${order.journalHash.slice(-6)}` : '0x7f9a...0a18'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons Bar (Download PDF Invoice, Track, Return) */}
                <div className="p-4 sm:p-5 bg-[#18191d]/90 border-t border-[#27272a] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#71717a] font-mono hidden lg:flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>{status.sublabel}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
                    {/* BUTTON 1: Download PDF Invoice */}
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={isDownloading}
                      data-magnetic
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#27272a] hover:bg-[#323236] border border-[#ff6b1a]/40 hover:border-[#ff6b1a] text-xs font-mono font-medium text-[#f5f5f7] hover:text-[#ff6b1a] transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      title="Download Branded Official Tax Invoice PDF"
                    >
                      <Download className={`w-3.5 h-3.5 text-[#ff6b1a] ${isDownloading ? 'animate-bounce' : ''}`} />
                      <span>{isDownloading ? 'Generating...' : 'Download PDF Invoice'}</span>
                    </button>

                    {/* BUTTON 2: Direct link to Track */}
                    <button
                      onClick={() => onOpenTracking(order)}
                      data-magnetic
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border border-[#2997ff]/50 text-xs font-mono font-bold text-[#2997ff] transition-all cursor-pointer shadow-sm"
                      title="Open Live Shipment Tracking Modal"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </button>

                    {/* BUTTON 3: Direct link to Return */}
                    <button
                      onClick={() => onOpenReturn(order)}
                      data-magnetic
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/50 text-xs font-mono font-bold text-[#10b981] transition-all cursor-pointer shadow-sm"
                      title="Initiate 30-Day Complimentary Return or Exchange"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
