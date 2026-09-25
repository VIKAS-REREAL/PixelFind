# OCR and Indexing

## OCR

Use Tesseract.js.

Process screenshots locally.

For each screenshot:

1. Load image
2. Resize if unnecessarily large
3. Run OCR
4. Clean extracted text
5. Store OCR result

---

## Index Record

Each indexed screenshot should contain:

id
filename
ocrText
tags
category
date
thumbnail
status
file identifier/hash where possible

---

## Processing States

pending
processing
completed
failed

---

## Incremental Processing

Before OCR:

Check whether the screenshot is already indexed.

If unchanged:

Skip OCR.

If new:

Process.

If changed:

Reprocess.

If deleted:

Remove or mark stale index entry.

---

## Failure Handling

One OCR failure must not stop the entire indexing process.
