import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  CirclePlus,
  ExternalLink,
  Filter,
  Link,
  ListChecks,
  MapPin,
  Search,
  Settings,
  Share2,
  Sparkles,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react';
import {
  COMPANION_ASSET_VERSION,
  COMPANION_GENDERS,
  COMPANION_PRESETS,
  COMPANION_STYLES,
  DEFAULT_COMPANION_PRESET,
  companionChoicesFromPreset,
  companionCopy,
  companionPresetFromChoices,
  companionStateFromMoods,
  companionSuccessTone,
} from './lib/companions.js';
import { daysSince, fmt, sortByRecency, timeStr, todayStr } from './lib/dates.js';
import { MOODS, MOOD_ORDER, moodKeys, moodList, topMoodKey } from './lib/moods.js';
import {
  DEFAULT_FAMILY_COLOR,
  FAMILIES,
  STATUSES,
  STATUS_ORDER,
  TAXONOMY,
  aggregateEntries,
  entryMoveKey,
  familyColor,
  iconSrc,
  moveKey,
} from './lib/moves.js';
import {
  MAX_REFERENCES_PER_MOVE,
  normalizeReferenceUrl,
  normalizedReferenceUrls,
  referenceDisplayName,
  referenceDrafts,
} from './lib/references.js';
import { readStoredState, writeStoredState } from './lib/storage.js';
import { pluralize } from './lib/text.js';
import './styles.css';

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

function App() {
  const stored = useMemo(readStoredState, []);
  const [companionPreset, setCompanionPreset] = useState(
    COMPANION_PRESETS[stored.companionPreset] ? stored.companionPreset : '',
  );
  const [inviteAccepted, setInviteAccepted] = useState(Boolean(stored.inviteAccepted));
  const [view, setView] = useState(() => (stored.inviteAccepted && COMPANION_PRESETS[stored.companionPreset] ? 'journal' : 'setup'));
  const [step, setStep] = useState(0);
  const [entries, setEntries] = useState(() => (stored.entries?.length ? stored.entries : seedEntries()));
  const [customMoves, setCustomMoves] = useState(() => stored.customMoves || []);
  const [moveReferences, setMoveReferences] = useState(() => stored.moveReferences || {});
  const [checkin, setCheckin] = useState(freshCheckin);
  const [moveSearch, setMoveSearch] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('all');
  const [bankMode, setBankMode] = useState('list');
  const [detailKey, setDetailKey] = useState(null);
  const [detailFrom, setDetailFrom] = useState('journal');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    writeStoredState({ entries, customMoves, moveReferences, companionPreset, inviteAccepted });
  }, [entries, customMoves, moveReferences, companionPreset, inviteAccepted]);

  useEffect(() => {
    document.querySelector('.app-scroll')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view, step, detailKey]);

  const bank = useMemo(() => aggregateEntries(entries), [entries]);
  const entriesSorted = useMemo(() => sortByRecency(entries), [entries]);

  function startCheckin(initial = freshCheckin(), nextStep = 0) {
    setView('checkin');
    setStep(nextStep);
    setCheckin(initial);
    setMoveSearch('');
    setAddingCustom(false);
    setCustomName('');
    setOpenMenuId(null);
  }

  function goBack() {
    if (view === 'detail') {
      setView(detailFrom);
      return;
    }
    if (view === 'checkin') {
      if (step <= 0) setView('journal');
      else setStep((current) => current - 1);
      return;
    }
    setView('journal');
  }

  function defaultStatus(family, moveName) {
    return entries.some((entry) => entry.family === family && entry.moveName === moveName)
      ? 'learned_again'
      : 'first_learned';
  }

  function selectMove(moveName, family) {
    setCheckin((current) => ({
      ...current,
      family,
      moveName,
      status: defaultStatus(family, moveName),
    }));
    setStep(2);
  }

  function saveCheckin() {
    if (!checkin.family || !checkin.moveName) return;
    const now = new Date();
    const referenceUrls = normalizedReferenceUrls(checkin);
    const entry = {
      id: `entry-${Date.now()}`,
      ...checkin,
      date: checkin.date || todayStr(now),
      time: timeStr(now),
      status: checkin.status || 'first_learned',
      mood: moodKeys(checkin.mood),
      note: checkin.note.trim(),
      referenceUrls: [],
      referenceUrl: '',
    };
    setEntries((current) => [entry, ...current]);
    if (referenceUrls.length) {
      const key = moveKey(checkin.family, checkin.moveName);
      setMoveReferences((current) => {
        const existing = current[key] || [];
        const existingUrls = new Set(existing.map((item) => item.url));
        const remainingSlots = Math.max(0, MAX_REFERENCES_PER_MOVE - existing.length);
        const newReferences = referenceUrls
          .filter((url) => !existingUrls.has(url))
          .slice(0, remainingSlots)
          .map((url, index) => ({
            id: `ref-${Date.now()}-${index}`,
            url,
            createdAt: now.toISOString(),
          }));
        if (!newReferences.length) return current;
        return {
          ...current,
          [key]: [...existing, ...newReferences],
        };
      });
    }
    setStep(4);
  }

  const context = {
    view,
    setView,
    step,
    setStep,
    entries,
    setEntries,
    entriesSorted,
    bank,
    checkin,
    setCheckin,
    moveSearch,
    setMoveSearch,
    bankSearch,
    setBankSearch,
    bankFilter,
    setBankFilter,
    bankMode,
    setBankMode,
    customMoves,
    setCustomMoves,
    moveReferences,
    setMoveReferences,
    customName,
    setCustomName,
    addingCustom,
    setAddingCustom,
    detailKey,
    setDetailKey,
    detailFrom,
    setDetailFrom,
    openMenuId,
    setOpenMenuId,
    settingsOpen,
    setSettingsOpen,
    startCheckin,
    goBack,
    selectMove,
    saveCheckin,
    companionPreset,
    setCompanionPreset,
    inviteAccepted,
    setInviteAccepted,
  };

  const showNav = view === 'journal' || view === 'moves' || view === 'wrapped' || view === 'detail' || (view === 'checkin' && step <= 2);

  return (
    <main className="swingo-stage">
      <section className="app-shell" aria-label="Swingo app">
        <div className="app-scroll">
          {view === 'setup' && <SetupScreen {...context} />}
          {view === 'journal' && <JournalScreen {...context} />}
          {view === 'checkin' && <CheckinScreen {...context} />}
          {view === 'moves' && <MoveBankScreen {...context} />}
          {view === 'detail' && <MoveDetailScreen {...context} />}
          {view === 'wrapped' && <WrappedScreen {...context} />}
        </div>
        {showNav && <BottomNav view={view} detailFrom={detailFrom} startCheckin={startCheckin} setView={setView} />}
      </section>
    </main>
  );
}

