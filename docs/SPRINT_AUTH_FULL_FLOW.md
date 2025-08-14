# Sprint Plan – Full User Registration, Login & Account Management

Kurz und fokussiert: Ein kompletter, datensparsamer Auth-Flow (Magic Link), inkl. Profilverwaltung, Logout/Session-Handling, Account-Löschung und GitHub-Link (MVP), mit klaren Tests, A11y und Sicherheitsleisten. Dauer: ~2 Wochen, kleine PRs.

## Ziele (What/Why)
- Nutzer können sich via Magic‑Link registrieren/anmelden, Sitzungen werden sicher verwaltet.
- Profil (Name, Locale, Region) editierbar; Logout/Logout‑all; Account‑Delete (Soft‑Delete + Purge Job).
- GitHub‑Link (MVP) gemäß OAuth2 Spec Draft; Audit‑Events; minimale Telemetrie.
- Mobile‑first, A11y‑konform, DE/EN Texte, klare Fehlerzustände.

## Out of Scope (Non‑Goals)
- Vollständige SSO‑Palette (nur GitHub MVP)
- Rollen-/Rechteverwaltung (nur vorbereitende Audit‑Events)
- Payments/Abos

## Akzeptanzkriterien
- Magic‑Link: E‑Mail anfordern → Link/Token konsumieren → /me gibt User zurück (httpOnly Cookie)
- Token: TTL ≤ 15min, Single‑Use, Rate‑Limit pro IP/Email, Anti‑replay
- Sitzungen: httpOnly+Secure Cookies, SameSite=Lax, Logout invalidiert Session, optional Logout‑all
- Profil: GET/PUT /profile (ETag), Felder: name, locale, region, Persistenz sichtbar in UI
- Account löschen: DELETE /account (Soft‑Delete + zeitversetztes Purge), Export‑Stub vorhanden
- GitHub Link (MVP): /auth/github/start, /callback mit state/PKCE; Link/Unlink Endpoints, Audit Event
- A11y: Alle Formfelder gelabelt, Fokusreihenfolge sinnvoll, Fehlertext mit role=alert
- I18n: DE/EN für Login/Fehler/Profil/GitHub‑Link
- Tests: Unit + mind. 1 E2E Happy Path grün (Login→Wizard→Home), ein Integrations‑Test gegen realen Auth in CI‑Job optional

## Architektur/Qualität (Leitplanken)
- Permissive Dependencies (MIT/BSD/Apache/ISC); kein Vendor‑Lock
- Sicherheitsleisten: Rate‑Limits, minimaler PII‑Log (ohne Rohdaten), CSRF‑Token für state‑change Routen
- A11y & Mobile‑Performance mitdenken (LCP < 2.5s, keine Blocker)
- Transparenz: Klarer Fehlertext (warum gescheitert), Hinweis bei Dev‑Token

## Arbeitspakete (kleine PRs)
1) Auth Service Bring‑Up (Fastify)
- Endpoints: POST /auth/register, POST /auth/magic-link/consume, GET /me, POST /auth/logout
- Session‑Cookie Flags (httpOnly, Secure, SameSite=Lax); einfache in‑memory Token‑Store
- Token TTL 15m, Single‑Use; strukturierte Logs (ohne Roh‑PII); Basis‑Rate‑Limit
- Tests: Unit (Token‑Issuance/Consume, Limits), Integration (/register→/consume→/me)

2) E‑Mail Versand + DEV‑Modus
- SMTP Provider verdrahten, einfache DE/EN Vorlage, DKIM/SPF Doku
- DEV_MODE: /auth/register liefert { token } zurück (nur nicht‑prod)
- Tests: Mock Transport, Template‑Smoke

3) Frontend Wiring + UX Politur
- Login UI finalisieren (A11y, Fehlertexte, aria‑live, Loading)
- Session Restore auf App‑Start; Logout UI; Dev‑Token Sektion gated
- E2E: Magic‑Link Happy Path (stabil; robust selectors)

4) Profil Endpoints + UI Edit
- GET/PUT /profile (ETag), Felder: name, locale, region
- App: Wizard + „Me“ Route an Backend anbinden (optimistisch + Retry)
- Unit/Integration: ETag/If‑Match, Feldvalidierung

5) Account Aktionen
- GET /sessions, POST /sessions/revoke‑all, DELETE /account (Soft‑Delete + Purge Job), Export‑Stub
- App: Buttons in „Me“ (Confirm Dialog, aria‑modal)
- Tests: Unit+Integration, E2E Logout‑all (optional seriell)

6) GitHub OAuth (MVP)
- Endpoints: /auth/github/start, /callback mit state/PKCE; Link/Unlink + Audit
- App: „Link GitHub“ Button → Status in „Me“; Fehlerpfade
- Tests: Unit (state verify), Integration (mock provider)

