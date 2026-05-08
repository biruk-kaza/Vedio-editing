# 📝 EOTC Voice Studio — Caption Format Guide

## The Two Ways to Provide Captions

You have **two options** for writing your captions. Both work for both systems (Kinetic Typography and Video Caption Overlay).

---

## ✅ Option A — `captions.json` (Recommended)

This is the main format. Each word needs a `start` and `end` time in **seconds**.

### File: `captions.json` (place in repo root)

```json
{
  "words": [
    { "word": "ሰላም",      "start": 0.0,  "end": 0.5  },
    { "word": "ዓለም",      "start": 0.6,  "end": 1.1  },
    { "word": "ወዳጆቼ",     "start": 1.2,  "end": 1.9  },
    { "word": "እንኳን",     "start": 2.1,  "end": 2.6  },
    { "word": "ደህና",      "start": 2.7,  "end": 3.2  },
    { "word": "ተቀበሉ",     "start": 3.3,  "end": 4.0  }
  ]
}
```

### Rules:
- `word` — the Amharic (or any language) word exactly as spoken
- `start` — when the word **begins** in seconds (decimal OK)
- `end` — when the word **ends** in seconds (decimal OK)
- Words must be in **chronological order** (sorted by start time)
- Gap between words is fine — silence is handled automatically

---

## ✅ Option B — `captions_review.txt` (Simpler Format)

If you prefer a more human-readable format, use this. Same rules, different layout.

### File: `captions_review.txt` (place in repo root)

```
[0.0 → 0.5] ሰላም
[0.6 → 1.1] ዓለም
[1.2 → 1.9] ወዳጆቼ
[2.1 → 2.6] እንኳን
[2.7 → 3.2] ደህና
[3.3 → 4.0] ተቀበሉ
[4.2 → 5.0] ማርያም
[5.1 → 6.0] ልደቷን
```

Format per line: `[START → END] WORD`

---

## 🌐 Option C — Paste URL in GitHub Actions

If you don't want to commit the file to the repo every time:

1. Upload your `captions.json` anywhere:
   - **GitHub Gist** (free, recommended)
   - Google Drive (get direct download link)
   - Pastebin or any raw JSON URL

2. In the GitHub Actions workflow input, paste the URL into the **"captions_url"** field

The workflow will download it automatically before rendering.

---

## 📐 Tips for Perfect Timing

| Situation | What to do |
|---|---|
| Word starts late | Add ~0.1s to the `start` value |
| Word cuts off early | Add ~0.1s to the `end` value |
| Two words overlap | Make sure end of word 1 < start of word 2 |
| Long pause in audio | Just leave a gap between end/start values |
| Short word (particle) | Even 0.2s duration works fine |

---

## 🎯 Example — Full Amharic Sentence

Audio: *"የቅድስት ድንግል ማርያም ልደትን እናከብር"* (5.5 seconds total)

```json
{
  "words": [
    { "word": "የቅድስት",  "start": 0.0,  "end": 0.7  },
    { "word": "ድንግል",   "start": 0.8,  "end": 1.4  },
    { "word": "ማርያም",   "start": 1.5,  "end": 2.1  },
    { "word": "ልደትን",   "start": 2.2,  "end": 2.9  },
    { "word": "እናከብር",  "start": 3.0,  "end": 3.8  }
  ]
}
```

---

## ❓ How to Get Word Timestamps Easily

If you have the audio/video file and want automatic timestamps:
1. Use the **"Transcribe Audio"** workflow in GitHub Actions
2. It uses Whisper AI to automatically generate word-level timestamps
3. The output is ready to use as `captions.json` directly

If you prefer manual control:
- Use **Audacity** (free) — open audio, zoom in, find exact times
- Use **VLC** — pause at each word, read the timestamp from the bottom bar
