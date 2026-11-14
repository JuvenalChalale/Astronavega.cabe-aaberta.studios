/* =========================================================
   GALERIA.JS — Sistema de galeria de capturas do jogo
   
   AGORA COM CONSUMO DE API REAL (NASA Image and Video Library)
   ========================================================= */

// ---------- CONFIGURAÇÃO DA API ----------
const NASA_API_BASE = "https://images-api.nasa.gov";
// Termos de busca para preencher a galeria com temas espaciais
const TERMOS_BUSCA = [
  { termo: "nebula", categoria: "evento" },
  { termo: "planet", categoria: "planeta" },
  { termo: "galaxy", categoria: "missao" },
  { termo: "spacecraft", categoria: "nave" }
];

// ---------- CAPTURAS DE FALLBACK (caso a API falhe) ----------
const CAPTURAS_FALLBACK = [
  {
    id: "fallback-01",
    src: "https://images-assets.nasa.gov/image/PIA23122/PIA23122~thumb.jpg",
    categoria: "evento",
    titulo_pt: "Nebulosa (Fallback)",
    titulo_en: "Nebula (Fallback)",
    desc_pt: "Imagem de reserva carregada porque a API não respondeu.",
    desc_en: "Fallback image loaded because the API did not respond.",
    data: "2026-01-01",
    local_pt: "Espaço profundo",
    local_en: "Deep space"
  }
];

// ---------- ESTADO ----------
let capturas = [];
let filtroAtivo = "todas";
let carregando = false;

// ---------- CARREGAR CAPTURAS (AGORA COM API) ----------
async function carregarCapturas() {
  if (carregando) return;
  carregando = true;

  // 1. Capturas locais do jogo (localStorage) — sempre carregam primeiro
  let locais = [];
  try {
    const raw = localStorage.getItem("astronavega-galeria");
    if (raw) locais = JSON.parse(raw);
  } catch (e) {
    console.warn("Erro ao ler capturas locais:", e);
  }

  // 2. Buscar imagens da API da NASA
  let apiCapturas = [];
  try {
    // Fazemos várias buscas em paralelo para ter variedade
    const promessas = TERMOS_BUSCA.map(async ({ termo, categoria }) => {
      const url = `${NASA_API_BASE}/search?q=${encodeURIComponent(termo)}&media_type=image&page_size=3`;
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();

      // A API retorna uma estrutura complexa; extraímos o que interessa
      const itens = dados.collection?.items || [];
      return itens.map((item, index) => {
        const data = item.data?.[0] || {};
        const links = item.links?.[0] || {};
        // Tenta pegar a thumbnail ou a imagem original
        const src = links.href || "";
        
        return {
          id: `nasa-${termo}-${index}-${Date.now()}`,
          src: src,
          categoria: categoria,
          titulo_pt: data.title || "Imagem NASA",
          titulo_en: data.title || "NASA Image",
          desc_pt: data.description || "Imagem capturada pela NASA.",
          desc_en: data.description || "Image captured by NASA.",
          data: data.date_created ? data.date_created.slice(0, 10) : "2026-01-01",
          local_pt: data.center || "NASA",
          local_en: data.center || "NASA"
        };
      });
    });

    const resultados = await Promise.all(promessas);
    apiCapturas = resultados.flat();
  } catch (e) {
    console.warn("Falha ao buscar API da NASA, usando fallback:", e);
    // Se a API falhar, usa as imagens de fallback
    apiCapturas = [...CAPTURAS_FALLBACK];
  }

  // 3. Juntar tudo (capturas locais do jogo + capturas da API)
  // Nota: as capturas locais têm prioridade na lista, mas todas aparecem
  capturas = [...locais, ...apiCapturas];

  carregando = false;
  renderizarGaleria();
}

