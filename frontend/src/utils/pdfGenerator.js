import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a comprehensive credit report PDF
 * @param {Object} userData - User's complete data
 * @param {Object} creditData - Credit score and history
 * @param {Array} payments - Payment history
 * @param {Array} circles - User's circles
 */
export const generateCreditReportPDF = async (userData, creditData, payments, circles) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Colors matching the app theme
  const colors = {
    primary: [217, 119, 6], // frontier-500
    secondary: [251, 191, 36], // amber-400
    success: [34, 197, 94], // green-500
    danger: [239, 68, 68], // red-500
    text: [229, 231, 235], // dusty-200
    darkBg: [28, 25, 23] // dusty-900
  };

  let yPosition = 20;

  // ===== HEADER =====
  // Logo/Title
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('🤠 PayItForward', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Credit Report', pageWidth / 2, 25, { align: 'center' });

  yPosition = 45;

  // ===== USER INFO SECTION =====
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Member Information', 15, yPosition);

  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${userData.name}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Member Since: ${new Date(userData.created_at).toLocaleDateString()}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 15, yPosition);

  yPosition += 12;

  // ===== CREDIT SCORE HIGHLIGHT =====
  // Draw credit score box
  const scoreBoxY = yPosition;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(15, scoreBoxY, pageWidth - 30, 30, 3, 3, 'F');

  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, scoreBoxY, pageWidth - 30, 30, 3, 3, 'S');

  // Credit score number
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  const scoreColor = creditData.credit_score >= 700 ? colors.success :
                     creditData.credit_score >= 600 ? colors.secondary :
                     colors.danger;
  doc.setTextColor(...scoreColor);
  doc.text(String(creditData.credit_score), pageWidth / 2 - 30, scoreBoxY + 20);

  // Credit score label
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('CREDIT SCORE', pageWidth / 2 + 10, scoreBoxY + 12);

  // Rating
  const rating = creditData.credit_score >= 750 ? 'Excellent' :
                 creditData.credit_score >= 650 ? 'Good' :
                 creditData.credit_score >= 500 ? 'Fair' : 'Building';
  doc.setTextColor(...scoreColor);
  doc.text(rating, pageWidth / 2 + 10, scoreBoxY + 22);

  yPosition += 40;

  // ===== QUICK STATS =====
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Account Summary', 15, yPosition);
  yPosition += 8;

  // Stats grid
  const stats = [
    ['Active Circles', circles.filter(c => c.status === 'active').length],
    ['Total Payments', payments.length],
    ['On-Time Payments', payments.filter(p => p.status === 'completed').length],
    ['Payment Rate', payments.length > 0 ? `${Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100)}%` : '0%']
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: stats,
    theme: 'grid',
    headStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: { fontSize: 10 },
    margin: { left: 15, right: 15 }
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // ===== CIRCLE PARTICIPATION =====
  if (circles.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Circle Participation', 15, yPosition);
    yPosition += 8;

    const circleData = circles.map(circle => [
      circle.name,
      circle.role.toUpperCase(),
      circle.member_status,
      `$${circle.monthly_amount}`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Circle Name', 'Role', 'Status', 'Monthly Amount']],
      body: circleData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // ===== PAYMENT HISTORY =====
  if (payments.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Payment History', 15, yPosition);
    yPosition += 8;

    const paymentData = payments.slice(0, 10).map(payment => [
      new Date(payment.payment_date).toLocaleDateString(),
      payment.circle_name || 'N/A',
      `$${payment.amount}`,
      payment.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Circle', 'Amount', 'Status']],
      body: paymentData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 },
      columnStyles: {
        3: {
          cellWidth: 30,
          fontStyle: 'bold',
          textColor: (data) => {
            const status = data.cell.raw;
            if (status === 'COMPLETED') return colors.success;
            if (status === 'PENDING') return colors.secondary;
            return colors.danger;
          }
        }
      },
      margin: { left: 15, right: 15 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Check if we need a new page for credit history
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // ===== CREDIT HISTORY =====
  if (creditData.history && creditData.history.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Credit Building Activity', 15, yPosition);
    yPosition += 8;

    const historyData = creditData.history.slice(0, 10).map(event => [
      new Date(event.created_at).toLocaleDateString(),
      event.description || event.event_type.replace(/_/g, ' '),
      event.impact > 0 ? `+${event.impact}` : event.impact,
      event.circle_name || 'General'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Activity', 'Impact', 'Circle']],
      body: historyData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 },
      columnStyles: {
        2: {
          fontStyle: 'bold',
          textColor: (data) => {
            const impact = parseInt(data.cell.raw);
            return impact > 0 ? colors.success : colors.danger;
          }
        }
      },
      margin: { left: 15, right: 15 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('This report is generated by PayItForward - Building financial trust on the frontier', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: 'center' });

  // Verification stamp
  doc.setFontSize(6);
  doc.text('🤠 Official Document - RowdyHacks 2025', pageWidth / 2, footerY + 10, { align: 'center' });

  // Generate filename
  const filename = `PayItForward_CreditReport_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Save the PDF
  doc.save(filename);
};
