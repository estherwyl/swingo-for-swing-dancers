import { sortByRecency, sortKey } from './dates.js';
import { topMoodKey } from './moods.js';

export const FAMILIES = {
  lindy: { label: 'Lindy Hop', color: '#E7B44C', dark: '#231708' },
  solo: { label: 'Solo Jazz', color: '#6FBF92', dark: '#08160E' },
  charleston: { label: 'Charleston', color: '#E8705C', dark: '#230B08' },
};

export const DEFAULT_FAMILY_COLOR = '#E7B44C';

export const STATUSES = {
  first_learned: { label: 'Learned for the first time', short: 'First time', statement: 'I learned' },
  learned_again: { label: 'Learned again', short: 'Learned again', statement: 'I learned again' },
  practiced: { label: 'Practiced', short: 'Practiced', statement: 'I practiced' },
  used_in_social: { label: 'Used in social', short: 'Social', statement: 'I used in social' },
  performed: { label: 'Performed', short: 'Performed', statement: 'I performed' },
};

export const STATUS_ORDER = ['first_learned', 'learned_again', 'practiced', 'used_in_social', 'performed'];

export const TAXONOMY = {
  lindy: [
    '6-count basic',
    '8-count basic',
    'Around the World',
    'Barrel Roll',
    'Lindy Circle',
    'Change of places',
    'Circle',
    'Drags',
    'Flip-flops',
    'Frisbee',
    'Glide to the side, scoots',
    'Gliding',
    'Jig Kicks',
    'Windmill',
    'Minnie Dip',
    'Points',
    'Pretzel',
    'Promenade',
    "Sailor's",
    'Send Out',
    'Side Pass',
    "Skater's",
    "Reverse Skater's",
    'Sugar Push',
    'Swingout',
    'Lindy turn',
    'Swivels',
    'Tangos',
    'Texas Tommy',
    'Tuck Turn',
    'Wheel',
  ],
  solo: [
    'Apple Jacks',
    'Boogie Back',
    'Boogie Forward',
    'Breeze in the Knees',
    'Camel Walks',
    'Chugs',
    'Fall off the Log',
    'Hangman',
    'Heel Toe',
    'James Brown',
    'Low-downs',
    'Mooches',
    'Over The Top',
    'Pimp Walk',
    'Rocks, Hallelujahs',
    'Shorty George',
    'Slip Slops',
    'Suzy Qs',
    'Tacky Annies',
    'Tangos',
    'Tick Tocks',
    'Trenches',
    'Truckin',
  ],
  charleston: [
    'Side by side',
    'Slide back',
    'Fishtail',
    'Kick through',
    'Hand to hand',
    'Airplane',
    'Skip up',
    "Johnnie's drop",
    'Tandem',
    'Windscreen wiper',
    'Butterfly exit',
  ],
};

export function slug(value) {
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

export function iconSrc(family, moveName) {
  const key = `${family}/${slug(moveName)}`;
  return ICON_SET.has(key) ? `/assets/moves/${key}.png` : '';
}

export function moveKey(family, moveName) {
  return `${family}|${moveName}`;
}

export function entryMoveKey(entry) {
  return moveKey(entry.family, entry.moveName);
}

export function familyColor(family) {
  return FAMILIES[family]?.color || DEFAULT_FAMILY_COLOR;
}

export function aggregateEntries(entries) {
  const groups = new Map();
  entries.forEach((entry) => {
    const key = entryMoveKey(entry);
    groups.set(key, [...(groups.get(key) || []), entry]);
  });

  return Array.from(groups.entries()).map(([key, list]) => {
    const sorted = sortByRecency(list);
    return {
      key,
      family: sorted[0].family,
      moveName: sorted[0].moveName,
      firstDate: list.map((entry) => entry.date).toSorted()[0],
      logs: sorted.length,
      latestStatus: sorted[0].status,
      latestSk: sortKey(sorted[0]),
      mood: topMoodKey(sorted),
      hasSocial: sorted.some((entry) => entry.status === 'used_in_social'),
      list: sorted,
    };
  });
}
