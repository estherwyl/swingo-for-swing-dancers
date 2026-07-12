import React, {
  memo,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePlus,
  Dumbbell,
  Filter,
  Footprints,
  List,
  Menu,
  Music2,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Trophy,
  Users,
  WandSparkles,
  X,
} from 'lucide-react';
import './styles.css';

const FAMILY_META = {
  'Lindy Hop': {
    key: 'lindy',
    color: '#ffc557',
    deep: '#5a390d',
    gradient: 'linear-gradient(135deg, #f8bd48 0%, #855c19 100%)',
    icon: Users,
  },
  'Solo Jazz': {
    key: 'solo',
    color: '#66d58a',
    deep: '#113821',
    gradient: 'linear-gradient(135deg, #49ca75 0%, #082a19 100%)',
    icon: Footprints,
  },
  Charleston: {
    key: 'charleston',
    color: '#ff604d',
    deep: '#4c1914',
    gradient: 'linear-gradient(135deg, #eb4a3b 0%, #7f211b 100%)',
    icon: Music2,
  },
};

const MOVE_TAXONOMY = {
  'Lindy Hop': [
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
    'Gliding',
    'Send Out',
    'Side Pass',
    "Skater's",
    'Swingout',
    'Texas Tommy',
    'Tuck Turn',
  ],
  'Solo Jazz': [
    'Apple Jacks',
    'Boogie Back',
    'Boogie Forward',
    'Breeze in the Knees',
    'Camel Walks',
    'Chugs',
    'Fall off the Log',
    'Hangman/ Fish out of Water',
    'Heel Toe/ Happy Feet/ V-Step',
    'Low-downs',
    'Shorty George',
    'Slip Slops',
    'Suzy Qs',
    'Tacky Annies',
    'Tangos',
    'Tick Tocks',
  ],
  Charleston: [
    'Side by side',
    'Slide back',
    'Fishtail',
    'Kick through',
    'Hand to hand',
    'Airplane',
    'Skip up',
    "Johnnie's Drop",
    'Tandem',
    'Windscreen wiper',
    'Butterfly exit',
  ],
};

const STATUS_OPTIONS = [
  { label: 'Learned for the first time', short: 'First time', icon: Star },
  { label: 'Learned again', short: 'Learned again', icon: CirclePlus },
  { label: 'Practiced', short: 'Practiced', icon: Dumbbell },
  { label: 'Used in social', short: 'Social', icon: Users },
  { label: 'Performed', short: 'Performed', icon: Trophy },
];

const MOODS = [
  { label: 'Proud', color: '#ffc557', glyph: 'arch' },
  { label: 'Excited', color: '#ffc557', glyph: 'burst' },
  { label: 'Flowing', color: '#5bd58a', glyph: 'wave' },
  { label: 'Curious', color: '#ffc557', glyph: 'question' },
  { label: 'Challenged', color: '#ff604d', glyph: 'zig' },
  { label: 'Confused', color: '#87a88f', glyph: 'swirl' },
  { label: 'Frustrated', color: '#ff402f', glyph: 'sun' },
  { label: 'Inspired', color: '#ffc557', glyph: 'star' },
];

