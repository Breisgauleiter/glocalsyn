# OAuth2 GitHub Spec (Draft)

Status: Draft (Sprint 03) – Implements Task 6 of Sprint 03 roadmap. Scope limited to Authorization Code Flow (no webhooks yet).

## Goals
- Securely link a Syntopia account with a GitHub user.
- Minimal scopes (read public repos + issues) initially; expand via incremental consent later.
- Store tokens server-side only (never expose PATs or access tokens to the PWA bundle).
- PKCE-ready design (optional for initial implementation, required if moving to pure frontend initiation later).

## Non-Goals (This Draft)
- Webhook handling (scheduled Sprint 05 migration; polling only in v1).
- Fine-grained token rotation / refresh (document stubs only).
- Enterprise GitHub / GHE differences.

## Flow Overview
1. Client requests `/auth/github/start` → server creates short-lived `auth_session` with:
   - `state` (CSRF protection, random 128-bit base32)
   - optional `code_verifier` (PKCE) if configured
   - user session id linkage
2. Server redirects to `https://github.com/login/oauth/authorize?client_id=...&state=...&scope=...&redirect_uri=...&code_challenge=...`.
3. User authorizes; GitHub redirects back to `/auth/github/callback?code=...&state=...`.
4. Server validates `state`, exchanges `code` for access token via `POST https://github.com/login/oauth/access_token`.
5. Server persists token (encrypted at rest) associated with user record + minimal metadata (scopes, createdAt, expiresAt? if refresh used).
6. Client polls `/me` or dedicated endpoint `/auth/github/status` to see `githubLinked=true` & allowed repos.
7. Later sync job (polling) uses stored token to fetch issues for selected repos.

## Endpoints
### POST /auth/github/start
Request: `{ "redirectUriOverride?": string }`
Response: `302` Redirect to GitHub authorize URL.
Headers: `Set-Cookie: gh_oauth_state=...; HttpOnly; Secure; SameSite=Lax`
Side Effects: Creates temporary record in `oauth_states` collection (`state`, `userId`, `createdAt`, `codeVerifier?`). TTL 10 minutes.

Validation:
- Reject if user already linked (return 409 unless `forceRelink=true`).
- Enforce rate limit (5/min per user) to mitigate spam.

### GET /auth/github/callback
Query: `code`, `state`
Actions:
- Validate `state` cookie & DB record.
- Exchange code:
  ```http
  POST https://github.com/login/oauth/access_token
  Accept: application/json
  Body: { client_id, client_secret, code, redirect_uri, state, code_verifier? }
  ```
- Store encrypted token: fields `{ id, userId, provider: 'github', accessTokenEnc, scopes, createdAt }`.
- Mark profile `githubLinked=true`.
- Redirect to client (configured `APP_ORIGIN` + `/me?linked=1`).

Errors → redirect with query `?error=code` (log internally).

### POST /auth/github/unlink
Body: none
Action: Delete stored token record (soft delete with `revokedAt`) & mark profile `githubLinked=false`.
Security: Requires active session; log audit event.

## Data Model (ArangoDB)
Collection: `oauth_tokens`
```
{
  _key: string,                // token id
  userId: string,              // reference to profile/user doc key
  provider: 'github',
  accessTokenEnc: string,      // AES-GCM encrypted token blob
  scopes: string[],
  createdAt: number,
  revokedAt?: number,
  lastUsedAt?: number,
  rateLimitRemaining?: number,
  rateLimitReset?: number
}
```
Collection: `oauth_states` (TTL index `createdAt + 600s`)
```
{ _key: state, userId: string, createdAt: number, codeVerifier?: string }
```

## Security Considerations
- CSRF: `state` cookie + DB record binding to user.
- PKCE: Optional `S256` if public client flow needed; can be toggled via env `OAUTH_GITHUB_USE_PKCE=1`.
- Token Storage: AES-GCM (random 96-bit IV per encrypt); key from KMS or env (rotate plan documented separately).
- Least Scope: Start with `read:user repo:status`? Actually for public issues listing only `public_repo` not required—use no scope or `read:user` minimal. Evaluate `repo` necessity when private repos become relevant.
- Logging: Never log raw tokens; log last 6 chars hashed with salt for debugging.
- Rate Limits: Persist `X-RateLimit-Remaining` & `X-RateLimit-Reset` on each GitHub API call for adaptive backoff.

## Environment Variables
```
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APP_ORIGIN=https://local.syntopia.app:5173
OAUTH_GITHUB_USE_PKCE=0
TOKEN_ENC_KEY=base64:aes256key...
```

## Pseudo Code (Start)
```ts
app.post('/auth/github/start', async (req, reply) => {
  const user = requireSession(req);
  if (user.githubLinked) return reply.code(409).send({ error: 'already_linked' });
  const state = randomBase32(24);
  const codeVerifier = usePkce ? randomUrlSafe(64) : undefined;
  await oauthStates.insert({ _key: state, userId: user.id, createdAt: Date.now(), codeVerifier });
  setStateCookie(reply, state);
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    state,
    redirect_uri: callbackUrl,
    scope: useScopes.join(' '),
    ...(codeVerifier ? { code_challenge_method: 'S256', code_challenge: sha256B64Url(codeVerifier) } : {})
  });
  reply.redirect(`https://github.com/login/oauth/authorize?${params}`);
});
```

## Token Exchange Example
```ts
async function exchange(code: string, state: string, codeVerifier?: string) {
  const body = { client_id: ID, client_secret: SECRET, code, state, redirect_uri: CALLBACK };
  if (codeVerifier) Object.assign(body, { code_verifier: codeVerifier });
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST', headers: { Accept: 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('oauth_exchange_failed');
  const json = await res.json();
  return json.access_token;
}
```

## Auditing & Telemetry
Events:
- `oauth.github.start` (userId, statePrefix)
- `oauth.github.linked` (userId, scopes, latencyMs)
- `oauth.github.unlink` (userId)
- `oauth.github.exchange_error` (userId?, reason)

## Open Questions
- Do we need refresh tokens? (GitHub classic tokens do not expire; GH App flow could supersede later.)
- Move to GitHub App installation for finer-grained repo access? (future RFC)

## Acceptance Criteria (Sprint 04 Implementation)
- Start + Callback endpoints operational with minimal scopes
- Tokens stored encrypted
- Unlink path removes token & flips profile flag
- Telemetry events emitted (logged)
- Docs updated (GETTING_STARTED)

---

Changelog: Initial draft created 13.08.2025.
