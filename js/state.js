export const GameState = {
  currentLevel: 0,
  isGameActive: false,
  coins: 0, // Novo sistema de moeda
  abilities: {
    color: true,
    run: true,
    doubleJump: true,
  },

  sacrifice(abilityId) {
    if (this.abilities[abilityId]) {
      this.abilities[abilityId] = false;
      if (abilityId === "color") {
        // Em vez de classe CSS, animamos o filtro via JS
        gsap.to("body", {
          duration: 3,
          filter: "grayscale(100%) contrast(1.2)",
          ease: "power2.inOut",
        });
      }
      return true;
    }
    return false;
  },

  // Nova função: Recuperar memória
  recover(abilityId, cost) {
    if (this.coins >= cost && !this.abilities[abilityId]) {
      this.coins -= cost;
      this.abilities[abilityId] = true;

      // Se recuperou a cor, remove o filtro cinza
      if (abilityId === "color") {
        // As cores voltam com um flash brilhante
        gsap.to("body", {
          duration: 0.1,
          filter: "brightness(200%) grayscale(0%)", // Flash de luz
          onComplete: () => {
            // Volta ao normal
            gsap.to("body", {
              duration: 2,
              filter: "brightness(100%) grayscale(0%)",
            });
          },
        });
      }
      return true;
    }
    return false;
  },

  addCoin() {
    this.coins++;
  },
};
