# GitHub OAuth2 – Authorization Code Flow Specification (Sprint 03 → 04 Transition)

Status: Draft (12 Aug 2025)
Owner: Engineering
Related Roadmap Items: Sprint 03 Deliverable (Preparation), Sprint 04 Sync v1

## 1. Ziel & Kontext
Wir wollen GitHub-Issues ab SCL ≥ 4 als Quests nutzbar machen und später PR-basierte Proofs automatisieren. Dafür brauchen wir eine datensparsame, sichere OAuth2-Anbindung, die:
- Nur minimal notwendige Scopes anfragt
- Tokens server-seitig speichert (nie im Client-Bundle)
- Entkoppelt ist (Adapter-Schicht, austauschbar)
- Replay / CSRF Schutz (state, PKCE optional) gewährleistet

## 2. High-Level Flow
1. Client (angemeldeter User) klickt "GitHub verbinden"
2. Frontend ruft POST /auth/github/start → Server erzeugt state (+ optional PKCE verifier) und speichert ephemeral Record (TTL)
3. Server antwortet mit { authorizeUrl }
4. Browser redirect zu GitHub OAuth authorize
5. User bestätigt → GitHub ruft /auth/github/callback?code=...&state=...
6. Server validiert state, tauscht code gegen access_token (und ggf. refresh_token / expires_in)
7. Token wird im Secure Store persistiert (verschlüsselt, userId, scopes, createdAt, metadata)
8. Server leitet Frontend auf /me?linked=github zurück (302) oder liefert minimalistisches HTML (window.close + postMessage)
9. Frontend aktualisiert Profil-Store (flag githubLinked=true)

## 3. Endpoints
### POST /auth/github/start
Purpose: Beginnt den Flow.
Request: Authenticated session (cookie / bearer) – Body leer.
Response 200:
{
  "authorizeUrl": "https://github.com/login/oauth/authorize?..."
}
Side Effects:
- Generate state (crypto.randomBytes 16B → base64url)
- (Optional) PKCE: code_verifier (43–128 chars), code_challenge = base64url(SHA256(verifier))
- Store ephemeral: { state, userId, createdAt, codeVerifier? } (TTL 10 min)

Errors:
- 401 if unauthenticated
- 429 if too many pending states

### GET /auth/github/callback
Query: code, state
Steps:
1. Lookup ephemeral by state → 400 if missing/expired
2. Exchange POST https://github.com/login/oauth/access_token (Accept: application/json)
3. Validate scopes vs allow-list
4. Persist token
5. Delete ephemeral state
6. Redirect 302 → /integrations/github/success (or /me) OR return JSON for XHR popup variant

Errors:
- 400 invalid_state
- 500 exchange_failed
- 403 scope_mismatch

### DELETE /auth/github/link
Revokes (logical) link.
Steps:
1. Mark token revokedAt
2. (Optional) Call GitHub token revocation endpoint (if using GitHub Apps / fine-grained)
3. Remove repo selections dependent on token

## 4. Scopes Strategy
Phase 1 (Read-Only Issues):
- repo:read (oder public_repo falls privat nicht nötig) – Ziel: Issues & PR Meta lesen
- read:user (Username, Avatar)
Vermeiden: write:* bis wirklich benötigt.

Upgrade Path:
- Additional scopes negotiated via incremental auth (2nd start call with extra scopes) – ensure UX clarity.

