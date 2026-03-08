let leads = [];
let isCollecting = false;

const countEl = document.getElementById('leadCount');
const statusEl = document.getElementById('status');
const collectBtn = document.getElementById('collectBtn');
const exportBtn = document.getElementById('exportBtn');
const sheetsBtn = document.getElementById('sheetsBtn');
const progressEl = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');

// Atualiza a UI
function updateUI() {
  countEl.textContent = leads.length;
  exportBtn.disabled = leads.length === 0;
  sheetsBtn.disabled = leads.length === 0;
  collectBtn.textContent = isCollecting ? '⏸ Coletando...' : '▶ Coletar Leads';
  collectBtn.disabled = isCollecting;
}

// Listener de mensagens do content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'LEAD_FOUND') {
    // Evita duplicatas pelo nome
    if (!leads.find(l => l.name === msg.data.name)) {
      leads.push(msg.data);
      updateUI();
    }
  }
  if (msg.type === 'SCRAPE_STATUS') {
    statusEl.textContent = msg.message;
  }
  if (msg.type === 'SCRAPE_PROGRESS') {
    progressEl.style.display = 'block';
    progressBar.style.width = msg.percent + '%';
  }
  if (msg.type === 'SCRAPE_DONE') {
    isCollecting = false;
    statusEl.textContent = 'Coleta finalizada! ' + leads.length + ' leads encontrados.';
    progressEl.style.display = 'none';
    updateUI();
  }
});

// Botão Coletar
collectBtn.addEventListener('click', async () => {
  isCollecting = true;
  leads = [];
  updateUI();
  statusEl.textContent = 'Iniciando coleta...';
  progressEl.style.display = 'block';
  progressBar.style.width = '0%';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url?.includes('google.com/maps')) {
    statusEl.textContent = '⚠️ Abra o Google Maps primeiro!';
    isCollecting = false;
    updateUI();
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: 'START_SCRAPING' });
});

// Botão Exportar
exportBtn.addEventListener('click', () => {
  if (leads.length === 0) return;

  const headers = ['Nome', 'Avaliação', 'Nº Avaliações', 'Endereço', 'Telefone', 'Site'];
  const rows = leads.map(l => [
    escapeCsv(l.name),
    escapeCsv(l.rating),
    escapeCsv(l.reviewCount),
    escapeCsv(l.address),
    escapeCsv(l.phone),
    escapeCsv(l.website)
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads_google_maps_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);

  statusEl.textContent = leads.length + ' leads exportados com sucesso!';
});

function escapeCsv(val) {
  val = val || '';
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

updateUI();

// Botão Google Sheets
sheetsBtn.addEventListener('click', () => {
  if (leads.length === 0) return;

  const headers = ['Nome', 'Avaliação', 'Nº Avaliações', 'Endereço', 'Telefone', 'Site'];
  const rows = leads.map(l => [
    l.name || '', l.rating || '', l.reviewCount || '',
    l.address || '', l.phone || '', l.website || ''
  ]);
  const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');

  navigator.clipboard.writeText(tsv).then(() => {
    window.open('https://docs.google.com/spreadsheets/create', '_blank');
    statusEl.textContent = 'Dados copiados! Cole (Ctrl+V) na planilha.';
  });
});