function SetupScreen({ companionPreset, setCompanionPreset, setInviteAccepted, setView }) {
  const initialChoices = companionChoicesFromPreset(companionPreset);
  const [gender, setGender] = useState(initialChoices.gender);
  const [style, setStyle] = useState(initialChoices.style);
  const selectedPreset = companionPresetFromChoices(gender, style);

  function continueToApp() {
    if (!selectedPreset) return;
    setCompanionPreset(selectedPreset);
    setInviteAccepted(true);
    setView('journal');
  }

  return (
    <div className="screen setup-screen">
      <div className="brand-script">Swingo</div>
      <h1 className="setup-title">Choose your dance self.</h1>
      <p className="setup-copy">
        Pick the version that feels closest to you. Swingo will use it whenever your logged emotion needs a reaction.
      </p>
      <div className="setup-choice-block">
        <p>I dance as</p>
        <OptionGroup className="setup-segment" options={COMPANION_GENDERS} selected={gender} onSelect={setGender} />
      </div>
      <div className="setup-choice-block">
        <p>My dance vibe is</p>
        <OptionGroup className="setup-segment" options={COMPANION_STYLES} selected={style} onSelect={setStyle} />
      </div>
      {selectedPreset && (
        <section className="setup-preview">
          <DancerCompanion preset={selectedPreset} state="reflect" size="preview" />
          <div>
            <strong>{COMPANION_PRESETS[selectedPreset].label}</strong>
            <span>{COMPANION_PRESETS[selectedPreset].sub}</span>
          </div>
        </section>
      )}
      <button className="gold-cta setup-cta" type="button" disabled={!selectedPreset} onClick={continueToApp}>
        Start reflecting
        <span>+</span>
      </button>
    </div>
  );
}

function JournalScreen({
  entries,
  setEntries,
  entriesSorted,
  bank,
  setView,
  setDetailKey,
  setDetailFrom,
  openMenuId,
  setOpenMenuId,
  settingsOpen,
  setSettingsOpen,
  startCheckin,
  companionPreset,
}) {
  const hasEntries = entries.length > 0;

  function openDetail(entry) {
    setDetailKey(entryMoveKey(entry));
    setDetailFrom('journal');
    setOpenMenuId(null);
    setView('detail');
  }

  return (
    <div className="screen journal-screen">
      <div className="journal-top">
        <div className="brand-script">Swingo</div>
        <div className="settings-wrap">
          <button className="icon-btn" type="button" onClick={() => setSettingsOpen(!settingsOpen)} aria-label="Settings">
            <Settings size={20} />
          </button>
          {settingsOpen && (
            <div className="settings-menu">
              <button type="button" onClick={() => { setEntries(seedEntries()); setSettingsOpen(false); }}>
                Load sample story
              </button>
              <button type="button" className="danger" onClick={() => { setEntries([]); setSettingsOpen(false); }}>
                Clear my dance story
              </button>
              <button type="button" onClick={() => { setView('setup'); setSettingsOpen(false); }}>
                Change companion
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="stat-pills">
        <StatPill tone="gold" value={bank.length} label="Moves collected" />
        <StatPill tone="coral" value={entries.length} label="2026 entries" />
      </div>

      <h1 className="hero-title">
        Your dance <em>story</em> {hasEntries ? 'is growing.' : 'starts here.'}
      </h1>

      <section className="companion-prompt">
        <DancerCompanion preset={companionPreset} state="reflect" size="home" />
        <div>
          <p>What do you want to remember from today's dance?</p>
          <span>Your dance self is ready when you are.</span>
        </div>
      </section>

      <button className="gold-cta" type="button" onClick={() => startCheckin()}>
        Check in today's dance
        <span>+</span>
      </button>

      {hasEntries ? (
        <section className="recent-section">
          <h2>Recent entries</h2>
          {entriesSorted.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpen={() => openDetail(entry)}
              onDelete={() => {
                setEntries((current) => current.filter((item) => item.id !== entry.id));
                setOpenMenuId(null);
              }}
            />
          ))}
        </section>
      ) : (
        <div className="empty-state">
          <Sticker family="lindy" moveName="Swingout" />
          <h2>Every move you learn becomes part of your story.</h2>
          <p>Check in the first move you learned.</p>
        </div>
      )}
    </div>
  );
}