const INITIAL_ENTRIES = [
  {
    id: 'entry-1',
    move: 'Shorty George',
    family: 'Solo Jazz',
    status: 'Learned for the first time',
    mood: 'Proud',
    note: 'Keep knees soft and stay playful with the rhythm. Need to work on the transition at the end.',
    event: 'Savoy Beginners Class',
    teacher: 'Jasper',
    location: 'Savoy Studio',
    date: '2026-07-14T19:41:00',
  },
  {
    id: 'entry-2',
    move: 'Swingout',
    family: 'Lindy Hop',
    status: 'Practiced',
    mood: 'Challenged',
    note: 'Timing felt clearer today. Starting to get the bounce.',
    event: 'Monday Lindy',
    teacher: 'Mina',
    location: 'Downtown Studio',
    date: '2026-07-13T18:22:00',
  },
  {
    id: 'entry-3',
    move: 'Tuck Turn',
    family: 'Lindy Hop',
    status: 'Used in social',
    mood: 'Flowing',
    note: 'Felt smooth in social dancing for the first time.',
    event: 'Sunday Social',
    teacher: '',
    location: 'Blue Room',
    date: '2026-07-12T14:05:00',
  },
  {
    id: 'entry-4',
    move: 'Tacky Annies',
    family: 'Solo Jazz',
    status: 'Learned again',
    mood: 'Inspired',
    note: 'Teacher emphasized knees and groove. Much better.',
    event: 'Solo Lab',
    teacher: 'Ari',
    location: 'Savoy Studio',
    date: '2026-07-20T18:25:00',
  },
  {
    id: 'entry-5',
    move: 'Shorty George',
    family: 'Solo Jazz',
    status: 'Learned again',
    mood: 'Proud',
    note: 'Teacher emphasized knees and groove. Much better.',
    event: 'Solo Lab',
    teacher: 'Ari',
    location: 'Savoy Studio',
    date: '2026-07-20T18:25:00',
  },
  {
    id: 'entry-6',
    move: 'Shorty George',
    family: 'Solo Jazz',
    status: 'Practiced',
    mood: 'Proud',
    note: 'Timing felt clearer today. Starting to get the bounce.',
    event: 'Practice Hour',
    teacher: '',
    location: 'Savoy Studio',
    date: '2026-08-04T19:10:00',
  },
  {
    id: 'entry-7',
    move: '6-count basic',
    family: 'Lindy Hop',
    status: 'Practiced',
    mood: 'Curious',
    note: 'Cleaned up the rock step.',
    event: 'Beginner Lindy',
    teacher: 'Jasper',
    location: 'Savoy Studio',
    date: '2026-07-08T19:08:00',
  },
  {
    id: 'entry-8',
    move: 'Apple Jacks',
    family: 'Solo Jazz',
    status: 'Learned for the first time',
    mood: 'Excited',
    note: 'Tiny hops, relaxed shoulders.',
    event: 'Solo Basics',
    teacher: 'Mina',
    location: 'Savoy Studio',
    date: '2026-07-06T20:10:00',
  },
];

const todayDate = '2026-07-14T20:07:00';

