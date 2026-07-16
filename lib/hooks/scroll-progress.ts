export function clampScrollProgress(scrollY: number, maxScroll: number): number {
  const max = Math.max(1, maxScroll);
  return Math.min(1, Math.max(0, scrollY / max));
}
