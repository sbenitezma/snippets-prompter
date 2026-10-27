import { describe, expect, it } from 'vitest';
import { extractVariables, resolveVariables } from './variables';

describe('extractVariables', () => {
  it('returns unique names in order of first appearance', () => {
    expect(extractVariables('Hi {{name}}, {{topic}} and again {{name}}')).toEqual([
      'name',
      'topic',
    ]);
  });

  it('accepts spaces inside the braces', () => {
    expect(extractVariables('Hello {{ name }}')).toEqual(['name']);
  });

  it('ignores malformed placeholders', () => {
    expect(extractVariables('{{}} {single} {{1bad}} {{ok_1}}')).toEqual(['ok_1']);
  });

  it('returns an empty list when there are no variables', () => {
    expect(extractVariables('Plain text')).toEqual([]);
  });
});

describe('resolveVariables', () => {
  it('replaces every occurrence of a variable', () => {
    expect(resolveVariables('{{a}} and {{a}}', { a: 'x' })).toBe('x and x');
  });

  it('keeps the placeholder when the value is missing or blank', () => {
    expect(resolveVariables('{{a}} {{b}}', { a: '  ' })).toBe('{{a}} {{b}}');
  });

  it('replaces placeholders written with inner spaces', () => {
    expect(resolveVariables('Hi {{ name }}', { name: 'Sonia' })).toBe('Hi Sonia');
  });
});
