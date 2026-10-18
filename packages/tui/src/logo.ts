// Terminal block-character logo. `left` and `right` are drawn side by side at wide widths, so
// the gap between them matches the one-space gap between letters: "CODER" reads as one word.
// Each glyph is four cells across and three rows tall, mirroring the SVG wordmark's grid.
export const logo = {
  left: ["         ", "█▀▀▀ █▀▀█", "█___ █__█", "▀▀▀▀ ▀▀▀▀"],
  right: ["              ", "█▀▀▄ █▀▀█ █▀▀█", "█__█ █^^^ █▀▀█", "▀▀▀▀ ▀▀▀▀ ▀▀▀▄"],
}

// The C mark alone, used when the terminal is too narrow for the wordmark.
export const go = {
  left: ["    ", "█▀▀▀", "█_^█", "▀▀▀▀"],
  right: ["    ", "█▀▀▀", "█___", "▀▀▀▀"],
}
