/* =========================================================
   MENU.JS — Lógica específica do menu principal
   ========================================================= */
function initMenu(){
  const btnStart = document.getElementById('btn-start');
  const btnQuit = document.getElementById('btn-quit');

  /* ============================================
     JOGAR — redireciona para a página do jogo
     >>> SUBSTITUI "jogo.html" PELO TEU LINK FINAL <<<
  ============================================ */
  if(btnStart){
    btnStart.addEventListener('click', ()=>{

      // Efeito visual rápido antes de sair
      document.body.animate(
        [
          { filter:'brightness(1)' },
          { filter:'brightness(1.8)' },
          { filter:'brightness(1)' }
        ],
        { duration:700, easing:'ease-out' }
      );

      setTimeout(()=>{
        window.location.href = 'https://erro444.netlify.app/';
      }, 350);

    });
  }

  /* ============================================
     SAIR — redireciona para o site da Cabeça Aberta
     >>> SUBSTITUI "#" PELO TEU LINK FINAL <<<
  ============================================ */
  if(btnQuit){
    btnQuit.addEventListener('click', ()=>{

      window.location.href = '#';

    });
  }
} 