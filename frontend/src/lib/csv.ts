/**
 * Minimal RFC 4180 CSV: quoted fields, doubled quotes, line breaks inside
 * quotes, CRLF or LF. Enough for spreadsheets (Google Sheets, Excel, Numbers)
 * without pulling in a parsing library.
 */

/**
 * Guesses the delimiter from the header line: Google Sheets writes commas,
 * Excel in many European locales writes semicolons, and a copy-paste from a
 * spreadsheet gives tabs.
 */
export function detectDelimiter(text: string): string {
  const header = text.slice(0, text.search(/\r?\n|$/));
  const counts = [',', ';', '\t'].map((d) => [d, header.split(d).length] as const);
  return counts.reduce((best, current) => (current[1] > best[1] ? current : best))[0];
}

export function parseCsv(input: string, delimiter = detectDelimiter(input)): string[][] {
  const text = input.replace(/^\uFEFF/, ''); // Excel's UTF-8 byte order mark.
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Spreadsheets often append blank lines; they are not data.
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export function toCsv(rows: string[][]): string {
  const escape = (cell: string) =>
    /[",\r\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
  return rows.map((row) => row.map(escape).join(',')).join('\r\n');
}
