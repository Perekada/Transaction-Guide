export function normalizeDescription(description: string): string {
  return description
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
