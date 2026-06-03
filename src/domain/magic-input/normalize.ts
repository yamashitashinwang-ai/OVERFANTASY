export function normalizeMagicTerm(value: unknown): string {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    // eslint-disable-next-line no-irregular-whitespace -- full-width space (U+3000) is intentional input we strip
    .replace(/[\s　"'“”‘’.,，。!?！？・、\-_/\\]/g, "");
}
