# ISAIYA Search API

Minimal backend for ISAIYA's Search Agent: query intent understanding and
search-as-you-type suggestions. It never decides which YouTube videos are
valid — that stays entirely in the Expo app's existing music relevance
scoring pipeline. This service only tells the app which query strings to
try.

## Endpoints

- `GET /health` — liveness check.
- `POST /api/search-intent` — body `{ query: string, language?: string }`,
  returns a `SearchIntent` (see `src/types.ts`).
- `POST /api/search-suggestions` — body `{ prefix: string, language?: string }`,
  returns `{ suggestions: string[] }`.

## Running locally

```
cd server
npm install
cp .env.example .env
npm run dev
```

Server listens on `http://localhost:4000` by default (`PORT` in `.env`).

Point the Expo app at it by setting `EXPO_PUBLIC_SEARCH_AGENT_URL` in the
app's `.env` to this server's reachable address — e.g. your machine's LAN
IP (`http://192.168.x.x:4000`) so a physical phone running Expo Go can
reach it, the same way it already reaches the Metro bundler during
development.

## Today's implementation: no LLM required

The only active provider is `RuleBasedProvider`
(`src/agent/ruleBasedProvider.ts`) — deterministic artist/song/era matching
against a small curated dataset (`src/agent/musicKnowledge.ts`). It needs no
API key and handles the common South Indian music query shapes (a known
song title, "`<artist>` songs", a bare known-artist name). Anything it
doesn't recognize resolves to `intent: "unknown"` with the original query
passed through unchanged — identical to the app's pre-agent behavior, so an
unrecognized query is never worse off than before this existed.

## Adding a real LLM provider later

1. Implement the `LlmProvider` interface (`src/agent/provider.ts`) in a new
   file, e.g. `src/agent/anthropicProvider.ts`, calling out to your LLM of
   choice. On any failure it should throw — the routes already catch and
   fail safe to a trivial intent, so the provider itself doesn't need its
   own fallback logic.
2. Register it in `getProvider()` in `provider.ts`, selected by the
   `LLM_PROVIDER` env var.
3. Add the real API key to `.env` (never commit it).

The Expo app never talks to the LLM provider directly and never holds an
LLM API key — this backend is the only thing that does, by design.

## Deploying (Render / Railway / Fly.io)

The included `Dockerfile` builds and runs the compiled server. Any of these
platforms can build directly from this `Dockerfile`; none need extra
platform-specific config beyond setting the `PORT` and `LLM_PROVIDER` env
vars (and a real LLM key, once one is wired in). This has not been deployed
as part of this change — that step requires your hosting account.
