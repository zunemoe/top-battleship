# Battleship Project Checklist

A step-by-step development roadmap using TDD, modular architecture, and Webpack.

---

## Initial Setup

- [x] Initialize project with `npm init -y`
- [x] Install Webpack, Babel, and Jest
- [x] Configure `webpack.config.js` with Babel and CSS loaders
- [x] Configure Babel (`.babelrc` or inline)
- [x] Set up Jest (`babel-jest` transform)
- [x] Create initial folder structure
- [x] Create placeholder test file and run first test

---

## Base Architecture Setup

- [x] Create `src/styles/` folder with:
  - [x] `variables.css`
  - [x] `layout.css`
  - [x] `responsive.css`
  - [x] `reset.css`
  - [x] `base.css` (to import the above)
- [x] Set up `utils/` folder with:
  - [x] `dom.js`
  - [x] `constants.js`
  - [x] `validation.js`
- [x] Set up `modules/` with:
  - [x] `ship/ship.js` + `ship.css`
  - [x] `gameboard/`
  - [x] `player/`
  - [x] `game/`
- [x] Create `components/` folder (optional for reusable UI)

---

## TDD Module Development

### Ship Module
- [x] Write tests for ship creation
- [x] Implement `Ship` factory function
- [x] Add styles in `ship.css`

### Gameboard Module
- [x] Write tests for placing ships and receiving attacks
- [x] Implement Gameboard logic
- [x] Add styles in `gameboard.css`

### Player Module
- [x] Write tests for player actions
- [x] Implement Player factory (human/computer)
- [x] Add styles in `player.css`

### Game Logic
- [x] Write integration tests for game flow
- [x] Implement core game loop
- [x] Style game screen

---

## Misc

- [x] Import global styles in `index.js`
- [x] Hook up DOM elements to JS modules
- [x] Add favicon and title to HTML
- [ ] Configure deployment (optional)

---

## Final Tasks

- [x] Polish UI
- [x] Final testing
- [x] Code cleanup
- [x] Write README with architecture and instructions