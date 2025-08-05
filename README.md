# Battleship

A classic Battleship game built using vanilla JavaScript, Webpack, and the Test-Driven Development (TDD) approach. This project is part of [The Odin Project](https://www.theodinproject.com) curriculum.

## Project Overview

In this game, two players take turns attempting to sink each other's fleet by guessing ship locations on a grid. This version supports single-player gameplay against a basic AI and emphasizes modular design, clean architecture, and testing best practices.

---

## Project Architecture

This project uses a **modular, feature-first architecture** with the following principles:

- Each module encapsulates **logic**, **DOM manipulation**, and its own **CSS**.
- A set of global styles are maintained via `base.css`, which imports shared styling files.
- Shared logic is abstracted into a `utils/` folder.
- Factory patterns are used where applicable (e.g., Ship, Gameboard).
- UI components are extracted into a `components/` folder if reused in multiple places.

### File Structure

```
└── 📁src
    └── 📁components
        ├── button.js
        ├── modal.js
    └── 📁modules
        └── 📁game
            ├── game.js
        └── 📁gameboard
            ├── gameboard.css
            ├── gameboard.js
        └── 📁player
            ├── player.js
        └── 📁ship
            ├── ship.css
            ├── ship.js
    └── 📁styles
        ├── base.css
        ├── layout.css
        ├── reset.css
        ├── responsive.css
        ├── variables.css
    └── 📁utils
        ├── constants.js
        ├── dom.js
        ├── validation.js
    ├── index.js
    └── template.html
```

---

## Testing

All logic is developed using a Test-Driven Development (TDD) approach with **Jest**. Test files are located in the `/tests` directory and mirror the structure of the source modules.

Run all tests:
```bash
npm test
```

Run in watch mode:
```bash
npm test -- --watch
```

---

## Setup & Usage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/top-battleship.git
cd top-battleship
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

---

## Deployment

This project can be easily deployed using GitHub Pages, Netlify, or any static hosting provider. To deploy manually, upload the contents of the `/dist` folder to your hosting provider.

---

## Credits

- [The Odin Project](https://www.theodinproject.com)
- Battleship game design inspired by classic board game

---

## License

This project is open source and available under the [MIT License](LICENSE).