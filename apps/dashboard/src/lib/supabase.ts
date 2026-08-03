import {
  getUser,
  login,
  logout,
  onAuthChange,
  signup,
  type User,
} from '@netlify/identity';

type DynamicData = ReturnType<typeof JSON.parse>;
type ApiResult<T = DynamicData> = { data: T; error: Error | null; count: number | null };
type Filter = { column: string; operator: string; value: unknown };

class RestQuery<T = DynamicData> implements PromiseLike<ApiResult<T>> {
  private request: Record<string, unknown>;

  constructor(table: string) {
    this.request = { table, operation: 'select', filters: [], order: [] };
  }

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    Object.assign(this.request, { select: columns, ...options });
    return this;
  }
  insert(values: unknown) { Object.assign(this.request, { operation: 'insert', values }); return this; }
  update(values: unknown) { Object.assign(this.request, { operation: 'update', values }); return this; }
  upsert(values: unknown, options?: { onConflict?: string; ignoreDuplicates?: boolean }) { Object.assign(this.request, { operation: 'upsert', values, ...options }); return this; }
  delete() { this.request.operation = 'delete'; return this; }
  eq(column: string, value: unknown) { return this.filter(column, 'eq', value); }
  neq(column: string, value: unknown) { return this.filter(column, 'neq', value); }
  gte(column: string, value: unknown) { return this.filter(column, 'gte', value); }
  lte(column: string, value: unknown) { return this.filter(column, 'lte', value); }
  in(column: string, value: unknown[]) { return this.filter(column, 'in', value); }
  is(column: string, value: unknown) { return this.filter(column, 'is', value); }
  or(value: string, options?: { foreignTable?: string }) {
    this.request.or = value;
    if (options?.foreignTable) this.request.orForeignTable = options.foreignTable;
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    (this.request.order as unknown[]).push({ column, ascending: options?.ascending ?? true });
    return this;
  }
  range(from: number, to: number) { this.request.range = [from, to]; return this; }
  limit(value: number) { this.request.limit = value; return this; }
  single() { this.request.single = true; return this; }
  maybeSingle() { this.request.maybeSingle = true; return this; }

  private filter(column: string, operator: string, value: unknown) {
    (this.request.filters as Filter[]).push({ column, operator, value });
    return this;
  }

  async execute(): Promise<ApiResult<T>> {
    const response = await fetch('/api/data', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.request),
    });
    const payload = await response.json();
    if (!response.ok) return { data: null as T, error: new Error(payload.error || 'Request failed'), count: null };
    return payload as ApiResult<T>;
  }

  then<TResult1 = ApiResult<T>, TResult2 = never>(
    onfulfilled?: ((value: ApiResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const sessionFor = (user: User | null) => user ? { user, access_token: '' } : null;

export const supabase = {
  from<T = DynamicData>(table: string) { return new RestQuery<T>(table); },
  rpc: async (name: string, args: Record<string, unknown>) => {
    const response = await fetch(`/api/rpc/${name}`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args),
    });
    const payload = await response.json();
    return response.ok ? { data: payload.data, error: null } : { data: null, error: new Error(payload.error) };
  },
  functions: {
    invoke: async (name: string, options?: { body?: unknown }) => {
      const response = await fetch(`/api/${name}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(options?.body ?? {}),
      });
      const payload = await response.json();
      return response.ok ? { data: payload, error: null } : { data: null, error: new Error(payload.error || 'Function failed') };
    },
  },
  auth: {
    getUser: async () => { const user = await getUser(); return { data: { user }, error: null }; },
    getSession: async () => { const user = await getUser(); return { data: { session: sessionFor(user) }, error: null }; },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try { const user = await login(email, password); return { data: { user, session: sessionFor(user) }, error: null }; }
      catch (error) { return { data: { user: null, session: null }, error: error as Error }; }
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      try { const user = await signup(email, password); return { data: { user, session: sessionFor(user) }, error: null }; }
      catch (error) { return { data: { user: null, session: null }, error: error as Error }; }
    },
    signOut: async () => { await logout(); return { error: null }; },
    onAuthStateChange: (callback: (event: string, session: ReturnType<typeof sessionFor>) => void) => {
      const unsubscribe = onAuthChange((event, user) => callback(event, sessionFor(user)));
      return { data: { subscription: { unsubscribe } } };
    },
  },
};

export type AuthUser = User;
