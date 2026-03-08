// utils/exportCSV.js — Utilitário de exportação CSV

export function exportLeadsToCSV(leads) {
  if (!leads || leads.length === 0) {
    console.warn('Nenhum lead para exportar');
    return;
  }

  const headers = ['Nome', 'Avaliação', 'Nº Avaliações', 'Endereço', 'Telefone', 'Site'];
  
  const rows = leads.map(lead => [
    escapeCsv(lead.name || ''),
    escapeCsv(lead.rating || ''),
    escapeCsv(lead.reviewCount || ''),
    escapeCsv(lead.address || ''),
    escapeCsv(lead.phone || ''),
    escapeCsv(lead.website || '')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // BOM para garantir encoding correto no Excel
  const blob = new Blob(['\uFEFF' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'leads_google_maps_' + getDateString() + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function getDateString() {
  return new Date().toISOString().slice(0, 10);
}