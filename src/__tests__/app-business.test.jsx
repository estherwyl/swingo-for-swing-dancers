import React, { useState } from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App, {
  JournalScreen,
  MapLane,
  MoodStep,
  MoveBankScreen,
  MoveDetailScreen,
  MoveListView,
  MoveMapView,
  PracticeView,
  WrappedScreen,
} from '../App.jsx';
import { STORAGE_KEY } from '../lib/constants.js';

const bankRows = [
  { key: 'lindy|Old Swingout', family: 'lindy', moveName: 'Old Swingout', firstDate: '2026-07-01', logs: 3, latestStatus: 'practiced', latestSk: '2026-08-01T18:00', mood: 'proud', hasSocial: false, list: [] },
  { key: 'solo|Shorty George', family: 'solo', moveName: 'Shorty George', firstDate: '2026-07-02', logs: 1, latestStatus: 'first_learned', latestSk: '2026-08-03T18:00', mood: 'excited', hasSocial: false, list: [] },
  { key: 'charleston|Fishtail', family: 'charleston', moveName: 'Fishtail', firstDate: '2026-07-03', logs: 2, latestStatus: 'practiced', latestSk: '2026-08-04T18:00', mood: 'flowing', hasSocial: false, list: [] },
  { key: 'lindy|Swingout', family: 'lindy', moveName: 'Swingout', firstDate: '2026-07-04', logs: 1, latestStatus: 'first_learned', latestSk: '2026-08-05T18:00', mood: 'proud', hasSocial: false, list: [] },
  { key: 'lindy|Social Swingout', family: 'lindy', moveName: 'Social Swingout', firstDate: '2026-07-05', logs: 2, latestStatus: 'used_in_social', latestSk: '2026-08-06T18:00', mood: 'flowing', hasSocial: true, list: [] },
];

function renderMoveBank(overrides = {}) {
  const props = {
    bank: bankRows,
    bankSearch: '',
    setBankSearch: vi.fn(),
    bankFilter: 'all',
    setBankFilter: vi.fn(),
    bankMode: 'list',
    setBankMode: vi.fn(),
    setView: vi.fn(),
    setDetailKey: vi.fn(),
    setDetailFrom: vi.fn(),
    ...overrides,
  };
  return render(<MoveBankScreen {...props} />);
}

function lane(label) {
  return screen.getAllByText(label)[0].closest('.practice-lane, .map-lane');
}

function practiceLane(label) {
  return screen.getByRole('heading', { name: label }).closest('.practice-lane');
}

function makePracticeRows() {
  const old = [1, 2, 3, 4, 5].map((index) => ({
    key: `old-${index}`, family: 'lindy', moveName: `Old ${index}`, logs: 2,
    latestStatus: 'practiced', latestSk: `2026-08-${String(index).padStart(2, '0')}T18:00`, mood: 'proud', hasSocial: true,
  }));
  const social = [2, 5, 3, 4, 1].map((logs, index) => ({
    key: `social-${index}`, family: 'solo', moveName: `Social ${index}`, logs,
    latestStatus: 'practiced', latestSk: '2026-08-10T18:00', mood: 'flowing', hasSocial: false,
  }));
  const confidence = [3, 1, 4, 2, 5].map((day, index) => ({
    key: `confidence-${index}`, family: 'charleston', moveName: `Confidence ${index}`, logs: 1,
    latestStatus: 'first_learned', latestSk: `2026-08-${String(day).padStart(2, '0')}T18:00`, mood: 'excited', hasSocial: false,
  }));
  return [...old, ...social, ...confidence];
}

function MoodHarness({ initialCheckin, moveReferences = {} }) {
  const [checkin, setCheckin] = useState(initialCheckin);
  return (
    <MoodStep
      checkin={checkin}
      setCheckin={setCheckin}
      saveCheckin={vi.fn()}
      goBack={vi.fn()}
      companionPreset="dressed-up-feminine"
      moveReferences={moveReferences}
    />
  );
}

