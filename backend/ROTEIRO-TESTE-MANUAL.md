# Roteiro de teste manual (Backend)

Baseado no teu `.env`:
- **PORT**: `4500`
- **Base URL**: `http://localhost:4500/api`

> Requisitos: `jq` instalado e o backend rodando (`pnpm dev`).

## Variáveis

```bash
BASE="http://localhost:4500/api"
EMAIL="teste+$(date +%s)@exemplo.com"
DOC="00000000000"
PASS="SenhaForte123!"
```

## 1) Health

```bash
curl -s "$BASE/health" | jq .
```

## 2) Sign-up

```bash
curl -s -X POST "$BASE/sign-up" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Teste\",\"email\":\"$EMAIL\",\"document\":\"$DOC\",\"password\":\"$PASS\",\"passwordConfirmation\":\"$PASS\"}" | jq .
```

## 3) Confirmar e-mail (se aplicável)

Se você estiver enviando e-mail de verdade, use o `code` recebido. Se não, pegue o código pelo Prisma Studio:

```bash
pnpm prisma:studio
```

Depois:

```bash
CODE="COLOQUE_O_CODIGO_AQUI"

curl -s -X POST "$BASE/confirm-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}" | jq .
```

## 4) Sign-in (pegar JWT)

```bash
TOKEN=$(curl -s -X POST "$BASE/sign-in" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | jq -r '.token')

echo "$TOKEN"
```

## 5) `GET /me`

```bash
curl -s "$BASE/me" -H "Authorization: Bearer $TOKEN" | jq .
```

## 6) `GET /agents/me` (perfil criado automaticamente no sign-up)

```bash
AGENT=$(curl -s "$BASE/agents/me" -H "Authorization: Bearer $TOKEN" | jq .)
echo "$AGENT" | jq .
AGENT_ID=$(echo "$AGENT" | jq -r '.id')
```

## 7) `PATCH /agents/me`

```bash
curl -s -X PATCH "$BASE/agents/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Agente","publicLocation":true,"shortDescription":"Bio curta","longDescription":"Bio longa"}' | jq .
```

## 8) Criar Space

```bash
SPACE=$(curl -s -X POST "$BASE/spaces" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Espaço","isPublic":true,"shortDescription":"Desc curta","longDescription":"Desc longa"}' | jq .)

echo "$SPACE" | jq .
SPACE_ID=$(echo "$SPACE" | jq -r '.id')
```

## 9) Criar Project

```bash
PROJECT=$(curl -s -X POST "$BASE/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Projeto","shortDescription":"Projeto curto","longDescription":"Projeto longo"}' | jq .)

echo "$PROJECT" | jq .
PROJECT_ID=$(echo "$PROJECT" | jq -r '.id')
```

## 10) Criar Event (com `projectId`)

```bash
EVENT=$(curl -s -X POST "$BASE/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Meu Evento\",\"shortDescription\":\"Resumo\",\"longDescription\":\"Detalhes\",\"rules\":null,\"projectId\":\"$PROJECT_ID\"}" | jq .)

echo "$EVENT" | jq .
EVENT_ID=$(echo "$EVENT" | jq -r '.id')
```

## 11) Criar Occurrence do Evento (vincula Event + Space)

```bash
OCC=$(curl -s -X POST "$BASE/events/$EVENT_ID/occurrences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"spaceId\":\"$SPACE_ID\",\"rule\":\"R1\",\"timezoneName\":\"Etc/UTC\"}" | jq .)

echo "$OCC" | jq .
```

## 12) Criar Opportunity (apontando para `Event` ou `Project`)

Exemplo apontando para `Event`:

```bash
OPP=$(curl -s -X POST "$BASE/opportunities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Edital 1\",\"shortDescription\":\"Chamada\",\"registrationFrom\":\"2026-01-01T00:00:00.000Z\",\"registrationTo\":\"2026-12-31T00:00:00.000Z\",\"objectType\":\"Event\",\"objectId\":\"$EVENT_ID\"}" | jq .)

echo "$OPP" | jq .
OPP_ID=$(echo "$OPP" | jq -r '.id')
```

## 13) Criar Registration na Opportunity

```bash
REG=$(curl -s -X POST "$BASE/opportunities/$OPP_ID/registrations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":null,"proponentType":"PF","range":"A"}' | jq .)

echo "$REG" | jq .
```

## Troubleshooting rápido

- **401**: token inválido/ausente (`Authorization: Bearer ...`).
- **404 em `/agents/me`**: perfil não criado no sign-up (verifique `users`, `usr`, `agent` no Prisma Studio).

