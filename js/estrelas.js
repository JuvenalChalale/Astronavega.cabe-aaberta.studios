/* =========================================================
   ESTRELAS.JS — Estrelas animadas + estrelas cadentes + paralaxe
   Uso: chamar initEstrelas() após DOM estar pronto
   ========================================================= */
function initEstrelas(){
  // ---------- ESTRELAS FIXAS ----------
  function makeStars(containerId, count, opts){
    const container = document.getElementById(containerId);
    if(!container) return;
    const frag = document.createDocumentFragment();
    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className = 'star' + (Math.random() < opts.twinkleChance ? ' twinkle' : '');
      const size = (Math.random() * (opts.maxSize - opts.minSize) + opts.minSize).toFixed(2);
      s.style.width = size + 'px'; s.style.height = size + 'px';
      s.style.left = (Math.random()*100) + '%'; s.style.top = (Math.random()*100) + '%';
      s.style.opacity = (Math.random()*0.6 + 0.3).toFixed(2);
      if(s.classList.contains('twinkle')){
        s.style.animationDelay = (Math.random()*3).toFixed(2) + 's';
        s.style.animationDuration = (2 + Math.random()*3).toFixed(2) + 's';
      }
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }
  makeStars('stars-far', 220, {minSize:0.5, maxSize:1.2, twinkleChance:0.12});
  makeStars('stars-mid', 100, {minSize:1.0, maxSize:1.9, twinkleChance:0.35});
  makeStars('stars-near', 55, {minSize:1.6, maxSize:2.8, twinkleChance:0.5});

  // ---------- ESTRELAS CADENTES ----------
  const shootContainer = document.getElementById('stars-shoot');
  if(shootContainer){
    function spawnShootingStar(){
      const s = document.createElement('div');
      s.className = 'shooting-star fire';
      s.style.left = (Math.random()*70 + 15) + '%';
      s.style.top = (Math.random()*35 + 5) + '%';
      const angleDeg = 145 + Math.random()*20;
      const dist = 220 + Math.random()*140;
      const rad = angleDeg * Math.PI / 180;
      s.style.setProperty('--dx', (Math.cos(rad)*dist).toFixed(1) + 'px');
      s.style.setProperty('--dy', (Math.sin(rad)*dist).toFixed(1) + 'px');
      s.style.setProperty('--angle', (angleDeg - 180) + 'deg');
      shootContainer.appendChild(s);
      s.addEventListener('animationend', ()=> s.remove());
    }
    (function schedule(){
      setTimeout(()=>{ spawnShootingStar(); schedule(); }, 3500 + Math.random()*6000);
    })();
  }

  // ---------- PARALAXE ----------
  const screen = document.getElementById('screen');
  const near = document.getElementById('stars-near');
  const ship = document.querySelector('.ship');
  if(screen && near){
    screen.addEventListener('mousemove', (e)=>{
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      near.style.transform = `translate(${x*10}px, ${y*10}px)`;
      if(ship){ ship.style.marginLeft = (x*8) + 'px'; ship.style.marginTop = (y*8) + 'px'; }
    });
  }
}