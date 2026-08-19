import { describe, expect, it } from 'vitest';
import { iconSrc, moveKey, slug } from '../moves.js';

describe('move and icon helpers', () => {
  it('slugifies punctuation, separators, and case', () => {
    expect(slug("Sailor's")).toBe('sailor-s');
    expect(slug(' Rocks, Hallelujahs ')).toBe('rocks-hallelujahs');
    expect(slug('--Swingout--')).toBe('swingout');
    expect(slug('Camel Walks')).toBe('camel-walks');
  });

  it('resolves taxonomy icons while excluding lindy Tangos', () => {
    expect(iconSrc('solo', 'Tangos')).toBe('/assets/moves/solo/tangos.png');
    expect(iconSrc('lindy', 'Swingout')).toBe('/assets/moves/lindy/swingout.png');
    expect(iconSrc('lindy', 'Tangos')).toBe('');
    expect(iconSrc('lindy', 'Not a move')).toBe('');
  });

  it('formats move keys', () => {
    expect(moveKey('solo', 'Shorty George')).toBe('solo|Shorty George');
  });
});
