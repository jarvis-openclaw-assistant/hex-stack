# ⬡ Hex Stack

A fast-paced hexagonal tile-matching puzzle game built with vanilla JavaScript, HTML5 Canvas, and Web Audio API.

![Hex Stack Screenshot](screenshot.png)

## 🎮 Play Now

**[Play Hex Stack Live](https://jarvis-openclaw-assistant.github.io/hex-stack/)**

## 🕹 How to Play

- **Click/tap** groups of 3+ same-colored hexagonal tiles to clear them
- New rows push up from the top over time — don't let the board fill up!
- Clear enough tiles to reach the **target score** and advance to the next level
- Build **combos** by clearing groups in quick succession for bonus points
- **Spacebar** or pause button to pause

## ✨ Features

- 🎯 **12 levels** with progressive difficulty
- 🎵 Procedural background music & 5+ sound effects via Web Audio API
- 🎨 Dark theme with vibrant hex colors and particle effects
- 📱 Fully responsive (375px to 2560px)
- 💾 Progress saved to localStorage
- ⚡ Instant load, no dependencies, <50KB total
- 🎮 2-5 minute sessions

## 🛠 Tech Stack

- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas
- Web Audio API
- CSS3 with animations
- No frameworks, no build tools, no dependencies

## 🚀 Run Locally

```bash
git clone https://github.com/jarvis-openclaw-assistant/hex-stack.git
cd hex-stack
# Serve with any static server:
python3 -m http.server 8000
# Open http://localhost:8000
```

## 📁 Project Structure

```
hex-stack/
├── index.html          # Single page app
├── css/style.css       # Dark theme styles
├── js/
│   ├── main.js         # Entry point & game loop
│   ├── game.js         # Hex grid, matching, physics
│   ├── audio.js        # Web Audio API music & SFX
│   ├── particles.js    # Particle effects
│   ├── ui.js           # Screens, HUD, transitions
│   ├── storage.js      # localStorage wrapper
│   ├── levels.js       # Level definitions
│   └── state.js        # Centralized state management
├── LICENSE             # MIT
└── README.md
```

## 📄 License

MIT — see [LICENSE](LICENSE)
