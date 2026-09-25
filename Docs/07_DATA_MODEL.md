# PixelFind Data Model

## Screenshot

{
  id,
  filename,
  ocrText,
  tags[],
  category,
  createdAt,
  modifiedAt,
  thumbnail,
  status,
  fileHash
}

---

## Search History

Optional.

{
  id,
  query,
  createdAt
}

Do not store search history unless useful.

---

## Settings

{
  selectedFolder,
  theme,
  smartSearchEnabled
}
