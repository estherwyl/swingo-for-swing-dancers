export const STORAGE_KEY = 'swingo_v2';
export const COMPANION_ASSET_VERSION = '2026-08-07-white-tennis-shoes';
export const MAX_REFERENCES_PER_MOVE = 3;

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

export const FAMILIES = {
  lindy: { label: 'Lindy Hop', color: '#E7B44C', dark: '#231708' },
  solo: { label: 'Solo Jazz', color: '#6FBF92', dark: '#08160E' },
  charleston: { label: 'Charleston', color: '#E8705C', dark: '#230B08' },
};

export const STATUSES = {
  first_learned: { label: 'Learned for the first time', short: 'First time', statement: 'I learned' },
  learned_again: { label: 'Learned again', short: 'Learned again', statement: 'I learned again' },
  practiced: { label: 'Practiced', short: 'Practiced', statement: 'I practiced' },
  used_in_social: { label: 'Used in social', short: 'Social', statement: 'I used in social' },
  performed: { label: 'Performed', short: 'Performed', statement: 'I performed' },
};

export const STATUS_ORDER = ['first_learned', 'learned_again', 'practiced', 'used_in_social', 'performed'];

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
export const MOOD_COMPANION_STATE = {
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
