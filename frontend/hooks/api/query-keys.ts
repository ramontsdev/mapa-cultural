export const queryKeys = {
  me: ["me"] as const,
  agents: {
    all: ["agents"] as const,
    list: (params: { q?: string; page?: number; pageSize?: number } = {}) =>
      ["agents", "list", params] as const,
    me: ["agents", "me"] as const,
    detail: (id: string) => ["agents", "detail", id] as const,
  },
  spaces: {
    all: ["spaces"] as const,
    list: (params: { q?: string; page?: number; pageSize?: number } = {}) =>
      ["spaces", "list", params] as const,
    me: (params: { page?: number; pageSize?: number } = {}) =>
      ["spaces", "me", params] as const,
    detail: (id: string) => ["spaces", "detail", id] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (params: { q?: string; page?: number; pageSize?: number } = {}) =>
      ["projects", "list", params] as const,
    me: (params: { page?: number; pageSize?: number } = {}) =>
      ["projects", "me", params] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },
  events: {
    all: ["events"] as const,
    list: (params: { q?: string; page?: number; pageSize?: number } = {}) =>
      ["events", "list", params] as const,
    me: (params: { page?: number; pageSize?: number } = {}) =>
      ["events", "me", params] as const,
    detail: (id: string) => ["events", "detail", id] as const,
  },
  opportunities: {
    all: ["opportunities"] as const,
    list: (params: { q?: string; page?: number; pageSize?: number } = {}) =>
      ["opportunities", "list", params] as const,
    me: (params: { page?: number; pageSize?: number } = {}) =>
      ["opportunities", "me", params] as const,
    detail: (id: string) => ["opportunities", "detail", id] as const,
  },
  registrations: {
    me: (params: { page?: number; pageSize?: number } = {}) =>
      ["registrations", "me", params] as const,
  },
} as const;
