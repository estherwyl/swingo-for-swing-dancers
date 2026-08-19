import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  BottomNav,
  JournalCard,
  MoveBankCard,
  MoveListView,
  SetupScreen,
  Sticker,
} from '../App.jsx';

const entry = {
  id: 'entry-1',
  family: 'lindy',
  moveName: 'Swingout',
  status: 'practiced',
  mood: 'proud',
  note: 'Keep the stretch.',
  date: '2026-08-19',
  time: '19:10',
};

describe('high-value components', () => {
  it('shows BottomNav active state for each view and move details', async () => {
    const user = userEvent.setup();
    const setView = vi.fn();
    const startCheckin = vi.fn();
    const { rerender } = render(
      <BottomNav view="journal" detailFrom="journal" setView={setView} startCheckin={startCheckin} />,
    );

    expect(screen.getByRole('button', { name: /journal/i })).toHaveClass('active');
    rerender(<BottomNav view="checkin" detailFrom="journal" setView={setView} startCheckin={startCheckin} />);
    expect(screen.getByRole('button', { name: /check in/i })).toHaveClass('active');
    rerender(<BottomNav view="moves" detailFrom="journal" setView={setView} startCheckin={startCheckin} />);
    expect(screen.getByRole('button', { name: /moves/i })).toHaveClass('active');
    rerender(<BottomNav view="detail" detailFrom="moves" setView={setView} startCheckin={startCheckin} />);
    expect(screen.getByRole('button', { name: /moves/i })).toHaveClass('active');
    rerender(<BottomNav view="wrapped" detailFrom="journal" setView={setView} startCheckin={startCheckin} />);
    expect(screen.getByRole('button', { name: /wrapped/i })).toHaveClass('active');

    await user.click(screen.getByRole('button', { name: /check in/i }));
    expect(startCheckin).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: /journal/i }));
    expect(setView).toHaveBeenCalledWith('journal');
  });

  it('renders JournalCard details and handles menu actions', async () => {
    const user = userEvent.setup();
    const setOpenMenuId = vi.fn();
    const onOpen = vi.fn();
    const onDelete = vi.fn();
    const { rerender } = render(
      <JournalCard entry={entry} openMenuId={null} setOpenMenuId={setOpenMenuId} onOpen={onOpen} onDelete={onDelete} />,
    );

    expect(screen.getByText('Wed Aug 19, 2026')).toBeInTheDocument();
    expect(screen.getByText('I practiced')).toBeInTheDocument();
    expect(screen.getByText('Lindy Hop · Practiced')).toBeInTheDocument();
    expect(screen.getByLabelText('Proud')).toHaveTextContent('🥹');
    expect(screen.getByText('"Keep the stretch."')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Entry menu' }));
    expect(setOpenMenuId).toHaveBeenCalledWith('entry-1');

    rerender(
      <JournalCard entry={entry} openMenuId="entry-1" setOpenMenuId={setOpenMenuId} onOpen={onOpen} onDelete={onDelete} />,
    );
    await user.click(screen.getByRole('button', { name: 'View move' }));
    expect(onOpen).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Delete entry' }));
    expect(onDelete).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Entry menu' }));
    expect(setOpenMenuId).toHaveBeenLastCalledWith(null);
  });

  it('renders a bank card and opens it', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <MoveBankCard
        row={{
          key: 'lindy|Swingout',
          family: 'lindy',
          moveName: 'Swingout',
          firstDate: '2026-08-01',
          logs: 2,
          latestStatus: 'practiced',
          mood: 'flowing',
        }}
        onOpen={onOpen}
      />,
    );
    expect(screen.getByText('Swingout')).toBeInTheDocument();
    expect(screen.getByText('Lindy Hop · First learned Aug 1')).toBeInTheDocument();
    expect(screen.getByText('2 logs')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Swingout/ }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('lets MoveListView update search and family filters', async () => {
    const user = userEvent.setup();
    const setBankSearch = vi.fn();
    const setBankFilter = vi.fn();
    render(
      <MoveListView
        filtered={[]}
        bank={[]}
        bankSearch=""
        setBankSearch={setBankSearch}
        bankFilter="all"
        setBankFilter={setBankFilter}
        onOpen={vi.fn()}
      />,
    );
    await user.type(screen.getByPlaceholderText('Search moves…'), 'swing');
    expect(setBankSearch).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Solo Jazz' }));
    expect(setBankFilter).toHaveBeenCalledWith('solo');
    expect(screen.getByText('No moves match that search.')).toBeInTheDocument();
  });

  it('shows an icon image or fallback sticker', () => {
    const { rerender } = render(<Sticker family="solo" moveName="Tangos" />);
    expect(document.querySelector('img')).toHaveAttribute('src', '/assets/moves/solo/tangos.png');
    rerender(<Sticker family="lindy" moveName="Tangos" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelector('.sticker-fallback')).toBeInTheDocument();
  });

  it('enables setup CTA after choices and continues to the app', async () => {
    const user = userEvent.setup();
    const setCompanionPreset = vi.fn();
    const setInviteAccepted = vi.fn();
    const setView = vi.fn();
    render(
      <SetupScreen
        companionPreset=""
        setCompanionPreset={setCompanionPreset}
        setInviteAccepted={setInviteAccepted}
        setView={setView}
      />,
    );

    const cta = screen.getByRole('button', { name: /start reflecting/i });
    expect(cta).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Female dancer' }));
    await user.click(screen.getByRole('button', { name: 'Casual' }));
    expect(cta).toBeEnabled();
    expect(screen.getByText('Casual feminine')).toBeInTheDocument();
    await user.click(cta);
    expect(setCompanionPreset).toHaveBeenCalledWith('casual-feminine');
    expect(setInviteAccepted).toHaveBeenCalledWith(true);
    expect(setView).toHaveBeenCalledWith('journal');
  });
});
