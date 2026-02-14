// js/levels.js
export const Levels = [
  {
    id: 1,
    title: "I. O Despertar",
    text: "Antes de sacrificar uma parte de si, responda à Entidade.",
    type: "platform",
    goal: { x: 750, y: 300, w: 30, h: 50 },
    // NOVO: Enigma
    riddle: {
      question: "Quanto mais você tira de mim, maior eu fico. O que eu sou?",
      options: ["O Medo", "Um Buraco", "A Escuridão"],
      answer: 1, // Índice da resposta certa (Buraco)
    },
    platforms: [
      { x: 0, y: 350, w: 800, h: 50 },
      { x: 300, y: 250, w: 100, h: 20 },
    ],
    coins: [{ x: 500, y: 200, r: 8, collected: false }],
    boxes: [{ x: 200, y: 300, w: 40, h: 40 }], // Caixa tutorial
  },
  {
    id: 2,
    title: "II. A Escolha",
    text: "Sua memória falha, mas sua lógica deve permanecer.",
    type: "platform",
    goal: { x: 750, y: 200, w: 30, h: 50 },
    riddle: {
      question:
        "Tenho cidades, mas não casas. Tenho montanhas, mas não árvores. Tenho água, mas não peixes. O que sou?",
      options: ["Um Mapa", "Um Sonho", "O Espelho"],
      answer: 0, // Mapa
    },
    platforms: [
      { x: 0, y: 350, w: 150, h: 50 },
      { x: 200, y: 350, w: 600, h: 50 },
      { x: 200, y: 250, w: 100, h: 20 },
    ],
    boxes: [{ x: 50, y: 300, w: 40, h: 40 }],
    doors: [{ x: 700, y: 200, w: 20, h: 150, id: 1, open: false }],
    buttons: [{ x: 300, y: 340, w: 30, h: 10, id: 1, pressed: false }],
  },
  {
    id: 3,
    title: "III. O Vazio",
    text: "A última barreira antes do esquecimento.",
    type: "platform",
    goal: { x: 750, y: 50, w: 30, h: 50 },
    riddle: {
      question:
        "O que pertence a você, mas as outras pessoas usam mais do que você?",
      options: ["Seu Dinheiro", "Sua Paciência", "Seu Nome"],
      answer: 2, // Nome
    },
    platforms: [
      { x: 0, y: 350, w: 800, h: 50 },
      { x: 300, y: 200, w: 200, h: 20 }, // Plataforma central
      { x: 600, y: 100, w: 100, h: 20 }, // Perto da saída
    ],
    phaseBlocks: [
      { x: 100, y: 250, w: 80, h: 20, type: "no_color" }, // Atalho secreto
    ],
    coins: [{ x: 400, y: 150, r: 8, collected: false }],
  },
  {
    id: 4,
    title: "IV. A Tranca Final",
    text: "Sem charadas. Apenas fios.",
    type: "puzzle",
    // Sem enigma aqui, direto para bomba
  },
  {
    id: 5,
    title: "FIM",
    type: "ending",
    platforms: [{ x: 0, y: 350, w: 800, h: 50 }],
    goal: { x: 750, y: 300, w: 30, h: 50 },
  },
];