describe('Move Bank screens', () => {
  it('filters every bank filter, searches case-insensitively, and sorts newest first', async () => {
    const { rerender } = renderMoveBank();

    expect(screen.getByText('Social Swingout')).toBeInTheDocument();
    expect(screen.getByText('Swingout')).toBeInTheDocument();
    const cards = [...document.querySelectorAll('.bank-card > span > strong')].map((node) => node.textContent);
    expect(cards.slice(0, 3)).toEqual(['Social Swingout', 'Swingout', 'Fishtail']);

    for (const [filter, expected] of [
      ['lindy', ['Social Swingout', 'Swingout', 'Old Swingout']],
      ['solo', ['Shorty George']],
      ['charleston', ['Fishtail']],
      ['new', ['Swingout', 'Shorty George']],
      ['revisited', ['Social Swingout', 'Fishtail', 'Old Swingout']],
      ['social', ['Social Swingout']],
    ]) {
      rerender(<MoveBankScreen {...{
        bank: bankRows, bankSearch: '', setBankSearch: vi.fn(), bankFilter: filter,
        setBankFilter: vi.fn(), bankMode: 'list', setBankMode: vi.fn(), setView: vi.fn(),
        setDetailKey: vi.fn(), setDetailFrom: vi.fn(),
      }} />);
      expect([...document.querySelectorAll('.bank-card > span > strong')].map((node) => node.textContent)).toEqual(expected);
    }

    rerender(<MoveBankScreen {...{
      bank: bankRows, bankSearch: 'sWiNg', setBankSearch: vi.fn(), bankFilter: 'all',
      setBankFilter: vi.fn(), bankMode: 'list', setBankMode: vi.fn(), setView: vi.fn(),
      setDetailKey: vi.fn(), setDetailFrom: vi.fn(),
    }} />);
    expect(screen.getByText('Swingout')).toBeInTheDocument();
    expect(screen.getByText('Old Swingout')).toBeInTheDocument();
    expect(screen.getByText('Social Swingout')).toBeInTheDocument();
    expect(screen.queryByText('Shorty George')).not.toBeInTheDocument();

    rerender(<MoveBankScreen {...{
      bank: bankRows, bankSearch: '', setBankSearch: vi.fn(), bankFilter: 'all',
      setBankFilter: vi.fn(), bankMode: 'map', setBankMode: vi.fn(), setView: vi.fn(),
      setDetailKey: vi.fn(), setDetailFrom: vi.fn(),
    }} />);
    expect(document.querySelector('.move-map')).toBeInTheDocument();
  });

  it('renders family bubble counts and each bank mode', async () => {
    const { rerender } = renderMoveBank();
    const bubbles = document.querySelector('.family-bubbles');
    expect(within(bubbles).getByText('3')).toBeInTheDocument();
    expect(within(bubbles).getAllByText('1')).toHaveLength(2);
    rerender(<MoveBankScreen {...{
      bank: bankRows, bankSearch: '', setBankSearch: vi.fn(), bankFilter: 'all',
      setBankFilter: vi.fn(), bankMode: 'practice', setBankMode: vi.fn(), setView: vi.fn(),
      setDetailKey: vi.fn(), setDetailFrom: vi.fn(),
    }} />);
    expect(document.querySelector('.practice-board')).toBeInTheDocument();
    rerender(<MoveBankScreen {...{
      bank: bankRows, bankSearch: '', setBankSearch: vi.fn(), bankFilter: 'all',
      setBankFilter: vi.fn(), bankMode: 'list', setBankMode: vi.fn(), setView: vi.fn(),
      setDetailKey: vi.fn(), setDetailFrom: vi.fn(),
    }} />);
    expect(screen.getByPlaceholderText('Search moves…')).toBeInTheDocument();
  });

  it('uses the correct singular and plural list headings', () => {
    const bank = [bankRows[0], bankRows[1]];
    const { rerender } = render(
      <MoveListView filtered={bank} bank={bank} bankSearch="" setBankSearch={vi.fn()} bankFilter="all" setBankFilter={vi.fn()} onOpen={vi.fn()} />,
    );
    expect(screen.getByText('All moves')).toBeInTheDocument();
    rerender(
      <MoveListView filtered={[bankRows[0]]} bank={bank} bankSearch="" setBankSearch={vi.fn()} bankFilter="all" setBankFilter={vi.fn()} onOpen={vi.fn()} />,
    );
    expect(screen.getByText('1 result')).toBeInTheDocument();
    rerender(
      <MoveListView filtered={bank} bank={bankRows} bankSearch="" setBankSearch={vi.fn()} bankFilter="all" setBankFilter={vi.fn()} onOpen={vi.fn()} />,
    );
    expect(screen.getByText('2 results')).toBeInTheDocument();
  });
});

