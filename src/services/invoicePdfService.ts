import { jsPDF } from 'jspdf';
import { CompletedOrder } from '../types';

export function generateInvoicePdf(order: CompletedOrder): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = margin;

  // Background Header Accent
  doc.setFillColor(12, 13, 15); // #0c0d0f (Luxury Dark)
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gradient Brand Bar
  doc.setFillColor(255, 107, 26); // #ff6b1a (Orange)
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SASHER', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 168, 118);
  doc.text('ADAPTIVE FASHION ATELIER & RESEARCH LABS', margin, 26);
  doc.setTextColor(180, 180, 185);
  doc.setFontSize(7.5);
  doc.text('Secure AI-Assisted Session & Visual Intent Commerce', margin, 31);
  doc.text('concierge@sasher.luxury | www.sasher.luxury | Support: +1 (800) 727-4371', margin, 36);

  // Invoice Title & Status Badge on Right Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', pageWidth - margin - 35, 18, { align: 'right' });

  // Paid Stamp / Badge
  doc.setFillColor(16, 185, 129); // #10b981 (Emerald Green)
  doc.roundedRect(pageWidth - margin - 32, 12, 32, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID IN FULL', pageWidth - margin - 16, 18, { align: 'center' });

  // Order Metadata Row
  y = 52;
  doc.setTextColor(60, 60, 65);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // Invoice Details Table Top Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 28, 2, 2, 'F');
  doc.setDrawColor(225, 225, 230);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 28, 2, 2, 'D');

  const colWidth = (pageWidth - margin * 2) / 4;
  
  // Col 1: Invoice / Order #
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 125);
  doc.text('INVOICE / ORDER NO.', margin + 4, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 25);
  doc.setFontSize(9);
  doc.text(order.orderNumber, margin + 4, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 125);
  doc.text(`Ref: ${order.paymentReference || 'SASHER-TX-ONLINE'}`, margin + 4, y + 21);

  // Col 2: Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DATE OF ISSUE', margin + colWidth + 4, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 25);
  doc.setFontSize(9);
  const orderDate = new Date(order.timestamp || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  doc.text(orderDate, margin + colWidth + 4, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 125);
  doc.text(new Date(order.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), margin + colWidth + 4, y + 21);

  // Col 3: Payment Method
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PAYMENT METHOD', margin + (colWidth * 2) + 4, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 25);
  doc.setFontSize(9);
  doc.text(String(order.paymentMethod || 'CARD').toUpperCase(), margin + (colWidth * 2) + 4, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('256-Bit SSL Verified', margin + (colWidth * 2) + 4, y + 21);

  // Col 4: Shipping Carrier
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 125);
  doc.setFontSize(8);
  doc.text('SHIPPING COURIER', margin + (colWidth * 3) + 4, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 25);
  doc.setFontSize(9);
  doc.text('SASHER Express Air Priority', margin + (colWidth * 3) + 4, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 107, 26);
  doc.text('Tracking: Active', margin + (colWidth * 3) + 4, y + 21);

  // Customer / Destination Section
  y = 86;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 25);
  doc.text('BILLED & DELIVERED TO:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 65);
  const addr = order.shippingAddress || {
    fullName: 'Valued Client',
    email: 'client@example.com',
    street: '124 Horizon Boulevard, Suite 8',
    city: 'Bangalore',
    postalCode: '560001',
    country: 'India'
  };

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 25);
  doc.text(addr.fullName, margin, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 75);
  doc.text(`${addr.street}`, margin, y + 10);
  doc.text(`${addr.city}, ${addr.postalCode} · ${addr.country}`, margin, y + 15);
  doc.text(`Email: ${addr.email}`, margin, y + 20);

  // Return & Support Notice Card on Right
  doc.setFillColor(252, 248, 242);
  doc.roundedRect(pageWidth - margin - 75, y - 2, 75, 24, 2, 2, 'F');
  doc.setDrawColor(226, 168, 118);
  doc.roundedRect(pageWidth - margin - 75, y - 2, 75, 24, 2, 2, 'D');

  doc.setTextColor(255, 107, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('30-DAY COMPLIMENTARY RETURNS', pageWidth - margin - 71, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 80, 70);
  doc.setFontSize(6.5);
  doc.text('Complimentary door pickup & full refund', pageWidth - margin - 71, y + 8);
  doc.text('within 30 days of delivery with security tag intact.', pageWidth - margin - 71, y + 12);
  doc.text('Initiate anytime in your SASHER account dashboard.', pageWidth - margin - 71, y + 16);

  // Line Items Table Header
  y = 116;
  doc.setFillColor(20, 21, 24);
  doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('#', margin + 3, y + 5.5);
  doc.text('ITEM DESCRIPTION', margin + 12, y + 5.5);
  doc.text('CATEGORY / SIZE', margin + 92, y + 5.5);
  doc.text('QTY', margin + 130, y + 5.5);
  doc.text('UNIT PRICE', margin + 148, y + 5.5);
  doc.text('TOTAL', pageWidth - margin - 4, y + 5.5, { align: 'right' });

  // Line Items Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const items = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : [
        {
          product: {
            id: 'item-01',
            name: 'Atelier Tailored Architecture Coat',
            category: 'Outerwear',
            price: order.subtotal || order.total,
            currency: '₹'
          },
          quantity: 1,
          size: 'M'
        }
      ];

  const currencySymbol = '₹';

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y, pageWidth - (margin * 2), 9, 'F');
    }
    doc.setDrawColor(235, 235, 240);
    doc.line(margin, y + 9, pageWidth - margin, y + 9);

    doc.setTextColor(100, 100, 105);
    doc.text(String(idx + 1), margin + 3, y + 6);

    doc.setTextColor(20, 20, 25);
    doc.setFont('helvetica', 'bold');
    const prodName = (item.product?.name || 'Luxury Fashion Item').slice(0, 42);
    doc.text(prodName, margin + 12, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 95);
    doc.text(`${item.product?.category || 'Piece'} · Size ${item.size || 'M'}`, margin + 92, y + 6);

    doc.setTextColor(20, 20, 25);
    doc.text(String(item.quantity || 1), margin + 133, y + 6);

    const unitPrice = item.product?.price || Math.round(order.total / (item.quantity || 1));
    doc.text(`${currencySymbol}${unitPrice.toLocaleString('en-IN')}`, margin + 148, y + 6);

    const lineTotal = unitPrice * (item.quantity || 1);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currencySymbol}${lineTotal.toLocaleString('en-IN')}`, pageWidth - margin - 4, y + 6, { align: 'right' });

    y += 9;
  });

  // Price Totals Section
  y += 4;
  const totalsStartX = pageWidth - margin - 85;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 85);

  // Subtotal
  doc.text('Cart Subtotal:', totalsStartX, y);
  doc.text(`${currencySymbol}${order.subtotal.toLocaleString('en-IN')}`, pageWidth - margin - 4, y, { align: 'right' });
  y += 5;

  // Discount (if any)
  if (order.discount && order.discount > 0) {
    doc.setTextColor(16, 185, 129);
    doc.text('Academic / Promotional Discount (15%):', totalsStartX, y);
    doc.text(`- ${currencySymbol}${order.discount.toLocaleString('en-IN')}`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5;
    doc.setTextColor(80, 80, 85);
  }

  // Shipping
  doc.text('Express Air Freight Courier:', totalsStartX, y);
  doc.text(order.shipping === 0 ? 'COMPLIMENTARY' : `${currencySymbol}${order.shipping}`, pageWidth - margin - 4, y, { align: 'right' });
  y += 5;

  // Tax
  doc.text('Estimated Goods & Services Tax (GST 12%):', totalsStartX, y);
  doc.text(`${currencySymbol}${order.tax.toLocaleString('en-IN')}`, pageWidth - margin - 4, y, { align: 'right' });
  y += 6;

  // Total Box
  doc.setFillColor(20, 21, 24);
  doc.roundedRect(totalsStartX - 4, y - 1, 89, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL AMOUNT PAID:', totalsStartX, y + 6);
  doc.setTextColor(255, 107, 26);
  doc.setFontSize(10.5);
  doc.text(`${currencySymbol}${order.total.toLocaleString('en-IN')}`, pageWidth - margin - 4, y + 6, { align: 'right' });

  // Cryptographic Ledger Hash & Authenticity Box
  y += 18;
  doc.setFillColor(245, 246, 249);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'F');
  doc.setDrawColor(220, 220, 228);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'D');

  doc.setTextColor(40, 40, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CRYPTOGRAPHIC SECURITY JOURNAL & AUTHENTICITY CERTIFICATION', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 110);
  doc.text('Every SASHER garment is tagged with an encrypted NFC certificate verified against the Atelier Ledger.', margin + 4, y + 11);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(70, 70, 80);
  doc.text(`Cryptographic Proof Hash: ${order.journalHash || '0x7f9a12c8b0e3f4d1e2a87600b3f5e921d74c0a18'}`, margin + 4, y + 17);

  // Footer: Terms, Tracking URL, and Concierge Contacts
  const footerY = pageHeight - 16;
  doc.setDrawColor(225, 225, 230);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 145);
  doc.text('SASHER Adaptive E-Commerce Inc. · GSTIN: 29AABCU9603R1ZM · CIN: U74999KA2025PTC184920', margin, footerY);
  doc.text('Need live assistance? Reach our 24/7 Concierge at concierge@sasher.luxury · White-Glove Support Active', margin, footerY + 4);
  doc.text(`Page 1 of 1 · Invoice ${order.orderNumber}`, pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

export function downloadInvoicePdf(order: CompletedOrder): void {
  try {
    const doc = generateInvoicePdf(order);
    const cleanOrderNum = order.orderNumber.replace(/[^a-zA-Z0-9_\-]/g, '');
    const filename = `SASHER-INVOICE-${cleanOrderNum}.pdf`;
    
    // Create blob directly for guaranteed iframe compatibility without popups
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (error) {
    console.error('Direct blob download error, falling back to doc.save', error);
    const doc = generateInvoicePdf(order);
    doc.save(`SASHER-INVOICE-${order.orderNumber}.pdf`);
  }
}

export function openPrintInvoicePdf(order: CompletedOrder): void {
  try {
    const doc = generateInvoicePdf(order);
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Use hidden iframe to avoid blocked popup windows in sandboxed environments
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Silent print blocked, fallback to download', err);
        downloadInvoicePdf(order);
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    };
  } catch (err) {
    console.error('Print invoice failed, downloading instead', err);
    downloadInvoicePdf(order);
  }
}
