import { describe, it, expect } from 'vitest';
import { t } from './i18n';

describe('i18n utility', () => {
  it('returns key when missing', () => {
    expect(t('non.existent.key')).toBe('non.existent.key');
  });
  it('translates German default', () => {
    expect(typeof t('me.title')).toBe('string');
  });
  it('variable interpolation works', () => {
    const msg = t('me.github.repos.invalidFormat', { invalid: 'x' });
    expect(msg.includes('x')).toBe(true);
  });
});
