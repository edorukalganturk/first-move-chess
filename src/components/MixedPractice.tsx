import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Chess, type Square } from 'chess.js';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Layers3,
  Lightbulb,
  Shuffle,
  Target,
  Trophy,
} from 'lucide-react';
import { validateMove } from '../domain/chess';
import {
  resolveMixedPuzzleAnswer,
  type MixedPracticeQuestion,
  type MixedPuzzleSource,
} from '../domain/mixed-practice';
import { recordAttempt, type ProgressState } from '../domain/progress';
import { ChessBoard } from './ChessBoard';
import { ChessPiece } from './ChessPiece';
import '../ui/mixed-practice.css';

export interface MixedPracticeCardProps {
  positionCount: number;
  openingCount: number;
  variationCount: number;
  onStart: () => void;
  onLearn: () => void;
}

export function MixedPracticeCard({
  positionCount,
  openingCount,
  variationCount,
  onStart,
  onLearn,
}: MixedPracticeCardProps) {
  const available = positionCount > 0;
  const roundSize = Math.min(10, positionCount);

  return (
    <section className="mixed-practice-card" aria-labelledby="mixed-practice-card-title">
      <div className="mixed-card-art" aria-hidden="true">
        <Shuffle size={30} strokeWidth={1.6} />
        <span />
        <span />
        <span />
      </div>
      <div className="mixed-card-copy">
        <div className="mixed-kicker">RECOGNIZE THE IDEA</div>
        <h2 id="mixed-practice-card-title">Mixed opening practice</h2>
        <p>
          {available
            ? 'A fresh mix from the openings you’ve learned. Read the position, remember the idea, and play your move.'
            : 'Learn an opening first, then come back to recognize its ideas in a fresh mix of positions.'}
        </p>
        {available && (
          <div className="mixed-card-meta" aria-label="Your mixed practice pool">
            <span>
              <Target size={16} aria-hidden="true" /> {positionCount}{' '}
              {positionCount === 1 ? 'position' : 'positions'}
            </span>
            <span>
              <BookOpen size={16} aria-hidden="true" /> {openingCount}{' '}
              {openingCount === 1 ? 'opening' : 'openings'}
            </span>
            <span>
              <Layers3 size={16} aria-hidden="true" /> {variationCount}{' '}
              {variationCount === 1 ? 'variation' : 'variations'}
            </span>
          </div>
        )}
        {available && variationCount === 1 && (
          <p className="mixed-card-note">
            One learned variation is enough to start. Your positions will be shuffled.
          </p>
        )}
      </div>
      <div className="mixed-card-actions">
        <button type="button" className="button primary" onClick={available ? onStart : onLearn}>
          {available ? 'Start mixed practice' : 'Learn your first opening'}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <span>
          {available
            ? `${roundSize} unique ${roundSize === 1 ? 'position' : 'positions'} per round`
            : 'Understand the moves. Then make them yours.'}
        </span>
      </div>
    </section>
  );
}

export interface MixedPracticeProps {
  questions: MixedPracticeQuestion[];
  updateProgress: Dispatch<SetStateAction<ProgressState>>;
  onExit: () => void;
  onRestart: () => void;
}

interface SolvedPosition {
  puzzleId: string;
  firstTry: boolean;
}

