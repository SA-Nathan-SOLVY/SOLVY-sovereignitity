/**
 * MOLI Policy Service Request PDF Generator
 * SOLVY Ecosystem™
 * 
 * Generates a professional PDF document from MOLI form submission data
 * using pdf-lib (pure JavaScript, no external binaries)
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Generate MOLI Policy Service Request PDF
 * @param {Object} data - Form submission data
 * @returns {Promise<Buffer>} PDF as Node.js Buffer
 */
async function generateMoliPDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = page.getSize();
  
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  let y = height - 50;
  const leftMargin = 50;
  const rightMargin = width - 50;
  const lineHeight = 18;
  const sectionGap = 24;
  
  // Helper functions
  const drawText = (text, x, yPos, options = {}) => {
    const font = options.bold ? helveticaBold : options.italic ? helveticaOblique : helvetica;
    const size = options.size || 11;
    const color = options.color || rgb(0.15, 0.15, 0.15);
    page.drawText(text, { x, y: yPos, size, font, color });
  };
  
  const drawLine = (yPos, thickness = 0.5) => {
    page.drawLine({
      start: { x: leftMargin, y: yPos },
      end: { x: rightMargin, y: yPos },
      thickness,
      color: rgb(0.75, 0.75, 0.75),
    });
  };
  
  const drawLabelValue = (label, value, yPos, options = {}) => {
    drawText(`${label}:`, leftMargin, yPos, { bold: true, size: 10 });
    const labelWidth = helveticaBold.widthOfTextAtSize(`${label}:`, 10);
    drawText(value || 'N/A', leftMargin + labelWidth + 8, yPos, { size: 10, ...options });
    return yPos - lineHeight;
  };
  
  const drawSectionHeader = (title, yPos) => {
    drawText(title, leftMargin, yPos, { bold: true, size: 14, color: rgb(0.13, 0.77, 0.37) });
    drawLine(yPos - 6, 1.5);
    return yPos - sectionGap;
  };
  
  // ===== HEADER =====
  drawText('SOLVY ECOSYSTEM™', leftMargin, y, { bold: true, size: 20, color: rgb(0.13, 0.77, 0.37) });
  y -= lineHeight + 4;
  drawText('Mutual of Omaha Life Insurance — Policy Service Request', leftMargin, y, { size: 13, color: rgb(0.4, 0.4, 0.4) });
  y -= lineHeight + 2;
  drawText(`Reference: ${data.policyNumber} — ${data.requestType}`, leftMargin, y, { size: 10, color: rgb(0.5, 0.5, 0.5) });
  y -= lineHeight;
  drawText(`Submitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, leftMargin, y, { size: 9, color: rgb(0.5, 0.5, 0.5) });
  y -= sectionGap + 10;
  
  // ===== POLICY HOLDER INFORMATION =====
  y = drawSectionHeader('POLICY HOLDER INFORMATION', y);
  y = drawLabelValue('Policy Holder', data.policyHolder, y);
  y = drawLabelValue('Policy Number', data.policyNumber, y);
  y = drawLabelValue('Available Cash Value', data.availableBalance || 'N/A', y);
  y -= 8;
  
  // ===== REQUEST DETAILS =====
  y = drawSectionHeader('REQUEST DETAILS', y);
  y = drawLabelValue('Request Type', data.requestType, y);
  
  if (data.amount && parseFloat(data.amount) > 0) {
    y = drawLabelValue('Amount Requested', `$${parseFloat(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, y);
    if (data.requestType === 'Policy Loan') {
      y = drawLabelValue('Interest Rate', '5.37% per annum', y, { color: rgb(0.4, 0.4, 0.4) });
    }
  }
  y -= 8;
  
  // ===== BANKING INFORMATION =====
  if (data.bankRoutingNumber || data.bankAccountNumber) {
    y = drawSectionHeader('BANKING INFORMATION', y);
    if (data.bankRoutingNumber) {
      y = drawLabelValue('Routing Number', `•••••••••${data.bankRoutingNumber.slice(-1)}`, y);
    }
    if (data.bankAccountNumber) {
      const masked = data.bankAccountNumber.length > 4 
        ? `••••••••${data.bankAccountNumber.slice(-4)}` 
        : '••••';
      y = drawLabelValue('Account Number', masked, y);
    }
    y -= 8;
  }
  
  // ===== MEC / TAX DISCLOSURE =====
  if (data.requestType === 'Policy Loan' && data.mecAcknowledged) {
    y = drawSectionHeader('MEC / TAX DISCLOSURE', y);
    const disclosureText = 
      'I understand that if this policy is classified as a Modified Endowment Contract (MEC), ' +
      'any loan or withdrawal may be subject to federal income tax and a 10% penalty if taken ' +
      'before age 59½. I have reviewed the policy illustration and understand the potential tax implications.';
    
    const words = disclosureText.split(' ');
    let line = '';
    const maxWidth = rightMargin - leftMargin - 20;
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = helvetica.widthOfTextAtSize(testLine, 9);
      if (testWidth > maxWidth && line) {
        drawText(line, leftMargin + 10, y, { size: 9, color: rgb(0.5, 0.3, 0.1) });
        y -= 14;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      drawText(line, leftMargin + 10, y, { size: 9, color: rgb(0.5, 0.3, 0.1) });
      y -= 14;
    }
    
    y = drawLabelValue('MEC Acknowledgment', '[CONFIRMED] Policyholder acknowledges MEC tax implications', y, { color: rgb(0.13, 0.55, 0.13) });
    y -= 8;
  }
  
  // ===== ELECTRONIC SIGNATURE =====
  y = drawSectionHeader('ELECTRONIC SIGNATURE & CONSENT', y);
  
  drawText('ESIGN Disclosure:', leftMargin, y, { bold: true, size: 10 });
  y -= 14;
  
  const esignText = 
    'By typing my name below, I agree that my electronic signature is the legal equivalent of my ' +
    'manual signature. I consent to be legally bound by this agreement and the use of electronic ' +
    'records and signatures. I have the right to withdraw consent, but understand that if I do, ' +
    'this request may not be processed. I confirm I have access to a printer or device capable ' +
    'of retaining a copy of this document.';
  
  const esignWords = esignText.split(' ');
  let esignLine = '';
  const esignMaxWidth = rightMargin - leftMargin;
  
  for (const word of esignWords) {
    const testLine = esignLine + (esignLine ? ' ' : '') + word;
    const testWidth = helvetica.widthOfTextAtSize(testLine, 8);
    if (testWidth > esignMaxWidth && esignLine) {
      drawText(esignLine, leftMargin, y, { size: 8, color: rgb(0.4, 0.4, 0.4) });
      y -= 12;
      esignLine = word;
    } else {
      esignLine = testLine;
    }
  }
  if (esignLine) {
    drawText(esignLine, leftMargin, y, { size: 8, color: rgb(0.4, 0.4, 0.4) });
    y -= 14;
  }
  
  // Signature block
  y -= 10;
  drawLine(y, 1);
  y -= 8;
  
  drawText(data.signatureName || '[NO SIGNATURE]', leftMargin, y, { 
    italic: true, 
    size: 18, 
    color: rgb(0.1, 0.1, 0.3) 
  });
  y -= 16;
  drawText('Signed electronically via SOLVY Ecosystem™', leftMargin, y, { size: 8, color: rgb(0.5, 0.5, 0.5) });
  y -= 14;
  drawText(`Date: ${data.signatureDate || new Date().toLocaleDateString('en-US')}`, leftMargin, y, { size: 9 });
  y -= 20;
  
  if (data.esignConsent) {
    drawText('[CONFIRMED] ESIGN Consent Confirmed', leftMargin, y, { size: 9, color: rgb(0.13, 0.55, 0.13), bold: true });
  }
  
  // ===== FOOTER =====
  const footerY = 40;
  drawLine(footerY + 15, 0.5);
  drawText('Product of SA Nathan LLC  |  SOLVY Ecosystem™  |  This document was generated electronically and is valid without physical signature.', 
    leftMargin, footerY, { size: 7, color: rgb(0.5, 0.5, 0.5) });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generateMoliPDF };
