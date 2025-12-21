const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

export function sanitizeContent(text: string): string {
  return text.replace(CONTROL_CHARS, '').trim();
}

export function enforceExportLimit(content: string, maxChars: number) {
  if (content.length > maxChars) {
    throw new Error(`Export exceeds maximum allowed size of ${maxChars} characters`);
  }
}

export function buildCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
}
