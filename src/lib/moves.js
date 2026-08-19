import { TAXONOMY } from './constants.js';

export function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const ICON_SET = new Set(
  Object.entries(TAXONOMY).flatMap(([family, moves]) =>
    moves
      .filter((move) => !(family === 'lindy' && move === 'Tangos'))
      .map((move) => `${family}/${slug(move)}`),
  ),
);

export function iconSrc(family, moveName) {
  const key = `${family}/${slug(moveName)}`;
  return ICON_SET.has(key) ? `/assets/moves/${key}.png` : '';
}

export function moveKey(family, moveName) {
  return `${family}|${moveName}`;
}
