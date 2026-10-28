import { describe, expect, it } from 'vitest';
import { detectDelimiter, parseCsv, toCsv } from './csv';

describe('parseCsv', () => {
  it('reads quoted fields with commas, doubled quotes and line breaks', () => {
    const text = 'a,b\r\n"x, y","say ""hi""\nthen go"\r\n';
    expect(parseCsv(text)).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"\nthen go'],
    ]);
  });

  it('drops a UTF-8 byte order mark and blank trailing lines', () => {
    expect(parseCsv('\uFEFFa,b\n1,2\n\n,\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('keeps empty cells', () => {
    expect(parseCsv('a,b,c\n1,,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '', '3'],
    ]);
  });
});

describe('detectDelimiter', () => {
  it('detects commas, semicolons (Excel in European locales) and tabs', () => {
    expect(detectDelimiter('title,body\n')).toBe(',');
    expect(detectDelimiter('title;body;categories\nA, B;x;y')).toBe(';');
    expect(detectDelimiter('title\tbody\n')).toBe('\t');
  });
});

describe('toCsv', () => {
  it('quotes only when needed and round-trips through parseCsv', () => {
    const rows = [
      ['plain', 'with, comma', 'with "quote"', 'multi\nline'],
      ['', 'x', 'y', 'z'],
    ];
    const csv = toCsv(rows);
    expect(csv.split('\r\n')[0]).toBe('plain,"with, comma","with ""quote""","multi\nline"');
    expect(parseCsv(csv)).toEqual(rows);
  });
});
