export function LoadingShell() {
  return (
    <div
      className="min-h-dvh bg-background px-4 pt-6 text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Buku kas
      </p>
      <h1 className="font-display text-3xl font-medium tracking-tight">Keluar</h1>
      <p className="mt-8 text-sm text-muted-foreground">Membuka catatan di perangkat…</p>
      <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 rounded-full bg-primary motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
