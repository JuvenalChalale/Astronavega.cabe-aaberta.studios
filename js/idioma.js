/* =========================================================
   IDIOMA.JS — Sistema PT / EN partilhado
   Uso: adicionar data-pt="Texto" data-en="Text" nos elementos
   ========================================================= */
(function(){
  let lang = localStorage.getItem('astronavega-lang') || 'pt';

  function applyLang(newLang){
  lang = newLang;
  localStorage.setItem('astronavega-lang', lang);
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  document.querySelectorAll('[data-pt][data-en]').forEach(el=>{
    const txt = lang === 'pt' ? el.getAttribute('data-pt') : el.getAttribute('data-en');
    if(el.hasAttribute('placeholder')){
      el.setAttribute('placeholder', txt);
    } else {
      el.textContent = txt;
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // NOVO: dispara evento para quem quiser reagir
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

  window.setLanguage = applyLang;
  window.getLanguage = ()=> lang;

  document.addEventListener('DOMContentLoaded', ()=>{
    applyLang(lang);
    document.querySelectorAll('.lang-btn').forEach(btn=>{
      btn.addEventListener('click', ()=> applyLang(btn.dataset.lang));
    });
  });
})();