import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Square } from 'chess.js';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  Leaf,
  Lightbulb,
  LockKeyhole,
  MoreHorizontal,
  Moon,
  Sun,
  Monitor,
  Puzzle,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  WifiOff,
  X,
} from 'lucide-react';
import { ChessBoard } from './components/ChessBoard';
import { ChessPiece } from './components/ChessPiece';
import { Brand } from './components/Brand';
import { MixedPractice, MixedPracticeCard } from './components/MixedPractice';
import { buildMixedPuzzlePool, createMixedPracticeSession } from './domain/mixed-practice';
import type { MixedPracticeQuestion } from './domain/mixed-practice';
import { openings, getVariation } from './domain/openings';
import { createPosition, generatePuzzles, getLastMove, validateMove } from './domain/chess';
import type { Opening } from './domain/types';
import {
  getStats,
  getVariationProgress,
  getReviewQueue,
  markLearned,
  recordAttempt,
  completeReview,
  setDailyGoal,
} from './domain/progress';
import type { ProgressState } from './domain/progress';
import { loadProgress, saveProgress } from './domain/storage';
import { useTheme } from './ui/useTheme';

type Page = 'learn' | 'puzzles' | 'review' | 'progress';
type Mode = 'learn' | 'recall' | 'puzzle' | 'review';
type VariationSession = { variationId: string; mode: Mode; runId: number };
type Session =
  VariationSession | { mode: 'mixed'; questions: MixedPracticeQuestion[]; runId: number };
const navigation: { id: Page; label: string; icon: typeof BookOpen }[] = [
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { id: 'review', label: 'Review', icon: RotateCcw },
  { id: 'progress', label: 'My progress', icon: TrendingUp },
];
const stages = ['Learn', 'Understand', 'Recall', 'Practice', 'Master'];