## 5. Token Storage
Store Interface (pseudo TypeScript):
```
interface GitHubTokenRecord {
  id: string;         // uuid
  userId: string;
  provider: 'github';
  accessTokenEnc: string;   // encrypted (AES-256-GCM)
  scope: string;      // space or comma separated
  createdAt: number;
  expiresAt?: number; // if provided by GitHub (usually not for classic tokens)
  refreshTokenEnc?: string;
  metadata?: { login?: string; avatarUrl?: string };
  revokedAt?: number;
}
```
Abstraction:
```
interface GitHubOAuthStore {
  putPending(state: string, userId: string, codeVerifier?: string): Promise<void>;
  getPending(state: string): Promise<{ userId: string; codeVerifier?: string } | null>;
  deletePending(state: string): Promise<void>;
  saveToken(rec: GitHubTokenRecord): Promise<void>;
  findActiveToken(userId: string): Promise<GitHubTokenRecord | null>;
  revoke(userId: string): Promise<void>;
}
```
Initial Implementation: In-Memory Map (Dev) + JSON file or lightweight KV (Prod placeholder). No DB lock-in.

Encryption: Node crypto; key from env (GITHUB_OAUTH_KMS_KEY) 32B; rotate via versioned prefix (keyId:payload). GCM tag base64url appended.

## 6. Security Considerations
- CSRF: state (unguessable), optionally PKCE (defense in depth)
- Rate-Limit: Throttle POST /auth/github/start per user (e.g. 5/min burst 2)
- Logging: Never log raw tokens; use token id
- Revocation: Provide DELETE endpoint; periodic sweeper for revoked/purged
- Scope Drift: On callback validate granted scope ⊆ requested
- Replay: Single-use state, delete after success/failure

## 7. Error Model (JSON Shape)
```
{ "error": { "code": "invalid_state", "message": "State expired" } }
```
Codes: invalid_state, exchange_failed, scope_mismatch, unauthorized, rate_limited.

## 8. Frontend Integration
Feature Flag: VITE_ENABLE_GITHUB_OAUTH (default off)
Flow:
- Button "GitHub verbinden" → mutation start → window.location = authorizeUrl
- After redirect back: parse linked=github query OR listen to success route; dispatch profileStore.update({ githubLinked: true })
- Unlink: call DELETE /auth/github/link → update store

State Persistence: For popup variant use postMessage('github:linked') → parent updates UI.

## 9. Telemetry & Audit
Events:
- oauth.github.start
- oauth.github.callback.success
- oauth.github.callback.error (code)
Audit Log Record:
{ userId, action: 'github_linked' | 'github_unlinked', at, scopes }

## 10. Future Extensions
- Fine-grained GitHub App for reduced scopes & webhook integration
- Refresh tokens (if App) instead of long-lived classic tokens
- Webhook signature verification storing delivery ids for replay defense
- Multi-account linking (array of providerLinks)

## 11. Open Questions
- Nutzen wir direkt GitHub App (besser für Webhooks) vs. Classic OAuth App? (Vorschlag: Start mit Classic wegen geringerer Setup-Zeit, Übergang geplant Sprint 05)
- Persistenzlösung: Reicht vorerst JSON-Datei + lock, oder direkt lightweight embedded DB?
- PKCE nötig? (Browser-based flows → ja, low cost)

## 12. Akzeptanzkriterien (PR 2)
- Spec Markdown existiert (dieses Dokument)
- ROADMAP Sprint 03 Deliverable aktualisiert: Markierung "OAuth2 Spezifikation" DELIVERED (Preparation)
- Keine Implementierung des Flows selbst (nur Design)
- Keine geheimnisverratenden Tokens / Dummy Beispiele
- Linter/CI passiert

## 13. Nicht-Ziele
- Noch keine Webhook-Verarbeitung
- Kein automatisches PR→Issue Mapping (nur Spezifikation Vorbereitung)
- Keine UI für Repo-Liste Refresh (nur Link/Unlink Button vorerst)

## 14. Appendix – Authorize URL Beispiel (Illustrativ)
```
https://github.com/login/oauth/authorize?client_id=XXXX&redirect_uri=https%3A%2F%2Fapp.example%2Fauth%2Fgithub%2Fcallback&state=BASE64URL&scope=read%3Auser+public_repo&allow_signup=false&code_challenge=CHALLENGE&code_challenge_method=S256
```

---
End of Spec.
