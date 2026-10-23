import logo from '../assets/chessmahal-logo-v4.png';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`brand ${compact ? 'brand--compact' : 'brand--stacked'}`}
      role="img"
      aria-label="ChessMahal"
    >
      <svg
        className="brand-artwork"
        viewBox={compact ? '84 292 1085 598' : '50 292 1160 813'}
        width={compact ? 1085 : 1160}
        height={compact ? 598 : 813}
        aria-hidden="true"
        focusable="false"
      >
        <image href={logo} width="1254" height="1254" />
      </svg>
      {compact && (
        <span className="brand-name" aria-hidden="true">
          ChessMahal
        </span>
      )}
    </div>
  );
}
