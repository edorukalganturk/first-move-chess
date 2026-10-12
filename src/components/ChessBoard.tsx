import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import type { PieceSymbol, Square } from 'chess.js';
import { ChessPiece } from './ChessPiece';

export interface ChessBoardProps {
  fen: string;
  onMove?: (from: Square, to: Square) => void;
  interactive?: boolean;
  lastMove?: { from: Square; to: Square } | null;
  hintSquare?: Square | null;
  flipped?: boolean;
  compact?: boolean;
}

const pieceNames: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export function ChessBoard({
  fen,
  onMove,
  interactive = false,
  lastMove = null,
  hintSquare = null,
  flipped = false,
  compact = false,
}: ChessBoardProps) {
  const chess = useMemo(() => new Chess(fen), [fen]);
  const [selected, setSelected] = useState<Square | null>(null);
  const files = flipped ? 'hgfedcba' : 'abcdefgh';
  const ranks = flipped ? '12345678' : '87654321';
  const legalMoves = useMemo(
    () => (selected ? chess.moves({ square: selected, verbose: true }) : []),
    [chess, selected],
  );
  const destinations = new Set(legalMoves.map((move) => move.to));

  useEffect(() => {
    setSelected(null);
  }, [fen, interactive, flipped]);

  function selectSquare(square: Square) {
    if (!interactive) return;
    const piece = chess.get(square);
    if (square === selected) {
      setSelected(null);
      return;
    }
    if (piece?.color === chess.turn()) {
      setSelected(square);
      return;
    }
    if (selected) {
      // Report attempted moves too: the lesson can respond with a helpful hint.
      onMove?.(selected, square);
      if (destinations.has(square)) setSelected(null);
    }
  }

  return (
    <div className={`board-wrap${compact ? ' compact' : ''}`}>
      <div
        className="chessboard"
        aria-label={`Chessboard. ${chess.turn() === 'w' ? 'White' : 'Black'} to move.`}
      >
        {[...ranks].flatMap((rank, row) =>
          [...files].map((file, column) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);
            const isLegal = destinations.has(square);
            const squareColor =
              (file.charCodeAt(0) - 97 + Number(rank)) % 2 === 0 ? 'light' : 'dark';
            const description = piece
              ? `${piece.color === 'w' ? 'white' : 'black'} ${pieceNames[piece.type]}`
              : 'empty';
            const className = [
              'square',
              squareColor,
              selected === square && 'selected',
              (lastMove?.from === square || lastMove?.to === square) && 'last-move',
              hintSquare === square && 'hinted',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={square}
                type="button"
                className={className}
                data-square={square}
                aria-label={`${square} ${description}`}
                aria-pressed={selected === square}
                disabled={!interactive}
                onClick={() => selectSquare(square)}
              >
                {!compact && column === 0 && (
                  <span className="coordinate rank" aria-hidden="true">
                    {rank}
                  </span>
                )}
                {!compact && row === 7 && (
                  <span className="coordinate file" aria-hidden="true">
                    {file}
                  </span>
                )}
                {piece && <ChessPiece type={piece.type} color={piece.color} />}
                {isLegal && (
                  <span className={piece ? 'legal-capture' : 'legal-dot'} aria-hidden="true" />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
