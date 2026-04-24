# Mapa Cultural — Frontend

Aplicação Next.js (App Router + React 19) que consome as APIs REST do backend Express/Prisma em `backend/`.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS
- `@tanstack/react-query` para cache/busca
- `react-hook-form` + `zod`
- `sonner` para toasts
- `leaflet` / `react-leaflet` para mapas

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Backend rodando em `backend/` (veja [backend/README](../backend/README.md))
- Banco PostgreSQL/PostGIS com as migrations aplicadas

## Configuração

1. Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

2. Ajuste `NEXT_PUBLIC_API_URL` se o backend estiver em outra porta. Por padrão:

```
NEXT_PUBLIC_API_URL=http://localhost:4500/api
```

## Rodar em desenvolvimento

No diretório raiz do repositório, suba backend e banco primeiro. Em seguida, no diretório `frontend/`:

```bash
pnpm install
pnpm dev
```

A aplicação sobe em `http://localhost:3000`.

## Execução combinada (backend + frontend)

Em terminais separados:

```bash
cd backend && pnpm dev
cd frontend && pnpm dev
```

O backend pode ser levantado de ponta a ponta com o smoke test documentado em `docs/` usando `pnpm hard-test` na raiz do monorepo.

## Arquitetura

- `lib/api/`: cliente HTTP (`http.ts`), módulos por recurso (`agents`, `spaces`, `projects`, `events`, `opportunities`, `registrations`, `auth`) e `types.ts` com mapeadores `DTO → tipos de UI`.
- `hooks/api/`: hooks de React Query (`useAgentMe`, `useSpaces`, `useMyEvents`, etc.) com `query-keys` padronizadas.
- `components/providers/query-provider.tsx`: `QueryClientProvider`.
- `components/auth-provider.tsx`: integra `POST /api/sign-in`, `POST /api/sign-up`, persistência de `accessToken` e `GET /api/agents/me`.
- `components/api/QueryState.tsx`: componente genérico para estados de loading/empty/error.
- `app/`: rotas do App Router (home, `eventos`, `lugares`, `projetos`, `oportunidades`, `usuarios`, `cadastro`).

### Autenticação

- JWT Bearer em cookie/`localStorage` (`mc_token`), injetado automaticamente pelo `apiFetch`.
- Em `401`, o cliente HTTP dispara logout e redireciona para `/cadastro`.
- Fluxos suportados: sign-up → confirmar e-mail (`/cadastro/confirmar-email`) → sign-in → esqueci/redefinir senha (`/login/esqueci-senha`, `/login/redefinir-senha`).

### Recursos

Todos os recursos abaixo usam os endpoints REST do backend (listagem pública, `/me`, CRUD):

- **Agentes** — `GET /api/agents`, `GET /api/agents/me`, `GET /api/agents/:id`, `PATCH /api/agents/me`.
- **Espaços** — `GET/POST/PATCH/DELETE /api/spaces`, `GET /api/spaces/me`.
- **Projetos** — `GET/POST/PATCH/DELETE /api/projects`, `GET /api/projects/me`.
- **Eventos** — `GET/POST/PATCH/DELETE /api/events`, `GET /api/events/me`, `POST /api/events/:id/occurrences`.
- **Oportunidades** — `GET/POST/DELETE /api/opportunities`, `GET /api/opportunities/me` (sem `PATCH`; a UI só permite visualizar/excluir).
- **Inscrições** — `POST /api/registrations`, `GET /api/registrations/me`.

As listagens retornam no formato `{ items, total, page, pageSize }` e aceitam `q`, `page`, `pageSize`.

### Metadata em `shortDescription`

Campos ricos da UI (endereço, redes sociais, áreas, classificação, tags) são serializados no campo `shortDescription` com o formato `[chave]: valor` e lidos via utilitários `formatMetadata` / `parseShortDescription` em `lib/api/`.

## Scripts

- `pnpm dev` — desenvolvimento
- `pnpm build` — build de produção
- `pnpm start` — servir build
- `pnpm lint` — ESLint

## Fora de escopo atual

- Upload de imagens/anexos.
- PostGIS real (geolocalização armazenada como `TEXT`).
- Campos ricos ainda não expostos pelo backend (`areasAtuacao`, `biografia`, redes sociais) — vivem apenas na UI e no `shortDescription` do Mapas.
- Paginação infinita e i18n das mensagens de erro.
