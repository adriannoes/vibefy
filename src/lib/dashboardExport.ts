import type { Dashboard, DashboardExportOptions } from '@/types/dashboard';
import type { CustomerFeedback } from '@/types/feedback';

// Utility function to convert data to CSV
export const convertToCSV = (data: any[], headers?: string[]): string => {
  if (!data.length) return '';

  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = data.map(row =>
    csvHeaders.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      const stringValue = String(value || '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  return [csvHeaders.join(','), ...csvRows].join('\n');
};

// Utility function to download a file
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Main export function
export const exportDashboard = async (
  dashboard: Dashboard,
  feedback: CustomerFeedback[],
  options: DashboardExportOptions
): Promise<void> => {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = `${dashboard.name.replace(/\s+/g, '_')}_${timestamp}`;

  switch (options.format) {
    case 'csv':
      await exportToCSV(dashboard, feedback, options, baseFilename);
      break;
    case 'xlsx':
      await exportToExcel(dashboard, feedback, options, baseFilename);
      break;
    case 'pdf':
      await exportToPDF(dashboard, feedback, options, baseFilename);
      break;
    case 'png':
      await exportToPNG(dashboard, feedback, options, baseFilename);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

// CSV Export
const exportToCSV = async (
  dashboard: Dashboard,
  feedback: CustomerFeedback[],
  options: DashboardExportOptions,
  baseFilename: string
): Promise<void> => {
  // Prepare data based on selected widgets
  const exportData: any[] = [];

  feedback.forEach(item => {
    const row: any = {
      id: item.id,
      title: item.title,
      content: item.content,
      status: item.status,
      priority: item.priority,
      sentiment: item.sentiment,
      source: item.source,
      customer_email: item.customer_email,
      customer_name: item.customer_name,
      votes: item.votes,
      tags: item.tags.join('; '),
      created_at: item.created_at,
      updated_at: item.updated_at,
    };

    // Add widget-specific data
    if (options.widgets?.includes('insights')) {
      // This would include insights data if available
    }

    exportData.push(row);
  });

  // Add metadata if requested
  if (options.includeMetadata) {
    exportData.unshift({
      id: 'METADATA',
      title: `Dashboard: ${dashboard.name}`,
      content: dashboard.description || '',
      status: 'metadata',
      priority: 'metadata',
      sentiment: 'metadata',
      source: 'metadata',
      customer_email: '',
      customer_name: '',
      votes: dashboard.widgets.length,
      tags: dashboard.widgets.map(w => w.type).join('; '),
      created_at: dashboard.createdAt,
      updated_at: dashboard.updatedAt,
    });
  }

  const csvContent = convertToCSV(exportData);
  downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv');
};

// Excel Export (simplified - would use a library in production)
const exportToExcel = async (
  dashboard: Dashboard,
  feedback: CustomerFeedback[],
  options: DashboardExportOptions,
  baseFilename: string
): Promise<void> => {
  // For now, export as CSV with Excel extension
  // In production, would use a library like xlsx or exceljs
  await exportToCSV(dashboard, feedback, options, baseFilename);
  // Rename file extension
  const csvContent = convertToCSV(feedback);
  downloadFile(csvContent, `${baseFilename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

// PDF Export (simplified - would use a library in production)
const exportToPDF = async (
  dashboard: Dashboard,
  feedback: CustomerFeedback[],
  options: DashboardExportOptions,
  baseFilename: string
): Promise<void> => {
  // For now, create a simple HTML-based PDF
  // In production, would use a library like jsPDF or puppeteer

  const htmlContent = generatePDFHTML(dashboard, feedback, options);
  downloadFile(htmlContent, `${baseFilename}.html`, 'text/html');

  // In a real implementation, you would:
  // 1. Use a PDF library to convert HTML to PDF
  // 2. Include charts as images
  // 3. Handle page breaks and layout
};

// PNG Export (simplified - would use a library in production)
const exportToPNG = async (
  dashboard: Dashboard,
  feedback: CustomerFeedback[],
  options: DashboardExportOptions,
  baseFilename: string
): Promise<void> => {
  // For now, create a simple HTML snapshot
  // In production, would use html2canvas or similar

  const htmlContent = generatePNGHTML(dashboard, feedback, options);
  downloadFile(htmlContent, `${baseFilename}.html`, 'text/html');

  // In a real implementation, you would:
  // 1. Use html2canvas to capture the dashboard
  // 2. Convert to PNG format
  // 3. Handle large dashboards with pagination
};

// Generate HTML for PDF export
const generatePDFHTML = (
  dashboard: Dashboard,
  feedback: CustomerFeedback[],
  options: DashboardExportOptions
): string => {
  const selectedWidgets = dashboard.widgets.filter(w =>
    options.widgets?.includes(w.id)
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${dashboard.name} - Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .widget {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .widget-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2563eb;
        }
        .metric {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${dashboard.name}</h1>
        ${dashboard.description ? `<p>${dashboard.description}</p>` : ''}
        <p><strong>Exportado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Período:</strong> ${options.dateRange}</p>
        <p><strong>Total de Feedback:</strong> ${feedback.length}</p>
      </div>

      ${selectedWidgets.map(widget => `
        <div class="widget">
          <div class="widget-title">${widget.title}</div>
          ${generateWidgetHTML(widget, feedback)}
        </div>
      `).join('')}

      <div class="footer">
        <p>Dashboard exportado do Vibefy</p>
        <p>Formato: ${options.format.toUpperCase()} | Orientação: ${options.orientation}</p>
      </div>
    </body>
    </html>
  `;
};

// Generate HTML for PNG export (simpler version)
const generatePNGHTML = (
  dashboard: Dashboard,
  feedback: CustomerFeedback[],
  options: DashboardExportOptions
): string => {
  return generatePDFHTML(dashboard, feedback, options);
};

// Generate HTML for individual widgets
const generateWidgetHTML = (widget: any, feedback: CustomerFeedback[]): string => {
  switch (widget.type) {
    case 'metric':
      const count = feedback.length;
      return `<div class="metric">${count}</div>`;

    case 'table':
      const headers = ['Título', 'Status', 'Prioridade', 'Criado em'];
      const rows = feedback.slice(0, 10).map(item => [
        item.title,
        item.status,
        item.priority,
        new Date(item.created_at).toLocaleDateString('pt-BR')
      ]);

      return `
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;

    default:
      return `<p>Dados do widget ${widget.type}</p>`;
  }
};
