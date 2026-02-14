import { GameState } from "./state.js";
import { Levels } from "./levels.js";
import { Player } from "./player.js";
import { UI } from "./ui.js";
import { Input } from "./input.js";
import { AudioSystem } from "./audio.js";

export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    // Inicializa o jogador
    this.player = new Player(this.canvas.width, this.canvas.height);
    this.currentLevelIndex = 0;
  }

  start() {
    // Inicializa sistemas essenciais
    Input.init();
    // Nota: O AudioSystem.init() geralmente é chamado no clique inicial no main.js,
    // mas garantimos aqui caso o jogador reinicie.

    // Configura o Menu de Pausa
    UI.setupPauseMenu({
      onRestartLevel: () => {
        this.player.reset();
        this.reloadCurrentLevelData();
        GameState.isPaused = false;
      },
    });

    // Inicia a primeira fase
    this.startLevelSequence(0);
    this.loop();
  }

  // Reseta objetos interativos (botões e portas) ao reiniciar a fase
  reloadCurrentLevelData() {
    const lvl = Levels[this.currentLevelIndex];
    if (!lvl) return;

    if (lvl.buttons) lvl.buttons.forEach((b) => (b.pressed = false));
    if (lvl.doors) lvl.doors.forEach((d) => (d.open = false));
    // Nota: Caixas não voltam à posição original nesta implementação simples.
    // Se o jogador travar uma caixa, ele deve reiniciar a fase.
  }

  // Gerencia o fluxo complexo de início de fase
  startLevelSequence(index) {
    this.currentLevelIndex = index;
    const levelData = Levels[index];

    // Reset de Estados
    GameState.isPaused = false;
    GameState.isGameActive = false; // O jogo só ativa depois da narrativa
    this.player.reset();
    this.reloadCurrentLevelData();

    // --- CONTROLE DE MÚSICA (BGM) ---
    if (levelData.type === "puzzle") {
      AudioSystem.playBGM("tension"); // Música tensa para puzzles de bomba
    } else if (levelData.type === "ending") {
      AudioSystem.playBGM("ending"); // Música final
    } else {
      // Toca o tema padrão (evita reiniciar se já estiver tocando)
      AudioSystem.playBGM("theme");
    }

    // --- FLUXO DE TIPOS DE FASE ---

    // CASO 1: Fase de Puzzle (Bomba/Fios)
    if (levelData.type === "puzzle") {
      UI.showPuzzle(
        () => {
          // Sucesso
          setTimeout(() => this.finishLevel(), 1000);
        },
        () => {
          // Falha (Explosão)
          document.getElementById("game-container").classList.add("shake");
          setTimeout(() => UI.showGameOver(), 1000);
        },
      );
      return;
    }

    // CASO 2: Fase Final (Caminhada)
    if (levelData.type === "ending") {
      UI.showNarrative(levelData, () => {
        UI.hide();
        GameState.isGameActive = true;
      });
      return;
    }

    // CASO 3: Fase Normal (Plataforma)
    // Ordem: Enigma (Riddle) -> Sacrifício -> Jogo

    const startNarrative = () => {
      UI.showNarrative(levelData, () => {
        UI.hide();
        GameState.isGameActive = true;
      });
    };

    if (levelData.riddle) {
      // Mostra o enigma primeiro
      UI.showRiddle(levelData.riddle, () => {
        // Se acertar, vai para a narrativa de sacrifício
        startNarrative();
      });
    } else {
      // Se não tiver enigma, vai direto
      startNarrative();
    }
  }

  finishLevel() {
    GameState.isGameActive = false;
    AudioSystem.playSfx("coin"); // Som de sucesso ao passar de fase

    // Verifica se existe próxima fase
    if (Levels[this.currentLevelIndex + 1]) {
      // Abre a Loja do Mercador antes da próxima fase
      UI.showShop(() => {
        this.startLevelSequence(this.currentLevelIndex + 1);
      });
    } else {
      // Fim de Jogo (Zerou)
      UI.elements.title.innerText = "FIM DA JORNADA";
      UI.elements.text.innerHTML = `Você escapou com <b>${GameState.coins}</b> fragmentos de memória.<br>Obrigado por jogar.`;
      UI.elements.layer.classList.remove("hidden");

      // Esconde botões de ação e menu
      UI.elements.btn.classList.add("hidden");
      UI.elements.menuBtn.classList.add("hidden");
      UI.elements.puzzle.classList.add("hidden");
    }
  }

  update() {
    // Pausa total
    if (GameState.isPaused) return;

    // Se estiver em menu/loja/história, não atualiza física
    if (!GameState.isGameActive) return;

    const levelData = Levels[this.currentLevelIndex];

    // Atualiza Lógica do Jogador (passando todo o levelData para colisões complexas)
    if (levelData.type === "platform" || levelData.type === "ending") {
      this.player.update(levelData);

      // Checa Vitória (Colisão com Goal)
      const g = levelData.goal;
      if (
        this.player.x < g.x + g.w &&
        this.player.x + this.player.w > g.x &&
        this.player.y < g.y + g.h &&
        this.player.y + this.player.h > g.y
      ) {
        this.finishLevel();
      }
    }
  }

  draw() {
    // Limpa a tela
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const levelData = Levels[this.currentLevelIndex];
    if (!levelData) return;

    // Fundo (Simples cor escura)
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // --- DESENHAR ELEMENTOS DO JOGO NA ORDEM DE CAMADAS ---

    // 1. Botões (Ficam no fundo)
    if (levelData.buttons) {
      levelData.buttons.forEach((b) => {
        this.ctx.fillStyle = b.pressed ? "#00ff00" : "#ff0000";
        // Efeito visual de botão afundado
        const h = b.pressed ? 5 : b.h;
        const y = b.pressed ? b.y + (b.h - 5) : b.y;
        this.ctx.fillRect(b.x, y, b.w, h);
      });
    }

    // 2. Portas
    if (levelData.doors) {
      this.ctx.fillStyle = "#666";
      levelData.doors.forEach((d) => {
        if (!d.open) {
          this.ctx.fillRect(d.x, d.y, d.w, d.h);
          // Fechadura
          this.ctx.fillStyle = "#a00";
          this.ctx.fillRect(d.x + 5, d.y + d.h / 2 - 5, 10, 10);
          this.ctx.fillStyle = "#666"; // Reset cor
        } else {
          // Porta aberta (contorno)
          this.ctx.strokeStyle = "#333";
          this.ctx.strokeRect(d.x, d.y, d.w, d.h);
        }
      });
    }

    // 3. Blocos de Fase (Visíveis apenas sob certas condições de cor)
    if (levelData.phaseBlocks) {
      levelData.phaseBlocks.forEach((b) => {
        let isVisible = false;
        // Blocos que exigem TER a cor
        if (b.type === "needs_color" && GameState.abilities.color)
          isVisible = true;
        // Blocos que exigem PERDER a cor
        if (b.type === "no_color" && !GameState.abilities.color)
          isVisible = true;

        if (isVisible) {
          this.ctx.fillStyle =
            b.type === "needs_color"
              ? "rgba(80, 80, 255, 0.8)"
              : "rgba(200, 200, 200, 0.8)";
          this.ctx.fillRect(b.x, b.y, b.w, b.h);
          // Borda pontilhada
          this.ctx.setLineDash([4, 4]);
          this.ctx.strokeStyle = "#fff";
          this.ctx.strokeRect(b.x, b.y, b.w, b.h);
          this.ctx.setLineDash([]);
        }
      });
    }

    // 4. Plataformas Normais
    this.ctx.fillStyle = "#444";
    if (levelData.platforms) {
      levelData.platforms.forEach((p) => this.ctx.fillRect(p.x, p.y, p.w, p.h));
    }

    // 5. Caixas (Empurráveis)
    if (levelData.boxes) {
      this.ctx.fillStyle = "#8B4513"; // SaddleBrown
      levelData.boxes.forEach((b) => {
        this.ctx.fillRect(b.x, b.y, b.w, b.h);
        // Detalhe visual (X na caixa)
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#5e2f0d";
        this.ctx.moveTo(b.x, b.y);
        this.ctx.lineTo(b.x + b.w, b.y + b.h);
        this.ctx.moveTo(b.x + b.w, b.y);
        this.ctx.lineTo(b.x, b.y + b.h);
        this.ctx.stroke();
      });
    }

    // 6. Moedas
    if (levelData.coins) {
      levelData.coins.forEach((c) => {
        if (!c.collected) {
          this.ctx.fillStyle = "#FFD700";
          this.ctx.beginPath();
          this.ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          this.ctx.fill();
          // Brilho
          this.ctx.strokeStyle = "#fff";
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    }

    // 7. Objetivo Final (Portal/Luz)
    if (levelData.goal) {
      // Se o jogador estiver daltônico, o objetivo é cinza
      this.ctx.fillStyle = GameState.abilities.color ? "#00FF7F" : "#999";
      // Efeito de pulsação simples (usando tempo)
      const pulse = Math.sin(Date.now() / 200) * 2;
      this.ctx.fillRect(
        levelData.goal.x - pulse,
        levelData.goal.y - pulse,
        levelData.goal.w + pulse * 2,
        levelData.goal.h + pulse * 2,
      );
    }

    // 8. O Jogador
    this.player.draw(this.ctx);

    // --- HUD / INTERFACE IN-GAME ---

    // Texto de Moedas
    if (GameState.isGameActive) {
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "16px 'Courier Prime', monospace";
      this.ctx.fillText(`Fragmentos: ${GameState.coins}`, 20, 30);
    }

    // Tela Escurecida de Pausa
    if (GameState.isPaused) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
