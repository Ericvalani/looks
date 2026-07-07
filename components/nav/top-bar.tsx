export function TopBar({ displayName }: { displayName: string }) {
  return (
    <header className="flex items-center gap-2 px-5 py-4">
      <span className="text-sm font-medium tracking-widest text-muted">LOOKS</span>
      <span className="text-xs text-muted/70">· {displayName}</span>
    </header>
  );
}