function OptionGroup({ options, selected, onSelect, className, label }) {
  return (
    <div className={className} aria-label={label}>
      {options.map(([key, optionLabel]) => (
        <button type="button" className={selected === key ? 'selected' : ''} key={key} onClick={() => onSelect(key)}>
          {optionLabel}
        </button>
      ))}
    </div>
  );
}

function MoodEmojis({ value, className }) {
  const moods = moodList(value);
  if (!moods.length) return null;
  return (
    <span className={className} aria-label={moods.map((mood) => mood.label).join(', ')}>
      <span aria-hidden="true">{moods.map((mood) => mood.emoji).join(' ')}</span>
    </span>
  );
}

function StatPill({ tone, value, label }) {
  return (
    <div className="stat-pill" data-tone={tone}>
      <span />
      <b>{value}</b>
      {label}
    </div>
  );
}

function JournalCard({ entry, openMenuId, setOpenMenuId, onOpen, onDelete }) {
  const family = FAMILIES[entry.family];
  const status = STATUSES[entry.status];
  const menuOpen = openMenuId === entry.id;

  return (
    <article className="journal-card" style={{ '--move-color': family.color }}>
      <div className="card-glow" />
      <div className="card-content">
        <div className="card-head">
          <p>
            {fmt(entry.date).full}
            <br />
            <span>{entry.time}</span>
          </p>
          <button type="button" onClick={() => setOpenMenuId(menuOpen ? null : entry.id)} aria-label="Entry menu">
            ⋯
          </button>
        </div>
        <p className="statement">{status.statement}</p>
        <button type="button" className="card-title" onClick={onOpen}>
          {entry.moveName}
        </button>
        <p className="card-meta">
          {family.label} · {status.short}
        </p>
        <MoodEmojis value={entry.mood} className="mood-chip" />
        {entry.note && <p className="note-preview">"{entry.note}"</p>}
      </div>
      <button type="button" className="card-sticker" onClick={onOpen} aria-label={`Open ${entry.moveName}`}>
        <Sticker family={entry.family} moveName={entry.moveName} />
      </button>
      {menuOpen && (
        <div className="entry-menu">
          <button type="button" onClick={onOpen}>View move</button>
          <button type="button" className="danger" onClick={onDelete}>Delete entry</button>
        </div>
      )}
    </article>
  );
}

function CheckinScreen(props) {
  if (props.step === 0) return <FamilyStep {...props} />;
  if (props.step === 1) return <MoveStep {...props} />;
  if (props.step === 2) return <StatusStep {...props} />;
  if (props.step === 3) return <MoodStep {...props} />;
  return <SuccessStep {...props} />;
}

function StepHeader({ title, color = DEFAULT_FAMILY_COLOR, progress, onBack }) {
  return (
    <>
      <div className="step-header">
        <button type="button" onClick={onBack} aria-label="Back">
          <ChevronLeft size={19} />
        </button>
        <span style={{ color }}>{title}</span>
        <i />
      </div>
      <div className="progress-track">
        <span style={{ width: progress, background: color }} />
      </div>
    </>
  );
}

