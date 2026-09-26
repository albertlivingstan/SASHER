import { CompletedOrder } from '../types';

export interface TrackingMilestone {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface ShippingTrackingInfo {
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  estimatedDeliveryDate: string;
  currentStatus: 'order_placed' | 'quality_check' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentStatusLabel: string;
  currentLocation: string;
  destinationAddress: string;
  recipientName: string;
  signatureRequired: boolean;
  milestones: TrackingMilestone[];
}

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
    condition: string;
  }[];
  returnMethod: 'courier_pickup' | 'hub_dropoff';
  pickupAddress: string;
  refundMethod: string;
  refundAmount: number;
  status: 'label_generated' | 'pickup_scheduled' | 'in_transit' | 'inspected' | 'refunded';
  returnRmaNumber: string;
  createdAt: string;
}

export const orderService = {
  getTrackingDetails(order: CompletedOrder): ShippingTrackingInfo {
    const orderDate = new Date(order.timestamp || Date.now());
    const estDelivery = new Date(orderDate.getTime() + (3 * 24 * 60 * 60 * 1000));
    const addr = order.shippingAddress;
    const dest = addr ? `${addr.street}, ${addr.city}, ${addr.postalCode} ${addr.country}` : 'Delivery Address Confirmed';

    const cleanOrderNum = order.orderNumber.replace(/[^a-zA-Z0-9]/g, '');
    const trackingNum = `SE-${cleanOrderNum.slice(-6)}-IN`;

    const milestones: TrackingMilestone[] = [
      {
        id: 'm1',
        title: 'Order Placed & Payment Cryptographically Sealed',
        description: 'Payment authorized via 256-bit SSL gateway. Digital receipt & journal hash generated.',
        location: 'SASHER Atelier Cloud Gateway',
        timestamp: orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        status: 'completed'
      },
      {
        id: 'm2',
        title: 'Quality Inspection & Encrypted NFC Tagging',
        description: 'Luxury garment hand-inspected for silhouette balance and tagged with authenticity NFC.',
        location: 'SASHER Master Atelier Hub, Bangalore',
        timestamp: new Date(orderDate.getTime() + 4 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        status: 'completed'
      },
      {
        id: 'm3',
        title: 'Dispatched via Air Priority Freight',
        description: 'Package handed over to SASHER Express Courier fleet for rapid climate-controlled transport.',
        location: 'Kempegowda Int. Cargo Logistics Terminal',
        timestamp: new Date(orderDate.getTime() + 14 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        status: 'in_progress'
      },
      {
        id: 'm4',
        title: 'Arrived at Regional Distribution Hub',
        description: 'Sorted for final-mile courier assignment and delivery scheduling.',
        location: `${addr?.city || 'Regional'} Express Sorting Center`,
        timestamp: 'Estimated Tomorrow, 08:30 AM',
        status: 'pending'
      },
      {
        id: 'm5',
        title: 'Out for Delivery with White-Glove Courier',
        description: 'Courier agent scheduled for direct delivery. Signature and verification code required.',
        location: `${addr?.city || 'Local'} Delivery Zone`,
        timestamp: `Estimated ${estDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, by 02:00 PM`,
        status: 'pending'
      }
    ];

    return {
      orderNumber: order.orderNumber,
      carrier: 'SASHER Express Air Priority (Global Luxury Fleet)',
      trackingNumber: trackingNum,
      estimatedDeliveryDate: estDelivery.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      currentStatus: 'in_transit',
      currentStatusLabel: 'In Transit — Air Freight Dispatched',
      currentLocation: 'Kempegowda Int. Cargo Hub (Air Transport en route)',
      destinationAddress: dest,
      recipientName: addr?.fullName || 'Valued Client',
      signatureRequired: true,
      milestones
    };
  },

  createReturnRequest(
    orderNumber: string,
    items: { productId: string; productName: string; quantity: number; reason: string; condition: string }[],
    returnMethod: 'courier_pickup' | 'hub_dropoff',
    pickupAddress: string,
    refundAmount: number
  ): ReturnRequest {
    const rma = `RMA-${Math.floor(100000 + Math.random() * 900000)}`;
    const ret: ReturnRequest = {
      id: `ret-${Date.now()}`,
      orderNumber,
      items,
      returnMethod,
      pickupAddress,
      refundMethod: 'Original Payment Method (Direct Credit)',
      refundAmount,
      status: 'label_generated',
      returnRmaNumber: rma,
      createdAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('sasher_returns_v1');
      const list: ReturnRequest[] = stored ? JSON.parse(stored) : [];
      list.unshift(ret);
      localStorage.setItem('sasher_returns_v1', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to store return request', e);
    }

    return ret;
  },

  getReturnRequests(): ReturnRequest[] {
    try {
      const stored = localStorage.getItem('sasher_returns_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
};