7) Sicherheit & Compliance Pass
- CSRF Token (Cookie + Header) für state‑change Routen (PUT/POST/DELETE außer Cookie‑Set)
- Rate‑Limits feinjustieren; Audit‑Events (register, consume, logout, link/unlink, delete)
- Privacy: Consent Timestamp, Delete‑Confirm Flow; Doku Update (DATENSCHUTZ)

## Teststrategie
- Unit: Token, Rate‑Limit, Cookie Flags, Profile Validation, OAuth state
- Integration: End‑to‑End Service Flows (Supertest/undici)
- E2E (Playwright): Login→Wizard→Home; Logout; Profil‑Edit
- Smoke CI Job „real‑auth“ (optional): startet Auth auf :4060, führt 1 Happy‑Path aus

## Timeline (2 Wochen Vorschlag)
- T1–T3: Pakete 1–2 (Auth Service + Email), T4: Paket 3 (FE wiring)
- T5–T7: Pakete 4–5 (Profil/Account), T8–T9: Paket 6 (GitHub OAuth MVP)
- T10: Paket 7 (Security Pass), T11–T12: Puffer/Politur

## Definition of Ready (DoR)
- Zielnutzen klar; Akzeptanzkriterien benannt; Risiken skizziert; Nicht‑Ziele gelistet

## Definition of Done (DoD)
- Akzeptanzkriterien erfüllt; Unit + ≥1 E2E green; A11y geprüft; mobile‑first Performance ok; Doku/Changelog aktualisiert

## Risiken & Abmilderung
- E2E Flakiness → stabilere Selektoren, Gate /me Responses in Tests, optional seriell
- E‑Mail Zustellbarkeit → Provider mit Sandbox, DKIM/SPF; Backoff/Retry
- Security/Compliance → Cookies korrekt, CSRF, Rate‑Limit, Audit; Privacy Copy prüfen

## How to test (Kurz)
- Dev: App via Vite; Auth Service auf :4060; Login Happy‑Path durchklicken
- CI: Unit+Integration für Service; App unit+e2e; optional real‑auth Job

## Dependencies & Practices
- Server (Fastify, MIT): @fastify/helmet, @fastify/cookie, @fastify/rate-limit, @fastify/csrf-protection, @fastify/etag, pino
- Tokens/Sessions: crypto.randomBytes + SHA‑256 (timingSafeEqual), nanoid (MIT), ioredis (MIT) oder dev: lru-cache (ISC)
- E‑Mail: nodemailer (MIT) mit SMTP Provider; dev: Ethereal/console; DKIM/SPF Doku
- OAuth: openid-client (Apache‑2.0) oder simple-oauth2 (MIT) mit PKCE/state
- Validation: zod (MIT) + fastify-type-provider-zod
- Tests: Fastify inject (Integration), vitest (Unit), Playwright (E2E)

Konfiguration (Ports & Proxy)
- App Dev‑Proxy: /auth und /me → http://localhost:4160 (Default), override via:
	- VITE_AUTH_PORT=4170 (Port)
	- VITE_AUTH_TARGET=http://localhost:9999 (volle URL)
- Ziel: Konflikte vermeiden und lokale Auth‑Instanz frei wählen.

---

## Dependencies & Practices (empfohlen)

Permissive Lizenzen (MIT/BSD/Apache/ISC), schlank und bewährt:

- Fastify Core & Plugins
	- @fastify/helmet (Security‑Header), @fastify/cookie (Cookies), @fastify/rate-limit (Rate‑Limits)
	- @fastify/csrf-protection (CSRF), @fastify/etag (ETag für GET), pino + @fastify/request-id (Logs)
- Session/Token
	- crypto.randomBytes + timingSafeEqual (Node Core), nanoid (IDs), ioredis (persistente Stores), lru-cache (In‑Memory Dev)
- E‑Mail
	- nodemailer (SMTP + Testaccount), Provider‑SDKs optional (AWS SDK v3, Postmark/Resend – MIT/Apache)
- OAuth (GitHub)
	- openid-client (Apache‑2.0) oder simple-oauth2 (MIT) für Authorization Code + PKCE
- Validation/Typing
	- zod + fastify-type-provider-zod
- Tests
	- Fastify inject (Integration ohne Ports), node:test oder vitest (Unit/Integration), Playwright (E2E)

Best Practices (konkret):
- __Host‑Session Cookie (Secure, httpOnly, SameSite=Lax, Path=/), Rotation nach Login
- Magic‑Link Token nur gehasht speichern (SHA‑256), TTL ≤ 15m, Single‑Use, Limits pro IP/E‑Mail
- CSRF für mutierende Routen (PUT/POST/DELETE, außer Cookie‑Set), ETag/If‑Match für /profile
- CSP/HSTS via helmet; Logs ohne PII, nur IDs/Hashes; Audit‑Events (register/consume/logout/link/unlink/delete)
- UI: korrekte Labels, aria‑live für Status, role=alert für Fehler; DE/EN Texte