function FamilyStep({ setCheckin, setStep, goBack }) {
  const options = [
    ['lindy', 'Warm & swinging partner work', '6-count basic'],
    ['solo', 'Playful individual rhythm', 'Shorty George'],
    ['charleston', 'Kicks & jazz-era energy', 'Kick through'],
  ];

  return (
    <div className="screen check-screen">
      <StepHeader title="Check In" progress="22%" onBack={goBack} />
      <h1 className="step-title">What did you learn today?</h1>
      <div className="family-list">
        {options.map(([familyKey, subtitle, moveName]) => {
          const family = FAMILIES[familyKey];
          return (
            <button
              type="button"
              className={`family-card ${familyKey}`}
              key={familyKey}
              onClick={() => {
                setCheckin((current) => ({ ...current, family: familyKey, moveName: null }));
                setStep(1);
              }}
            >
              <strong>{family.label}</strong>
              <span>{subtitle}</span>
              <i>
                <Sticker family={familyKey} moveName={moveName} />
              </i>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="subtle-link"
        onClick={() => {
          setCheckin((current) => ({ ...current, family: null, moveName: null }));
          setStep(1);
        }}
      >
        Not sure? Browse all moves →
      </button>
    </div>
  );
}

function MoveStep({
  checkin,
  setCheckin,
  setStep,
  goBack,
  moveSearch,
  setMoveSearch,
  customMoves,
  setCustomMoves,
  addingCustom,
  setAddingCustom,
  customName,
  setCustomName,
  selectMove,
}) {
  const pool = useMemo(() => {
    const base = checkin.family
      ? TAXONOMY[checkin.family].map((name) => ({ name, family: checkin.family }))
      : Object.entries(TAXONOMY).flatMap(([family, moves]) => moves.map((name) => ({ name, family })));
    const custom = customMoves
      .filter((move) => !checkin.family || move.family === checkin.family)
      .map((move) => ({ name: move.name, family: move.family }));
    const needle = moveSearch.trim().toLowerCase();
    return [...base, ...custom].filter((move) => (needle ? move.name.toLowerCase().includes(needle) : true));
  }, [checkin.family, customMoves, moveSearch]);

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    const family = checkin.family || 'lindy';
    setCustomMoves((current) => [...current, { name, family }]);
    setCustomName('');
    setAddingCustom(false);
    selectMove(name, family);
  }

  return (
    <div className="screen check-screen">
      <StepHeader
        title={checkin.family ? FAMILIES[checkin.family].label : 'All moves'}
        color={familyColor(checkin.family)}
        progress="46%"
        onBack={goBack}
      />
      <h1 className="move-title">Which move did you learn or practice?</h1>
      <label className="search-field">
        <input value={moveSearch} onChange={(event) => setMoveSearch(event.target.value)} placeholder="Search a move…" />
        <Search size={17} />
      </label>
      <div className="move-tile-grid">
        {pool.map((move) => {
          const selected = move.name === checkin.moveName && move.family === checkin.family;
          return (
            <button
              type="button"
              className={selected ? 'selected' : ''}
              key={`${move.family}-${move.name}`}
              style={{ '--family-color': familyColor(move.family) }}
              onClick={() => selectMove(move.name, move.family)}
            >
              {move.name}
            </button>
          );
        })}
      </div>
      {addingCustom ? (
        <div className="custom-row">
          <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Name your move…" />
          <button type="button" onClick={addCustom}>Add</button>
        </div>
      ) : (
        <button type="button" className="subtle-link" onClick={() => setAddingCustom(true)}>
          Can't find it? Add a custom move ✎
        </button>
      )}
    </div>
  );
}

function StatusStep({ checkin, setCheckin, setStep, entries, goBack }) {
  const color = familyColor(checkin.family);
  const priorList = entries.filter((entry) => entry.family === checkin.family && entry.moveName === checkin.moveName);
  const priorFirst = priorList.length ? fmt(priorList.map((entry) => entry.date).toSorted()[0]).medium : '';

  return (
    <div className="screen check-screen">
      <StepHeader title={checkin.moveName} color={color} progress="68%" onBack={goBack} />
      <h1 className="status-title">
        What happened with <span style={{ color }}>{checkin.moveName}</span> today?
      </h1>
      {priorList.length > 0 && <p className="prior-note">✨ You first learned {checkin.moveName} on {priorFirst}.</p>}
      <div className="status-list">
        {STATUS_ORDER.map((key) => {
          const selected = checkin.status === key;
          return (
            <button
              type="button"
              className={selected ? 'selected' : ''}
              key={key}
              onClick={() => setCheckin((current) => ({ ...current, status: key }))}
            >
              <Glyph type={key} />
              <span>{STATUSES[key].label}</span>
              {selected && <Check size={14} />}
            </button>
          );
        })}
      </div>
      <button className="green-cta" type="button" onClick={() => setStep(3)}>Next</button>
    </div>
  );
}

function MoodStep({ checkin, setCheckin, saveCheckin, goBack, companionPreset, moveReferences }) {
  const dateRef = useRef(null);
  const companionState = companionStateFromMoods(checkin.mood);
  const references = moveReferences[moveKey(checkin.family, checkin.moveName)] || [];
  const availableReferenceSlots = Math.max(0, MAX_REFERENCES_PER_MOVE - references.length);
  const draftReferenceUrls = referenceDrafts(checkin).slice(0, Math.max(1, availableReferenceSlots));
  const visibleReferenceUrls = availableReferenceSlots > 0 ? (draftReferenceUrls.length ? draftReferenceUrls : ['']) : [];
  const hasReferenceDraft = visibleReferenceUrls.some((url) => url.trim());
  const invalidReferenceIndexes = new Set(
    visibleReferenceUrls
      .map((url, index) => (url.trim() && !normalizeReferenceUrl(url) ? index : null))
      .filter((index) => index !== null),
  );
  const filledReferenceCount = visibleReferenceUrls.filter((url) => url.trim()).length;
  const lastReferenceUrl = visibleReferenceUrls[visibleReferenceUrls.length - 1] || '';
  const canAddReferenceField =
    availableReferenceSlots > visibleReferenceUrls.length &&
    Boolean(normalizeReferenceUrl(lastReferenceUrl)) &&
    invalidReferenceIndexes.size === 0;
  const canSave = !hasReferenceDraft || invalidReferenceIndexes.size === 0;

  function updateReferenceUrl(index, value) {
    setCheckin((current) => {
      const currentUrls = [...referenceDrafts(current)];
      currentUrls[index] = value;
      return { ...current, referenceUrls: currentUrls };
    });
  }

  function clearReferenceUrl(index) {
    setCheckin((current) => {
      const currentUrls = [...referenceDrafts(current)];
      if (currentUrls.length === 1) currentUrls[index] = '';
      else currentUrls.splice(index, 1);
      return { ...current, referenceUrls: currentUrls.length ? currentUrls : [''] };
    });
  }

  function addReferenceField() {
    if (!canAddReferenceField) return;
    setCheckin((current) => {
      return { ...current, referenceUrls: [...referenceDrafts(current), ''].slice(0, MAX_REFERENCES_PER_MOVE) };
    });
  }

  return (
    <div className="screen check-screen mood-screen">
      <StepHeader title="Almost there" progress="88%" onBack={goBack} />
      <h1 className="move-title">How did this learning feel?</h1>
      <section className="mood-companion">
        <DancerCompanion preset={companionPreset} state={companionState} size="small" />
        <p>{companionCopy(companionState)}</p>
      </section>
      <div className="mood-grid">
        {MOOD_ORDER.map((key) => {
          const mood = MOODS[key];
          const selected = moodKeys(checkin.mood).includes(key);
          return (
            <button
              type="button"
              className={selected ? 'selected' : ''}
              style={{ '--mood-color': mood.color }}
              key={key}
              onClick={() =>
                setCheckin((current) => {
                  const selectedMood = moodKeys(current.mood)[0];
                  return {
                    ...current,
                    mood: selectedMood === key ? [] : [key],
                  };
                })
              }
            >
              <span aria-hidden="true">{mood.emoji}</span>
              {mood.label}
            </button>
          );
        })}
      </div>
      <label className="field-label">What do you want to remember?</label>
      <textarea
        value={checkin.note}
        onChange={(event) => setCheckin((current) => ({ ...current, note: event.target.value }))}
        placeholder="Keep knees soft. Don't rush the rhythm…"
        rows={3}
      />
      <section className="reference-input-panel">
        <div>
          <label className="field-label">Reference (max 3)</label>
        </div>
        {availableReferenceSlots > 0 ? (
          <>
            {visibleReferenceUrls.map((url, index) => (
              <div className="reference-row" key={`reference-${index}`}>
                <label className={`reference-field ${invalidReferenceIndexes.has(index) ? 'invalid' : ''}`}>
                  <Link size={17} />
                  <input
                    value={url}
                    onChange={(event) => updateReferenceUrl(index, event.target.value)}
                    placeholder="https://youtube.com/..."
                    inputMode="url"
                    aria-label={`Reference link ${index + 1}`}
                  />
                  {url && (
                    <button type="button" onClick={() => clearReferenceUrl(index)} aria-label={`Clear reference link ${index + 1}`}>
                      <X size={14} />
                    </button>
                  )}
                </label>
              </div>
            ))}
            {invalidReferenceIndexes.size > 0 && <p className="field-error">Use a valid http or https web link.</p>}
            {canAddReferenceField && (
              <button type="button" className="reference-add-btn" onClick={addReferenceField}>
                <CirclePlus size={16} />
                Add another reference
              </button>
            )}
          </>
        ) : (
          <p className="reference-cap-note">This move already has 3 references.</p>
        )}
      </section>
      <div className="optional-fields">
        <label>
          <CalendarDays size={17} onClick={() => dateRef.current?.showPicker?.()} />
          <input
            ref={dateRef}
            type="date"
            value={checkin.date}
            onChange={(event) => setCheckin((current) => ({ ...current, date: event.target.value }))}
          />
        </label>
        <OptionalField
          icon={<ListChecks size={17} />}
          value={checkin.cls}
          placeholder="Class or event (optional)"
          onChange={(value) => setCheckin((current) => ({ ...current, cls: value }))}
        />
        <OptionalField
          icon={<UserRound size={17} />}
          value={checkin.teacher}
          placeholder="Teacher (optional)"
          onChange={(value) => setCheckin((current) => ({ ...current, teacher: value }))}
        />
        <OptionalField
          icon={<MapPin size={17} />}
          value={checkin.location}
          placeholder="Location (optional)"
          onChange={(value) => setCheckin((current) => ({ ...current, location: value }))}
        />
      </div>
      <button className="green-cta save-cta" type="button" disabled={!canSave} onClick={saveCheckin}>Save to my dance story</button>
    </div>
  );
}

function OptionalField({ icon, value, placeholder, onChange }) {
  return (
    <label>
      {icon}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label={`Clear ${placeholder}`}>
          <X size={14} />
        </button>
      )}
    </label>
  );
}

function SuccessStep({ checkin, bank, setView, startCheckin, setCheckin, companionPreset, setDetailKey, setDetailFrom }) {
  const family = FAMILIES[checkin.family] || FAMILIES.lindy;
  const status = STATUSES[checkin.status || 'first_learned'];
  const companionState = companionStateFromMoods(checkin.mood);
  const successTone = companionSuccessTone(companionState);
  const savedMoveKey = moveKey(checkin.family, checkin.moveName);

  return (
    <div className="screen success-screen" style={{ '--conf-color': family.color }}>
      <Confetti />
      <h1>{successTone.title}</h1>
      <h2>
        {successTone.before} <span style={{ color: family.color }}>{checkin.moveName}</span> {successTone.after}
      </h2>
      <div className="success-sticker">
        <DancerCompanion preset={companionPreset} state={companionState} size="success" />
      </div>
      <p className="companion-reaction">{companionCopy(companionState)}</p>
      <p className="success-sub">
        {family.label} · {status.label}
        <MoodEmojis value={checkin.mood} />
      </p>
      <p className="success-count"><b>{bank.length}</b> moves collected this year</p>
      <div className="success-actions">
        <button
          type="button"
          className="gold-cta centered"
          onClick={() => {
            setDetailKey(savedMoveKey);
            setDetailFrom('journal');
            setView('detail');
            setCheckin(freshCheckin());
          }}
        >
          Review this move
        </button>
        <button type="button" className="secondary-btn" onClick={() => startCheckin()}>
          Add another move
        </button>
        <button type="button" className="plain-btn" onClick={() => { setView('journal'); setCheckin(freshCheckin()); }}>
          Back to journal
        </button>
      </div>
    </div>
  );
}

function DancerCompanion({ preset, state = 'reflect', size = 'medium' }) {
  const safePreset = COMPANION_PRESETS[preset] ? preset : DEFAULT_COMPANION_PRESET;
  const src = `/assets/companions/${safePreset}/${state}.webp?v=${COMPANION_ASSET_VERSION}`;
  return (
    <figure className={`dancer-companion ${size}`} data-state={state}>
      <img src={src} alt="Your Swingo dance self" />
    </figure>
  );
}

const BANK_MODES = [
  ['list', 'List'],
  ['map', 'Map'],
  ['practice', 'Practice'],
];

const BANK_FILTERS = [
  ['all', 'All'],
  ['lindy', 'Lindy Hop'],
  ['solo', 'Solo Jazz'],
  ['charleston', 'Charleston'],
  ['new', 'New'],
  ['revisited', 'Revisited'],
  ['social', 'Used in social'],
];

function MoveBankScreen({
  bank,
  bankSearch,
  setBankSearch,
  bankFilter,
  setBankFilter,
  bankMode,
  setBankMode,
  setView,
  setDetailKey,
  setDetailFrom,
}) {
  const filtered = useMemo(() => {
    let rows = [...bank];
    if (['lindy', 'solo', 'charleston'].includes(bankFilter)) rows = rows.filter((row) => row.family === bankFilter);
    if (bankFilter === 'new') rows = rows.filter((row) => row.logs === 1);
    if (bankFilter === 'revisited') rows = rows.filter((row) => row.logs > 1);
    if (bankFilter === 'social') rows = rows.filter((row) => row.hasSocial);
    const needle = bankSearch.trim().toLowerCase();
    if (needle) rows = rows.filter((row) => row.moveName.toLowerCase().includes(needle));
    return rows.toSorted((a, b) => b.latestSk.localeCompare(a.latestSk));
  }, [bank, bankFilter, bankSearch]);

  function open(row) {
    setDetailKey(row.key);
    setDetailFrom('moves');
    setView('detail');
  }

  return (
    <div className="screen bank-screen">
      <div className="bank-header">
        <div>
          <h1>Move Bank</h1>
          <p>{bank.length} moves collected in 2026</p>
        </div>
        <button type="button" aria-label="Filter">
          <Filter size={18} />
        </button>
      </div>
      <OptionGroup
        className="bank-mode-switch"
        label="Move Bank view"
        options={BANK_MODES}
        selected={bankMode}
        onSelect={setBankMode}
      />
      {bank.length > 0 && (
        <div className="family-bubbles">
          {Object.entries(FAMILIES).map(([key, family]) => (
            <div key={key}>
              <strong style={{ color: family.color }}>{bank.filter((row) => row.family === key).length}</strong>
              <span>{family.label}</span>
            </div>
          ))}
        </div>
      )}
      {bankMode === 'list' && (
        <MoveListView
          filtered={filtered}
          bank={bank}
          bankSearch={bankSearch}
          setBankSearch={setBankSearch}
          bankFilter={bankFilter}
          setBankFilter={setBankFilter}
          onOpen={open}
        />
      )}
      {bankMode === 'map' && <MoveMapView bank={bank} onOpen={open} />}
      {bankMode === 'practice' && <PracticeView bank={bank} onOpen={open} />}
    </div>
  );
}

function MoveListView({ filtered, bank, bankSearch, setBankSearch, bankFilter, setBankFilter, onOpen }) {
  return (
    <>
      <label className="search-field">
        <input value={bankSearch} onChange={(event) => setBankSearch(event.target.value)} placeholder="Search moves…" />
        <Search size={17} />
      </label>
      <OptionGroup className="filter-row" options={BANK_FILTERS} selected={bankFilter} onSelect={setBankFilter} />
      <h2 className="list-label">{filtered.length === bank.length ? 'All moves' : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}</h2>
      {filtered.length ? filtered.map((row) => (
        <MoveBankCard key={row.key} row={row} onOpen={() => onOpen(row)} />
      )) : <p className="empty-copy">No moves match that search.</p>}
    </>
  );
}

function MoveMapView({ bank, onOpen }) {
  return (
    <section className="move-map">
      {Object.entries(FAMILIES).map(([familyKey, family]) => {
        const rows = bank.filter((row) => row.family === familyKey).toSorted((a, b) => b.logs - a.logs);
        const signature = rows.filter((row) => row.logs >= 3).slice(0, 5);
        const social = rows.filter((row) => row.hasSocial).slice(0, 5);
        const notUsed = rows.filter((row) => !row.hasSocial).slice(0, 5);
        const newMoves = rows.filter((row) => row.logs === 1 && row.latestStatus === 'first_learned').slice(0, 5);
        return (
          <article className="map-family" key={familyKey} style={{ '--family-color': family.color }}>
            <div className="map-hub">
              <strong>{family.label}</strong>
              <span>{rows.length} moves</span>
            </div>
            <MapLane label="Signature moves" rows={signature} onOpen={onOpen} />
            <MapLane label="Social tested" rows={social} onOpen={onOpen} />
            <MapLane label="Not used yet" rows={notUsed} onOpen={onOpen} />
            <MapLane label="New branches" rows={newMoves} onOpen={onOpen} />
          </article>
        );
      })}
    </section>
  );
}

function MapLane({ label, rows, onOpen }) {
  return (
    <div className="map-lane">
      <small>{label}</small>
      <div>
        {rows.length ? rows.map((row) => (
          <button type="button" key={row.key} onClick={() => onOpen(row)}>
            {row.moveName}
          </button>
        )) : <span>No moves yet</span>}
      </div>
    </div>
  );
}

function PracticeView({ bank, onOpen }) {
  const oldRows = [...bank].toSorted((a, b) => daysSince(b.latestSk.slice(0, 10)) - daysSince(a.latestSk.slice(0, 10))).slice(0, 4);
  const socialReady = bank.filter((row) => row.logs > 1 && !row.hasSocial).toSorted((a, b) => b.logs - a.logs).slice(0, 4);
  const buildConfidence = bank.filter((row) => row.logs === 1).toSorted((a, b) => a.latestSk.localeCompare(b.latestSk)).slice(0, 4);

  return (
    <section className="practice-board">
      <PracticeLane title="Warm up again" subtitle="Moves you have not touched recently" rows={oldRows} onOpen={onOpen} />
      <PracticeLane title="Try socially" subtitle="Revisited moves not yet used in social" rows={socialReady} onOpen={onOpen} />
      <PracticeLane title="Build confidence" subtitle="Newer one-log moves that need another rep" rows={buildConfidence} onOpen={onOpen} />
    </section>
  );
}

function PracticeLane({ title, subtitle, rows, onOpen }) {
  return (
    <article className="practice-lane">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {rows.length ? rows.map((row) => (
        <button type="button" key={row.key} onClick={() => onOpen(row)} style={{ '--family-color': familyColor(row.family) }}>
          <Sticker family={row.family} moveName={row.moveName} />
          <span>
            <strong>{row.moveName}</strong>
            <small>{pluralize(row.logs, 'log')} · latest {fmt(row.latestSk.slice(0, 10)).md}</small>
          </span>
        </button>
      )) : <p className="empty-copy">Nothing here yet.</p>}
    </article>
  );
}

function MoveBankCard({ row, onOpen }) {
  const family = FAMILIES[row.family];
  const mood = moodList(row.mood)[0];
  return (
    <button type="button" className="bank-card" onClick={onOpen}>
      <Sticker family={row.family} moveName={row.moveName} />
      <span>
        <strong>{row.moveName}</strong>
        <small>{family.label} · First learned {fmt(row.firstDate).md}</small>
      </span>
      <i style={{ color: mood?.color || family.color }}>
        <strong>{pluralize(row.logs, 'log')}</strong>
        <small>{STATUSES[row.latestStatus].short}</small>
      </i>
    </button>
  );
}

function MoveDetailScreen({ bank, detailKey, detailFrom, setView, setDetailKey, setDetailFrom, startCheckin, goBack, moveReferences, companionPreset }) {
  const detail = bank.find((row) => row.key === detailKey) || bank[0];
  if (!detail) return null;
  const family = FAMILIES[detail.family];
  const mood = moodList(detail.mood)[0];
  const references = moveReferences[detail.key] || [];
  const latestEntry = detail.list[0];
  const latestMoods = moodList(latestEntry?.mood);
  const detailCompanionState = companionStateFromMoods(latestEntry?.mood);

  return (
    <div className="screen detail-screen">
      <button type="button" className="back-btn" onClick={goBack} aria-label="Back">
        <ChevronLeft size={19} />
      </button>
      <h1>{detail.moveName}</h1>
      <p style={{ color: family.color }}>{family.label}</p>
      <div className="detail-sticker" style={{ '--detail-color': family.color }}>
        <Sticker family={detail.family} moveName={detail.moveName} />
        <span>✦</span>
      </div>
      <div className="summary-panel">
        <SummaryCell label="First learned" value={fmt(detail.firstDate).medium} />
        <SummaryCell label="Total logs" value={pluralize(detail.logs, 'time')} />
        <SummaryCell label="Latest" value={STATUSES[detail.latestStatus].short} />
        <SummaryCell label="Top mood" value={mood?.label || '—'} color={mood?.color} />
      </div>
      <section className="detail-companion">
        <DancerCompanion preset={companionPreset} state={detailCompanionState} size="small" />
        <div>
          <strong>{companionCopy(detailCompanionState)}</strong>
          <span>
            Latest feeling: {latestMoods.length ? latestMoods.map((item) => `${item.emoji} ${item.label}`).join(' · ') : 'Not logged yet'}
          </span>
        </div>
      </section>
      <section className="reference-section">
        <div className="section-head">
          <h2 className="list-label">Reference</h2>
          <span>{references.length}/{MAX_REFERENCES_PER_MOVE}</span>
        </div>
        {references.length ? (
          <div className="reference-list">
            {references.map((reference, index) => (
              <a key={reference.id} href={reference.url} target="_blank" rel="noreferrer">
                <span>
                  <strong>Reference {index + 1}</strong>
                  <small>{referenceDisplayName(reference.url)}</small>
                </span>
                <ExternalLink size={16} />
              </a>
            ))}
          </div>
        ) : (
          <p className="empty-copy left">Add a YouTube, Instagram, TikTok, or recap link the next time you log this move.</p>
        )}
      </section>
      <h2 className="list-label">History</h2>
      <div className="timeline">
        {detail.list.map((entry) => (
          <article key={entry.id} className="timeline-row" style={{ '--row-color': familyColor(entry.family) }}>
            <i />
            <div>
              <small>{fmt(entry.date).medium} · {entry.time}</small>
              <h3>{STATUSES[entry.status].label}</h3>
              {entry.note && <p>"{entry.note}"</p>}
            </div>
          </article>
        ))}
      </div>
      <button
        className="green-cta"
        type="button"
        onClick={() => {
          setDetailKey(detail.key);
          setDetailFrom(detailFrom);
          startCheckin({ ...freshCheckin(), family: detail.family, moveName: detail.moveName, status: 'learned_again' }, 2);
        }}
      >
        Add another log
      </button>
    </div>
  );
}

function SummaryCell({ label, value, color }) {
  return (
    <div>
      <small>{label}</small>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function WrappedScreen({ entries, bank, startCheckin }) {
  const wrapped = useMemo(() => {
    if (!bank.length) return null;
    const familyEntries = (family) => entries.filter((entry) => entry.family === family).length;
    const topFamily = Object.keys(FAMILIES).toSorted((a, b) => familyEntries(b) - familyEntries(a))[0];
    const revisited = [...bank].toSorted((a, b) => b.logs - a.logs)[0];
    const topMood = topMoodKey(entries);
    const latest = sortByRecency(entries)[0];
    return { topFamily, revisited, topMood, latest };
  }, [bank, entries]);

  return (
    <div className="screen wrapped-screen">
      <p className="year-label">2026 · in progress</p>
      <h1>Your 2026 Swingo <em>Wrapped</em> is building.</h1>
      {wrapped ? (
        <>
          <div className="wrapped-hero">
            <span>Moves collected</span>
            <strong>{bank.length}</strong>
            <Sticker family="lindy" moveName="6-count basic" />
          </div>
          <div className="wrapped-grid">
            <WrappedCard label="Dance entries" value={entries.length} />
            <WrappedCard label="Most logged" value={FAMILIES[wrapped.topFamily].label} color={FAMILIES[wrapped.topFamily].color} />
            <WrappedCard label="Most revisited" value={wrapped.revisited.moveName} sub={`${wrapped.revisited.logs} logs`} />
            <WrappedCard label="Top mood" value={MOODS[wrapped.topMood]?.label || '—'} color={MOODS[wrapped.topMood]?.color} />
          </div>
          <p className="wrapped-copy">
            So far, you've collected <b>{bank.length} moves</b>. Your most logged family is <b style={{ color: FAMILIES[wrapped.topFamily].color }}>{FAMILIES[wrapped.topFamily].label}</b>. Your latest move is <b style={{ color: FAMILIES[wrapped.latest.family].color }}>{wrapped.latest.moveName}</b>, and your most common learning mood is <b style={{ color: MOODS[wrapped.topMood]?.color }}>{MOODS[wrapped.topMood]?.label || '—'}</b>.
          </p>
          <button className="gold-cta centered" type="button" onClick={() => startCheckin()}>
            Keep building your dance story
          </button>
        </>
      ) : (
        <p className="empty-copy">Your Wrapped grows from every move you log. Check in your first move to begin.</p>
      )}
    </div>
  );
}

function WrappedCard({ label, value, sub, color }) {
  return (
    <article>
      <small>{label}</small>
      <strong style={{ color }}>{value}</strong>
      {sub && <span>{sub}</span>}
    </article>
  );
}

function BottomNav({ view, detailFrom, startCheckin, setView }) {
  const active = {
    journal: view === 'journal',
    checkin: view === 'checkin',
    moves: view === 'moves' || (view === 'detail' && detailFrom === 'moves'),
    wrapped: view === 'wrapped',
  };
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <button type="button" className={active.journal ? 'active' : ''} onClick={() => setView('journal')}>
        <ListChecks size={22} />Journal
      </button>
      <button type="button" className={active.checkin ? 'active' : ''} onClick={() => startCheckin()}>
        <CirclePlus size={23} />Check In
      </button>
      <button type="button" className={active.moves ? 'active' : ''} onClick={() => setView('moves')}>
        <Share2 size={22} />Moves
      </button>
      <button type="button" className={active.wrapped ? 'active' : ''} onClick={() => setView('wrapped')}>
        <WandSparkles size={22} />Wrapped
      </button>
    </nav>
  );
}

function Sticker({ family, moveName }) {
  const src = iconSrc(family, moveName);
  return src ? <img className="sticker-img" src={src} alt="" aria-hidden="true" /> : <span className="sticker-fallback" />;
}

function Glyph({ type }) {
  return <span className={`status-glyph ${type}`} aria-hidden="true" />;
}

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 11 }, (_, index) => <i key={index} />)}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