describe('Practice and map views', () => {
  afterEach(() => vi.useRealTimers());

  it('buckets practice lanes, orders them, caps each lane, and shows empty lanes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12));
    render(<PracticeView bank={makePracticeRows()} onOpen={vi.fn()} />);
    const practiceLanes = document.querySelectorAll('.practice-lane');
    expect([...practiceLanes[0].querySelectorAll('strong')].map((node) => node.textContent)).toEqual(['Old 1', 'Confidence 1', 'Old 2', 'Confidence 3']);
    expect([...practiceLanes[1].querySelectorAll('strong')].map((node) => node.textContent)).toEqual(['Social 1', 'Social 3', 'Social 2', 'Social 0']);
    expect([...practiceLanes[2].querySelectorAll('strong')].map((node) => node.textContent)).toEqual(['Confidence 1', 'Confidence 3', 'Confidence 0', 'Confidence 2']);
    cleanup();
    render(<PracticeView bank={[]} onOpen={vi.fn()} />);
    expect(screen.getAllByText('Nothing here yet.')).toHaveLength(3);
  });

  it('renders map lanes with their predicates, five-item caps, and empty copy', () => {
    const rows = [
      ...Array.from({ length: 6 }, (_, index) => ({ key: `signature-${index}`, family: 'lindy', moveName: `Signature ${index}`, logs: 3, latestStatus: 'practiced', latestSk: '2026-08-01T18:00', mood: 'proud', hasSocial: false, list: [] })),
      ...Array.from({ length: 6 }, (_, index) => ({ key: `social-${index}`, family: 'lindy', moveName: `Social ${index}`, logs: 1, latestStatus: 'first_learned', latestSk: '2026-08-02T18:00', mood: 'proud', hasSocial: true, list: [] })),
    ];
    render(<MoveMapView bank={rows} onOpen={vi.fn()} />);
    expect(lane('Signature moves').querySelectorAll('button')).toHaveLength(5);
    expect(lane('Social tested').querySelectorAll('button')).toHaveLength(5);
    expect(lane('Not used yet').querySelectorAll('button')).toHaveLength(5);
    expect(lane('New branches').querySelectorAll('button')).toHaveLength(5);
    expect(screen.getAllByText('No moves yet').length).toBeGreaterThan(0);
    const { container } = render(<MapLane label="Empty lane" rows={[]} onOpen={vi.fn()} />);
    expect(within(container).getByText('Empty lane')).toBeInTheDocument();
    expect(within(container).getByText('No moves yet')).toBeInTheDocument();
  });
});

