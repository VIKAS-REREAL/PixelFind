# PixelFind Search Engine

## Fundamental Rule

PixelFind is a retrieval system.

It is NOT a chatbot.

Search queries must produce multiple screenshot results.

---

## Search Inputs

Search using:

- OCR text
- filename
- tags
- category
- date
- optional semantic similarity

---

## Example

Query:

"C++ vector error"

Potential matches:

Screenshot A
Tags: cpp, error, programming

Screenshot B
Tags: cpp, debugging

Screenshot C
OCR contains vector

Screenshot D
OCR contains error

---

## Ranking

Use a simple scoring system.

Example:

OCR exact match: high weight
OCR partial match: medium weight
Tag match: high weight
Category match: medium weight
Filename match: low weight
Date relevance: optional

Do not expose fake precision such as
"97.32% AI confidence" unless that value is actually calculated.

Prefer:

"Best match"

or:

"High relevance"

---

## Results

Always show multiple results when multiple matches exist.

Display:

- Result count
- Search query
- Active filters
- Screenshot previews
- Tags
- OCR snippet
- Relevance
- Date

---

## No Results

Show:

"No screenshots matched your search."

Then suggest:

- Try fewer words
- Remove filters
- Browse all screenshots

---

## Smart Search

Parse simple natural-language intent.

Example:

"python error last week"

Extract:

python
error
date: last week

Then use those as search signals.

Smart Search should still return screenshots,
not a text answer.
