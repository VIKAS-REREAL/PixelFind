# PixelFind

**Find screenshots by what you remember — not by filename.**

PixelFind is a local-first, browser-based screenshot search tool. It uses OCR (Tesseract.js) to extract text from your screenshots and lets you search them by content.

---

## 🚀 Live Demo

Deploy to GitHub Pages — see instructions below.

---

## ✨ Features

- 📁 **Folder selection** — Select any local folder of screenshots
- 🔍 **OCR-powered search** — Extracts text from every image locally
- 🏷️ **Auto-tagging** — Detects Python, C++, React, SQL, GitHub, Figma, Networking, etc.
- 📂 **Categories** — Programming, Education, Project, Design, Website, Error
- 🧠 **Smart Search** — Natural language queries like "python error last week"
- 💾 **Local index** — Stores everything in IndexedDB, nothing uploaded
- ⚡ **Incremental indexing** — Only processes new/changed files on re-scan
- 🔄 **Manual refresh** — Check for new screenshots with a single click
- 📊 **Batch processing** — 2 images in parallel, never lags your device
- 🔒 **100% private** — Nothing leaves your browser

---

## 🖥️ How to Use

### Option 1: GitHub Pages (Recommended)

1. Fork this repo
2. Go to Settings → Pages → Source: `GitHub Actions`
3. Push to `main` — GitHub Actions auto-deploys
4. Open `https://yourusername.github.io/PixelFind/`
5. Use **Chrome** or **Edge** (required for File System Access API)

### Option 2: Local Dev Server

```bash
git clone https://github.com/yourusername/PixelFind.git
cd PixelFind
npm install
npm run dev
```

Open [http://localhost:5173/PixelFind/](http://localhost:5173/PixelFind/)

---

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy the `dist/` folder to any static host.

---

## 🌐 Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Folder Selection | ✅ | ✅ | ❌ | ❌ |
| OCR | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |

> **Folder selection requires Chrome or Edge.** This is a browser security limitation — only Chrome/Edge support the File System Access API.

---

## 🔧 Tech Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** — Styling
- **Tesseract.js** — Local OCR
- **Dexie + IndexedDB** — Local database
- **Fuse.js** — Fuzzy search
- **Zustand** — State management
- **Lucide React** — Icons

---

## 📄 License

MIT
