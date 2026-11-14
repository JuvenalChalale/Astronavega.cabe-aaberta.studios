/* =========================================================
   GALERIA.JS — Sistema de galeria de capturas do jogo
   
   Como funciona:
   1. O jogo guarda capturas em localStorage com a chave
      "astronavega-galeria" (array de objetos).
   2. Esta página lê esse array e mostra as imagens.
   3. Também suporta capturas pré-definidas na pasta /img/capturas/
   ========================================================= */

// ---------- CAPTURAS PRÉ-DEFINIDAS (exemplos) ----------
// Substitui estas por capturas reais do teu jogo, se quiseres.
// O jogo pode adicionar mais via addCapture() (ver função abaixo).
const CAPTURAS_PADRAO = [
  {
    id: "cap-01",
    src: "img/capturas/captura-01.png",
    categoria: "missao",
    titulo_pt: "Lançamento da Missão ASTRO-01",
    titulo_en: "Mission ASTRO-01 Launch",
    desc_pt: "Início da jornada além do nosso céu.",
    desc_en: "The beginning of the journey beyond our sky.",
    data: "2026-01-15",
    local_pt: "Base de Lançamento, Luanda",
    local_en: "Launch Base, Luanda"
  },
  {
    id: "cap-02",
    src: "img/capturas/captura-02.jpg",
    categoria: "planeta",
    titulo_pt: "Órbita do Planeta ORION-07",
    titulo_en: "Orbit of Planet ORION-07",
    desc_pt: "Primeira aproximação ao planeta desconhecido.",
    desc_en: "First approach to the unknown planet.",
    data: "2026-01-22",
    local_pt: "Sistema ORION-07",
    local_en: "ORION-07 System"
  },
  {
    id: "cap-03",
    src: "img/capturas/captura-03.jpg",
    categoria: "nave",
    titulo_pt: "Nave ASTRONAVEGA em formação",
    titulo_en: "ASTRONAVEGA Ship in Formation",
    desc_pt: "A frota alinhada pronta para o salto.",
    desc_en: "The fleet aligned, ready for the jump.",
    data: "2026-04-03",
    local_pt: "Espaço profundo",
    local_en: "Deep space"
  },
  {
    id: "cap-04",
    src: "img/capturas/captura-04.jpg",
    categoria: "evento",
    titulo_pt: "Tempestade solar",
    titulo_en: "Solar Storm",
    desc_pt: "Evento raro capturado durante a missão.",
    desc_en: "Rare event captured during the mission.",
    data: "2026-02-18",
    local_pt: "Cinturão de asteroides",
    local_en: "Asteroid belt"
  }
];

// ---------- ESTADO ----------
let capturas = [];
let filtroAtivo = "todas";

// ---------- CARREGAR CAPTURAS ----------
function carregarCapturas(){
  // 1. Capturas do jogo (localStorage)
  let locais = [];
  try{
    const raw = localStorage.getItem("astronavega-galeria");
    if(raw) locais = JSON.parse(raw);
  }catch(e){
    console.warn("Erro ao ler capturas locais:", e);
  }

  // 2. Juntar capturas padrão + capturas do jogo
  capturas = [...CAPTURAS_PADRAO, ...locais];
}

