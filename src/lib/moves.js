import { TAXONOMY } from './constants.js';

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const ICON_SET = new Set(
  Object.entries(TAXONOMY).flatMap(([family, moves]) =>
    moves
      .filter((move) => !(family === 'lindy' && move === 'Tangos'))
      .map((move) => `${family}/${slug(move)}`),
  ),
);

function iconSrc(family, moveName) {
  const key = `${family}/${slug(moveName)}`;
  return ICON_SET.has(key) ? `/assets/moves/${key}.png` : '';
}

function moveKey(family, moveName) {
  return `${family}|${moveName}`;
}


export { slug, ICON_SET, iconSrc, moveKey };
