# PixelFind — Product Requirements

## Problem

Users accumulate large numbers of screenshots.

The filename usually does not describe what is inside the screenshot.

Users often remember the content but not the filename.

Example:

"I need that screenshot of my C++ vector error."

But the actual file may be:

Screenshot_2026_08_18_1432.png

PixelFind solves this by making screenshot content searchable.

---

## Product Statement

PixelFind is a local-first screenshot retrieval tool that allows
users to search screenshots using remembered content and context.

---

## Core Value

Search by:

"What was inside the screenshot?"

instead of:

"What was the filename?"

---

## MVP Features

### Screenshot ingestion

- Select folder
- Scan images
- Generate thumbnails

### OCR

- Extract visible text
- Store OCR text locally

### Metadata

- Filename
- Date
- Category
- Tags

### Search

- Keyword search
- Context/tag search
- Multiple results
- Relevance ranking

### Browsing

- Gallery
- Categories
- Tags
- Recent screenshots

### Detail

- Full preview
- OCR text
- Metadata
- Open original

---

## Non-Goals

Do not build:

- authentication
- cloud storage
- social features
- collaboration
- admin panel
- mobile app
- chatbot
- cloud AI processing