// ---------- RENDERIZAR GRELHA ----------
function renderizarGaleria() {
  const grid = document.getElementById("gallery-grid");
  const count = document.getElementById("gallery-count");
  const empty = document.getElementById("gallery-empty");
  if (!grid) return;

  const lang = window.getLanguage ? window.getLanguage() : "pt";

  // Filtrar
  const filtradas = filtroAtivo === "todas"
    ? capturas
    : capturas.filter(c => c.categoria === filtroAtivo);

  // Atualizar contador
  if (count) {
    const label = lang === "pt" ? "CAPTURAS" : "CAPTURES";
    count.innerHTML = `${label}: <strong>${filtradas.length}</strong>`;
  }

  // Estado vazio
  if (filtradas.length === 0) {
    grid.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  // Construir HTML
  grid.innerHTML = filtradas.map(c => {
    const titulo = lang === "pt" ? c.titulo_pt : c.titulo_en;
    const local = lang === "pt" ? c.local_pt : c.local_en;
    const tagLabel = {
      missao: lang === "pt" ? "MISSÃO" : "MISSION",
      planeta: lang === "pt" ? "PLANETA" : "PLANET",
      nave: lang === "pt" ? "NAVE" : "SHIP",
      evento: lang === "pt" ? "EVENTO" : "EVENT"
    }[c.categoria] || c.categoria.toUpperCase();

    // Fallback de imagem caso o src esteja vazio ou quebrado
    const imgSrc = c.src || "data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 250%22><rect fill=%22%230a1a2a%22 width=%22400%22 height=%22250%22/><text x=%22200%22 y=%22125%22 fill=%22%2351d8ff%22 font-family=%22monospace%22 font-size=%2216%22 text-anchor=%22middle%22>SEM IMAGEM</text></svg>";

    return `
      <div class="gallery-item" data-id="${c.id}" role="button" tabindex="0">
        <span class="tag ${c.categoria}">${tagLabel}</span>
        <img src="${imgSrc}" alt="${titulo}" loading="lazy"
             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 250%22><rect fill=%22%230a1a2a%22 width=%22400%22 height=%22250%22/><text x=%22200%22 y=%22125%22 fill=%22%2351d8ff%22 font-family=%22monospace%22 font-size=%2216%22 text-anchor=%22middle%22>SEM IMAGEM</text></svg>'">
        <div class="overlay">
          <span class="title">${titulo}</span>
          <span class="meta">${c.data} • ${local}</span>
        </div>
      </div>
    `;
  }).join("");

  // Eventos de clique
  grid.querySelectorAll(".gallery-item").forEach(el => {
    el.addEventListener("click", () => abrirModal(el.dataset.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirModal(el.dataset.id);
      }
    });
  });
}

// ---------- MODAL ----------
function abrirModal(id) {
  const cap = capturas.find(c => c.id === id);
  if (!cap) return;
  const modal = document.getElementById("gallery-modal");
  const img = document.getElementById("modal-image");
  const title = document.getElementById("modal-title");
  const meta = document.getElementById("modal-meta");
  const desc = document.getElementById("modal-desc");

  const lang = window.getLanguage ? window.getLanguage() : "pt";

  img.src = cap.src;
  title.textContent = lang === "pt" ? cap.titulo_pt : cap.titulo_en;
  meta.textContent = `${cap.data} • ${lang === "pt" ? cap.local_pt : cap.local_en}`;
  desc.textContent = lang === "pt" ? cap.desc_pt : cap.desc_en;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  const modal = document.getElementById("gallery-modal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// ---------- FILTROS ----------
function initFiltros() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtroAtivo = btn.dataset.filter;
      renderizarGaleria();
    });
  });
}

// ---------- API PÚBLICA (para o jogo adicionar capturas) ----------
function addCapture(cap) {
  try {
    const lista = JSON.parse(localStorage.getItem("astronavega-galeria") || "[]");
    const nova = {
      id: "cap-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      data: new Date().toISOString().slice(0, 10),
      categoria: cap.categoria || "evento",
      src: cap.src,
      titulo_pt: cap.titulo_pt || "Captura",
      titulo_en: cap.titulo_en || "Capture",
      desc_pt: cap.desc_pt || "",
      desc_en: cap.desc_en || "",
      local_pt: cap.local_pt || "",
      local_en: cap.local_en || ""
    };
    lista.push(nova);
    localStorage.setItem("astronavega-galeria", JSON.stringify(lista));
    return nova;
  } catch (e) {
    console.error("Erro ao guardar captura:", e);
    return null;
  }
}

function removeCapture(id) {
  try {
    const lista = JSON.parse(localStorage.getItem("astronavega-galeria") || "[]");
    const nova = lista.filter(c => c.id !== id);
    localStorage.setItem("astronavega-galeria", JSON.stringify(nova));
  } catch (e) {
    console.error("Erro ao remover captura:", e);
  }
}

// ---------- INICIALIZAÇÃO ----------
function initGaleria() {
  // Carrega local primeiro (síncrono) e dispara a API (assíncrono)
  // Para não bloquear, chamamos carregarCapturas que é async
  carregarCapturas();
  initFiltros();

  // Fechar modal
  const closeBtn = document.getElementById("modal-close");
  const modal = document.getElementById("gallery-modal");
  if (closeBtn) closeBtn.addEventListener("click", fecharModal);
  if (modal) modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharModal();
  });

  // Re-renderizar quando muda de idioma
  document.addEventListener("languageChanged", renderizarGaleria);
}

// Expor API pública
window.addCapture = addCapture;
window.removeCapture = removeCapture;
window.initGaleria = initGaleria;