/* =========================================================
   MUSICA.JS — Sistema de música personalizada
   Uso: MUSIC_FILE com o caminho, e o botão #audio-toggle no HTML
   ========================================================= */
const MUSIC_FILE = "audio/audio-game.mp3";
const MUSIC_VOLUME = 0.75;

let musicAudio = null;
let isPlaying = false;

function initMusica(){
  const toggleBtn = document.getElementById('audio-toggle');
  if(!toggleBtn) return;

  musicAudio = new Audio(MUSIC_FILE);
  musicAudio.loop = true;
  musicAudio.volume = MUSIC_VOLUME;
  musicAudio.preload = "auto";
  musicAudio.addEventListener('error', ()=> {
    console.warn("⚠️ Música não encontrada:", MUSIC_FILE);
  });

  function startMusic(){
    if(!musicAudio) initMusica();
    const p = musicAudio.play();
    if(p !== undefined){
      p.then(()=>{
        isPlaying = true;
        toggleBtn.classList.add('playing');
        toggleBtn.setAttribute('aria-pressed', 'true');
      }).catch(()=>{});
    }
  }

  function stopMusic(){
    if(musicAudio){ musicAudio.pause(); musicAudio.currentTime = 0; }
    isPlaying = false;
    toggleBtn.classList.remove('playing');
    toggleBtn.setAttribute('aria-pressed', 'false');
  }

  toggleBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(isPlaying){ stopMusic(); } else { startMusic(); }
  });

  // Autoplay no primeiro clique do utilizador
  document.addEventListener('click', function firstClick(){
    if(!isPlaying){ startMusic(); }
    document.removeEventListener('click', firstClick);
  }, { once:true });
}