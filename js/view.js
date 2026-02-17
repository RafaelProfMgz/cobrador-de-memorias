// js/view.js

export class GameView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // Inicializa a Aplicação Pixi (WebGL)
    // BackgroundAlpha 0 permite ver o CSS de fundo se quiser
    this.app = new PIXI.Application({
      width: 800,
      height: 400,
      backgroundAlpha: 0,
      antialias: true,
    });

    // O Canvas antigo (Context 2D) ainda está lá no HTML
    // Vamos adicionar o Canvas NOVO da Pixi por cima ou no lugar
    // Para testes, vamos deixar oculto ou preparado para troca
    this.app.view.id = "pixiCanvas";
    this.app.view.style.position = "absolute";
    this.app.view.style.top = "0";
    this.app.view.style.left = "0";
    this.app.view.style.pointerEvents = "none"; // Deixa cliques passarem por enquanto

    this.container.appendChild(this.app.view);

    // Cache de Sprites (para não recriar a cada frame)
    this.sprites = {};
  }

  // Carrega imagens antes do jogo começar
  async loadAssets() {
    // Exemplo: PIXI.Assets.add('player', 'assets/sprites/player.png');
    // await PIXI.Assets.load(['player']);
    console.log("Sistema Gráfico PixiJS iniciado.");
  }

  // Método para desenhar usando Pixi em vez de ctx.fillRect
  render(gameState, player) {
    // Futuramente, você moverá a lógica do 'draw()' do game.js para cá.
    // Exemplo:
    // if (!this.sprites.player) {
    //      cria sprite...
    // }
    // this.sprites.player.x = player.x;
    // this.sprites.player.y = player.y;
  }
}
