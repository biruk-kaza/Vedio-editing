# 🎬 EOTC Voice Studio v2.0

> **World-class Amharic voice-to-video pipeline** powered by Whisper + Remotion, running on GitHub Actions.

Transforms raw Amharic voiceover audio into cinematic 9:16 vertical videos with animated motion graphics, word-level caption animations, and EOTC-themed design — fully automated.

---

## ✨ What It Produces

| Feature | Description |
|---------|-------------|
| 🎨 **Animated Background** | Cinematic gradient with drifting color orbs, film grain, vignette |
| ✦ **Light Rays** | Volumetric god-ray effect with slow rotation |
| ✝️ **Cross Watermark** | Subtle rotating Ethiopian Orthodox cross |
| ✨ **Particle Field** | 45 floating golden particles with twinkle |
| 📝 **Animated Captions** | Word-by-word spring animations, golden glow on active word |
| 🎬 **Intro Sequence** | Cinematic fade-from-black with cross + title |
| 🔚 **Outro Sequence** | Branded closing card with Amharic tagline |
| 🎵 **Audio Sync** | Voiceover perfectly synced to caption timing |

## 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| Transcription | OpenAI Whisper (Medium model) |
| Video Engine | **Remotion 4.0** (React → Video) |
| Motion Graphics | React components + Remotion springs |
| Rendering | Headless Chrome (frame-by-frame) |
| CI/CD | GitHub Actions |
| Output | 1080×1920 MP4 (TikTok/Reels ready) |

## 📁 Project Structure

```
├── src/
│   ├── index.jsx              # Remotion entry — registers compositions
│   ├── Video.jsx              # Main composition (layers all elements)
│   ├── components/
│   │   ├── AnimatedBackground.jsx   # Cinematic gradient + orbs
│   │   ├── ParticleField.jsx        # Golden floating particles
│   │   ├── LightRays.jsx           # Volumetric god-rays
│   │   ├── CrossWatermark.jsx      # SVG Orthodox cross
│   │   ├── CaptionOverlay.jsx      # Word-by-word animated captions
│   │   ├── IntroSequence.jsx       # Cinematic opening
│   │   └── OutroSequence.jsx       # Branded closing
│   ├── utils/
│   │   └── theme.js               # Design tokens (colors, fonts, timing)
│   └── transcribe.js             # Caption parser
├── render-entry.js               # CLI render script (used by CI)
├── remotion.config.js            # Remotion bundler config
├── package.json
├── public/                       # Static assets for Remotion
├── input/                        # Drop audio files here
├── output/                       # Rendered videos appear here
└── .github/workflows/
    ├── transcribe.yml            # Phase 1: Whisper transcription
    └── render-video.yml          # Phase 2: Remotion rendering
```

## 🚀 Two-Phase Pipeline

### Phase 1: Transcribe
1. Drop an audio file (`.mp3`, `.m4a`, `.wav`, etc.) into `input/`
2. Push to GitHub → **Transcribe workflow** auto-triggers
3. Whisper Medium generates word-level timestamps
4. `captions.json` and `captions_review.txt` are committed

### Phase 2: Render
1. Go to **Actions → Render Video (Remotion)**
2. Select quality (`fast` / `high` / `ultra`)
3. Remotion renders the cinematic video
4. Download from Artifacts or auto-receive via Telegram

## 🎨 Quality Presets

| Preset | CRF | Concurrency | Use Case |
|--------|-----|-------------|----------|
| `fast` | 28 | 4 threads | Quick preview |
| `high` | 18 | 2 threads | Production quality |
| `ultra` | 14 | 1 thread | Maximum quality |

## 🖥️ Local Development

```bash
# Install dependencies
npm install

# Open Remotion Studio (live preview)
npm run studio

# Render locally
npm run render -- --quality high --title "My Video"
```

## ⚙️ Configuration

All design tokens are in `src/utils/theme.js`:
- Background colors and gradients
- Gold accent palette
- Typography (Noto Sans Ethiopic + Inter)
- Caption sizing and animation timing
- Video dimensions and FPS

## 📱 Telegram Integration (Optional)

Set these GitHub Secrets for auto-delivery:
- `TELEGRAM_BOT_TOKEN` — your bot token from @BotFather
- `TELEGRAM_CHAT_ID` — target channel/group ID

---

**Built for the Ethiopian Orthodox Tewahedo Church** ✝️
