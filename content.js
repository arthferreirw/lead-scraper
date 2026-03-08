// content.js — Script injetado no Google Maps

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_SCRAPING') {
    scrapeLeads();
  }
});

async function scrapeLeads() {
  chrome.runtime.sendMessage({ type: 'SCRAPE_STATUS', message: 'Procurando resultados...' });

  const scrollContainer = document.querySelector('div[role="feed"]') 
    || document.querySelector('.m6QErb[aria-label]');

  if (!scrollContainer) {
    chrome.runtime.sendMessage({ 
      type: 'SCRAPE_STATUS', 
      message: '⚠️ Nenhum resultado encontrado. Faça uma pesquisa no Maps.' 
    });
    chrome.runtime.sendMessage({ type: 'SCRAPE_DONE' });
    return;
  }

  // Scroll automático para carregar todos os resultados
  let previousHeight = 0;
  let scrollAttempts = 0;
  const maxScrollAttempts = 30;

  while (scrollAttempts < maxScrollAttempts) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    await sleep(1500);

    const newHeight = scrollContainer.scrollHeight;
    if (newHeight === previousHeight) {
      scrollAttempts++;
      if (scrollAttempts >= 3) break; // 3 tentativas sem novos resultados
    } else {
      scrollAttempts = 0;
      previousHeight = newHeight;
    }

    const progress = Math.min((scrollAttempts / 3) * 100, 90);
    chrome.runtime.sendMessage({ type: 'SCRAPE_PROGRESS', percent: progress });
    chrome.runtime.sendMessage({ 
      type: 'SCRAPE_STATUS', 
      message: 'Carregando mais resultados... (scroll ' + (scrollAttempts + 1) + ')' 
    });
  }

  chrome.runtime.sendMessage({ type: 'SCRAPE_PROGRESS', percent: 95 });
  chrome.runtime.sendMessage({ type: 'SCRAPE_STATUS', message: 'Extraindo dados...' });

  // Extrair dados dos cards
  const cards = document.querySelectorAll('.Nv2PK, div[jsaction*="mouseover"]');
  
  for (let i = 0; i < cards.length; i++) {
    try {
      const lead = extractLeadFromCard(cards[i]);
      if (lead && lead.name) {
        chrome.runtime.sendMessage({ type: 'LEAD_FOUND', data: lead });
      }
    } catch (e) {
      console.warn('Erro ao extrair lead:', e);
    }

    const percent = 95 + (5 * (i + 1) / cards.length);
    chrome.runtime.sendMessage({ type: 'SCRAPE_PROGRESS', percent: Math.min(percent, 100) });
  }

  chrome.runtime.sendMessage({ type: 'SCRAPE_DONE' });
}

function extractLeadFromCard(card) {
  // Nome — geralmente no primeiro link com classe fontHeadlineSmall ou no aria-label
  const nameEl = card.querySelector('.fontHeadlineSmall') 
    || card.querySelector('a[aria-label]') 
    || card.querySelector('.qBF1Pd');
  const name = nameEl?.textContent?.trim() || nameEl?.getAttribute('aria-label')?.trim() || '';

  // Avaliação
  const ratingEl = card.querySelector('.MW4etd') || card.querySelector('span[aria-hidden="true"]');
  const rating = ratingEl?.textContent?.trim() || '';

  // Número de avaliações
  const reviewEl = card.querySelector('.UY7F9') || card.querySelector('span[aria-label*="avalia"]');
  let reviewCount = '';
  if (reviewEl) {
    const match = reviewEl.textContent.match(/[\d.,]+/);
    reviewCount = match ? match[0] : reviewEl.textContent.trim();
  }

  // Endereço — geralmente em spans com classe W4Efsd
  const infoEls = card.querySelectorAll('.W4Efsd');
  let address = '';
  let phone = '';
  
  infoEls.forEach(el => {
    const text = el.textContent.trim();
    // Detecta telefone pelo padrão
    if (text.match(/\(\d{2}\)\s*\d{4,5}-\d{4}/) || text.match(/^\+?\d[\d\s()-]{8,}/)) {
      if (!phone) phone = text.match(/[\d()\s+-]+/)?.[0]?.trim() || '';
    }
    // Endereço — contém vírgula e não é categoria
    if (text.includes(',') && !text.includes('·') && text.length > 10 && !address) {
      address = text;
    }
  });

  // Se não encontrou endereço nos W4Efsd, tenta outros seletores
  if (!address) {
    const addrEl = card.querySelector('[data-tooltip*=","]') || card.querySelector('.W4Efsd:last-child');
    if (addrEl) address = addrEl.textContent.trim();
  }

  // Website — link que não é do Google
  const links = card.querySelectorAll('a[href]');
  let website = '';
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && !href.includes('google.com') && !href.includes('maps') && href.startsWith('http')) {
      website = href;
    }
  });

  return { name, rating, reviewCount, address, phone, website };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}