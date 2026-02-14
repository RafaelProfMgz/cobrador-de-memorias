// js/main.js
import { Game } from "./game.js";
import { AudioSystem } from "./audio.js";

window.onload = async () => {
  // 1. Inicializa Audio Context (Pode estar suspenso até clique)
  AudioSystem.init();

  // 2. Tela de Carregando (Opcional visualmente)
  const container = document.getElementById("game-container");
  const loadingText = document.createElement("div");
  loadingText.innerText = "Carregando Memórias Áudiais...";
  loadingText.style =
    "position:absolute; bottom:10px; right:10px; color:#666; font-size:12px;";
  container.appendChild(loadingText);

  // 3. Carregar arquivos REAIS
  await Promise.all([
    AudioSystem.loadTrack("theme", "assets/music/theme.mp3"),
    AudioSystem.loadTrack("tension", "assets/music/tension.mp3"),
    AudioSystem.loadTrack("ending", "assets/music/ending.mp3"),
  ]);

  loadingText.remove();
  console.log("Todas as músicas carregadas.");

  // 4. Iniciar Jogo
  const game = new Game("gameCanvas");
  game.start();
};