export function MixedPractice({
  questions,
  updateProgress,
  onExit,
  onRestart,
}: MixedPracticeProps) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<SolvedPosition[]>([]);
  const [practicedVariations, setPracticedVariations] = useState<string[]>([]);
  const solvedIds = useRef(new Set<string>());
  const practicedIds = useRef(new Set<string>());
  const question = questions[index];
  const total = questions.length;
  const firstTryCount = results.filter((result) => result.firstTry).length;
  const accuracy = results.length ? Math.round((firstTryCount / results.length) * 100) : 0;

  function rememberAttempt(variationId: string) {
    if (practicedIds.current.has(variationId)) return;
    practicedIds.current.add(variationId);
    setPracticedVariations((previous) => [...previous, variationId]);
  }

  function rememberSolved(result: SolvedPosition) {
    if (solvedIds.current.has(result.puzzleId)) return;
    solvedIds.current.add(result.puzzleId);
    setResults((previous) => [...previous, result]);
  }

  function restart() {
    solvedIds.current.clear();
    practicedIds.current.clear();
    setResults([]);
    setPracticedVariations([]);
    setIndex(0);
    onRestart();
  }

  if (total === 0) {
    return (
      <section className="mixed-practice mixed-empty empty-state">
        <div className="empty-icon">
          <BookOpen size={32} aria-hidden="true" />
        </div>
        <h1>Your next idea starts with a lesson.</h1>
        <p>Learn an opening variation to fill your mixed practice with positions you understand.</p>
        <button type="button" className="button primary" onClick={onExit}>
          Back to puzzles <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }

  if (!question) {
    return (
      <section className="mixed-practice mixed-summary completion">
        <div className="completion-art">
          <Trophy size={42} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="mixed-kicker">A LITTLE PRACTICE, LASTING IDEAS</div>
        <h1>Round complete.</h1>
        <p>You recognized positions from your repertoire and put the ideas into play.</p>
        <dl className="mixed-summary-stats">
          <div>
            <dd>
              {results.length}
              <span> / {total}</span>
            </dd>
            <dt>Positions solved</dt>
          </div>
          <div>
            <dd>{accuracy}%</dd>
            <dt>First-try accuracy</dt>
          </div>
          <div>
            <dd>{practicedVariations.length}</dd>
            <dt>Variations practiced</dt>
          </div>
        </dl>
        <p className="mixed-summary-note">
          First-try accuracy counts moves played correctly without a hint or an earlier mistake.
        </p>
        <div className="mixed-summary-actions">
          <button type="button" className="button primary" onClick={restart}>
            <Shuffle size={18} aria-hidden="true" /> Practice another mix
          </button>
          <button type="button" className="button secondary" onClick={onExit}>
            Back to puzzles <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mixed-practice training-page">
      <button type="button" className="back-link" onClick={onExit}>
        <ArrowLeft size={17} aria-hidden="true" /> Back to puzzles
      </button>
      <div className="training-heading">
        <div>
          <div className="mixed-kicker">
            <Shuffle size={16} aria-hidden="true" /> MIXED OPENING PRACTICE
          </div>
          <h1>Play from memory.</h1>
          <p>{question.focus.side} to move. Play a move you’ve learned.</p>
        </div>
        <span className="badge mixed-round-count">
          Position {index + 1} of {total}
        </span>
      </div>
      <div
        className="progress-track mixed-round-progress"
        role="progressbar"
        aria-label="Positions solved this round"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={results.length}
      >
        <span style={{ width: `${(results.length / total) * 100}%` }} />
      </div>
      <MixedPracticePosition
        key={question.puzzle.id}
        question={question}
        updateProgress={updateProgress}
        lastPosition={index + 1 === total}
        onAttempt={rememberAttempt}
        onSolved={rememberSolved}
        onNext={() => setIndex((current) => current + 1)}
      />
    </div>
  );
}

interface PositionProps {
  question: MixedPracticeQuestion;
  updateProgress: Dispatch<SetStateAction<ProgressState>>;
  lastPosition: boolean;
  onAttempt: (variationId: string) => void;
  onSolved: (result: SolvedPosition) => void;
  onNext: () => void;
}

interface PositionFeedback {
  kind: 'correct' | 'hint' | 'illegal';
  title: string;
  body: string;
}

function MixedPracticePosition({
  question,
  updateProgress,
  lastPosition,
  onAttempt,
  onSolved,
  onNext,
}: PositionProps) {
  const { puzzle, focus } = question;
  const [fen, setFen] = useState(puzzle.fen);
  const [matchedSource, setMatchedSource] = useState<MixedPuzzleSource | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [feedback, setFeedback] = useState<PositionFeedback | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const solvedLock = useRef(false);
  const nextLock = useRef(false);
  const legalAttempts = useRef(0);
  const assisted = useRef(false);
  const side = focus.side;
  const opponent = side === 'White' ? 'Black' : 'White';
  const hintSquare = useMemo(() => {
    try {
      return new Chess(puzzle.fen).move(focus.move.san, { strict: true }).from;
    } catch {
      return null;
    }
  }, [puzzle.fen, focus.move.san]);

  function showHint() {
    if (solvedLock.current) return;
    assisted.current = true;
    setHintVisible(true);
    setFeedback({ kind: 'hint', title: 'Look for the idea.', body: focus.move.hint });
  }

  function submitMove(from: Square, to: Square) {
    if (solvedLock.current) return;
    const validation = validateMove(puzzle.fen, from, to);
    if (!validation.legal || !validation.san || !validation.fen) {
      setFeedback({
        kind: 'illegal',
        title: 'That move isn’t legal here.',
        body: 'Select a piece and choose one of its highlighted destinations.',
      });
      return;
    }

    const source = resolveMixedPuzzleAnswer(question, validation.san);
    const firstTry = legalAttempts.current === 0 && !assisted.current;
    legalAttempts.current += 1;
    const attemptTime = new Date();

    if (!source) {
      assisted.current = true;
      onAttempt(focus.variationId);
      updateProgress((previous) =>
        recordAttempt(previous, focus.variationId, false, true, attemptTime),
      );
      setHintVisible(true);
      setFeedback({ kind: 'hint', title: 'Try the idea again.', body: focus.move.hint });
      return;
    }

    solvedLock.current = true;
    const wasAssisted = assisted.current;
    onAttempt(source.variationId);
    updateProgress((previous) =>
      recordAttempt(previous, source.variationId, true, wasAssisted, attemptTime),
    );
    setFen(validation.fen);
    setLastMove({ from, to });
    setMatchedSource(source);
    setFeedback({
      kind: 'correct',
      title: 'Well played!',
      body: 'You remembered a move from your learned repertoire.',
    });
    onSolved({ puzzleId: puzzle.id, firstTry });
  }

  function nextPosition() {
    if (!solvedLock.current || nextLock.current) return;
    nextLock.current = true;
    onNext();
  }

  return (
    <div className="training-grid mixed-position-grid">
      <div className="training-board-panel">
        <div className="board-player">
          <span className="player-piece">
            <ChessPiece type="k" color={side === 'White' ? 'b' : 'w'} />
          </span>
          <div>
            <strong>The other side</strong>
            <span>{opponent} pieces</span>
          </div>
        </div>
        <ChessBoard
          fen={fen}
          onMove={submitMove}
          interactive={!matchedSource}
          flipped={side === 'Black'}
          lastMove={lastMove}
          hintSquare={hintVisible && !matchedSource ? hintSquare : null}
        />
        <div className="board-player">
          <span className="player-piece">
            <ChessPiece type="k" color={side === 'White' ? 'w' : 'b'} />
          </span>
          <div>
            <strong>You</strong>
            <span>{side} pieces</span>
          </div>
          <span className="player-tag">{matchedSource ? 'Well played' : 'Your move'}</span>
        </div>
        <div className="board-help">
          <span>{matchedSource ? 'Position solved' : `${side} to move`}</span>
          <span>Tap a piece → tap a square</span>
        </div>
        {feedback && (
          <div
            className={`board-feedback ${feedback.kind === 'correct' ? 'correct' : 'hint'}`}
            role="status"
            aria-live="polite"
          >
            {feedback.kind === 'correct' ? (
              <CheckCircle2 size={20} aria-hidden="true" />
            ) : (
              <Lightbulb size={20} aria-hidden="true" />
            )}
            <div>
              <strong>{feedback.title}</strong>
              <p>{feedback.body}</p>
            </div>
          </div>
        )}
      </div>
      <section className="lesson-panel mixed-lesson-panel" aria-labelledby="mixed-position-title">
        <div className="lesson-kicker">
          <Target size={17} aria-hidden="true" />{' '}
          {matchedSource ? 'THE IDEA YOU REMEMBERED' : 'READ THE POSITION'}
        </div>
        <h2 id="mixed-position-title">
          {matchedSource ? matchedSource.move.title : `${side} to move. What would you play?`}
        </h2>
        {matchedSource ? (
          <>
            <div className="mixed-source" aria-label="Opening revealed">
              <span>{matchedSource.openingName}</span>
              <strong>{matchedSource.variationName}</strong>
            </div>
            <span className="move-badge">{matchedSource.move.san}</span>
            <p>{matchedSource.move.explanation}</p>
            <button
              type="button"
              className={`why-button ${whyOpen ? 'open' : ''}`}
              aria-expanded={whyOpen}
              aria-controls="mixed-move-why"
              onClick={() => setWhyOpen((open) => !open)}
            >
              <Lightbulb size={18} aria-hidden="true" /> Why this move?{' '}
              <ChevronDown size={17} aria-hidden="true" />
            </button>
            {whyOpen && (
              <div className="why-explanation" id="mixed-move-why">
                <span>THE IDEA BEHIND THE MOVE</span>
                <p>{matchedSource.move.why}</p>
              </div>
            )}
            <button type="button" className="button primary" onClick={nextPosition}>
              {lastPosition ? 'Finish round' : 'Next position'}{' '}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <p>
              Look for a move you’ve learned. Think about what it develops, protects, or prepares.
            </p>
            <div className="mixed-position-note">
              <Shuffle size={20} aria-hidden="true" />
              <span>The opening is revealed after you play a move from your repertoire.</span>
            </div>
            <button type="button" className="button secondary hint-button" onClick={showHint}>
              <Lightbulb size={18} aria-hidden="true" />{' '}
              {hintVisible ? 'Read the hint again' : 'Show a hint'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
