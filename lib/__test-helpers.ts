import { vi } from "vitest";

export type StubResult = { data: unknown; error: { message: string } | null };

export function buildStubClient(results: Record<string, StubResult | StubResult[]>) {
  const calls: Record<string, unknown[][]> = {};
  const take = (key: string): StubResult => {
    const r = results[key];
    if (!r) return { data: null, error: null };
    return Array.isArray(r) ? (r.shift() as StubResult) ?? { data: null, error: null } : r;
  };
  const chain = (table: string) => {
    const c: Record<string, unknown> = {};
    for (const m of ["select", "insert", "update", "upsert", "delete", "eq", "neq", "order", "limit", "single", "maybeSingle"]) {
      c[m] = vi.fn((...args: unknown[]) => {
        (calls[`${table}.${m}`] ??= []).push(args);
        return c;
      });
    }
    (c as { then: (resolve: (r: StubResult) => void) => void }).then = (resolve) =>
      resolve(take(table));
    return c;
  };
  return {
    calls,
    from: vi.fn((table: string) => chain(table)),
    rpc: vi.fn(async (fn: string, args?: unknown) => {
      (calls[`rpc.${fn}`] ??= []).push([args]);
      return take(`rpc.${fn}`);
    }),
  };
}
