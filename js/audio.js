// js/audio.js

export const AudioSystem = {
  ctx: null,
  musicGain: null, // Volume separado para Música
  sfxGain: null, // Volume separado para Efeitos

  // Armazena os arquivos carregados na memória
  tracks: {},
  currentTrackSource: null, // Fonte da música tocando agora
  currentTrackKey: null, // Nome da música atual
  isMuted: false,

  init() {
    if (!this.ctx) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Cria canais de volume separados
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      // Configura volumes iniciais (Música mais baixa para não atrapalhar)
      this.musicGain.gain.value = 0.4;
      this.sfxGain.gain.value = 0.6;

      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  // --- SISTEMA DE CARREGAMENTO (ASSETS) ---
  async loadTrack(key, url) {
    if (!this.ctx) this.init();

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.tracks[key] = audioBuffer;
      console.log(`Áudio carregado: ${key}`);
    } catch (error) {
      console.error(`Erro ao carregar música ${url}:`, error);
    }
  },

  // --- TOCADOR DE MÚSICA (BGM) ---
  playBGM(key) {
    if (this.isMuted || !this.tracks[key]) return;

    // Se a música já está tocando, não reinicia
    if (this.currentTrackKey === key) return;

    // Se tem outra música tocando, para ela (com fade out suave se quiser)
    this.stopBGM();

    // Cria nova fonte
    const source = this.ctx.createBufferSource();
    source.buffer = this.tracks[key];
    source.loop = true; // Loop infinito
    source.connect(this.musicGain);

    source.start(0);
    this.currentTrackSource = source;
    this.currentTrackKey = key;
  },

  stopBGM() {
    if (this.currentTrackSource) {
      // Poderia adicionar um fade-out aqui
      this.currentTrackSource.stop();
      this.currentTrackSource = null;
      this.currentTrackKey = null;
    }
  },

  setVolume(value) {
    // 0.0 a 1.0
    if (this.musicGain)
      this.musicGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.5);
  },

  // --- TOCADOR DE EFEITOS (SFX 8-BIT) ---
  // (Mantenha o código de sfx antigo, mas conecte ao this.sfxGain)
  playSfx(type) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // Importante: Conectar ao volume de SFX
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    const now = this.ctx.currentTime;

    // ... (Mesma lógica de sons osciladores que você já tem) ...
    if (type === "jump") {
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.1);
      gainNode.gain.setValueAtTime(0.5, now); // Ajustado volume relativo
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "coin") {
      // ... copie o resto dos seus SFX aqui ...
      osc.frequency.setValueAtTime(1200, now);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
    // ... adicione os outros (win, explode, push) ...
    else if (type === "explode") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === "win") {
      // ...
      // Para acordes, é complexo ligar aqui direto, simplifique
      this.playTone(440, 0.2, now);
    }
  },

  playTone(freq, dur, now) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.sfxGain);
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.2, now);
    g.gain.linearRampToValueAtTime(0, now + dur);
    o.start(now);
    o.stop(now + dur);
  },
};
