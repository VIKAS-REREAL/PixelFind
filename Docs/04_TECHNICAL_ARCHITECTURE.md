# PixelFind — Technical Architecture

## Architecture

Browser-first local application.

React UI
↓
Application State
↓
Local Processing
↓
Local Index
↓
Search

---

## Stack

React
Vite
TypeScript
Tailwind
shadcn/ui
Lucide
Zustand
Tesseract.js
Dexie
IndexedDB
Fuse.js

Optional:
Transformers.js

---

## Processing Pipeline

Image
↓
Thumbnail
↓
OCR
↓
Text cleanup
↓
Tag extraction
↓
Category detection
↓
Local storage
↓
Search index

---

## Storage

Use IndexedDB through Dexie.

Do not store original screenshots inside IndexedDB
unless necessary.

Prefer references/handles and generated thumbnails where
browser security permits.

---

## Search

Combine:

OCR text matching
+
Filename matching
+
Tag matching
+
Category matching
+
Date filtering

Then calculate a simple relevance score.

---

## Optional Semantic Search

If Transformers.js performs reliably:

Query
↓
Embedding
↓
Screenshot text embedding
↓
Similarity
↓
Ranking

Semantic search must remain optional.
