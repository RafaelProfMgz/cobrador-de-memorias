# 🕯️ O Cobrador de Memórias

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Language](<https://img.shields.io/badge/Linguagem-JavaScript_(ES6)-f7df1e>)
![License](https://img.shields.io/badge/License-MIT-green)

> **"Em jogos, evolução geralmente significa poder. Aqui, evolução significa ausência."**

**O Cobrador de Memórias** é um experimento de _ludonarrativa_ em formato de jogo 2D, com atmosfera inspirada em horror cósmico. A proposta inverte a lógica tradicional dos Metroidvanias: **em vez de ganhar habilidades (_power-ups_) para progredir, você deve vender fragmentos de si mesmo para pagar o pedágio.**

---

## 🎮 O Conceito & O Dilema

Você não fica mais forte. Você se adapta à própria mutilação mecânica.

Imagine chegar a uma fase repleta de abismos verticais, apenas para perceber que, para destrancar a porta de entrada, você teve que vender a habilidade de **Pulo Duplo**. Ou enfrentar um quebra-cabeça baseado em cores (cortar o fio azul) logo após ter negociado sua **Visão Cromática** com a Entidade.

Cada escolha altera a experiência de gameplay, a interface e a resolução de puzzles de forma irreversível.

---

## 🗺️ Roadmap de Desenvolvimento

Este projeto segue a filosofia **Build in Public**. Abaixo, o mapa de atualizações técnicas e narrativas:

### ✅ Fase 1: O Núcleo Lógico (Concluído)

_Foco: Arquitetura, Física Customizada e Lógica de Sacrifício._

- [x] Game Loop e Time Step.
- [x] Engine de Física AABB (Plataformas, Colisões, Gravidade).
- [x] Sistema de Estado Global (Gerenciamento de Habilidades perdidas).
- [ ] Lógica de Puzzles Contextuais (Botões, Portas, Blocos de Fase).
- [ ] Enigmas de Texto (Riddles) antes do sacrifício.

### 🚧 Fase 2: A Vida Visual & Audio (Atual)

_Foco: Migração para WebGL e Design de Som._

- [x] Sistema de Áudio (Web Audio API) com trilha dinâmica e SFX.
- [ ] Integração da **PixiJS** para renderização de sprites.
- [ ] Substituição dos "quadrados" (`ctx.fillRect`) por assets artísticos.
- [ ] Efeitos de partículas e feedback visual (Juice).
- [ ] Iluminação dinâmica para fases escuras.

### 📅 Fase 3: Expansão de Conteúdo

_Foco: Level Design e Complexidade._

- [ ] 10 Níveis com dificuldade progressiva.
- [ ] Novas mecânicas (Gravidade invertida, Espelhos da realidade).
- [ ] Sistema de Save/Load local (LocalStorage).

### 📅 Fase 4: Lançamento

- [ ] Menu Principal, Créditos e Configurações.
- [ ] Otimização e Deploy no **Itch.io**.

---

## 🛠️ Stack Tecnológica

O projeto evita engines pesadas (como Unity/Godot) propositalmente para explorar engenharia de software pura.

- **Core:** JavaScript (ES6 Modules) - Arquitetura própria.
- **Renderização:** HTML5 Canvas API (Migrando para PixiJS/WebGL).
- **Áudio:** Web Audio API (Sintetização e Buffer Loader).
- **Interface:** HTML/CSS sobreposto com animações via **GSAP**.
- **Controle de Versão:** Git & GitHub.

---

## 🚀 Como Rodar o Projeto

Como o projeto utiliza Módulos ES6 (`import`/`export`), ele precisa rodar em um servidor local (apenas abrir o arquivo não funcionará devido a políticas de CORS).

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/RafaelProfMgz/stick_test.git
    cd stick_test
    ```

2.  **Rode o servidor local:**
    - **Opção A (VS Code):** Instale a extensão "Live Server", clique com botão direito no `index.html` e escolha "Open with Live Server".
    - **Opção B (Python):**
      ```bash
      python -m http.server
      ```
    - **Opção C (Node):**
      ```bash
      npx http-server
      ```

3.  Acesse `http://localhost:8000` (ou a porta indicada).

---

## 🤝 Contribuições

Este é um laboratório aberto. Sugestões são bem-vindas nas seguintes áreas:

- Novas mecânicas de "punição" criativa.
- Otimização de Render Loop.
- Ideias de narrativa emergente.

Sinta-se à vontade para abrir uma **Issue** ou enviar um **Pull Request**.

---

<p align="center">
  <i>"Quanto mais você tira de mim, maior eu fico. O que eu sou?"</i>
K</p>
