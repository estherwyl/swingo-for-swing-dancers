export const MOODS = {
  proud: { label: 'Proud', color: '#E7B44C', emoji: '🥹' },
  excited: { label: 'Excited', color: '#E86C58', emoji: '🥳' },
  flowing: { label: 'Flowing', color: '#6FBF92', emoji: '😌' },
  curious: { label: 'Curious', color: '#6FA8CF', emoji: '🤔' },
  challenged: { label: 'Challenged', color: '#C46A7C', emoji: '😤' },
  angry: { label: 'Angry', color: '#D05744', emoji: '😠' },
  confused: { label: 'Confused', color: '#9B8BC4', emoji: '😵‍💫' },
  frustrated: { label: 'Frustrated', color: '#D9704A', emoji: '😣' },
  inspired: { label: 'Inspired', color: '#E7C15A', emoji: '🤩' },
};

export const MOOD_ORDER = ['proud', 'excited', 'flowing', 'inspired', 'challenged', 'angry', 'confused', 'frustrated'];

export function moodKeys(value) {
  if (Array.isArray(value)) return value.filter((key) => MOODS[key]);
  return value && MOODS[value] ? [value] : [];
}

export function moodList(value) {
  return moodKeys(value).map((key) => MOODS[key]);
}

export function topMoodKey(entries) {
  const tally = new Map();
  entries.forEach((entry) => {
    moodKeys(entry.mood).forEach((mood) => {
      tally.set(mood, (tally.get(mood) || 0) + 1);
    });
  });
  return Array.from(tally.entries()).toSorted((a, b) => b[1] - a[1])[0]?.[0] || null;
}
