import { moodKeys } from './moods.js';

export const COMPANION_ASSET_VERSION = '2026-08-07-white-tennis-shoes';
export const DEFAULT_COMPANION_PRESET = 'dressed-up-feminine';

export const COMPANION_PRESETS = {
  'dressed-up-feminine': {
    label: 'Vintage feminine',
    sub: 'Red dress, polished shoes, festival sparkle',
    gender: 'feminine',
    style: 'vintage',
  },
  'dressed-up-masculine': {
    label: 'Vintage masculine',
    sub: 'Bow tie, suspenders, Savoy polish',
    gender: 'masculine',
    style: 'vintage',
  },
  'casual-feminine': {
    label: 'Casual feminine',
    sub: 'Oversized top, sneakers, comfort-first',
    gender: 'feminine',
    style: 'casual',
  },
  'casual-masculine': {
    label: 'Casual masculine',
    sub: 'Relaxed tee, joggers, easy social energy',
    gender: 'masculine',
    style: 'casual',
  },
};

export const COMPANION_ORDER = ['dressed-up-feminine', 'dressed-up-masculine', 'casual-feminine', 'casual-masculine'];

export const COMPANION_GENDERS = [
  ['feminine', 'Female dancer'],
  ['masculine', 'Male dancer'],
];

export const COMPANION_STYLES = [
  ['vintage', 'Vintage'],
  ['casual', 'Casual'],
];

const MOOD_COMPANION_STATE = {
  proud: 'celebrate',
  excited: 'celebrate',
  flowing: 'reflect',
  inspired: 'reflect',
  challenged: 'fired-up',
  angry: 'fired-up',
  confused: 'disappointed',
  frustrated: 'disappointed',
  curious: 'reflect',
};

export function companionStateFromMoods(value) {
  const [key] = moodKeys(value);
  return MOOD_COMPANION_STATE[key] || 'reflect';
}

export function companionPresetFromChoices(gender, style) {
  return COMPANION_ORDER.find((preset) => {
    const item = COMPANION_PRESETS[preset];
    return item.gender === gender && item.style === style;
  }) || '';
}

export function companionChoicesFromPreset(preset) {
  const item = COMPANION_PRESETS[preset];
  return {
    gender: item?.gender || '',
    style: item?.style || '',
  };
}

export function companionCopy(state) {
  if (state === 'celebrate') return 'This felt good. Remember what clicked.';
  if (state === 'fired-up') return 'That anger has information. Save what happened, then come back to yourself.';
  if (state === 'disappointed') return 'This one did not land the way you hoped. Keep the lesson, not the weight.';
  return 'Small details become real progress when you remember them.';
}

export function companionSuccessTone(state) {
  if (state === 'celebrate') {
    return {
      title: 'Nice one!',
      before: '',
      after: 'is saved as a win in your 2026 dance story.',
    };
  }
  if (state === 'fired-up') {
    return {
      title: 'That feeling counts.',
      before: '',
      after: 'is saved with the part that made you fired up.',
    };
  }
  if (state === 'disappointed') {
    return {
      title: 'Still worth saving.',
      before: '',
      after: 'is saved, even though it did not feel how you wanted.',
    };
  }
  return {
    title: 'Saved for future you.',
    before: '',
    after: 'is now part of your 2026 dance story.',
  };
}
