import { describe, expect, it } from 'vitest';
import {
  companionChoicesFromPreset,
  companionCopy,
  companionPresetFromChoices,
  companionStateFromMoods,
  companionSuccessTone,
  moodKeys,
  moodList,
} from '../moods.js';
import { MOOD_COMPANION_STATE } from '../constants.js';

describe('mood helpers', () => {
  it('normalizes arrays, strings, and invalid values', () => {
    expect(moodKeys(['proud', 'unknown', 'excited'])).toEqual(['proud', 'excited']);
    expect(moodKeys('flowing')).toEqual(['flowing']);
    expect(moodKeys('unknown')).toEqual([]);
    expect(moodKeys(null)).toEqual([]);
    expect(moodKeys(['unknown', null])).toEqual([]);
  });

  it('maps valid mood keys to mood records', () => {
    expect(moodList(['proud', 'excited'])).toEqual([
      { label: 'Proud', color: '#E7B44C', emoji: '🥹' },
      { label: 'Excited', color: '#E86C58', emoji: '🥳' },
    ]);
    expect(moodList('unknown')).toEqual([]);
  });

  it('maps every mood companion state and reflects unknown moods', () => {
    Object.entries(MOOD_COMPANION_STATE).forEach(([mood, state]) => {
      expect(companionStateFromMoods(mood)).toBe(state);
    });
    expect(companionStateFromMoods([])).toBe('reflect');
    expect(companionStateFromMoods('unknown')).toBe('reflect');
  });

  it('converts all valid gender and style combinations to presets', () => {
    expect(companionPresetFromChoices('feminine', 'vintage')).toBe('dressed-up-feminine');
    expect(companionPresetFromChoices('masculine', 'vintage')).toBe('dressed-up-masculine');
    expect(companionPresetFromChoices('feminine', 'casual')).toBe('casual-feminine');
    expect(companionPresetFromChoices('masculine', 'casual')).toBe('casual-masculine');
    expect(companionPresetFromChoices('other', 'vintage')).toBe('');
  });

  it('converts presets to choices, including unknown presets', () => {
    expect(companionChoicesFromPreset('casual-masculine')).toEqual({ gender: 'masculine', style: 'casual' });
    expect(companionChoicesFromPreset('missing')).toEqual({ gender: '', style: '' });
  });

  it('returns copy and success tone for every branch', () => {
    expect(companionCopy('celebrate')).toContain('felt good');
    expect(companionCopy('fired-up')).toContain('anger');
    expect(companionCopy('disappointed')).toContain('did not land');
    expect(companionCopy('reflect')).toContain('Small details');

    expect(companionSuccessTone('celebrate').title).toBe('Nice one!');
    expect(companionSuccessTone('fired-up').title).toBe('That feeling counts.');
    expect(companionSuccessTone('disappointed').title).toBe('Still worth saving.');
    expect(companionSuccessTone('reflect').title).toBe('Saved for future you.');
  });
});
