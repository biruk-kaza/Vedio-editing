# 🎙️ EOTC Voice Studio

**Transform your Amharic voice recordings into stunning TikTok/Reels-ready vertical videos — 100% free, powered by GitHub Actions.**

A production-grade pipeline that takes your personal Ethiopian Orthodox Tewahedo Church voice recording and automatically generates cinematic 9:16 vertical videos (1080×1920) with beautiful animated captions perfectly synced to your voice.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🎤 **Amharic Transcription** | OpenAI Whisper (small model) with word-level timestamps |
| 📝 **Human Review** | Editable `captions_review.txt` for fixing Amharic errors |
| 🎬 **Cinematic Video** | 9:16 vertical, Ken Burns zoom, vignette, color grading |
| ✝️ **EOTC Design** | Dark gradient + gold Ethiopian Orthodox cross patterns |
| 💬 **Animated Captions** | TikTok-style word-by-word gold highlighting |
| 📱 **Telegram Delivery** | Auto-send to your channel (optional) |
| 💰 **100% Free** | Runs entirely on GitHub Actions free tier |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR GITHUB REPO                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PHASE 1: Transcribe (Auto on push)                        │
│  ┌──────────┐    ┌─────────┐    ┌──────────────────┐       │
│  │ input/   │───▶│ Whisper │───▶│ captions.json    │       │
│  │ voice.mp3│    │ (small) │    │ captions_review  │       │
│  └──────────┘    └─────────┘    └──────────────────┘       │
│                                        │                    │
│                               ✏️ YOU REVIEW & FIX           │
│                                        │                    │
│  PHASE 2: Render (Manual trigger)      ▼                    │
│  ┌──────────────┐    ┌─────────┐    ┌──────────────┐       │
│  │ background   │───▶│ FFmpeg  │───▶│ output/      │       │
│  │ + captions   │    │ render  │    │ tiktok_ready │       │
│  │ + audio      │    │         │    │   .mp4       │       │
│  └──────────────┘    └─────────┘    └──────────────┘       │
│                                           │                 │
│                                    📱 Telegram (optional)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Step 1: Create Your GitHub Repository

1. Create a new GitHub repository
2. Clone it locally
3. Copy all files from this project into the repo
4. Push to GitHub:

```bash
git add .
git commit -m "🎙️ Initialize EOTC Voice Studio"
git push origin main
```

### Step 2: Upload Your Voice Recording (Phase 1)

1. Place your Amharic audio file (`.mp3`, `.wav`, or `.ogg`) in the `input/` folder
2. Commit and push:

```bash
cp your-recording.mp3 input/
git add input/
git commit -m "🎤 Add voice recording"
git push
```

3. Go to your repo's **Actions** tab — the "Transcribe" workflow will start automatically
4. Wait ~5-10 minutes for Whisper to process your audio
5. The bot will commit `captions.json` and `captions_review.txt` back to the repo

### Step 3: Review & Fix Captions

1. Pull the changes: `git pull`
2. Open `captions_review.txt` in any text editor
3. Fix any Amharic transcription errors (keep the timestamp format intact!)
4. Push your corrections:

```bash
git add captions_review.txt
git commit -m "✏️ Fix Amharic captions"
git push
```

### Step 4: Render Your Video (Phase 2)

1. Go to your repo's **Actions** tab
2. Click **"🎬 Phase 2: Render TikTok Video"** in the left sidebar
3. Click **"Run workflow"**
4. Choose your options:
   - **Background style**: `gradient` (fast) or `puppeteer` (beautiful)
   - **Caption style**: `word-highlight`, `karaoke-fill`, or `fade-in`
   - **Quality**: `fast`, `high`, or `ultra`
5. Click **"Run workflow"** and wait ~10-15 minutes
6. Download your video from the **Artifacts** section!

---

## 📱 Optional: Telegram Auto-Delivery

To auto-send videos to your Telegram channel:

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Get your channel's Chat ID
3. Add these secrets to your GitHub repo (**Settings → Secrets → Actions**):
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `TELEGRAM_CHAT_ID`: Your channel ID (e.g., `-1001234567890`)

---

## 📁 Project Structure

```
eotc-voice-studio/
├── .github/workflows/
│   ├── transcribe.yml        # Phase 1: Auto-transcribe on push
│   └── render-video.yml      # Phase 2: Manual trigger to render
├── assets/
│   └── background.png        # EOTC background (auto-generated)
├── input/                    # Drop your .mp3 voice recordings here
├── output/                   # Final MP4 appears here
├── src/
│   ├── transcribe.js         # Caption loading & parsing logic
│   ├── render.js             # FFmpeg video composition
│   ├── captions.js           # ASS subtitle generator
│   ├── generate-background.js       # Puppeteer background gen
│   └── generate-background-ffmpeg.js # FFmpeg-only background gen
├── templates/
│   └── background.html       # Puppeteer HTML template
├── captions.json             # Auto-generated word timestamps
├── captions_review.txt       # Human-readable for review
├── package.json
├── .gitignore
└── README.md
```

---

## 🎨 Caption Styles

| Style | Description |
|-------|-------------|
| `word-highlight` | TikTok-style — each word glows gold when spoken, dims after |
| `karaoke-fill` | Karaoke-style — text fills in with gold color as you speak |
| `fade-in` | Words fade in one by one as they're spoken |

---

## 🎨 Design Aesthetic

- **Background**: Deep dark (#0a0a0f) with subtle gold (#D4A574) accents
- **Cross Patterns**: Faint Ethiopian Orthodox cross watermark
- **Captions**: Large, bold Noto Sans Ethiopic font
- **Active Word**: Bright gold with glow effect
- **Past Words**: Softer dimmed grey
- **Video Effects**: Ken Burns slow zoom, vignette, warm color grading

---

## ⚙️ Technical Details

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 (ES Modules) |
| Transcription | OpenAI Whisper (Python, `small` model) |
| Video Rendering | FFmpeg (system + fluent-ffmpeg) |
| Background Gen | Puppeteer or FFmpeg |
| Subtitles | ASS/SSA format |
| Font | Noto Sans Ethiopic |
| CI/CD | GitHub Actions (free tier) |

### Resource Usage
- **RAM**: Whisper small model needs ~3GB (fits in GitHub's 7GB)
- **Time**: Transcription ~5-10min, Rendering ~10-15min
- **Storage**: Output videos typically 5-30MB

---

## 🛠️ Troubleshooting

### Whisper transcription is inaccurate
- The `small` model works well for Amharic but isn't perfect
- Always review `captions_review.txt` and fix errors before rendering
- Speak clearly and minimize background noise in your recordings

### Video rendering fails
- Check the Actions log for FFmpeg errors
- Ensure your audio file isn't corrupted
- Try `fast` quality first to debug issues

### Font not rendering Amharic characters
- The workflow installs `fonts-noto-core` automatically
- If characters appear as boxes, check the font installation step in the log

### Video is too large for Telegram
- Telegram limit is 50MB
- Use `fast` quality preset for shorter videos
- Videos >50MB are still available as GitHub Actions artifacts

---

## 📜 License

MIT License — Built for the glory of the Ethiopian Orthodox Tewahedo Church.

---

> ✝️ *"ስብሐት ለእግዚአብሔር" — Glory be to God*
