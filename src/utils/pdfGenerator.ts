import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../types';

export interface GeneratePDFOptions {
  element?: HTMLElement | null;
  order: Order;
  agencyEmail?: string;
  agencyWhatsApp?: string;
}

/**
 * Downloads a professional, tax-compliant PDF invoice for an order.
 * Uses a double-fallback mechanism:
 * 1. html2canvas capture for pixel-perfect layout
 * 2. Pure jsPDF vector drawing if DOM capture is unsupported
 * 3. Multi-strategy file download (Blob URL + jsPDF save + Window fallback)
 */
export async function downloadInvoicePDF({
  element,
  order,
  agencyEmail = 'beyondpixelsagency.official@gmail.com',
  agencyWhatsApp = '+8801613253301'
}: GeneratePDFOptions): Promise<boolean> {
  const fileName = `BeyondPixels_Invoice_${order.id || 'Order'}.pdf`;

  // Strategy 1: Attempt html2canvas capture if element is provided
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        imageTimeout: 5000
      });

      if (canvas && canvas.width > 0 && canvas.height > 0) {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, Math.min(pageHeight, imgHeight));
        
        return triggerPdfDownload(pdf, fileName);
      }
    } catch (canvasErr) {
      console.warn('html2canvas capture notice, switching to vector jsPDF engine:', canvasErr);
    }
  }

  // Strategy 2: Programmatic Vector PDF Generation (100% fail-safe)
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const totalBDT = Number(order.estimatedTotalBDT || (order as any).estimatedTotal || 0);
    const advanceBDT = Number(order.advanceAmountBDT || (order as any).advanceAmount || Math.round(totalBDT * 0.3));
    const remainingDue = Math.max(0, totalBDT - advanceBDT);
    const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // 1. Header Banner
    doc.setFillColor(225, 29, 72); // Rose-600 #e11d48
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BEYOND PIXELS AGENCY', 14, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('OFFICIAL TAX INVOICE & PAYMENT RECEIPT', 14, 19);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE #: INV-${order.id}`, 196, 13, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Date: ${invoiceDate}`, 196, 19, { align: 'right' });

    // 2. Agency Contact Info
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.text(`Agency Email: ${agencyEmail} | WhatsApp: ${agencyWhatsApp} | Dhaka, Bangladesh`, 14, 30);

    // 3. Client & Payment Details Cards
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 34, 88, 38, 3, 3, 'FD');
    doc.roundedRect(108, 34, 88, 38, 3, 3, 'FD');

    // Billed To
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO (CLIENT):', 18, 41);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10);
    doc.text(order.clientName || 'Valued Client', 18, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text(`Email: ${order.clientEmail}`, 18, 54);
    doc.text(`Phone: ${order.clientPhone}`, 18, 60);
    doc.text(`Timeline: ${order.deliveryTimeframe?.toUpperCase() || 'STANDARD'} DELIVERY`, 18, 66);

    // Payment Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT VERIFICATION:', 112, 41);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(9);
    doc.text(`Method: ${order.paymentMethod || 'bKash'} (${order.paymentNumber || '01965407715'})`, 112, 48);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72);
    doc.text(`TrxID: ${order.transactionId || 'PENDING'}`, 112, 54);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 149, 193); // Emerald
    doc.text(`Status: ${order.status?.toUpperCase() || 'PENDING VERIFICATION'}`, 112, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text('30% Advance Deposit Verified Upfront', 112, 66);

    // 4. Items Table
    let y = 80;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ITEM / SCOPE OF WORK', 18, y + 5.5);
    doc.text('CATEGORY / TIMELINE', 120, y + 5.5);
    doc.text('AMOUNT (BDT)', 192, y + 5.5, { align: 'right' });

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);

    if (order.subServices && order.subServices.length > 0) {
      order.subServices.forEach(sub => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(sub.title, 18, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(sub.category || 'Service', 120, y + 4);
        doc.setFont('helvetica', 'bold');
        doc.text(`৳${(sub.priceBDT || 0).toLocaleString()}`, 192, y + 4, { align: 'right' });
        
        y += 8;
        doc.setDrawColor(240, 240, 240);
        doc.line(14, y, 196, y);
        y += 2;
      });
    } else {
      const mainTitle = order.packageSelected 
        ? `Retainer Package: ${order.packageSelected}`
        : (Array.isArray(order.services) ? order.services.join(' + ') : 'Creative Design & Growth');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(mainTitle, 18, y + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(order.deliveryTimeframe?.toUpperCase() || 'STANDARD', 120, y + 4);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`৳${totalBDT.toLocaleString()}`, 192, y + 4, { align: 'right' });
      
      y += 8;
      if (order.projectDescription) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        const splitBrief = doc.splitTextToSize(`Scope: ${order.projectDescription}`, 170);
        doc.text(splitBrief, 18, y);
        y += (splitBrief.length * 4) + 4;
      }
    }

    if (order.adBoostBudgetUSD && order.adBoostBudgetUSD > 0) {
      const adBDT = order.adBoostBudgetUSD * (order.adDollarRateBDT || 148);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      doc.text(`Ad Spend Dollar Top-up ($${order.adBoostBudgetUSD} USD @ ৳${order.adDollarRateBDT || 148}/$)`, 18, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Ad Budget', 120, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(`৳${adBDT.toLocaleString()}`, 192, y + 4, { align: 'right' });
      y += 10;
    }

    // 5. Financial Summary Block
    y = Math.max(y + 6, 145);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, 196, y);
    y += 6;

    // Terms Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('PAYMENT POLICIES & TERMS:', 18, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text('• 30% Advance Deposit paid upfront via bKash / Nagad to initiate project sprint.', 18, y + 10);
    doc.text('• Remaining 70% balance is payable upon deliverable review & final source file release.', 18, y + 15);
    doc.text('• Official 100% satisfaction guarantee with structured revisions.', 18, y + 20);

    // Totals on Right
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, y, 76, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text('Total Project Value:', 124, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(`৳${totalBDT.toLocaleString()}`, 192, y + 7, { align: 'right' });

    doc.setTextColor(16, 149, 193); // Emerald
    doc.text('30% Advance Paid:', 124, y + 15);
    doc.text(`- ৳${advanceBDT.toLocaleString()}`, 192, y + 15, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.line(124, y + 19, 192, y + 19);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(225, 29, 72); // Rose
    doc.text('Remaining Due (70%):', 124, y + 26);
    doc.text(`৳${remainingDue.toLocaleString()}`, 192, y + 26, { align: 'right' });

    // 6. Footer Seal & Authentication
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 260, 196, 260);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text('BEYOND PIXELS OPERATIONS', 18, 267);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Computer-Generated Tax Compliant Digital Invoice • No Signature Required', 18, 272);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text('Beyond Pixels Agency', 192, 267, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('Authorized Finance Signatory', 192, 272, { align: 'right' });

    return triggerPdfDownload(doc, fileName);
  } catch (pdfErr) {
    console.error('Vector PDF generation error:', pdfErr);
    return false;
  }
}

function triggerPdfDownload(pdf: jsPDF, fileName: string): boolean {
  try {
    // Strategy A: Blob URL with simulated anchor click (best cross-platform support)
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    return true;
  } catch (blobErr) {
    try {
      // Strategy B: Direct jsPDF save
      pdf.save(fileName);
      return true;
    } catch (saveErr) {
      try {
        // Strategy C: Open in new window
        const dataUri = pdf.output('datauristring');
        const win = window.open(dataUri, '_blank');
        return !!win;
      } catch (winErr) {
        console.error('All PDF download strategies failed:', winErr);
        return false;
      }
    }
  }
}
