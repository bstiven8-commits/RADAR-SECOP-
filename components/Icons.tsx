export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" opacity=".5" />
      <g className="logo-sweep">
        <path d="M16 16 L16 2 A14 14 0 0 1 28.1 9 Z" fill="var(--signal)" />
      </g>
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

export function Bell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
