import {
  getUser,
  login,
  logout,
  onAuthChange,
  signup,
  type User,
} from '@netlify/identity';

export type ApiError = Error;

export interface ApiResponse<T> {
  data: T;
  error: ApiError | null;
  count: number | null;
}

export interface RpcResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface FunctionResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: ApiError | null;
}

export type DataFilter = {
  column: string;
  operator: 'eq' | 'neq' | 'gte' | 'lte' | 'in' | 'is';
  value: unknown;
};

export type DataOrder = {
  column: string;
  ascending: boolean;
};

export interface DataRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  values?: Record<string, unknown> | Record<string, unknown>[];
  filters?: DataFilter[];
  or?: string;
  orForeignTable?: string;
  select?: string;
  count?: 'exact';
  head?: boolean;
  order?: DataOrder[];
  limit?: number;
  range?: [number, number];
  single?: boolean;
  maybeSingle?: boolean;
  onConflict?: string;
  ignoreDuplicates?: boolean;
}

type DefaultData = unknown;
type ApiPayload<T> = { data: T; error?: string; count?: number | null };
type Session = { user: User; access_token: string };

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
};

class RestQuery<T = DefaultData> implements PromiseLike<ApiResponse<T>> {
  private readonly request: DataRequest;

  constructor(table: string) {
    this.request = { table, operation: 'select', filters: [], order: [] };
  }

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    Object.assign(this.request, { select: columns, ...options });
    return this;
  }

  insert<TValue extends object>(values: TValue | TValue[]) {
    Object.assign(this.request, { operation: 'insert', values: values as DataRequest['values'] });
    return this;
  }

  update<TValue extends object>(values: TValue) {
    Object.assign(this.request, { operation: 'update', values: values as DataRequest['values'] });
    return this;
  }

  upsert<TValue extends object>(values: TValue | TValue[], options?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    Object.assign(this.request, { operation: 'upsert', values: values as DataRequest['values'], ...options });
    return this;
  }

  delete() {
    this.request.operation = 'delete';
    return this;
  }

  eq(column: string, value: unknown) { return this.filter(column, 'eq', value); }
  neq(column: string, value: unknown) { return this.filter(column, 'neq', value); }
  gte(column: string, value: unknown) { return this.filter(column, 'gte', value); }
  lte(column: string, value: unknown) { return this.filter(column, 'lte', value); }
  in(column: string, value: unknown[]) { return this.filter(column, 'in', value); }
  is(column: string, value: unknown) { return this.filter(column, 'is', value); }

  or(value: string, options?: { foreignTable?: string }) {
    this.request.or = value;
    this.request.orForeignTable = options?.foreignTable;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.request.order?.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  range(from: number, to: number) {
    this.request.range = [from, to];
    return this;
  }

  limit(value: number) {
    this.request.limit = value;
    return this;
  }

  single() {
    this.request.single = true;
    return this;
  }

  maybeSingle() {
    this.request.maybeSingle = true;
    return this;
  }

  private filter(column: string, operator: DataFilter['operator'], value: unknown) {
    this.request.filters?.push({ column, operator, value });
    return this;
  }

  async execute(): Promise<ApiResponse<T>> {
    try {
      const payload = await requestJson<ApiPayload<T>>('/api/data', {
        method: 'POST',
        body: JSON.stringify(this.request),
      });

      return {
        data: payload.data,
        error: null,
        count: payload.count ?? null,
      };
    } catch (error) {
      return {
        data: null as T,
        error: error instanceof Error ? error : new Error('Request failed'),
        count: null,
      };
    }
  }

  then<TResult1 = ApiResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: ApiResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const sessionFor = (user: User | null): Session | null => user ? { user, access_token: '' } : null;

export const apiClient = {
  from<T = DefaultData>(table: string) {
    return new RestQuery<T>(table);
  },

  async rpc<T = DefaultData>(name: string, args: Record<string, unknown>): Promise<RpcResponse<T>> {
    try {
      const payload = await requestJson<{ data: T }>(`/api/rpc/${encodeURIComponent(name)}`, {
        method: 'POST',
        body: JSON.stringify(args),
      });
      return { data: payload.data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('RPC request failed') };
    }
  },

  functions: {
    async invoke<T = DefaultData>(name: string, options?: { body?: unknown }): Promise<FunctionResponse<T>> {
      try {
        const data = await requestJson<T>(`/api/${encodeURIComponent(name)}`, {
          method: 'POST',
          body: JSON.stringify(options?.body ?? {}),
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error instanceof Error ? error : new Error('Function request failed') };
      }
    },
  },

  auth: {
    getUser: async () => ({ data: { user: await getUser() }, error: null }),
    getSession: async () => ({ data: { session: sessionFor(await getUser()) }, error: null }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
      try {
        const user = await login(email, password);
        return { data: { user, session: sessionFor(user) }, error: null };
      } catch (error) {
        return {
          data: { user: null, session: null },
          error: error instanceof Error ? error : new Error('Sign in failed'),
        };
      }
    },
    signUp: async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
      try {
        const user = await signup(email, password);
        return { data: { user, session: sessionFor(user) }, error: null };
      } catch (error) {
        return {
          data: { user: null, session: null },
          error: error instanceof Error ? error : new Error('Sign up failed'),
        };
      }
    },
    signOut: async () => {
      await logout();
      return { error: null };
    },
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      const unsubscribe = onAuthChange((event, user) => callback(event, sessionFor(user)));
      return { data: { subscription: { unsubscribe } } };
    },
  },
};

export type AuthUser = User;