// ---------- RENDERIZAR GRELHA ----------
function renderizarGaleria(){
  const grid = document.getElementById("gallery-grid");
  const count = document.getElementById("gallery-count");
  const empty = document.getElementById("gallery-empty");
  if(!grid) return;

  const lang = window.getLanguage ? window.getLanguage() : "pt";

  // Filtrar
  const filtradas = filtroAtivo === "todas"
    ? capturas
    : capturas.filter(c => c.categoria === filtroAtivo);

  // Atualizar contador
  if(count){
    const label = lang === "pt" ? "CAPTURAS" : "CAPTURES";
    count.innerHTML = `${label}: <strong>${filtradas.length}</strong>`;
  }

  // Estado vazio
  if(filtradas.length === 0){
    grid.innerHTML = "";
    if(empty) empty.style.display = "block";
    return;
  }
  if(empty) empty.style.display = "none";

  // Construir HTML
  grid.innerHTML = filtradas.map(c=>{
    const titulo = lang === "pt" ? c.titulo_pt : c.titulo_en;
    const local = lang === "pt" ? c.local_pt : c.local_en;
    const tagLabel = {
      missao: lang === "pt" ? "MISSÃO" : "MISSION",
      planeta: lang === "pt" ? "PLANETA" : "PLANET",
      nave: lang === "pt" ? "NAVE" : "SHIP",
      evento: lang === "pt" ? "EVENTO" : "EVENT"
    }[c.categoria] || c.categoria.toUpperCase();

    return `
      <div class="gallery-item" data-id="${c.id}" role="button" tabindex="0">
        <span class="tag ${c.categoria}">${tagLabel}</span>
        <img src="${c.src}" alt="${titulo}" loading="lazy"
             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 250%22><rect fill=%22%230a1a2a%22 width=%22400%22 height=%22250%22/><text x=%22200%22 y=%22125%22 fill=%22%2351d8ff%22 font-family=%22monospace%22 font-size=%2216%22 text-anchor=%22middle%22>SEM IMAGEM</text></svg>'">
        <div class="overlay">
          <span class="title">${titulo}</span>
          <span class="meta">${c.data} • ${local}</span>
        </div>
      </div>
    `;
  }).join("");

  // Eventos de clique
  grid.querySelectorAll(".gallery-item").forEach(el=>{
    el.addEventListener("click", ()=> abrirModal(el.dataset.id));
    el.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        abrirModal(el.dataset.id);
      }
    });
  });
}

// ---------- MODAL ----------
function abrirModal(id){
  const cap = capturas.find(c=> c.id === id);
  if(!cap) return;
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

function fecharModal(){
  const modal = document.getElementById("gallery-modal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// ---------- FILTROS ----------
function initFiltros(){
  document.querySelectorAll(".filter-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      filtroAtivo = btn.dataset.filter;
      renderizarGaleria();
    });
  });
}

// ---------- API PÚBLICA (para o jogo adicionar capturas) ----------
/**
 * Adiciona uma nova captura à galeria.
 * O jogo chama esta função quando o jogador tira um screenshot.
 * 
 * Exemplo:
 *   addCapture({
 *     src: "data:image/png;base64,...",  // ou "img/capturas/nova.jpg"
 *     categoria: "missao",
 *     titulo_pt: "Descoberta de vida",
 *     titulo_en: "Discovery of life",
 *     desc_pt: "...",
 *     desc_en: "...",
 *     local_pt: "Planeta X",
 *     local_en: "Planet X"
 *   });
 */
function addCapture(cap){
  try{
    const lista = JSON.parse(localStorage.getItem("astronavega-galeria") || "[]");
    const nova = {
      id: "cap-" + Date.now() + "-" + Math.random().toString(36).slice(2,8),
      data: new Date().toISOString().slice(0,10),
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
  }catch(e){
    console.error("Erro ao guardar captura:", e);
    return null;
  }
}

/**
 * Remove uma captura da galeria (só as guardadas pelo jogo).
 */
function removeCapture(id){
  try{
    const lista = JSON.parse(localStorage.getItem("astronavega-galeria") || "[]");
    const nova = lista.filter(c => c.id !== id);
    localStorage.setItem("astronavega-galeria", JSON.stringify(nova));
  }catch(e){
    console.error("Erro ao remover captura:", e);
  }
}

// ---------- INICIALIZAÇÃO ----------
function initGaleria(){
  carregarCapturas();
  initFiltros();
  renderizarGaleria();

  // Fechar modal
  const closeBtn = document.getElementById("modal-close");
  const modal = document.getElementById("gallery-modal");
  if(closeBtn) closeBtn.addEventListener("click", fecharModal);
  if(modal) modal.addEventListener("click", (e)=>{
    if(e.target === modal) fecharModal();
  });
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") fecharModal();
  });

  // Re-renderizar quando muda de idioma
  document.addEventListener("languageChanged", renderizarGaleria);
}

// Expor API pública
window.addCapture = addCapture;
window.removeCapture = removeCapture;
window.initGaleria = initGaleria;