describe('Wrapped, mood, detail, and journal screens', () => {
  afterEach(() => vi.useRealTimers());

  it('renders Wrapped empty copy and derives each winning summary', () => {
    const { rerender } = render(<WrappedScreen entries={[]} bank={[]} startCheckin={vi.fn()} />);
    expect(screen.getByText('Your Wrapped grows from every move you log. Check in your first move to begin.')).toBeInTheDocument();
    const entries = [
      { id: '1', family: 'lindy', moveName: 'Swingout', date: '2026-08-19', time: '20:00', mood: 'proud' },
      { id: '2', family: 'lindy', moveName: 'Swingout', date: '2026-08-18', time: '20:00', mood: 'proud' },
      { id: '3', family: 'lindy', moveName: 'Tuck Turn', date: '2026-08-17', time: '20:00', mood: 'proud' },
      { id: '4', family: 'solo', moveName: 'Shorty George', date: '2026-08-16', time: '20:00', mood: 'excited' },
    ];
    const bank = [
      { key: 'lindy|Swingout', family: 'lindy', moveName: 'Swingout', logs: 2, latestSk: '2026-08-19T20:00' },
      { key: 'lindy|Tuck Turn', family: 'lindy', moveName: 'Tuck Turn', logs: 1, latestSk: '2026-08-17T20:00' },
      { key: 'solo|Shorty George', family: 'solo', moveName: 'Shorty George', logs: 1, latestSk: '2026-08-16T20:00' },
    ];
    rerender(<WrappedScreen entries={entries} bank={bank} startCheckin={vi.fn()} />);
    expect(screen.getAllByText('Lindy Hop').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Swingout').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Proud').length).toBeGreaterThan(0);
    expect(screen.getByText(/latest move is/)).toBeInTheDocument();
  });

  it('validates MoodStep references, caps fields, clears the only row, and toggles moods', async () => {
    const user = userEvent.setup();
    const initial = { family: 'lindy', moveName: 'Swingout', mood: [], note: '', referenceUrls: [''], date: '2026-08-20', cls: '', teacher: '', location: '' };
    render(<MoodHarness initialCheckin={initial} />);
    const save = screen.getByRole('button', { name: 'Save to my dance story' });
    const reference = screen.getByLabelText('Reference link 1');
    await user.type(reference, 'not-a-link');
    expect(screen.getByText('Use a valid http or https web link.')).toBeInTheDocument();
    expect(save).toBeDisabled();
    await user.clear(reference);
    await user.type(reference, 'https://example.com/dance');
    expect(screen.getByRole('button', { name: 'Add another reference' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Add another reference' }));
    expect(screen.getByLabelText('Reference link 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear reference link 1' }));
    expect(screen.getByLabelText('Reference link 1')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Proud' }));
    expect(screen.getByRole('button', { name: 'Proud' })).toHaveClass('selected');
    await user.click(screen.getByRole('button', { name: 'Proud' }));
    expect(screen.getByRole('button', { name: 'Proud' })).not.toHaveClass('selected');

    cleanup();
    const { rerender } = render(
      <MoodHarness
        initialCheckin={{ ...initial, referenceUrls: ['https://one.example', 'https://two.example'] }}
        moveReferences={{ 'lindy|Swingout': [] }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Add another reference' })).toBeEnabled();
    rerender(
      <MoodHarness
        initialCheckin={{ ...initial, referenceUrls: ['https://one.example'] }}
        moveReferences={{ 'lindy|Swingout': [{ id: 'a', url: 'https://a.example' }, { id: 'b', url: 'https://b.example' }] }}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Add another reference' })).not.toBeInTheDocument();
    rerender(
      <MoodHarness
        initialCheckin={{ ...initial, referenceUrls: [''] }}
        moveReferences={{ 'lindy|Swingout': [{ id: 'a', url: 'https://a.example' }, { id: 'b', url: 'https://b.example' }, { id: 'c', url: 'https://c.example' }] }}
      />,
    );
    expect(screen.getByText('This move already has 3 references.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Reference link 1')).not.toBeInTheDocument();
  });

  it('renders MoveDetail summary, references, history, and starts a learned-again log', async () => {
    vi.setSystemTime(new Date(2026, 7, 20, 12));
    const user = userEvent.setup();
    const setView = vi.fn();
    const setDetailKey = vi.fn();
    const setDetailFrom = vi.fn();
    const startCheckin = vi.fn();
    const detail = {
      key: 'lindy|Swingout', family: 'lindy', moveName: 'Swingout', firstDate: '2026-08-01', logs: 2,
      latestStatus: 'practiced', latestSk: '2026-08-19T20:00', mood: 'proud', hasSocial: false,
      list: [
        { id: 'latest', family: 'lindy', moveName: 'Swingout', date: '2026-08-19', time: '20:00', status: 'practiced', mood: 'proud', note: 'Keep stretching.' },
        { id: 'old', family: 'lindy', moveName: 'Swingout', date: '2026-08-01', time: '18:00', status: 'first_learned', mood: 'excited', note: '' },
      ],
    };
    render(
      <MoveDetailScreen
        bank={[detail]}
        detailKey={detail.key}
        detailFrom="moves"
        setView={setView}
        setDetailKey={setDetailKey}
        setDetailFrom={setDetailFrom}
        startCheckin={startCheckin}
        goBack={vi.fn()}
        moveReferences={{ [detail.key]: [{ id: 'ref', url: 'https://www.youtube.com/watch?v=1' }] }}
        companionPreset="dressed-up-feminine"
      />,
    );
    expect(screen.getByText('Aug 1, 2026')).toBeInTheDocument();
    expect(screen.getByText('2 times')).toBeInTheDocument();
    expect(screen.getAllByText('Practiced').length).toBeGreaterThan(0);
    expect(screen.getByText('Proud')).toBeInTheDocument();
    expect(screen.getByText('youtube.com')).toBeInTheDocument();
    expect(screen.getByText('"Keep stretching."')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add another log' }));
    expect(setDetailKey).toHaveBeenCalledWith(detail.key);
    expect(setDetailFrom).toHaveBeenCalledWith('moves');
    expect(startCheckin).toHaveBeenCalledWith(expect.objectContaining({ family: 'lindy', moveName: 'Swingout', status: 'learned_again' }), 2);

    render(<MoveDetailScreen bank={[{ ...detail, key: 'lindy|Empty', moveName: 'Empty', list: [] }]} detailKey="lindy|Empty" detailFrom="journal" setView={vi.fn()} setDetailKey={vi.fn()} setDetailFrom={vi.fn()} startCheckin={vi.fn()} goBack={vi.fn()} moveReferences={{}} companionPreset="" />);
    expect(screen.getByText(/Add a YouTube, Instagram, TikTok/)).toBeInTheDocument();
  });

  it('handles Journal settings, stats, and empty state', async () => {
    const user = userEvent.setup();
    const setEntries = vi.fn();
    const setView = vi.fn();
    const setSettingsOpen = vi.fn();
    const props = {
      entries: [], entriesSorted: [], bank: [], setEntries, setView, setDetailKey: vi.fn(),
      setDetailFrom: vi.fn(), openMenuId: null, setOpenMenuId: vi.fn(), settingsOpen: true,
      setSettingsOpen, startCheckin: vi.fn(), companionPreset: '',
    };
    render(<JournalScreen {...props} />);
    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText('Every move you learn becomes part of your story.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Load sample story' }));
    expect(setEntries.mock.calls[0][0]).toHaveLength(18);
    await user.click(screen.getByRole('button', { name: 'Clear my dance story' }));
    expect(setEntries).toHaveBeenCalledWith([]);
    await user.click(screen.getByRole('button', { name: 'Change companion' }));
    expect(setView).toHaveBeenCalledWith('setup');
  });
});

describe('App integration', () => {
  let originalScrollTo;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 20, 19, 30));
    localStorage.clear();
    originalScrollTo = Element.prototype.scrollTo;
    Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, value: vi.fn() });
  });

  afterEach(() => {
    localStorage.clear();
    if (originalScrollTo) {
      Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, value: originalScrollTo });
    } else {
      delete Element.prototype.scrollTo;
    }
    vi.useRealTimers();
  });

  it('opens the stored journal and saves a check-in and its move reference', async () => {
    const user = userEvent.setup();
    const initialEntry = {
      id: 'existing', family: 'solo', moveName: 'Shorty George', status: 'practiced', mood: 'proud',
      note: 'Existing entry', date: '2026-08-19', time: '18:00', cls: '', teacher: '', location: '',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      companionPreset: 'dressed-up-feminine', inviteAccepted: true, entries: [initialEntry], customMoves: [], moveReferences: {},
    }));
    render(<App />);
    expect(screen.getByRole('heading', { name: /Your dance story/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Check in today's dance/i }));
    await user.click(screen.getByRole('button', { name: /Lindy Hop/ }));
    await user.click(screen.getByRole('button', { name: 'Swingout' }));
    await user.click(screen.getByRole('button', { name: 'Practiced' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Proud' }));
    await user.type(screen.getByLabelText('Reference link 1'), 'https://example.com/swingout');
    await user.click(screen.getByRole('button', { name: 'Save to my dance story' }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).entries).toHaveLength(2));
    await user.click(screen.getByRole('button', { name: 'Back to journal' }));
    expect(screen.getByText('Swingout')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.entries.some((entry) => entry.moveName === 'Swingout' && entry.status === 'practiced')).toBe(true);
    expect(stored.moveReferences['lindy|Swingout'][0].url).toBe('https://example.com/swingout');
  });
});
