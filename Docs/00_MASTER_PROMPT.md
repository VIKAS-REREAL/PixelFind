# PixelFind — Master Development Prompt

You are building PixelFind, a browser-first local screenshot search application.

## PRODUCT IDEA

PixelFind allows users to find screenshots based on what they remember
about the screenshot rather than remembering the filename.

Example:

User searches:

"C++ vector error"

PixelFind returns multiple relevant screenshots ranked by relevance.

PixelFind is NOT a chatbot.

The search result should be a collection of relevant screenshots,
not one generated answer.

---

# PRIMARY GOAL

Build a polished, working prototype that implements approximately
40–60% of the proposed PixelFind system.

Prioritize actual working functionality over theoretical architecture.

The prototype must work locally in a desktop browser.

Do not build unnecessary cloud infrastructure.

---

# CORE USER FLOW

1. User opens PixelFind.
2. User selects a local screenshot folder.
3. PixelFind scans supported images.
4. PixelFind generates thumbnails.
5. PixelFind extracts visible text using OCR.
6. PixelFind generates basic tags/categories.
7. PixelFind stores the index locally.
8. User searches for something they remember.
9. PixelFind returns multiple relevant screenshots.
10. User can filter results.
11. User can open a screenshot and view its extracted information.
12. User can open the original screenshot.

---

# SUPPORTED IMAGE TYPES

Initially support:

- PNG
- JPG
- JPEG
- WEBP

Do not add unnecessary file types unless required.

---

# TECHNOLOGY

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Tesseract.js
- Dexie
- IndexedDB
- Fuse.js
- Zustand

Optional:

- Transformers.js for semantic search

Do NOT make semantic embeddings a hard dependency for the first
working version.

The application must remain functional using OCR + tags +
keyword/context search if semantic models are unavailable.

---

# LOCAL-FIRST REQUIREMENT

Do not upload screenshots to a server.

Do not create a cloud database.

Do not require authentication.

Do not require an API key.

Original screenshots should remain on the user's device.

OCR and indexing should happen locally whenever possible.

Indexed metadata should be stored locally using IndexedDB/Dexie.

---

# SEARCH BEHAVIOUR

Search must return MULTIPLE RESULTS.

Never reduce the search to one generated answer.

For example:

Query:

"C++ vector error"

Possible results:

1. C++ vector error — high relevance
2. C++ debugging — high relevance
3. vector implementation — medium relevance
4. C++ code screenshot — lower relevance

Display several relevant results.

Each result should show:

- screenshot preview
- filename
- extracted text preview
- tags
- category
- relevance indicator
- date when available

---

# SMART SEARCH

Provide a Smart Search mode.

Smart Search should interpret simple natural language queries.

Example:

"that Python error from last week"

should attempt to identify:

- Python
- Error
- Recent date

and use those as search signals.

Do not create a chatbot response.

Smart Search still produces screenshot results.

---

# TAGGING

Generate lightweight tags from OCR text.

Examples:

Python
C++
JavaScript
React
SQL
HTML
CSS
Programming
Error
Assignment
Notes
College
Project
GitHub
Figma
Website
Networking

Use deterministic rules first.

Do not require a large AI model to generate tags.

---

# CATEGORIES

Support basic categories such as:

- Programming
- Education
- Project
- Design
- Website
- Error
- Other

A screenshot may have multiple tags.

---

# UI DIRECTION

The interface must look like a real productivity application.

Visual references:

- Apple Files
- Linear
- modern productivity tools

Do NOT create generic "AI SaaS" visual design.

Avoid:

- purple AI gradients
- glowing cards
- excessive glassmorphism
- neon borders
- robot illustrations
- futuristic backgrounds
- excessive gradients
- unnecessary 3D graphics
- fake analytics
- excessive animations

The design should be calm, clean and functional.

---

# COLOR SYSTEM

Use a restrained neutral palette.

Background:
#F7F7F5

Surface:
#FFFFFF

Primary text:
#171717

Secondary text:
#737373

Border:
#E7E7E4

Primary accent:
#2F5D50

Light accent:
#E8F0ED

Use the accent sparingly.

Do not make the entire interface green.

---

# MAIN SCREENS

Implement:

1. Welcome / Folder Selection
2. Indexing Progress
3. Screenshot Library
4. Search Results
5. Screenshot Detail

---

# WELCOME SCREEN

Show:

PixelFind

"Find screenshots by what you remember."

Button:

"Select Screenshot Folder"

Also communicate:

"Your screenshots stay on your device."

---

# INDEXING SCREEN

Show:

- total screenshots
- processed screenshots
- current file
- progress bar
- OCR status
- completion status

Example:

124 / 180

Processing:
Screenshot_2026_09_18.png

Extracting text...

---

# LIBRARY SCREEN

Provide:

- sidebar
- All Screenshots
- Recent
- Categories
- Tags

Main area:

- search bar
- filters
- screenshot grid

Use attractive but simple screenshot cards.

---

# SEARCH SCREEN

Show:

Large search field.

Smart Search toggle.

Suggested tags.

Result count.

Multiple result cards.

Sort options:

- Relevance
- Newest
- Oldest

---

# SCREENSHOT CARD

Each card should contain:

- image preview
- title/filename
- extracted text preview
- tags
- category
- date
- relevance when searching

Clicking the card opens the detail view.

---

# DETAIL SCREEN

Show:

- large screenshot
- filename
- date
- category
- tags
- extracted OCR text
- Open Original button
- Back to Results

---

# INDEXING OPTIMIZATION

Do not OCR every screenshot repeatedly.

Store an identifier/hash for indexed files.

When scanning again:

- detect already indexed screenshots
- skip unchanged files
- process only new/changed files

Show this information to the user.

Example:

156 already indexed
24 new screenshots

---

# EMPTY STATES

Create useful empty states.

Examples:

No screenshots indexed yet.

No results found.

No OCR text detected.

No screenshots match this filter.

Do not leave blank screens.

---

# DEMO DATA

Make the application easy to demonstrate with approximately
20–30 screenshots containing:

- C++ code
- Python error
- React code
- SQL query
- college notes
- assignment
- networking diagram
- GitHub screenshot
- Figma design
- project architecture

The demo should clearly prove that searching by remembered content
works.

---

# PERFORMANCE

Do not block the UI while processing many images.

Use asynchronous/background processing where practical.

Show progress.

Generate thumbnails rather than rendering huge original images
throughout the gallery.

Do not load every full-resolution screenshot simultaneously.

---

# ERROR HANDLING

Handle:

- unsupported image
- OCR failure
- unreadable image
- empty folder
- permission failure
- duplicate screenshot
- corrupted image

The application should continue processing remaining files
if one screenshot fails.

---

# FUTURE FEATURES

Do not implement these unless the core prototype is stable:

- semantic embeddings
- visual similarity
- voice search
- multimodal AI
- automatic secret/API-key detection
- feedback-based ranking
- session grouping
- advanced classifiers

These should be represented as future scope, not allowed to
destabilize the current prototype.

---

# DEVELOPMENT PRIORITY

Priority order:

1. Working folder selection
2. Screenshot scanning
3. OCR
4. Local storage
5. Gallery
6. Search
7. Multiple ranked results
8. Tags/categories
9. Filters
10. Detail view
11. UI polish
12. Optional semantic search

Never sacrifice working core functionality for an advanced feature.

---

# IMPORTANT

Do not invent fake functionality.

Do not show fake AI scores.

Do not create fake processing results.

If a feature is not implemented, either implement it or clearly
mark it as planned.

The final prototype must be demonstrable live.
