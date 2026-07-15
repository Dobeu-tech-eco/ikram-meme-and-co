// Minimal structural type for the Supabase-shaped client the pure core
// functions and the chainable test stub (lib/__test-helpers.ts) both satisfy.
// Real SupabaseClient<Database> instances are passed with an `as never` /
// `as unknown as Db` cast at the call sites (server actions, catalog pages);
// keeping this loose lets the core logic stay unit-testable without a live DB.

export type DbResult = { data: unknown; error: { message: string } | null };

export type QueryBuilder = PromiseLike<DbResult> & {
  select: (...args: unknown[]) => QueryBuilder;
  insert: (...args: unknown[]) => QueryBuilder;
  update: (...args: unknown[]) => QueryBuilder;
  upsert: (...args: unknown[]) => QueryBuilder;
  delete: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  neq: (...args: unknown[]) => QueryBuilder;
  order: (...args: unknown[]) => QueryBuilder;
  limit: (...args: unknown[]) => QueryBuilder;
  single: () => QueryBuilder;
  maybeSingle: () => QueryBuilder;
};

export type Db = {
  from: (table: string) => QueryBuilder;
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<DbResult>;
};
