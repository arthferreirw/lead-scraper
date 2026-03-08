# Google Maps Lead Extractor

Extensão de navegador que permite **coletar leads diretamente do Google Maps**, exportar os dados para **CSV** ou abrir automaticamente no **Google Sheets** para análise e prospecção.

Este projeto foi desenvolvido para automatizar a coleta de dados de empresas listadas no Google Maps, facilitando a criação de listas de leads para marketing, vendas ou pesquisa de mercado.

---

## ✨ Funcionalidades

* 🔎 Extrai empresas listadas no **Google Maps**
* 📊 Coleta dados relevantes de cada empresa
* 📁 Exporta os dados em **arquivo CSV**
* ⚡ Interface simples com popup na extensão
* 🧠 Scroll automático para carregar mais resultados

---

## 📋 Dados coletados

A extensão captura as seguintes informações de cada empresa:

* Nome da empresa
* Avaliação (rating)
* Número de avaliações
* Endereço
* Telefone (quando disponível)
* Website (quando disponível)

---

## 🧩 Como funciona

1. O usuário realiza uma busca no **Google Maps**
   Exemplo: `personal trainer em Belo Horizonte`

2. A extensão analisa os **cards de empresas na lateral da página**

3. Os dados são extraídos do **DOM da página**

4. Os leads são armazenados em memória e podem ser:

* exportados para CSV
* enviados diretamente para o Google Sheets

---

## 🛠️ Tecnologias utilizadas

* JavaScript
* Chrome Extension API (Manifest V3)
* DOM Scraping
* CSV generation
* Google Sheets (via importação de CSV)

---

## 📂 Estrutura do projeto

```
google-maps-lead-extractor
│
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── utils
│   └── exportCSV.js
└── README.md
```

---

## 🚀 Como instalar a extensão

1. Baixe ou clone este repositório

```
git clone https://github.com/seu-usuario/google-maps-lead-extractor
```

2. Abra o **Google Chrome**

3. Acesse:

```
chrome://extensions
```

4. Ative **Modo Desenvolvedor**

5. Clique em **Carregar sem compactação**

6. Selecione a pasta do projeto

A extensão aparecerá na barra do navegador.

---

## 🔎 Como usar

1. Abra o **Google Maps**

2. Pesquise por um tipo de negócio

Exemplo:

```
academia em São Paulo
dentista em Belo Horizonte
personal trainer em Rio de Janeiro
```

3. Clique no ícone da extensão

4. Escolha uma das opções:

* **Coletar Leads**
* **Exportar CSV**
* **Abrir no Google Sheets**

---


## ⚠️ Observações

O Google Maps utiliza **scroll infinito**, então a extensão pode precisar realizar scroll automático para carregar mais empresas antes da coleta.

Mudanças no layout do Google Maps podem exigir ajustes nos seletores utilizados no scraper.

---

## 📌 Possíveis melhorias futuras

* Filtro por número mínimo de avaliações
* Extração automática de emails
* Integração direta com CRM
* Envio automático de leads para automações (Zapier / Make)
* Dashboard de leads coletados

---

## 📄 Licença

Este projeto é open source e pode ser utilizado para fins educacionais e experimentação.
