import type { Color, PieceSymbol } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
}

/** Small, original Staunton silhouettes, with a shared bevel and base. */
export function ChessPiece({ type, color }: ChessPieceProps) {
  const fill = color === 'w' ? '#fffaf0' : '#223833';
  const stroke = color === 'w' ? '#34423b' : '#10241e';
  const detail = color === 'w' ? '#857c68' : '#769087';
  const base = (
    <>
      <path d="M19 48h26l4 7H15l4-7Z" />
      <path d="M15 55h34v4H15z" />
      <path d="M20 51h24" fill="none" stroke={detail} strokeWidth="1.2" />
    </>
  );

  return (
    <svg
      className="chess-piece"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g fill={fill} stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        {type === 'p' && (
          <>
            <circle cx="32" cy="18" r="7.5" />
            <path d="M25 27h14l-2 5c-1 6 1 10 5 15H22c4-5 6-9 5-15l-2-5Z" />
            <path d="M24 27h16v4H24z" />
          </>
        )}
        {type === 'r' && (
          <>
            <path d="M18 10h7v7h5v-7h5v7h5v-7h7v15l-6 5H24l-6-5V10Z" />
            <path d="M25 30h15l-1 12 5 6H21l5-6-1-12Z" />
            <path d="M22 25h21M26 42h13" fill="none" stroke={detail} strokeWidth="1.3" />
          </>
        )}
        {type === 'n' && (
          <>
            <path d="M20 48c1-9 5-14 11-20l-10 4-7-4 3-8 10-8 3-7 4 5 7 2c8 7 8 21 4 36H20Z" />
            <path
              d="m17 23 7 2 9-8M31 28c7-4 9-5 8-10M25 42c5-8 10-8 11-13"
              fill="none"
              stroke={detail}
              strokeWidth="1.5"
            />
            <circle cx="27" cy="18" r="1.4" fill={stroke} stroke="none" />
            <path d="m16 27 4-1" fill="none" />
          </>
        )}
        {type === 'b' && (
          <>
            <circle cx="32" cy="7" r="2.5" />
            <path d="M32 11c-4 4-12 9-12 16 0 6 5 9 12 9s12-3 12-9c0-7-8-12-12-16Z" />
            <path d="m35 17-7 12" fill="none" stroke={stroke} strokeWidth="2.6" />
            <path d="M26 36h12l-1 6 6 6H21l6-6-1-6Z" />
            <path d="M23 34h18v4H23z" />
            <path d="M26 44h12" fill="none" stroke={detail} strokeWidth="1.3" />
          </>
        )}
        {type === 'q' && (
          <>
            <path d="m17 16 6 17h18l6-17-10 10-5-15-5 15-10-10Z" />
            <circle cx="17" cy="13" r="3" />
            <circle cx="32" cy="8" r="3" />
            <circle cx="47" cy="13" r="3" />
            <path d="M24 33h16l-2 10 6 5H20l6-5-2-10Z" />
            <path d="M22 33h20v4H22z" />
            <path d="M27 43h10" fill="none" stroke={detail} strokeWidth="1.3" />
          </>
        )}
        {type === 'k' && (
          <>
            <path d="M30 4h4v5h5v4h-5v7h-4v-7h-5V9h5V4Z" />
            <path d="M32 23c-8-12-18-3-14 7l6 8h16l6-8c4-10-6-19-14-7Z" />
            <path d="M25 38h14l-1 5 6 5H20l6-5-1-5Z" />
            <path d="M22 35h20v4H22z" />
            <path d="M32 23v10M26 44h12" fill="none" stroke={detail} strokeWidth="1.3" />
          </>
        )}
        {base}
      </g>
    </svg>
  );
}
