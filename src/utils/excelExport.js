import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Object} options - Formatting options
 */
export function exportToExcel(data, filename, options = {}) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const { sheetName = 'Sheet1' } = options;

  // Create worksheet from data
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const range = XLSX.utils.decode_range(ws['!ref']);
  const colWidths = [];
  
  for (let col = range.s.c; col <= range.e.c; col++) {
    let maxWidth = 10;
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (ws[cellAddress] && ws[cellAddress].v) {
        const cellLength = ws[cellAddress].v.toString().length;
        maxWidth = Math.max(maxWidth, cellLength + 2);
      }
    }
    colWidths.push({ wch: Math.min(maxWidth, 50) });
  }
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate and download file
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}

/**
 * Export finance expenses with proper formatting
 */
export function exportExpenses(expenses) {
  const formattedData = expenses.map((expense) => ({
    Date: expense.expense_date,
    Description: expense.description,
    Category: expense.category?.toUpperCase() || 'N/A',
    'Amount (K)': parseFloat(expense.amount || 0).toFixed(2),
    'Payment Method': expense.payment_method || 'N/A',
    Employee: expense.employees?.name || 'N/A',
    'Order Number': expense.orders?.order_number || 'N/A',
  }));

  exportToExcel(formattedData, 'Expenses', {
    sheetName: 'Expenses',
  });
}

/**
 * Export finance payments with proper formatting
 */
export function exportPayments(payments) {
  const formattedData = payments.map((payment) => ({
    Date: payment.payment_date,
    'Order Number': payment.orders?.order_number || 'N/A',
    Customer: payment.orders?.customers?.name || 'N/A',
    'Amount (K)': parseFloat(payment.amount || 0).toFixed(2),
    'Payment Method': payment.payment_method,
    'Order Total (K)': parseFloat(payment.orders?.total_cost || 0).toFixed(2),
  }));

  exportToExcel(formattedData, 'Payments', {
    sheetName: 'Payments',
  });
}

/**
 * Export monthly financial summary
 */
export function exportFinancialSummary(summary) {
  const formattedData = [
    { Metric: 'Total Revenue', 'Value (K)': parseFloat(summary.totalRevenue || 0).toFixed(2) },
    { Metric: 'Material Costs', 'Value (K)': parseFloat(summary.totalMaterial || 0).toFixed(2) },
    { Metric: 'Labour Costs', 'Value (K)': parseFloat(summary.totalLabour || 0).toFixed(2) },
    { Metric: 'Overhead Costs', 'Value (K)': parseFloat(summary.totalOverhead || 0).toFixed(2) },
    { Metric: 'Other Expenses', 'Value (K)': parseFloat(summary.totalExpenses || 0).toFixed(2) },
    { Metric: 'Total Costs', 'Value (K)': parseFloat(summary.totalCosts || 0).toFixed(2) },
    { Metric: 'Net Profit', 'Value (K)': parseFloat(summary.netProfit || 0).toFixed(2) },
    { Metric: 'Profit Margin', 'Value (%)': parseFloat(summary.profitMargin || 0).toFixed(1) + '%' },
    { Metric: 'Cash Flow', 'Value (K)': parseFloat(summary.cashFlow || 0).toFixed(2) },
    { Metric: 'Total Orders', Value: summary.totalOrders },
    { Metric: 'Completed Orders', Value: summary.completedOrders },
    { Metric: 'Average Order Value', 'Value (K)': parseFloat(summary.avgOrderValue || 0).toFixed(2) },
  ];

  exportToExcel(formattedData, `Financial_Summary_${summary.month}`, {
    sheetName: 'Summary',
  });
}

