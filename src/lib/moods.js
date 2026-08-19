import { COMPANION_ORDER, COMPANION_PRESETS, MOODS, MOOD_COMPANION_STATE } from './constants.js';

export function moodKeys(value) {
  if (Array.isArray(value)) return value.filter((key) => MOODS[key]);
  return value && MOODS[value] ? [value] : [];
}

export function moodList(value) {
  return moodKeys(value).map((key) => MOODS[key]);
}

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
