import { GameState } from "./state.js";
import { AudioSystem } from "./audio.js";

export const UI = {
  // Cache dos elementos do DOM para acesso rápido
  elements: {
    // Layers e Texto
    layer: document.getElementById("ui-layer"),
    title: document.getElementById("ui-title"),
    text: document.getElementById("ui-text"),
    choices: document.getElementById("choices-container"),
    btn: document.getElementById("action-btn"),

    // Riddles (Enigmas de Texto)
    riddleContainer: document.getElementById("riddle-container"),
    riddleOptions: document.getElementById("riddle-options"),
    riddleFeedback: document.getElementById("riddle-feedback"),

    // Puzzle (Fios)
    puzzle: document.getElementById("puzzle-container"),
    wiresBox: document.getElementById("wires-box"),
    puzzleMsg: document.getElementById("puzzle-msg"),

    // Menu de Pausa
    pauseMenu: document.getElementById("pause-menu"),
    menuBtn: document.getElementById("menu-btn"),
    resumeBtn: document.getElementById("resume-btn"),
    restartLevelBtn: document.getElementById("restart-level-btn"),
    resetGameBtn: document.getElementById("reset-game-btn"),
  },

  // --- CONFIGURAÇÃO DO MENU DE PAUSA ---
  setupPauseMenu(callbacks) {
    const toggleMenu = () => {
      // Só alterna o menu se o jogo estiver rodando ou já estiver pausado
      // Evita abrir menu em cima de menus narrativos
      if (GameState.isGameActive || GameState.isPaused) {
        GameState.isPaused = !GameState.isPaused;

        if (GameState.isPaused) {
          this.elements.pauseMenu.classList.remove("hidden");
          AudioSystem.playSfx("push"); // Som suave ao abrir
        } else {
          this.elements.pauseMenu.classList.add("hidden");
        }
      }
    };

    // Eventos
    this.elements.menuBtn.onclick = toggleMenu;
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape") toggleMenu();
    });

    this.elements.resumeBtn.onclick = toggleMenu;

    this.elements.restartLevelBtn.onclick = () => {
      toggleMenu();
      callbacks.onRestartLevel();
    };

    this.elements.resetGameBtn.onclick = () => {
      if (confirm("Todo o progresso será perdido. Deseja continuar?")) {
        location.reload();
      }
    };
  },

  // --- SISTEMA DE ENIGMAS (RIDDLE) ---
  showRiddle(riddleData, onSolved) {
    this.resetUI();
    this.elements.layer.classList.remove("hidden");

    this.elements.title.innerText = "ENIGMA DO GUARDIÃO";
    this.elements.text.innerText = riddleData.question;
    this.elements.riddleContainer.classList.remove("hidden");

    this.elements.riddleOptions.innerHTML = "";
    this.elements.riddleFeedback.innerText = "";

    riddleData.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.innerText = opt;

      btn.onclick = () => {
        if (index === riddleData.answer) {
          // Resposta Correta
          AudioSystem.playSfx("win");
          this.elements.riddleFeedback.style.color = "#5f5";
          this.elements.riddleFeedback.innerText = "SABEDORIA RECONHECIDA.";

          // Trava botões para não clicar de novo
          Array.from(this.elements.riddleOptions.children).forEach(
            (b) => (b.disabled = true),
          );

          setTimeout(() => {
            this.elements.riddleContainer.classList.add("hidden");
            onSolved(); // Avança para a tela de sacrifício
          }, 1500);
        } else {
          // Resposta Errada
          AudioSystem.playSfx("explode"); // Som de erro
          this.elements.riddleFeedback.style.color = "#f55";
          this.elements.riddleFeedback.innerText = "RESPOSTA INCORRETA.";

          // Efeito visual de tremor
          const container = document.getElementById("game-container");
          container.classList.remove("shake");
          void container.offsetWidth; // Trigger reflow para reiniciar animação
          container.classList.add("shake");
        }
      };
      this.elements.riddleOptions.appendChild(btn);
    });
  },

  // --- SISTEMA DE NARRATIVA E SACRIFÍCIO ---
  showNarrative(levelData, onStartLevel) {
    this.resetUI();
    this.elements.layer.classList.remove("hidden");

    this.elements.title.innerText = levelData.title;
    this.elements.text.innerHTML = levelData.text;

    // Se for fase final (Ending), apenas mostra botão de continuar
    if (levelData.type === "ending") {
      this.showContinueBtn("Finalizar Jornada", onStartLevel);
      return;
    }

    // Gera opções de sacrifício baseadas no que o player AINDA TEM
    const options = [
      { id: "color", label: "Visão (Cores)" },
      { id: "run", label: "Pressa (Correr)" },
      { id: "doubleJump", label: "Impulso (Pulo Alto)" },
    ];

    let hasChoices = false;

    options.forEach((opt) => {
      if (GameState.abilities[opt.id]) {
        // Só mostra se tiver a habilidade
        hasChoices = true;
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = `Entregar: ${opt.label}`;

        btn.onclick = () => {
          GameState.sacrifice(opt.id);
          AudioSystem.playSfx("explode"); // Som dramático
          this.elements.text.innerHTML = `Você entregou <span style="color:#f55">${opt.label}</span>.<br>A Entidade aceita o pagamento.`;
          this.elements.choices.innerHTML = ""; // Remove botões
          this.showContinueBtn("Entrar na Fase", onStartLevel);
        };
        this.elements.choices.appendChild(btn);
      }
    });

    // Caso o jogador não tenha mais nada para vender
    if (!hasChoices) {
      this.elements.text.innerHTML +=
        "<br><br><em style='color:#aaa'>Você não tem mais nada a oferecer. A Entidade permite sua passagem por piedade.</em>";
      this.showContinueBtn("Avançar", onStartLevel);
    }
  },

  // --- A LOJA (MERCADOR) ---
  showShop(onNext) {
    this.resetUI();
    this.elements.layer.classList.remove("hidden");

    this.elements.title.innerText = "O MERCADOR DE FRAGMENTOS";
    // Mostra moedas com cor dourada
    this.updateShopText();

    this.renderShopButtons(onNext);
    this.showContinueBtn("Continuar Jornada", onNext);
  },

  // Auxiliar para renderizar botões da loja (necessário recriar ao comprar para atualizar estado)
  renderShopButtons(onNext) {
    this.elements.choices.innerHTML = "";

    const lostAbilities = [
      { id: "color", label: "Visão das Cores" },
      { id: "run", label: "Capacidade de Correr" },
      { id: "doubleJump", label: "Pulo Alto" },
    ];

    lostAbilities.forEach((opt) => {
      // Se NÃO tem a habilidade, pode comprar de volta
      if (!GameState.abilities[opt.id]) {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = `Recuperar ${opt.label} (3 Frags)`;

        if (GameState.coins < 3) {
          btn.disabled = true;
          btn.style.opacity = "0.5";
          btn.style.cursor = "not-allowed";
        } else {
          btn.onclick = () => {
            const success = GameState.recover(opt.id, 3);
            if (success) {
              AudioSystem.playSfx("coin"); // Som de compra
              this.updateShopText();
              this.renderShopButtons(onNext); // Atualiza botões
            }
          };
        }
        this.elements.choices.appendChild(btn);
      }
    });
  },

  updateShopText() {
    this.elements.text.innerHTML = `Saldo: <span style="color:#ffd700; font-size:1.2em; font-weight:bold">${GameState.coins}</span> Fragmentos.<br>Deseja recuperar alguma memória perdida?`;
  },

  // --- PUZZLE DE FIOS ---
  showPuzzle(onSuccess, onFail) {
    this.resetUI();
    this.elements.layer.classList.remove("hidden");
    this.elements.puzzle.classList.remove("hidden");

    this.elements.title.innerText = "SISTEMA DE SEGURANÇA";

    // Verifica se o jogador está "daltônico"
    if (!GameState.abilities.color) {
      this.elements.puzzleMsg.innerHTML =
        "<span style='color:#f55; font-weight:bold'>ERRO DE VISOR:</span> CORES NÃO DETECTADAS.<br>O fio azul é a saída. Você terá que arriscar.";
    } else {
      this.elements.puzzleMsg.innerHTML =
        "Sistemas online.<br>Corte o fio <span style='color:#55f; font-weight:bold'>AZUL</span> para desativar a bomba.";
    }

    // Limpa fios antigos
    this.elements.wiresBox.innerHTML = "";

    // Cria fios aleatórios
    const wires = [
      { color: "red", valid: false },
      { color: "blue", valid: true }, // Fio correto
      { color: "green", valid: false },
    ].sort(() => Math.random() - 0.5); // Embaralha

    wires.forEach((w) => {
      const wireDiv = document.createElement("div");
      // Nota: .bg-red, .bg-blue são definidos no CSS
      // Se o body tiver filter:grayscale, as cores visuais aqui ficarão cinzas automaticamente
      wireDiv.className = `wire bg-${w.color}`;

      wireDiv.onclick = () => {
        if (w.valid) {
          AudioSystem.playSfx("win");
          this.elements.puzzleMsg.innerHTML =
            "<span style='color:#5f5'>ACESSO PERMITIDO.</span>";
          onSuccess();
        } else {
          AudioSystem.playSfx("explode");
          onFail();
        }
      };
      this.elements.wiresBox.appendChild(wireDiv);
    });
  },

  // --- TELAS GERAIS ---
  showGameOver() {
    this.resetUI();
    this.elements.layer.classList.remove("hidden");

    this.elements.title.innerText = "FALHA CRÍTICA";
    this.elements.text.innerText = "A memória foi corrompida permanentemente.";

    this.elements.btn.innerText = "Tentar Novamente";
    this.elements.btn.classList.remove("hidden");
    this.elements.btn.onclick = () => location.reload();
  },

  showContinueBtn(text, callback) {
    this.elements.btn.innerText = text;
    this.elements.btn.classList.remove("hidden");
    this.elements.btn.onclick = () => {
      AudioSystem.playSfx("push"); // Feedback tátil
      // Garante que o contexto de áudio esteja rodando (política de autoplay)
      AudioSystem.resume();
      callback();
    };
  },

  // Limpa a tela para o próximo estado
  resetUI() {
    this.elements.layer.classList.add("hidden"); // Esconde overlay

    // Esconde sub-paineis
    this.elements.puzzle.classList.add("hidden");
    this.elements.riddleContainer.classList.add("hidden");
    this.elements.btn.classList.add("hidden");

    // Limpa conteúdo
    this.elements.choices.innerHTML = "";
    this.elements.text.innerText = "";
    this.elements.riddleFeedback.innerText = "";
    this.elements.wiresBox.innerHTML = "";
  },

  hide() {
    this.elements.layer.classList.add("hidden");
  },
};