function formatDate(value, style = 'long') {
  const date = new Date(value);
  if (style === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusShort(status) {
  return STATUS_OPTIONS.find((item) => item.label === status)?.short ?? status;
}

function deriveMoveBank(entries, customMoves) {
  const familyMoves = Object.entries(MOVE_TAXONOMY).flatMap(([family, moves]) =>
    moves.map((move) => ({ move, family, custom: false })),
  );
  const custom = customMoves.map((move) => ({ ...move, custom: true }));
  const lookup = new Map();

  [...familyMoves, ...custom].forEach((item) => {
    lookup.set(`${item.family}:${item.move}`, {
      ...item,
      logs: [],
      firstLearned: null,
      latestStatus: 'Not logged yet',
      commonMood: 'Not yet',
    });
  });

  entries.forEach((entry) => {
    const key = `${entry.family}:${entry.move}`;
    const existing =
      lookup.get(key) ??
      {
        move: entry.move,
        family: entry.family,
        custom: true,
        logs: [],
        firstLearned: null,
        latestStatus: 'Not logged yet',
        commonMood: 'Not yet',
      };
    existing.logs = [...existing.logs, entry].toSorted(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    lookup.set(key, existing);
  });

  return Array.from(lookup.values()).map((item) => {
    if (item.logs.length === 0) return item;
    const sortedAsc = item.logs.toSorted((a, b) => new Date(a.date) - new Date(b.date));
    const moodCounts = new Map();
    item.logs.forEach((log) => {
      moodCounts.set(log.mood, (moodCounts.get(log.mood) ?? 0) + 1);
    });
    const commonMood = Array.from(moodCounts.entries()).toSorted((a, b) => b[1] - a[1])[0][0];
    return {
      ...item,
      firstLearned: sortedAsc[0].date,
      latestStatus: item.logs[0].status,
      commonMood,
    };
  });
}

function App() {
  const [activeTab, setActiveTab] = useState('Journal');
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [customMoves, setCustomMoves] = useState([]);
  const [selectedMove, setSelectedMove] = useState('Shorty George');
  const [checkin, setCheckin] = useState(createFreshCheckin);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const moveBank = useMemo(() => deriveMoveBank(entries, customMoves), [entries, customMoves]);
  const entriesByDate = useMemo(
    () => entries.toSorted((a, b) => new Date(b.date) - new Date(a.date)),
    [entries],
  );
  const selectedMoveData = useMemo(
    () => moveBank.find((item) => item.move === selectedMove) ?? moveBank[0],
    [moveBank, selectedMove],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelectorAll('.phone-shell, .app-surface, .screen').forEach((element) => {
      element.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, [activeTab, checkin.step, selectedMove]);

  const navigate = useCallback((tab) => {
    startTransition(() => setActiveTab(tab));
  }, []);

  const beginCheckin = useCallback(() => {
    setCheckin(createFreshCheckin());
    navigate('Check In');
  }, [navigate]);

  const saveEntry = useCallback(
    (draft) => {
      const entry = {
        id: `entry-${Date.now()}`,
        move: draft.move,
        family: draft.family,
        status: draft.status,
        mood: draft.mood,
        note: draft.note,
        event: draft.event,
        teacher: draft.teacher,
        location: draft.location,
        date: todayDate,
      };
      setEntries((current) => [entry, ...current]);
      setSelectedMove(draft.move);
      setCheckin((current) => ({ ...current, step: 'success', savedEntry: entry }));
    },
    [],
  );

  const addCustomMove = useCallback((family, move) => {
    const normalized = move.trim();
    if (!normalized) return;
    setCustomMoves((current) => {
      const exists = current.some(
        (item) => item.family === family && item.move.toLowerCase() === normalized.toLowerCase(),
      );
      return exists ? current : [...current, { family, move: normalized }];
    });
    setCheckin((current) => ({ ...current, move: normalized, step: 'status' }));
  }, []);

  const tabProps = {
    activeTab,
    navigate,
    entries,
    entriesByDate,
    moveBank,
    beginCheckin,
    setSelectedMove,
    selectedMoveData,
    query,
    setQuery,
    filter,
    setFilter,
    checkin,
    setCheckin,
    saveEntry,
    addCustomMove,
  };

  return (
    <main className="stage">
      <section className="phone-shell" aria-label="Swingo MVP preview">
        <div className="screen-glow" />
        <div className="app-surface">
          {activeTab === 'Journal' ? <JournalScreen key="journal" {...tabProps} /> : null}
          {activeTab === 'Check In' ? <CheckInScreen key={`check-${checkin.step}`} {...tabProps} /> : null}
          {activeTab === 'Moves' ? <MoveBankScreen key="moves" {...tabProps} /> : null}
          {activeTab === 'Wrapped' ? <WrappedScreen key="wrapped" {...tabProps} /> : null}
          {activeTab === 'Detail' ? <MoveDetailScreen key={selectedMove} {...tabProps} /> : null}
        </div>
      </section>
    </main>
  );
}

function createFreshCheckin() {
  return {
    step: 'family',
    family: '',
    move: '',
    status: '',
    mood: 'Proud',
    note: '',
    event: 'Savoy Beginners Class',
    teacher: 'Jasper',
    location: 'Savoy Studio',
    savedEntry: null,
  };
}

const Brand = memo(function Brand() {
  return (
    <div className="brand">
      <span>Swingo</span>
      <Sparkles size={17} aria-hidden="true" />
    </div>
  );
});

function ScreenHeader({ title, eyebrow, onBack, action }) {
  return (
    <header className="screen-header">
      {onBack ? (
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back">
          <ArrowLeft size={21} />
        </button>
      ) : null}
      <div className="screen-title-block">
        {title ? <h1>{title}</h1> : null}
        {eyebrow ? <span className={`header-eyebrow ${title ? 'below' : ''}`}>{eyebrow}</span> : null}
      </div>
      {action ?? <span className="header-spacer" />}
    </header>
  );
}

function JournalScreen({ entriesByDate, moveBank, beginCheckin, navigate, setSelectedMove }) {
  const loggedMoves = useMemo(() => moveBank.filter((item) => item.logs.length > 0).length, [moveBank]);

  return (
    <div className="screen">
      <div className="journal-hero">
        <div className="journal-top">
          <Brand />
          <button className="round-dark-button" type="button" aria-label="Settings">
            <Settings size={18} />
          </button>
        </div>
        <div className="stat-row">
          <StatPill value={loggedMoves} label="Moves collected" />
          <StatPill value={entriesByDate.length} label="Journal entries" />
        </div>
        <h1>
          Your dance <span>story</span> is growing.
        </h1>
        <button className="primary-cta gold" type="button" onClick={beginCheckin}>
          <span>Check in today's dance</span>
          <Plus size={22} />
        </button>
      </div>

      <section className="feed-section" aria-label="Recent entries">
        <div className="section-label">Recent entries</div>
        <div className="entry-list">
          {entriesByDate.slice(0, 5).map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onOpen={() => {
                setSelectedMove(entry.move);
                navigate('Detail');
              }}
            />
          ))}
        </div>
      </section>
      <BottomNav active="Journal" navigate={navigate} />
    </div>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="stat-pill">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function JournalCard({ entry, onOpen }) {
  const meta = FAMILY_META[entry.family];

  return (
    <button className={`journal-card ${meta.key}`} type="button" onClick={onOpen}>
      <div className="card-menu" aria-hidden="true">
        <Menu size={15} />
      </div>
      <small>
        {formatDate(entry.date)}
        <br />
        {formatTime(entry.date)}
      </small>
      <h2>
        {entry.status.includes('Practiced')
          ? 'I practiced'
          : entry.status.includes('Used')
            ? 'I used in social'
            : 'I learned'}
        <span>{entry.move}</span>
      </h2>
      <p>
        {entry.family} · {statusShort(entry.status)}
      </p>
      <span className="mood-line">
        <MoodGlyph mood={entry.mood} size="tiny" />
        {entry.mood}
      </span>
      <Sticker family={entry.family} mood={entry.mood} />
    </button>
  );
}

function CheckInScreen(props) {
  const { checkin } = props;
  if (checkin.step === 'family') return <FamilyStep {...props} />;
  if (checkin.step === 'move') return <MoveStep {...props} />;
  if (checkin.step === 'status') return <StatusStep {...props} />;
  if (checkin.step === 'mood') return <MoodStep {...props} />;
  return <SuccessStep {...props} />;
}

function Progress({ step }) {
  const width = { family: '24%', move: '48%', status: '68%', mood: '82%', success: '100%' }[step];
  return (
    <div className="progress-track" aria-hidden="true">
      <span style={{ width }} />
    </div>
  );
}

function FamilyStep({ checkin, setCheckin, navigate }) {
  return (
    <div className="screen check-screen">
      <ScreenHeader
        eyebrow="Check In"
        onBack={() => navigate('Journal')}
        action={<span className="header-spacer" />}
      />
      <Progress step={checkin.step} />
      <div className="prompt-row">
        <h1>What did you learn today?</h1>
        <DanceFigure family="Lindy Hop" />
      </div>
      <div className="family-stack">
        {Object.entries(FAMILY_META).map(([family, meta]) => (
          <button
            className={`family-tile ${meta.key}`}
            type="button"
            key={family}
            onClick={() => setCheckin((current) => ({ ...current, family, step: 'move' }))}
          >
            <span>{family}</span>
            <DanceFigure family={family} compact />
          </button>
        ))}
      </div>
      <button className="text-link" type="button" onClick={() => setCheckin((c) => ({ ...c, family: 'Solo Jazz', step: 'move' }))}>
        Not sure? Browse all moves <ChevronRight size={16} />
      </button>
      <BottomNav active="Check In" navigate={navigate} />
    </div>
  );
}

function MoveStep({ checkin, setCheckin, navigate, moveBank, addCustomMove }) {
  const [moveQuery, setMoveQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const deferredQuery = useDeferredValue(moveQuery);
  const family = checkin.family || 'Solo Jazz';
  const meta = FAMILY_META[family];
  const moves = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return moveBank
      .filter((item) => item.family === family)
      .filter((item) => (needle ? item.move.toLowerCase().includes(needle) : true))
      .slice(0, 18);
  }, [deferredQuery, family, moveBank]);

  return (
    <div className="screen check-screen">
      <ScreenHeader
        eyebrow={family}
        onBack={() => setCheckin((current) => ({ ...current, step: 'family' }))}
        action={<span className="header-spacer" />}
      />
      <Progress step={checkin.step} />
      <h1 className="step-title">Which move did you learn or practice?</h1>
      <SearchBox value={moveQuery} onChange={setMoveQuery} placeholder="Search a move..." />
      <div className="move-grid" style={{ '--family-color': meta.color }}>
        {moves.map((item) => (
          <button
            type="button"
            className={`move-bubble ${item.move === 'Shorty George' ? 'selected' : ''}`}
            key={`${item.family}-${item.move}`}
            onClick={() => setCheckin((current) => ({ ...current, move: item.move, step: 'status' }))}
          >
            {item.move}
          </button>
        ))}
      </div>
      <form
        className="custom-move"
        onSubmit={(event) => {
          event.preventDefault();
          addCustomMove(family, customName);
          setCustomName('');
        }}
      >
        <input
          value={customName}
          onChange={(event) => setCustomName(event.target.value)}
          placeholder="Can't find it? Add a custom move"
          aria-label="Custom move name"
        />
        <button type="submit" aria-label="Add custom move">
          <Pencil size={16} />
        </button>
      </form>
      <BottomNav active="Check In" navigate={navigate} />
    </div>
  );
}

function StatusStep({ checkin, setCheckin, navigate, moveBank }) {
  const family = checkin.family || 'Solo Jazz';
  const meta = FAMILY_META[family];
  const move = checkin.move || 'Shorty George';
  const prior = moveBank.find((item) => item.family === family && item.move === move);
  const suggested = prior?.logs.length ? 'Practiced' : 'Learned for the first time';

  return (
    <div className="screen check-screen">
      <ScreenHeader
        onBack={() => setCheckin((current) => ({ ...current, step: 'move' }))}
        action={<DanceFigure family={family} compact />}
      />
      <Progress step={checkin.step} />
      <h1 className="status-title">
        What happened with <span style={{ color: meta.color }}>{move}</span> today?
      </h1>
      {prior?.logs.length ? (
        <p className="helper-copy">You first learned {move} on {formatDate(prior.firstLearned, 'short')}.</p>
      ) : null}
      <div className="status-stack">
        {STATUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = (checkin.status || suggested) === option.label;
          return (
            <button
              className={`status-option ${selected ? 'selected' : ''}`}
              type="button"
              key={option.label}
              onClick={() =>
                setCheckin((current) => ({ ...current, status: option.label, step: 'mood' }))
              }
            >
              <Icon size={25} />
              <span>{option.label}</span>
              {selected ? <Check size={18} /> : null}
            </button>
          );
        })}
      </div>
      <button
        className="primary-cta mint bottom-action"
        type="button"
        onClick={() =>
          setCheckin((current) => ({ ...current, status: current.status || suggested, step: 'mood' }))
        }
      >
        Next
      </button>
      <BottomNav active="Check In" navigate={navigate} />
    </div>
  );
}

function MoodStep({ checkin, setCheckin, saveEntry, navigate }) {
  return (
    <div className="screen check-screen mood-screen">
      <ScreenHeader
        eyebrow="Almost there"
        onBack={() => setCheckin((current) => ({ ...current, step: 'status' }))}
        action={<span className="header-spacer" />}
      />
      <Progress step={checkin.step} />
      <h1 className="step-title compact">How did this learning feel?</h1>
      <div className="mood-grid">
        {MOODS.map((mood) => (
          <button
            className={`mood-option ${checkin.mood === mood.label ? 'selected' : ''}`}
            type="button"
            key={mood.label}
            onClick={() => setCheckin((current) => ({ ...current, mood: mood.label }))}
          >
            <MoodGlyph mood={mood.label} />
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="note">
        What do you want to remember?
      </label>
      <textarea
        id="note"
        value={checkin.note}
        onChange={(event) => setCheckin((current) => ({ ...current, note: event.target.value }))}
        placeholder="Keep knees soft. Don't rush the rhythm."
      />
      <div className="optional-fields">
        {[
          ['event', 'Class or event (optional)', CalendarDays],
          ['teacher', 'Teacher (optional)', Users],
          ['location', 'Location (optional)', Footprints],
        ].map(([key, label, Icon]) => (
          <label className="mini-field" key={key}>
            <Icon size={17} />
            <span>{label}</span>
            <input
              value={checkin[key]}
              onChange={(event) => setCheckin((current) => ({ ...current, [key]: event.target.value }))}
            />
            <button
              type="button"
              aria-label={`Clear ${label}`}
              onClick={() => setCheckin((current) => ({ ...current, [key]: '' }))}
            >
              <X size={14} />
            </button>
          </label>
        ))}
      </div>
      <button
        className="primary-cta mint save-button mood-save-button"
        type="button"
        onClick={() =>
          saveEntry({
            ...checkin,
            status: checkin.status || 'Learned for the first time',
            note:
              checkin.note ||
              'Keep knees soft and stay playful with the rhythm. Need to work on the transition at the end.',
          })
        }
      >
        Save to my dance story
      </button>
      <BottomNav active="Check In" navigate={navigate} />
    </div>
  );
}

function SuccessStep({ checkin, setCheckin, navigate }) {
  const entry = checkin.savedEntry;
  const family = entry?.family ?? 'Solo Jazz';
  const move = entry?.move ?? 'Shorty George';
  return (
    <div className="screen success-screen">
      <div className="spotlight" />
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <h1>Nice one!</h1>
      <h2>
        <span>{move}</span> added to your 2026 dance story.
      </h2>
      <Sticker family={family} mood={entry?.mood ?? 'Proud'} hero />
      <div className="save-summary">
        <p>
          {family} · {entry?.status ?? 'Learned for the first time'}
        </p>
        <span>
          <MoodGlyph mood={entry?.mood ?? 'Proud'} size="tiny" /> Mood: {entry?.mood ?? 'Proud'}
        </span>
      </div>
      <div className="success-actions">
        <button className="primary-cta gold" type="button" onClick={() => navigate('Journal')}>
          View in journal
        </button>
        <button className="outline-button" type="button" onClick={() => setCheckin(createFreshCheckin())}>
          Add another move
        </button>
        <button className="outline-button" type="button" onClick={() => navigate('Moves')}>
          Go to Move Bank
        </button>
      </div>
    </div>
  );
}

function MoveBankScreen({
  moveBank,
  entries,
  navigate,
  setSelectedMove,
  query,
  setQuery,
  filter,
  setFilter,
}) {
  const deferredQuery = useDeferredValue(query);
  const loggedMoves = useMemo(() => moveBank.filter((item) => item.logs.length > 0), [moveBank]);
  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return moveBank
      .filter((item) => (filter === 'All' ? item.logs.length > 0 : item.family === filter && item.logs.length > 0))
      .filter((item) => (needle ? item.move.toLowerCase().includes(needle) : true))
      .toSorted((a, b) => b.logs.length - a.logs.length || a.move.localeCompare(b.move));
  }, [deferredQuery, filter, moveBank]);

  return (
    <div className="screen move-bank-screen">
      <ScreenHeader
        title="Move Bank"
        eyebrow={`${loggedMoves.length} moves collected in 2026`}
        action={
          <button className="round-dark-button" type="button" aria-label="Filter moves">
            <Filter size={17} />
          </button>
        }
      />
      <SearchBox value={query} onChange={setQuery} placeholder="Search moves..." />
      <div className="filter-row">
        {['All', 'Lindy Hop', 'Solo Jazz', 'Charleston'].map((item) => (
          <button
            type="button"
            className={filter === item ? 'selected' : ''}
            key={item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="bank-section-title">
        <span>Recently added</span>
        <button type="button">See all</button>
      </div>
      <div className="move-list">
        {filtered.slice(0, 8).map((item) => (
          <MoveRow
            key={`${item.family}-${item.move}`}
            item={item}
            onClick={() => {
              setSelectedMove(item.move);
              navigate('Detail');
            }}
          />
        ))}
      </div>
      <div className="bank-section-title all">
        <span>All moves</span>
        <small>{entries.length} total logs</small>
      </div>
      <BottomNav active="Moves" navigate={navigate} />
    </div>
  );
}

function MoveRow({ item, onClick }) {
  const meta = FAMILY_META[item.family];
  const recent = item.logs[0];
  return (
    <button className="move-row" type="button" onClick={onClick}>
      <Sticker family={item.family} mood={item.commonMood} small />
      <span>
        <strong>{item.move}</strong>
        <small>{item.family}</small>
      </span>
      <span className="row-stat">
        <strong>{item.logs.length} logs</strong>
        <small>{recent ? formatDate(recent.date, 'short') : 'No logs'}</small>
      </span>
      <i style={{ background: meta.color }} />
    </button>
  );
}

function MoveDetailScreen({ selectedMoveData, navigate, beginCheckin }) {
  const item = selectedMoveData;
  const meta = FAMILY_META[item.family];
  const logs = item.logs;
  return (
    <div className="screen detail-screen">
      <ScreenHeader
        onBack={() => navigate('Moves')}
        action={
          <button className="round-dark-button" type="button" aria-label="Share move">
            <Share2 size={17} />
          </button>
        }
      />
      <div className="detail-heading">
        <h1>{item.move}</h1>
        <p style={{ color: meta.color }}>{item.family}</p>
      </div>
      <div className="detail-hero">
        <Sticker family={item.family} mood={item.commonMood} hero />
        <Sparkles size={18} />
      </div>
      <div className="summary-strip">
        <SummaryItem label="First learned" value={item.firstLearned ? formatDate(item.firstLearned, 'short') : 'Not yet'} />
        <SummaryItem label="Total logs" value={`${logs.length} times`} />
        <SummaryItem label="Latest status" value={statusShort(item.latestStatus)} />
        <SummaryItem label="Most common mood" value={item.commonMood} />
      </div>
      <section className="history">
        <h2>History</h2>
        <div className="timeline">
          {logs.map((log) => (
            <article className="timeline-card" key={log.id}>
              <span className="timeline-dot" />
              <small>
                {formatDate(log.date)} · {formatTime(log.date)}
              </small>
              <h3>{log.status}</h3>
              <p>{log.note}</p>
              <Sticker family={log.family} mood={log.mood} small />
            </article>
          ))}
        </div>
      </section>
      <button className="primary-cta mint save-button" type="button" onClick={beginCheckin}>
        Add another log
      </button>
      <BottomNav active="Moves" navigate={navigate} />
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <span>
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function WrappedScreen({ entries, moveBank, navigate, beginCheckin }) {
  const stats = useMemo(() => {
    const familyCounts = entries.reduce((counts, entry) => {
      counts.set(entry.family, (counts.get(entry.family) ?? 0) + 1);
      return counts;
    }, new Map());
    const topFamily = Array.from(familyCounts.entries()).toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? 'Solo Jazz';
    const logged = moveBank.filter((item) => item.logs.length > 0);
    const mostRevisited = logged.toSorted((a, b) => b.logs.length - a.logs.length)[0]?.move ?? 'Shorty George';
    const latest = entries.toSorted((a, b) => new Date(b.date) - new Date(a.date))[0]?.move ?? 'Shorty George';
    return { topFamily, mostRevisited, latest, moves: logged.length };
  }, [entries, moveBank]);

  return (
    <div className="screen wrapped-screen">
      <ScreenHeader title="Your 2026 Swingo Wrapped is building" />
      <div className="wrapped-orbit">
        <Sparkles size={22} />
        <h2>{stats.moves}</h2>
        <p>moves collected so far</p>
      </div>
      <div className="wrapped-grid">
        <WrappedCard label="Dance entries" value={entries.length} tone="gold" />
        <WrappedCard label="Top family" value={stats.topFamily} tone="mint" />
        <WrappedCard label="Most revisited" value={stats.mostRevisited} tone="coral" />
        <WrappedCard label="Latest move" value={stats.latest} tone="gold" />
      </div>
      <p className="wrapped-copy">
        Every check-in gives your future dance report more rhythm: classes, moods, revisits, and
        the tiny moments that would otherwise slip away.
      </p>
      <button className="primary-cta gold save-button" type="button" onClick={beginCheckin}>
        Add today's dance
      </button>
      <BottomNav active="Wrapped" navigate={navigate} />
    </div>
  );
}

function WrappedCard({ label, value, tone }) {
  return (
    <article className={`wrapped-card ${tone}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="search-box">
      <Search size={18} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function BottomNav({ active, navigate }) {
  const items = [
    ['Journal', List],
    ['Check In', CirclePlus],
    ['Moves', Share2],
    ['Wrapped', WandSparkles],
  ];
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(([label, Icon]) => (
        <button
          className={active === label ? 'active' : ''}
          type="button"
          key={label}
          onClick={() => navigate(label)}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function DanceFigure({ family, compact = false }) {
  const meta = FAMILY_META[family];
  const people = family === 'Lindy Hop' ? 2 : 1;
  return (
    <div className={`dance-figure ${compact ? 'compact' : ''}`} style={{ '--figure-color': meta.color }}>
      {Array.from({ length: people }, (_, index) => (
        <span key={index} className={`person person-${index + 1}`}>
          <i className="head" />
          <i className="body" />
          <i className="arm a" />
          <i className="arm b" />
          <i className="leg a" />
          <i className="leg b" />
        </span>
      ))}
      <Sparkles size={compact ? 12 : 16} />
    </div>
  );
}

function Sticker({ family, mood, small = false, hero = false }) {
  const meta = FAMILY_META[family] ?? FAMILY_META['Solo Jazz'];
  const moodColor = MOODS.find((item) => item.label === mood)?.color ?? meta.color;
  return (
    <span
      className={`sticker ${meta.key} ${small ? 'small' : ''} ${hero ? 'hero' : ''}`}
      style={{ '--sticker-color': moodColor, '--sticker-bg': meta.color }}
      aria-hidden="true"
    >
      <i />
    </span>
  );
}

function MoodGlyph({ mood, size = 'normal' }) {
  const item = MOODS.find((option) => option.label === mood) ?? MOODS[0];
  return (
    <span className={`mood-glyph ${item.glyph} ${size}`} style={{ '--mood-color': item.color }} aria-hidden="true">
      <i />
    </span>
  );
}

createRoot(document.getElementById('root')).render(<App />);
