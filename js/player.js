import { GameState } from "./state.js";
import { Input } from "./input.js";
import { AudioSystem } from "./audio.js";

export class Player {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.reset();
  }

  reset() {
    this.x = 50;
    this.y = 200;
    this.w = 20;
    this.h = 20;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
  }

  /**
   * Atualiza a posição e interações do jogador
   * @param {Object} levelData - O objeto contendo todas as listas do nível (platforms, boxes, doors, etc)
   */
  update(levelData) {
    // --- 1. DEFINE STATUS BASEADO NAS MEMÓRIAS (SACRIFÍCIOS) ---

    // Se vendeu a "Pressa" (run), move devagar (2). Se tem, move rápido (5).
    const speed = GameState.abilities.run ? 5 : 2;

    // Se vendeu o "Impulso" (doubleJump), pula baixo (-6). Se tem, pula alto (-9).
    const jumpForce = GameState.abilities.doubleJump ? -9 : -6;

    // --- 2. INPUT DE MOVIMENTO ---

    // Horizontal
    if (Input.isDown("ArrowLeft") || Input.isDown("KeyA")) {
      this.vx = -speed;
    } else if (Input.isDown("ArrowRight") || Input.isDown("KeyD")) {
      this.vx = speed;
    } else {
      this.vx = 0;
    }

    // Pulo
    // Aceita Espaço, Seta Cima ou W
    if (
      (Input.isDown("Space") ||
        Input.isDown("ArrowUp") ||
        Input.isDown("KeyW")) &&
      this.grounded
    ) {
      this.vy = jumpForce;
      this.grounded = false;
      AudioSystem.playSfx("jump"); // Efeito sonoro
    }

    // --- 3. FÍSICA ---

    this.vy += 0.5; // Gravidade
    this.x += this.vx;
    this.y += this.vy;
    this.grounded = false; // Assume que está no ar até provar o contrário (colisão)

    // --- 4. COLISÕES ---

    // A. Plataformas Normais
    if (levelData.platforms) {
      this.checkPlatformCollisions(levelData.platforms);
    }

    // B. Portas (Tratadas como paredes se estiverem fechadas)
    if (levelData.doors) {
      const closedDoors = levelData.doors.filter((d) => !d.open);
      this.checkPlatformCollisions(closedDoors);
    }

    // C. Blocos de Fase (Phase Blocks) - Mecânica de "Visão"
    if (levelData.phaseBlocks) {
      // Filtra quais blocos são sólidos baseado na habilidade 'color'
      const activeBlocks = levelData.phaseBlocks.filter((b) => {
        // Tipo 'needs_color': Sólido apenas se o jogador TIVER a cor
        if (b.type === "needs_color") return GameState.abilities.color;

        // Tipo 'no_color': Sólido apenas se o jogador TIVER VENDIDO a cor (Invisível vira sólido)
        if (b.type === "no_color") return !GameState.abilities.color;

        return true;
      });
      this.checkPlatformCollisions(activeBlocks);
    }

    // D. Caixas (Empurrar)
    if (levelData.boxes) {
      this.checkBoxCollisions(levelData.boxes);
    }

    // E. Botões (Gatilhos)
    if (levelData.buttons) {
      this.checkButtonTriggers(levelData.buttons, levelData.doors);
    }

    // F. Moedas (Coleta)
    if (levelData.coins) {
      this.checkCoinCollisions(levelData.coins);
    }

    // G. Limites da Tela e Morte
    this.checkBoundaries();
  }

  /**
   * Colisão genérica AABB com resolução de penetração
   */
  checkPlatformCollisions(platforms) {
    platforms.forEach((plat) => {
      // Verifica se há sobreposição (AABB Check)
      if (
        this.x < plat.x + plat.w &&
        this.x + this.w > plat.x &&
        this.y < plat.y + plat.h &&
        this.y + this.h > plat.y
      ) {
        // Resolução de Colisão: Determina de onde veio o impacto

        // 1. Caindo de cima (Pés batendo no chão)
        // Verifica se no frame anterior o jogador estava acima da plataforma
        // Usa vy para "voltar no tempo" um pouco e checar
        if (this.vy > 0 && this.y + this.h - this.vy <= plat.y + 12) {
          this.grounded = true;
          this.vy = 0;
          this.y = plat.y - this.h; // Coloca perfeitamente em cima
        }
        // 2. Batendo a cabeça (Pulo)
        else if (this.vy < 0 && this.y - this.vy >= plat.y + plat.h - 12) {
          this.vy = 0;
          this.y = plat.y + plat.h; // Coloca perfeitamente abaixo
        }
        // 3. Colisão Lateral (Parede)
        else {
          if (this.vx > 0) {
            // Indo para direita
            this.x = plat.x - this.w;
          } else if (this.vx < 0) {
            // Indo para esquerda
            this.x = plat.x + plat.w;
          }
        }
      }
    });
  }

  /**
   * Colisão Específica com Caixas (Permite empurrar se tiver força)
   */
  checkBoxCollisions(boxes) {
    boxes.forEach((box) => {
      if (
        this.x < box.x + box.w &&
        this.x + this.w > box.x &&
        this.y < box.y + box.h &&
        this.y + this.h > box.y
      ) {
        // Colisão Vertical (Pular em cima da caixa funciona normal)
        if (this.vy > 0 && this.y + this.h - this.vy <= box.y + 10) {
          this.grounded = true;
          this.vy = 0;
          this.y = box.y - this.h;
          return;
        }

        // Colisão Horizontal (Tentativa de empurrar)
        // MECÂNICA: Só pode empurrar se tiver a habilidade "run" (Força)
        const canPush = GameState.abilities.run;

        if (canPush) {
          if (this.vx > 0 && this.x + this.w / 2 < box.x + box.w / 2) {
            box.x = this.x + this.w; // Move a caixa para direita
          } else if (this.vx < 0 && this.x + this.w / 2 > box.x + box.w / 2) {
            box.x = this.x - box.w; // Move a caixa para esquerda
          }

          // Efeito Sonoro de Arrastar (Evita tocar todo frame)
          if (this.vx !== 0 && Math.random() < 0.1) {
            AudioSystem.playSfx("push");
          }
        } else {
          // Sem habilidade, a caixa é uma parede imóvel
          if (this.vx > 0) this.x = box.x - this.w;
          else if (this.vx < 0) this.x = box.x + box.w;
        }
      }
    });
  }

  checkButtonTriggers(buttons, doors) {
    buttons.forEach((btn) => {
      // Verifica pisão no botão
      if (
        this.x < btn.x + btn.w &&
        this.x + this.w > btn.x &&
        this.y + this.h >= btn.y &&
        this.y + this.h <= btn.y + btn.h + 10
      ) {
        if (!btn.pressed) {
          btn.pressed = true;
          AudioSystem.playSfx("win"); // Som de ativação (bip agudo)

          // Abre a porta correspondente ao ID do botão
          if (doors) {
            doors.forEach((d) => {
              if (d.id === btn.id) d.open = true;
            });
          }
        }
      }
    });
  }

  checkCoinCollisions(coins) {
    coins.forEach((coin) => {
      if (coin.collected) return;

      // Colisão Circular (Player Center vs Coin Center)
      const dx = this.x + this.w / 2 - coin.x;
      const dy = this.y + this.h / 2 - coin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.w / 2 + coin.r) {
        coin.collected = true;
        GameState.addCoin();
        AudioSystem.playSfx("coin"); // Som "Plin"
      }
    });
  }

  checkBoundaries() {
    // Paredes laterais da tela
    if (this.x < 0) this.x = 0;
    if (this.x > this.gameWidth) this.x = this.gameWidth - this.w;

    // Buraco sem fundo (Morte)
    if (this.y > this.gameHeight) {
      AudioSystem.playSfx("explode"); // Som de queda
      this.reset(); // Reinicia posição no começo da fase
    }
  }

  draw(ctx) {
    // Se tem "Color", o jogador brilha (Laranja). Se não, é Cinza Morto.
    ctx.fillStyle = GameState.abilities.color ? "#ffaa00" : "#bbbbbb";
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Detalhe: Olhos indicando direção
    ctx.fillStyle = "#000";
    if (this.vx >= 0) {
      // Olhando direita
      ctx.fillRect(this.x + 12, this.y + 5, 4, 4);
    } else {
      // Olhando esquerda
      ctx.fillRect(this.x + 4, this.y + 5, 4, 4);
    }
  }
}