function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`button ${secondary ? 'secondary' : 'primary'} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`progress-track ${className}`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
function MiniMotif({ opening, index }: { opening: Opening; index: number }) {
  const motifIndex = index % 8;
  const piece = (['n', 'b', 'r', 'p', 'n', 'b', 'p', 'k'] as const)[motifIndex];
  return (
    <div
      className={`opening-motif motif-${motifIndex}`}
      style={{ '--motif-color': opening.accent } as React.CSSProperties}
    >
      <div className="motif-grid" />
      <ChessPiece type={piece} color={index % 3 === 0 ? 'b' : 'w'} />
    </div>
  );
}

export default function App() {
  const { preference, theme, chooseTheme } = useTheme();
  const [page, setPage] = useState<Page>('learn');
  const [progress, setProgress] = useState<ProgressState>(loadProgress);
  const [session, setSession] = useState<Session | null>(null);
  const [detail, setDetail] = useState<Opening | null>(null);
  const [settings, setSettings] = useState(false);
  const [filter, setFilter] = useState('All openings');
  const [openingQuery, setOpeningQuery] = useState('');
  const [saved, setSaved] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState('');
  const stats = getStats(progress);
  const italian = openings.find((o) => o.available)!;
  const primaryVariation = italian.variations[0];
  const primaryProgress = getVariationProgress(progress, primaryVariation.id);
  const visibleOpenings = useMemo(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[’']/g, '')
        .toLowerCase();
    const query = normalize(openingQuery.trim());
    return openings.filter((opening) => {
      const matchesFilter =
        filter === 'All openings' ||
        (filter === 'Available now' && opening.available) ||
        (filter === 'White repertoire' && opening.side === 'White') ||
        (filter === 'Black repertoire' && opening.side === 'Black') ||
        opening.difficulty === filter;
      const searchable = [
        opening.name,
        opening.subtitle,
        ...opening.variations.map((variation) => variation.name),
      ].join(' ');
      return matchesFilter && normalize(searchable).includes(query);
    });
  }, [filter, openingQuery]);
  useEffect(() => {
    setSaved(saveProgress(progress));
  }, [progress]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const startSession = (variationId: string, mode: Mode) => {
    setDetail(null);
    setSession({ variationId, mode, runId: Date.now() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const changePage = (next: Page) => {
    setSession(null);
    setPage(next);
    setFilter('All openings');
    setOpeningQuery('');
    window.scrollTo(0, 0);
  };
  const startMixedPractice = () => {
    const questions = createMixedPracticeSession(buildMixedPuzzlePool(openings, progress));
    if (!questions.length) {
      changePage('learn');
      return;
    }
    setDetail(null);
    setPage('puzzles');
    setSession({ mode: 'mixed', questions, runId: Date.now() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const nav = (
    <>
      {navigation.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-item ${page === id ? 'active' : ''}`}
          onClick={() => changePage(id)}
        >
          <Icon size={20} strokeWidth={1.7} />
          <span>{label}</span>
          {id === 'review' && stats.dueCount > 0 && (
            <span className="nav-count">{stats.dueCount}</span>
          )}
        </button>
      ))}
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-label">YOUR CHESS JOURNEY</div>
        <nav aria-label="Main navigation">{nav}</nav>
        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <span className="quote-piece">
              <ChessPiece type="n" color="b" />
            </span>
            <p>
              Every great game
              <br />
              starts with a good idea.
            </p>
            <span>Make your first move.</span>
          </div>
          <button
            className="profile"
            onClick={() => setSettings(true)}
            aria-label="Practice settings"
          >
            <span className="avatar">Y</span>
            <span>
              You, in the making<small>A little better every day</small>
            </span>
            <Settings2 size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand compact />
          </div>
          <div className="breadcrumb">
            Your workspace <ChevronRight size={13} />
            <span>
              {session
                ? session.mode === 'mixed'
                  ? 'Mixed practice'
                  : openings.find((o) => o.variations.some((v) => v.id === session.variationId))
                      ?.name
                : navigation.find((n) => n.id === page)?.label}
            </span>
          </div>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={() => chooseTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {!online && (
              <span className="offline-label">
                <WifiOff size={14} />
                Offline
              </span>
            )}
            <button
              className="streak-pill"
              onClick={() => changePage('progress')}
              aria-label={`${stats.streak} day streak — view progress`}
            >
              <Flame size={17} />
              <strong>{stats.streak}</strong>
              <span>day streak</span>
            </button>
            <span className="topbar-divider" />
            <button
              className="top-avatar"
              onClick={() => setSettings(true)}
              aria-label="Open practice settings"
            >
              Y
            </button>
          </div>
        </header>
        <main className="main-content">
          {!saved && (
            <div className="storage-warning">
              Your browser couldn’t save progress. Keep this tab open to preserve your current
              session.
            </div>
          )}
          {session ? (
            session.mode === 'mixed' ? (
              <MixedPractice
                key={`mixed-${session.runId}`}
                questions={session.questions}
                updateProgress={setProgress}
                onExit={() => changePage('puzzles')}
                onRestart={startMixedPractice}
              />
            ) : (
              <Training
                key={`${session.variationId}-${session.mode}-${session.runId}`}
                session={session}
                progress={progress}
                updateProgress={setProgress}
                onStart={startSession}
                onExit={() => {
                  setSession(null);
                  setPage('learn');
                }}
              />
            )
          ) : (
            <>
              {page === 'learn' && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">
                        <span className="tiny-line" /> ONE MOVE AT A TIME
                      </div>
                      <h1>
                        Good moves start here<span className="sage-period">.</span>
                      </h1>
                      <p>Learn the ideas. Remember the moves. Make them yours.</p>
                    </div>
                    <span className="heading-tag">
                      <Leaf size={15} /> A little better, every day
                    </span>
                  </div>
                  <div className="dashboard-grid">
                    <div className="dashboard-main">
                      <section className="featured-lesson">
                        <div className="featured-copy">
                          <span className="feature-label">
                            <span className="pulsing-dot" /> YOUR{' '}
                            {primaryProgress.learned ? 'NEXT PRACTICE' : 'FIRST OPENING'}
                          </span>
                          <h2>The Italian Game</h2>
                          <span className="feature-subtitle">Small moves. Big possibilities.</span>
                          <p>
                            Take the center, bring your pieces to life, and build a position with
                            purpose.
                          </p>
                          <div className="feature-meta">
                            <span>
                              <GraduationCap size={15} /> Beginner friendly
                            </span>
                            <span>
                              <Clock3 size={14} /> 5 min
                            </span>
                          </div>
                          <Button
                            onClick={() =>
                              startSession(
                                primaryVariation.id,
                                primaryProgress.learned ? 'recall' : 'learn',
                              )
                            }
                          >
                            {primaryProgress.learned ? 'Practice this opening' : 'Start learning'}
                            <ArrowRight size={17} />
                          </Button>
                          <span className="feature-footnote">
                            {primaryProgress.learned
                              ? 'Make the moves from memory'
                              : 'No memorization. Just understanding.'}
                          </span>
                        </div>
                        <div className="featured-board">
                          <div className="board-decoration decoration-one" />
                          <div className="board-decoration decoration-two" />
                          <ChessBoard
                            fen={createPosition(primaryVariation.moves, 6).fen()}
                            compact
                          />
                          <div className="board-caption">
                            <span className="white-player-dot" /> Giuoco Piano{' '}
                            <span>1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5</span>
                          </div>
                        </div>
                      </section>
                      <section className="learning-path">
                        <div className="path-intro">
                          <Sparkles size={17} />
                          <span>A path to lasting confidence</span>
                        </div>
                        <div className="path-steps">
                          {stages.map((stage, i) => (
                            <div key={stage} className={`path-step ${i === 0 ? 'current' : ''}`}>
                              <span>{i === 0 ? <BookOpen size={15} /> : i + 1}</span>
                              <strong>{stage}</strong>
                              {i < 4 && <ChevronRight size={13} className="path-arrow" />}
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="library-section">
                        <div className="section-heading">
                          <div>
                            <h2>Build your repertoire</h2>
                            <p>
                              {openings.length} openings ·{' '}
                              {openings.reduce(
                                (total, opening) => total + opening.variations.length,
                                0,
                              )}{' '}
                              playable variations
                            </p>
                          </div>
                          <label className="filter-control">
                            <select
                              aria-label="Filter opening library"
                              value={filter}
                              onChange={(e) => setFilter(e.target.value)}
                            >
                              <option>All openings</option>
                              <option>Beginner</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                              <option>White repertoire</option>
                              <option>Black repertoire</option>
                              <option>Available now</option>
                            </select>
                            <ChevronDown size={14} />
                          </label>
                        </div>
                        <div className="library-tools">
                          <label className="opening-search">
                            <Search size={18} aria-hidden="true" />
                            <input
                              type="search"
                              aria-label="Search openings and variations"
                              placeholder="Find an opening or variation"
                              value={openingQuery}
                              onChange={(event) => setOpeningQuery(event.target.value)}
                            />
                            {openingQuery && (
                              <button
                                aria-label="Clear opening search"
                                onClick={() => setOpeningQuery('')}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </label>
                          <span aria-live="polite">
                            {visibleOpenings.length} of {openings.length} openings
                          </span>
                        </div>
                        <div className="opening-grid">
                          {visibleOpenings.map((o) => (
                            <OpeningCard
                              key={o.id}
                              opening={o}
                              index={openings.indexOf(o)}
                              progress={progress}
                              onClick={() => setDetail(o)}
                            />
                          ))}
                        </div>
                        {visibleOpenings.length === 0 && (
                          <div className="library-empty">
                            <Search size={24} aria-hidden="true" />
                            <h3>No openings found yet.</h3>
                            <p>Try another name or choose a different filter.</p>
                          </div>
                        )}
                      </section>
                    </div>
                    <aside className="dashboard-aside">
                      <DailyGoal
                        progress={progress}
                        stats={stats}
                        onSettings={() => setSettings(true)}
                      />
                      <section className="mindset-card">
                        <span className="tip-label">
                          <Lightbulb size={17} /> THE OPENING MINDSET
                        </span>
                        <div className="tip-art">
                          <div className="tip-lines" />
                          <ChessPiece type="p" color="w" />
                          <span className="tip-star">✳</span>
                        </div>
                        <h3>
                          Know the why.
                          <br />
                          The moves will follow.
                        </h3>
                        <p>
                          When you understand the idea behind a move, remembering it becomes second
                          nature.
                        </p>
                        <button
                          className="text-link"
                          onClick={() => startSession(primaryVariation.id, 'learn')}
                        >
                          Let’s put it into practice <ArrowRight size={14} />
                        </button>
                      </section>
                      <div className="offline-note">
                        <span>
                          <CheckCircle2 size={15} /> Made for your rhythm
                        </span>
                        <p>
                          Your progress stays on this device.
                          <br />
                          Practice anywhere, even offline.
                        </p>
                      </div>
                    </aside>
                  </div>
                </>
              )}
              {page === 'puzzles' && (
                <PracticePage
                  progress={progress}
                  onStart={startSession}
                  onMixedStart={startMixedPractice}
                  onLearn={() => changePage('learn')}
                />
              )}
              {page === 'review' && <ReviewPage progress={progress} onStart={startSession} />}
              {page === 'progress' && (
                <ProgressPage
                  progress={progress}
                  stats={stats}
                  onSettings={() => setSettings(true)}
                  onStart={startSession}
                />
              )}
            </>
          )}
          <footer className="footer">
            <Brand compact />
            <span>Better moves. One day at a time.</span>
            <span className="footer-leaf">
              <Leaf size={13} /> Thoughtfully made for learning
            </span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav}
      </nav>
      {detail && (
        <Dialog title={detail.name} onClose={() => setDetail(null)}>
          <div className="detail-motif">
            <MiniMotif opening={detail} index={openings.indexOf(detail)} />
          </div>
          <div className="detail-meta">
            <span className="badge">{detail.difficulty}</span>
            <span>{detail.side} repertoire</span>
          </div>
          <p>{detail.description}</p>
          <h3>Choose a variation</h3>
          <div className="variation-list">
            {detail.variations.map((v) => (
              <button
                key={v.id}
                disabled={!detail.available}
                onClick={() => startSession(v.id, 'learn')}
              >
                <span>
                  <strong>{v.name}</strong>
                  <small>{v.description}</small>
                  <small className="variation-status">
                    {v.moves.length} lesson moves · {getVariationProgress(progress, v.id).mastery}
                  </small>
                </span>
                {detail.available ? <ChevronRight size={18} /> : <LockKeyhole size={16} />}
              </button>
            ))}
          </div>
          {!detail.available && (
            <div className="coming-note">
              <Sparkles size={17} />
              <span>
                This opening is on the way. Start with the Italian Game to build your foundation.
              </span>
            </div>
          )}
        </Dialog>
      )}
      {settings && (
        <Dialog title="Make practice a habit" onClose={() => setSettings(false)}>
          <p>
            A small goal, consistently met, makes a big difference. Choose your daily number of
            practice moves.
          </p>
          <div className="goal-options">
            {[5, 8, 20].map((goal) => (
              <button
                key={goal}
                className={progress.dailyGoal === goal ? 'chosen' : ''}
                onClick={() => {
                  setProgress((p) => setDailyGoal(p, goal));
                  setToast(`Daily goal set to ${goal} moves`);
                }}
              >
                <span>{goal === 5 ? 'Gentle' : goal === 8 ? 'Steady' : 'Focused'}</span>
                <strong>{goal} moves</strong>
                {progress.dailyGoal === goal && <Check size={16} />}
              </button>
            ))}
          </div>
          <p className="settings-note">
            <WifiOff size={15} /> Your lessons and progress work offline after your first visit.
          </p>
          <div className="appearance-settings">
            <h3>Appearance</h3>
            <p>A calmer board, in any light.</p>
            <div className="theme-options" role="group" aria-label="Appearance">
              {(
                [
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button key={id} aria-pressed={preference === id} onClick={() => chooseTheme(id)}>
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => setSettings(false)}>
            That’s my pace <ArrowRight size={17} />
          </Button>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function OpeningCard({
  opening: o,
  index,
  progress,
  onClick,
}: {
  opening: Opening;
  index: number;
  progress: ProgressState;
  onClick: () => void;
}) {
  const learned = o.variations.filter((v) => getVariationProgress(progress, v.id).learned).length;
  const percent = o.variations.length ? Math.round((learned / o.variations.length) * 100) : 0;
  return (
    <button className="opening-card" onClick={onClick}>
      <MiniMotif opening={o} index={index} />
      <div className="opening-card-body">
        <div className="opening-card-top">
          <span className={`difficulty ${o.difficulty.toLowerCase()}`}>
            <span />
            {o.difficulty}
          </span>
          {!o.available && <LockKeyhole size={13} />}
        </div>
        <h3>{o.name}</h3>
        <p>{o.subtitle}</p>
        <div className="card-progress">
          <ProgressBar value={percent} />
          <span>{o.available ? `${percent}%` : 'Soon'}</span>
        </div>
        <div className="opening-card-bottom">
          <span>{o.variations.length} variations</span>
          <span>
            {o.available ? 'Explore' : 'Preview'} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}
function DailyGoal({
  progress,
  stats,
  onSettings,
}: {
  progress: ProgressState;
  stats: ReturnType<typeof getStats>;
  onSettings: () => void;
}) {
  const percentage = Math.min(stats.todayCount / progress.dailyGoal, 1);
  return (
    <section className="daily-card">
      <div className="daily-heading">
        <h3>Your daily practice</h3>
        <button className="icon-button" onClick={onSettings} aria-label="Change daily goal">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="goal-ring">
        <svg viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" className="ring-track" />
          <circle
            cx="70"
            cy="70"
            r="60"
            className="ring-value"
            strokeDasharray={`${percentage * 377} 377`}
          />
        </svg>
        <div>
          <Target size={22} />
          <strong>
            {stats.todayCount}
            <small> / {progress.dailyGoal}</small>
          </strong>
          <span>moves today</span>
        </div>
      </div>
      <p>
        {percentage >= 1
          ? 'Your daily goal, beautifully done.'
          : 'A few moves today. A stronger you tomorrow.'}
      </p>
      <div className="daily-divider" />
      <div className="daily-stat">
        <span>
          <Flame size={18} className="orange-icon" /> Practice streak
        </span>
        <strong>
          {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
        </strong>
      </div>
      <div className="week-row">
        {weekDays(progress).map((day) => (
          <div key={day.date} className={day.active ? 'done' : day.today ? 'today' : ''}>
            <span>{day.label}</span>
            <i>{day.active ? <Check size={11} /> : day.today ? <span /> : '·'}</i>
          </div>
        ))}
      </div>
    </section>
  );
}
function weekDays(progress: ProgressState) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    return {
      date,
      label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
      today: day.toDateString() === today.toDateString(),
      active: (progress.activity[date] || 0) > 0,
    };
  });
}
function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') {
        const elements = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), select, [href], [tabindex="0"]',
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handle);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog" ref={ref} role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-heading">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Training({
  session,
  progress,
  updateProgress,
  onExit,
  onStart,
}: {
  session: VariationSession;
  progress: ProgressState;
  updateProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
  onExit: () => void;
  onStart: (id: string, mode: Mode) => void;
}) {
  const variation = getVariation(session.variationId)!;
  const opening = openings.find((o) => o.variations.some((v) => v.id === variation.id))!;
  const learnerColor = opening.side === 'White' ? 'w' : 'b';
  const learnerSide = opening.side;
  const opponentSide = learnerSide === 'White' ? 'Black' : 'White';
  const startingPly = learnerColor === 'w' ? 0 : 1;
  const [ply, setPly] = useState(session.mode === 'learn' ? 0 : startingPly);
  const [whyOpen, setWhyOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: 'correct' | 'incorrect' | 'hint';
    title: string;
    body: string;
  } | null>(null);
  const [hinted, setHinted] = useState(false);
  const [solved, setSolved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [cleanCorrect, setCleanCorrect] = useState(0);
  const [mistake, setMistake] = useState(false);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [positionAfter, setPositionAfter] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(learnerColor === 'b');
  const isLearn = session.mode === 'learn';
  const isPuzzle = session.mode === 'puzzle';
  const puzzles = useMemo(() => {
    const items = generatePuzzles(variation, learnerColor);
    return [...items.slice(1), items[0]];
  }, [variation, learnerColor]);
  const currentPly = isPuzzle ? puzzles[puzzleIndex].ply : ply;
  const chess = createPosition(variation.moves, currentPly);
  const fen = positionAfter || chess.fen();
  const currentMove = variation.moves[Math.min(currentPly, variation.moves.length - 1)];
  const total = isPuzzle ? puzzles.length : Math.ceil((variation.moves.length - startingPly) / 2);
  const stageIndex = isLearn
    ? whyOpen
      ? 1
      : 0
    : session.mode === 'recall'
      ? 2
      : session.mode === 'puzzle'
        ? 3
        : 4;
  const count = isLearn ? ply : isPuzzle ? puzzleIndex : Math.floor((ply - startingPly) / 2);
  const resetQuestion = () => {
    setFeedback(null);
    setHinted(false);
    setSolved(false);
    setMistake(false);
    setPositionAfter(null);
    setWhyOpen(false);
  };
  const finish = () => {
    if (isLearn) updateProgress((p) => markLearned(p, variation.id));
    else updateProgress((p) => completeReview(p, variation.id, cleanCorrect / total));
    setCompleted(true);
  };
  const next = () => {
    if (isLearn) {
      if (ply >= variation.moves.length) finish();
      else {
        setPly((p) => p + 1);
        setWhyOpen(false);
        setFeedback(null);
        setHinted(false);
      }
    } else if (isPuzzle) {
      if (puzzleIndex + 1 >= puzzles.length) finish();
      else {
        setPuzzleIndex((p) => p + 1);
        resetQuestion();
      }
    } else {
      if (ply + 2 >= variation.moves.length) finish();
      else {
        setPly((p) => p + 2);
        resetQuestion();
      }
    }
  };
  const onMove = (from: Square, to: Square) => {
    if (solved || completed || (isLearn && ply >= variation.moves.length)) return;
    const attempted = validateMove(fen, from, to);
    if (!attempted.legal) {
      setFeedback({
        kind: 'hint',
        title: 'That piece can’t move there.',
        body: 'Tap a piece to see its legal moves, then choose a highlighted square.',
      });
      return;
    }
    const correct = attempted.san === currentMove.san;
    if (isLearn) {
      if (correct) {
        setPly((p) => p + 1);
        setWhyOpen(false);
        setHinted(false);
        setFeedback(null);
      } else {
        setHinted(true);
        setFeedback({
          kind: 'hint',
          title: 'Think about this opening’s next idea.',
          body: currentMove.hint,
        });
      }
      return;
    }
    updateProgress((p) => recordAttempt(p, variation.id, correct, hinted || mistake));
    if (correct) {
      setSolved(true);
      setPositionAfter(attempted.fen!);
      if (!hinted && !mistake) setCleanCorrect((n) => n + 1);
      setFeedback({ kind: 'correct', title: 'That’s the idea!', body: currentMove.explanation });
    } else {
      setMistake(true);
      setHinted(true);
      setFeedback({
        kind: 'incorrect',
        title: 'A legal move. Try a different idea.',
        body: currentMove.hint,
      });
    }
  };
  const showHint = () => {
    setHinted(true);
    setFeedback({ kind: 'hint', title: 'A little nudge', body: currentMove.hint });
  };
  const expected = createPosition(
    variation.moves,
    Math.min(currentPly, variation.moves.length - 1),
  );
  const expectedMove = expected.move(currentMove.san);
  const displayMove = variation.moves[Math.max(0, ply - 1)];
  const learned = getVariationProgress(progress, variation.id);
  if (completed)
    return (
      <section className="completion">
        <div className="completion-art">
          <Trophy size={48} strokeWidth={1.5} />
          <span>✦</span>
        </div>
        <div className="eyebrow">ONE STEP STRONGER</div>
        <h1>{isLearn ? 'The ideas are yours.' : 'Good moves. Real progress.'}</h1>
        <p>
          {isLearn
            ? `You’ve explored the ${variation.name}. Now let’s see what you remember by making the moves yourself.`
            : 'Every thoughtful attempt helps the opening stick. Your next review is scheduled around how you did.'}
        </p>
        <div className="completion-stats">
          <div>
            <span>{isLearn ? variation.moves.length : total}</span>
            <small>{isLearn ? 'moves explored' : 'positions practiced'}</small>
          </div>
          <div>
            <span>{isLearn ? 'Learning' : `${Math.round((cleanCorrect / total) * 100)}%`}</span>
            <small>{isLearn ? 'mastery stage' : 'first-try recall'}</small>
          </div>
          <div>
            <span>{learned.mastery}</span>
            <small>current mastery</small>
          </div>
        </div>
        <Button
          onClick={() =>
            onStart(
              variation.id,
              isLearn ? 'recall' : session.mode === 'recall' ? 'puzzle' : 'review',
            )
          }
        >
          {isLearn
            ? 'Try active recall'
            : session.mode === 'recall'
              ? 'Put it into practice'
              : 'Review the opening'}
          <ArrowRight size={17} />
        </Button>
        <button className="text-link" onClick={onExit}>
          Back to my journey <ArrowRight size={14} />
        </button>
      </section>
    );
  return (
    <div className="training-page">
      <button className="back-link" onClick={onExit}>
        <ArrowLeft size={16} /> Back to your journey
      </button>
      <div className="training-heading">
        <div>
          <div className="eyebrow">
            {opening.name.toUpperCase()} · {variation.name.toUpperCase()}
          </div>
          <h1>
            {isLearn
              ? 'Every move has a purpose.'
              : isPuzzle
                ? 'Find your next move.'
                : session.mode === 'review'
                  ? 'Make it second nature.'
                  : 'Your turn to remember.'}
          </h1>
          <p>
            {isLearn
              ? 'Try each move on the board, or follow along to discover the ideas.'
              : `Tap a piece, then its destination. You’re playing as ${learnerSide}.`}
          </p>
        </div>
        <span className="badge">
          <Clock3 size={14} />{' '}
          {isLearn
            ? `${Math.min(ply, variation.moves.length)} / ${variation.moves.length} moves`
            : `${Math.min(count + 1, total)} / ${total} positions`}
        </span>
      </div>
      <div className="training-stages">
        {stages.map((stage, i) => (
          <span
            key={stage}
            className={stageIndex === i ? 'active' : i < stageIndex ? 'complete' : ''}
          >
            {i < stageIndex ? <Check size={14} /> : <i>{i + 1}</i>}
            {stage}
          </span>
        ))}
      </div>
      <ProgressBar value={isLearn ? (ply / variation.moves.length) * 100 : (count / total) * 100} />
      <div className="training-grid">
        <div className="training-board-panel">
          <div className="board-player">
            <span className="player-piece">
              <ChessPiece type="k" color={learnerColor === 'w' ? 'b' : 'w'} />
            </span>
            <div>
              <strong>{isLearn ? 'The other side' : 'Your opponent'}</strong>
              <span>{opponentSide} pieces</span>
            </div>
            <span className="player-tag">{isLearn ? 'Follow along' : 'Automatic replies'}</span>
          </div>
          <ChessBoard
            fen={fen}
            interactive={isLearn ? ply < variation.moves.length : !solved}
            onMove={onMove}
            lastMove={
              positionAfter
                ? { from: expectedMove.from, to: expectedMove.to }
                : getLastMove(variation.moves, currentPly)
            }
            hintSquare={hinted && feedback?.kind === 'hint' ? expectedMove.from : null}
            flipped={flipped}
          />
          <div className="board-player">
            <span className="player-piece white">
              <ChessPiece type="k" color={learnerColor} />
            </span>
            <div>
              <strong>You</strong>
              <span>{learnerSide} pieces</span>
            </div>
            <button
              className="icon-button"
              onClick={() => setFlipped((f) => !f)}
              aria-label="Flip chessboard"
            >
              <RotateCcw size={17} />
            </button>
          </div>
          <div className="board-help">
            <span>
              <span className="white-player-dot" />
              {isLearn
                ? (chess.turn() === 'w' ? 'White' : 'Black') + ' to move'
                : solved
                  ? 'Well played'
                  : `${learnerSide} to move`}
            </span>
            <span>
              {isLearn ? 'Try the move, or follow along below' : 'Tap a piece → tap a square'}
            </span>
          </div>
          {feedback && (
            <div className={`board-feedback ${feedback.kind}`} role="status">
              <span>
                {feedback.kind === 'correct' ? <CheckCircle2 size={18} /> : <Lightbulb size={18} />}
              </span>
              <div>
                <strong>{feedback.title}</strong>
                <p>{feedback.body}</p>
              </div>
            </div>
          )}
        </div>
        <div className="lesson-panel">
          {isLearn ? (
            <>
              <div className="lesson-kicker">
                <BookOpen size={17} />{' '}
                {ply === 0
                  ? 'THE STARTING POSITION'
                  : `MOVE ${Math.ceil(ply / 2)} · ${ply % 2 === 1 ? 'WHITE' : 'BLACK'}`}
              </div>
              <h2>{ply === 0 ? `Meet the ${variation.name}.` : displayMove.title}</h2>
              {ply > 0 && (
                <span className="move-badge">
                  {Math.ceil(ply / 2)}
                  {ply % 2 === 1 ? '.' : '...'} {displayMove.san}
                </span>
              )}
              <p>
                {ply === 0
                  ? `${variation.description} You’ll explore ${variation.moves.length} moves, then recall the ${learnerSide.toLowerCase()} moves on the board.`
                  : displayMove.explanation}
              </p>
              {ply > 0 && (
                <button
                  className={`why-button ${whyOpen ? 'open' : ''}`}
                  onClick={() => setWhyOpen((w) => !w)}
                >
                  <Lightbulb size={17} /> Why this move?
                  <ChevronDown size={16} />
                </button>
              )}
              {whyOpen && (
                <div className="why-explanation">
                  <span>THE IDEA BEHIND THE MOVE</span>
                  <p>{displayMove.why}</p>
                </div>
              )}
              <div className="move-sequence">
                {Array.from({ length: Math.ceil(variation.moves.length / 2) }, (_, i) => (
                  <div key={i}>
                    <span>{i + 1}.</span>
                    {[i * 2, i * 2 + 1]
                      .filter((idx) => idx < variation.moves.length)
                      .map((idx) => (
                        <button
                          key={idx}
                          className={idx + 1 === ply ? 'current' : idx < ply ? 'played' : ''}
                          onClick={() => {
                            setPly(idx + 1);
                            setWhyOpen(false);
                          }}
                          aria-label={`Explore move ${idx + 1}: ${variation.moves[idx].san}`}
                        >
                          {variation.moves[idx].san}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
              <div className="lesson-controls">
                <button
                  className="button secondary"
                  disabled={ply === 0}
                  onClick={() => {
                    setPly((p) => p - 1);
                    setWhyOpen(false);
                  }}
                  aria-label="Previous move"
                >
                  <ChevronLeft size={18} />
                </button>
                <Button onClick={next}>
                  {ply === 0
                    ? 'Show the first move'
                    : ply >= variation.moves.length
                      ? 'I’m ready to recall'
                      : 'Next move'}
                  <ArrowRight size={17} />
                </Button>
              </div>
              <div className="lesson-bottom-note">
                <Lightbulb size={14} /> Don’t rush. Understanding comes first.
              </div>
            </>
          ) : (
            <>
              <div className="lesson-kicker">
                {isPuzzle ? <Puzzle size={17} /> : <Target size={17} />}{' '}
                {isPuzzle ? 'OPENING PRACTICE' : 'ACTIVE RECALL'}
              </div>
              <h2>
                {solved
                  ? 'A move with meaning.'
                  : isPuzzle
                    ? puzzles[puzzleIndex].prompt
                    : 'What would you play?'}
              </h2>
              <p>
                {solved
                  ? 'You remembered the move. Take a moment to connect it with the idea.'
                  : isPuzzle
                    ? `Use what you learned in the ${opening.name}. Find the move that continues your ${variation.name} line.`
                    : 'The sequence is hidden. Recall the idea, then play the next move from the line.'}
              </p>
              <div className="recall-hidden">
                <LockKeyhole size={17} />
                <span>The moves are in your memory now.</span>
              </div>
              <div className="feedback-space" aria-live="polite">
                {feedback ? (
                  <div className={`feedback ${feedback.kind}`}>
                    <span>
                      {feedback.kind === 'correct' ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <Lightbulb size={22} />
                      )}
                    </span>
                    <div>
                      <h3>{feedback.title}</h3>
                      <p>{feedback.body}</p>
                    </div>
                  </div>
                ) : (
                  <div className="quiet-prompt">
                    <span className="prompt-dot" />
                    <p>
                      Take your time. Think about the center,
                      <br />
                      development, and your king.
                    </p>
                  </div>
                )}
              </div>
              {solved ? (
                <>
                  <button className="why-button" onClick={() => setWhyOpen((w) => !w)}>
                    <Lightbulb size={17} /> Why this move?
                    <ChevronDown size={16} />
                  </button>
                  {whyOpen && (
                    <div className="why-explanation">
                      <p>{currentMove.why}</p>
                    </div>
                  )}
                  <Button onClick={next}>
                    {count + 1 >= total
                      ? 'Finish practice'
                      : isPuzzle
                        ? 'Next puzzle'
                        : 'See the reply & continue'}
                    <ArrowRight size={17} />
                  </Button>
                </>
              ) : (
                <button className="button secondary hint-button" onClick={showHint}>
                  <Lightbulb size={17} /> I’d like a hint
                </button>
              )}
              <div className="lesson-bottom-note">
                <Leaf size={14} /> A thoughtful attempt is a step forward.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span className="tiny-line" />
          {eyebrow}
        </div>
        <h1>
          {title}
          <span className="sage-period">.</span>
        </h1>
        <p>{children}</p>
      </div>
    </div>
  );
}
function PracticePage({
  progress,
  onStart,
  onMixedStart,
  onLearn,
}: {
  progress: ProgressState;
  onStart: (id: string, mode: Mode) => void;
  onMixedStart: () => void;
  onLearn: () => void;
}) {
  const [openingFilter, setOpeningFilter] = useState(openings[0].id);
  const mixedPool = useMemo(() => buildMixedPuzzlePool(openings, progress), [progress]);
  const mixedSources = mixedPool.flatMap((puzzle) => puzzle.sources);
  const available = openings.flatMap((o) =>
    o.available && (o.id === openingFilter || openingFilter === 'learned')
      ? o.variations
          .filter(
            (v) => openingFilter !== 'learned' || getVariationProgress(progress, v.id).learned,
          )
          .map((v) => ({ o, v }))
      : [],
  );
  return (
    <>
      <PageHeading eyebrow="PUT IDEAS INTO ACTION" title="Your next move matters">
        Practice real positions from the openings you’ve learned.
      </PageHeading>
      <MixedPracticeCard
        positionCount={mixedPool.length}
        openingCount={new Set(mixedSources.map((source) => source.openingId)).size}
        variationCount={new Set(mixedSources.map((source) => source.variationId)).size}
        onStart={onMixedStart}
        onLearn={onLearn}
      />
      <div className="section-heading repertoire-filter">
        <div>
          <h2>Choose your practice</h2>
          <p>{available.length} variations · Learn the ideas, then play from memory.</p>
        </div>
        <label className="filter-control">
          <select
            aria-label="Filter puzzle openings"
            value={openingFilter}
            onChange={(e) => setOpeningFilter(e.target.value)}
          >
            {openings
              .filter((o) => o.available)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            <option value="learned">My learned variations</option>
          </select>
          <ChevronDown size={16} />
        </label>
      </div>
      {available.length === 0 && (
        <div className="coming-note">
          Learn a variation from the opening library to add it to your practice collection.
        </div>
      )}
      <div className="practice-grid">
        {available.map(({ o, v }) => {
          const learned = getVariationProgress(progress, v.id).learned;
          const positions = Math.ceil((v.moves.length - (o.side === 'Black' ? 1 : 0)) / 2);
          return (
            <section className="practice-card" key={v.id}>
              <ChessBoard
                fen={createPosition(
                  v.moves,
                  Math.min(v.moves.length - 1, o.side === 'Black' ? 5 : 4),
                ).fen()}
                compact
                flipped={o.side === 'Black'}
              />
              <div>
                <span className="eyebrow">{o.name}</span>
                <h2>{v.name}</h2>
                <p>{v.description}</p>
                <span className="practice-meta">
                  <Puzzle size={15} />
                  {positions} opening positions <span>·</span> Play as {o.side}
                </span>
                <Button onClick={() => onStart(v.id, learned ? 'puzzle' : 'learn')}>
                  {learned ? 'Start practice' : 'Learn this line first'}
                  <ArrowRight size={17} />
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
function ReviewPage({
  progress,
  onStart,
}: {
  progress: ProgressState;
  onStart: (id: string, mode: Mode) => void;
}) {
  const queue = getReviewQueue(progress);
  const learned = Object.values(progress.variations).filter((v) => v.learned);
  const italian = openings.find((o) => o.available)!;
  return (
    <>
      <PageHeading eyebrow="A LITTLE REPETITION. LASTING CONFIDENCE." title="Keep the ideas close">
        Your practice adapts to you. The trickier lines come back sooner.
      </PageHeading>
      {queue.length === 0 ? (
        <section className="empty-state">
          <span className="empty-icon">
            <RotateCcw size={35} />
          </span>
          <h2>{learned.length ? 'All caught up.' : 'Your review journey starts here.'}</h2>
          <p>
            {learned.length
              ? 'Your next reviews are scheduled. You can revisit an opening whenever you like.'
              : 'Learn your first variation, then come back to make it second nature.'}
          </p>
          <Button
            onClick={() =>
              onStart(
                learned[0]?.variationId || italian.variations[0].id,
                learned.length ? 'review' : 'learn',
              )
            }
          >
            {learned.length ? 'Practice anyway' : 'Learn the Italian Game'}
            <ArrowRight size={17} />
          </Button>
        </section>
      ) : (
        <div className="review-list">
          {queue.map((p, i) => {
            const v = getVariation(p.variationId);
            if (!v) return null;
            return (
              <section key={p.variationId} className="review-card">
                <span className="review-number">0{i + 1}</span>
                <div>
                  <span className="eyebrow">
                    {openings.find((o) => o.variations.some((line) => line.id === v.id))?.name}
                  </span>
                  <h2>{v.name}</h2>
                  <p>
                    {p.correct === 0
                      ? 'Your first recall is ready.'
                      : `${Math.round((p.correct / p.attempts) * 100)}% move accuracy · Let’s strengthen this line.`}
                  </p>
                </div>
                <span className="badge">{p.mastery}</span>
                <Button onClick={() => onStart(v.id, 'review')}>
                  Review <ArrowRight size={16} />
                </Button>
              </section>
            );
          })}
        </div>
      )}
      <section className="review-explainer">
        <Lightbulb size={21} />
        <div>
          <h3>Just before you forget.</h3>
          <p>
            New and challenging variations return sooner. Consistent, unassisted recall gradually
            extends the time between reviews.
          </p>
        </div>
      </section>
    </>
  );
}
function ProgressPage({
  progress,
  stats,
  onSettings,
  onStart,
}: {
  progress: ProgressState;
  stats: ReturnType<typeof getStats>;
  onSettings: () => void;
  onStart: (id: string, mode: Mode) => void;
}) {
  const [openingFilter, setOpeningFilter] = useState(openings[0].id);
  const entries = openings
    .filter((o) => o.available)
    .flatMap((o) => o.variations.map((v) => ({ o, v, p: getVariationProgress(progress, v.id) })));
  const weakest = entries
    .filter(({ p }) => p.attempts > 0)
    .sort((a, b) => a.p.correct / a.p.attempts - b.p.correct / b.p.attempts);
  const visibleEntries = entries.filter(
    ({ o }) => openingFilter === 'all' || o.id === openingFilter,
  );
  const learnedInSelection = visibleEntries.filter(({ p }) => p.learned).length;
  return (
    <>
      <PageHeading eyebrow="SMALL STEPS ADD UP" title="Look how far you’re going">
        Every idea understood and every move recalled is progress.
      </PageHeading>
      <div className="stats-grid">
        {[
          {
            icon: Trophy,
            value: `${stats.overallMastery}%`,
            label: 'Overall mastery',
            detail: 'Across started variations',
          },
          {
            icon: Target,
            value: stats.attempts ? `${stats.accuracy}%` : '—',
            label: 'Move accuracy',
            detail: `${stats.attempts} practice attempts`,
          },
          {
            icon: BookOpen,
            value: String(stats.learnedCount),
            label: 'Variations learned',
            detail: 'Ideas explored move by move',
          },
          {
            icon: Flame,
            value: String(stats.streak),
            label: 'Day streak',
            detail: 'A habit worth keeping',
          },
        ].map(({ icon: Icon, value, label, detail }) => (
          <section className="stat-card" key={label}>
            <Icon size={21} />
            <strong>{value}</strong>
            <h3>{label}</h3>
            <p>{detail}</p>
          </section>
        ))}
      </div>
      <div className="progress-grid">
        <section className="mastery-card">
          <div className="section-heading">
            <div>
              <h2>Your repertoire, growing</h2>
              <p>
                {learnedInSelection} / {visibleEntries.length} variations learned. Mastery follows.
              </p>
            </div>
            <label className="filter-control">
              <select
                aria-label="Filter progress openings"
                value={openingFilter}
                onChange={(e) => setOpeningFilter(e.target.value)}
              >
                {openings
                  .filter((o) => o.available)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                <option value="all">All openings</option>
              </select>
              <ChevronDown size={16} />
            </label>
          </div>
          {visibleEntries.map(({ o, v, p }) => (
            <div className="mastery-row" key={v.id}>
              <div>
                <h3>{v.name}</h3>
                <span>{o.name}</span>
              </div>
              <div className="mastery-steps">
                {['New', 'Learning', 'Familiar', 'Good', 'Mastered'].map((m, i) => (
                  <span
                    key={m}
                    className={
                      i <= ['New', 'Learning', 'Familiar', 'Good', 'Mastered'].indexOf(p.mastery)
                        ? 'filled'
                        : ''
                    }
                    title={m}
                  />
                ))}
                <small>{p.mastery}</small>
              </div>
              <button
                className="icon-button"
                onClick={() => onStart(v.id, p.learned ? 'review' : 'learn')}
                aria-label={`Practice ${o.name}: ${v.name}`}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          ))}
          <div className="mastery-legend">
            <span>New</span>
            <span>Learning</span>
            <span>Familiar</span>
            <span>Good</span>
            <span>Mastered</span>
          </div>
        </section>
        <DailyGoal progress={progress} stats={stats} onSettings={onSettings} />
      </div>
      <section className="weakest-card">
        <h2>A little extra attention</h2>
        <p>
          {weakest.length
            ? 'These variations could use another thoughtful visit.'
            : 'Your trickiest variations will appear here as you practice.'}
        </p>
        {weakest.slice(0, 3).map(({ o, v, p }) => (
          <button key={v.id} onClick={() => onStart(v.id, 'review')}>
            <span>
              <strong>{v.name}</strong>
              <small>
                {o.name} · {Math.round((p.correct / p.attempts) * 100)}% accuracy
              </small>
            </span>
            <span>
              Practice <ArrowRight size={15} />
            </span>
          </button>
        ))}
      </section>
    </>
  );
}
