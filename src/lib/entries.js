import { todayStr, sortKey } from './dates.js';
import { moodKeys } from './moods.js';

function freshCheckin() {
  return {
    family: null,
    moveName: null,
    status: null,
    mood: [],
    note: '',
    referenceUrls: [''],
    date: todayStr(),
    cls: '',
    teacher: '',
    location: '',
  };
}

function seedEntries() {
  const rows = [
    ['solo', 'Shorty George', 'practiced', 'proud', 'Timing felt clearer today. Starting to get the bounce.', '2026-07-10', '19:10', 'Savoy Beginners Class', 'Jasper', 'Savoy Studio'],
    ['lindy', 'Swingout', 'practiced', 'challenged', 'Keep the stretch, don’t collapse the connection.', '2026-07-09', '18:22', 'Lindy Level 2', 'Mara', 'The Hall'],
    ['lindy', 'Tuck Turn', 'used_in_social', 'flowing', 'Led it cleanly at the Tuesday social!', '2026-07-08', '22:05', 'Tuesday Social', '', 'The Hall'],
    ['solo', 'Tacky Annies', 'first_learned', 'excited', 'So bouncy and fun.', '2026-07-06', '20:00', 'Solo Jazz Drop-in', 'Jasper', 'Savoy Studio'],
    ['solo', 'Shorty George', 'learned_again', 'inspired', 'Teacher emphasized knees and groove. Much better!', '2026-07-02', '18:25', 'Solo Jazz Drop-in', 'Jasper', 'Savoy Studio'],
    ['solo', 'Camel Walks', 'practiced', 'flowing', 'Smooth glide, stay low.', '2026-06-30', '19:30', '', '', ''],
    ['lindy', 'Texas Tommy', 'first_learned', 'curious', 'Wrap and unwrap — still figuring out the hand.', '2026-06-27', '20:15', 'Lindy Level 2', 'Mara', 'The Hall'],
    ['charleston', 'Side by side', 'first_learned', 'excited', 'Classic Charleston kicks, love it.', '2026-06-24', '19:00', 'Charleston Intro', 'Lena', 'The Hall'],
    ['lindy', 'Swingout', 'learned_again', 'proud', 'Finally the rhythm clicked.', '2026-06-20', '18:40', 'Lindy Level 2', 'Mara', 'The Hall'],
    ['solo', 'Apple Jacks', 'first_learned', 'challenged', 'Heels in, knees together — tricky.', '2026-06-18', '20:10', 'Solo Jazz Drop-in', 'Jasper', 'Savoy Studio'],
    ['charleston', 'Fishtail', 'first_learned', 'flowing', 'Hips and travel.', '2026-06-15', '19:20', 'Charleston Intro', 'Lena', 'The Hall'],
    ['lindy', '6-count basic', 'first_learned', 'proud', 'Where it all begins.', '2026-06-10', '18:30', 'Lindy Level 1', 'Mara', 'The Hall'],
    ['solo', 'Suzy Qs', 'practiced', 'flowing', 'Crossing steps getting smoother.', '2026-06-06', '19:45', '', '', ''],
    ['lindy', 'Tuck Turn', 'first_learned', 'curious', 'First real turn pattern.', '2026-06-02', '20:00', 'Lindy Level 1', 'Mara', 'The Hall'],
    ['solo', 'Boogie Back', 'first_learned', 'excited', 'Travel back with style.', '2026-05-28', '19:15', 'Solo Jazz Drop-in', 'Jasper', 'Savoy Studio'],
    ['solo', 'Shorty George', 'first_learned', 'proud', 'First time hearing this move name. So fun!', '2026-05-24', '19:41', 'Solo Jazz Drop-in', 'Jasper', 'Savoy Studio'],
    ['charleston', 'Kick through', 'first_learned', 'inspired', 'Big kicks!', '2026-05-20', '19:00', 'Charleston Intro', 'Lena', 'The Hall'],
    ['lindy', 'Lindy Circle', 'first_learned', 'curious', 'Rotating as a couple.', '2026-05-16', '18:50', 'Lindy Level 1', 'Mara', 'The Hall'],
  ];

  return rows.map(([family, moveName, status, mood, note, date, time, cls, teacher, location], index) => ({
    id: `seed-${index}`,
    family,
    moveName,
    status,
    mood,
    note,
    date,
    time,
    cls,
    teacher,
    location,
  }));
}

function aggregateEntries(entries) {
  const groups = new Map();
  entries.forEach((entry) => {
    const key = `${entry.family}|${entry.moveName}`;
    groups.set(key, [...(groups.get(key) || []), entry]);
  });

  return Array.from(groups.entries()).map(([key, list]) => {
    const sorted = list.toSorted((a, b) => sortKey(b).localeCompare(sortKey(a)));
    const firstDate = list.map((entry) => entry.date).toSorted()[0];
    const moodTally = new Map();
    sorted.forEach((entry) => {
      moodKeys(entry.mood).forEach((mood) => {
        moodTally.set(mood, (moodTally.get(mood) || 0) + 1);
      });
    });
    const mood = Array.from(moodTally.entries()).toSorted((a, b) => b[1] - a[1])[0]?.[0] || null;
    return {
      key,
      family: sorted[0].family,
      moveName: sorted[0].moveName,
      firstDate,
      logs: sorted.length,
      latestStatus: sorted[0].status,
      latestSk: sortKey(sorted[0]),
      mood,
      hasSocial: sorted.some((entry) => entry.status === 'used_in_social'),
      list: sorted,
    };
  });
}


export { freshCheckin, seedEntries, aggregateEntries };
