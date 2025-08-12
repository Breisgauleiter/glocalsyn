# Auth Backend Specification – Persistent User Accounts (Draft)

Status: Draft (12 Aug 2025)
Owner: Engineering
Related Roadmap Items: Sprint 03/04 Transition (Prerequisite for GitHub OAuth)

## 1. Ziele
Bereitstellung einer minimalen, sicheren, datensparsamen User-Persistenz und Authentifizierung als Grundlage für Provider-Verknüpfungen (GitHub), SCL-Aufstiege und zukünftige Rollen/Governance.

## 2. Designprinzipien
- Datenschutz: Nur notwendige Felder (id, createdAt, displayName optional, locale, scl, flags)
- Austauschbare Auth-Methoden: Start mit Passwortlos (Magic Link) ODER klassisches Passwort (gehasht) – Entscheidung unten
- Keine Speicherung im Client-Bundle: Tokens serverseitig, Session-Cookie httpOnly, secure, sameSite=lax
- Vendor-Lock vermeiden: Keine proprietären SaaS-Abhängigkeiten; SMTP/Mail-Adapter abstrahiert

## 3. User Datenmodell (ArangoDB Collection `users`)
```
{
  _key: string,          // = userId (uuid or ksuid)
  createdAt: number,
  updatedAt: number,
  displayName?: string,
  locale?: 'de' | 'en',
  scl: number,           // Skill / Syntopia Capability Level
  email?: string,        // für Magic Link / Passwortflow; index unique sparse
  emailVerified?: boolean,
  auth:
    {
      passwordHash?: string;     // Argon2id (empfohlen) oder bcrypt, nur falls Passwort-Modus
      magicLinkPending?: {
        tokenHash: string;       // SHA256 der gesendeten Nonce
        expiresAt: number;
        email: string;
      };
      lastLoginAt?: number;
      failedLoginAttempts?: number; // Rate-Limit / Lockout
      lockUntil?: number;
    },
  flags?: { githubLinked?: boolean };
}
```
Indices: unique(email), ttl(magicLinkPending.expiresAt) optional via sweeper.

## 4. Auth Varianten – Entscheidung
Option A: Start Magic Link only (Plus: keine Passwörter, weniger Friktion; Minus: Email-Zustellung kritisch)
Option B: Passwort (mit späterer Magic Link Erweiterung)
Empfehlung: Magic Link first. Grund: Geringere kognitive Last, schnellerer Einstieg, spätere Passwort-Nachrüstung möglich (Additiv). Fallback: Dev/Test Mode erlaubt statische Test-Accounts.

## 5. Endpoints (Phase 1)
### POST /auth/register (optional bei Magic Link → sendet Login Mail)
Body: { email }
Action: Erzeugt user falls nicht existent, generiert magicLink token, sendet Mail.
Response: 204
Errors: 429 (rate), 400 (invalid email)

### POST /auth/magic-link/consume
Body: { token }
Action: Hash(token) match pending; verifiziert email; erstellt Session.
Response: { user: PublicUser }
Errors: 400 invalid_token | expired

### POST /auth/login (nur bei Passwort-Modus)
Body: { email, password }
Response: { user: PublicUser }

### POST /auth/logout
Clears session cookie.

### GET /me
Returns current user (server derives from session).

## 6. Session Management
- Session Store: Signed & encrypted cookie (alternativ: stateless JWT mit rotation – später). Empfehlung: Opaque Session ID (uuid) -> in-memory + future persistent store.
- Cookie: `sid` httpOnly, secure (prod), sameSite=lax, maxAge 7d rollierend.
- Session Record:
```
{ id, userId, createdAt, lastAccess, userAgentHash, ipHash }
```
Pruning: LRU / TTL (30d inactivity).

## 7. Sicherheitsaspekte
- Rate-Limits: /auth/register & /auth/magic-link/consume per IP+email (z.B. 5/min burst 2)
- Brute Force (Passwort-Modus): Argon2id mit moderaten Parametern (t=2, m=64MB, p=1) – Konfig in ENV.
- Timing: Einheitliche Antwortzeiten bei Invalid Token vs. Expired.
- Email-Enumeration: Immer 204 bei register, egal ob User existiert (intern Logging).
- Logging: Keine Klartext Tokens. Nur Token Hash, Session ID.

## 8. PublicUser Shape
```
interface PublicUser {
  id: string;
  displayName?: string;
  locale?: 'de' | 'en';
  scl: number;
  flags?: { githubLinked?: boolean };
}
```

## 9. Interaktion mit GitHub OAuth (Zukunft)
- GitHub OAuth Endpoints prüfen zuerst existierende Session; ohne Session → 401.
- githubLinked Flag wird nach erfolgreicher Verknüpfung gesetzt.
- TokenStore speichert userId (foreign key `users._key`).

## 10. Migrationsüberlegung
Aktuell nur Client-ephemerer "User" (Profilwizard). Migration: Beim ersten echten Login wird bestehender clientseitiger Profilzustand (Name, Region) an /auth/register übergeben und dem persistenten User zugeordnet.

## 11. Telemetrie
Events: auth.magic_link.requested, auth.magic_link.consumed, auth.session.created, auth.session.ended

## 12. Akzeptanzkriterien (PR Auth Spec)
- Dieses Dokument hinzugefügt
- ROADMAP aktualisiert (Reihenfolge angepasst)
- Keine Implementierungscodeänderungen

## 13. Nicht-Ziele
- Noch keine Rollen/Governance Vergabe
- Kein Social Login (GitHub als App-Login) – nur Account-Link später
- Keine Refresh Token Rotation Strategies (Session ausreichend)

## 14. Offene Fragen
- Fallback ohne Email-Infrastruktur? (Dev: Console Mail Transport)
- Benötigen wir Early DisplayName Reservierung? (vermutlich nein, spätere Änderung erlaubt)
- Multi-Faktor benötigt vor Sprint 06? (vermutlich nein)

## 15. TAO Integration & Graph Projection
Ziel: Persistente User-Accounts sauber in bestehendes TAO-Graph-Modell (Collection `graph_objects` + `graph_edges`) integrieren ohne Redundanzen / Inkonsistenzen.

### 15.1 Collections & Trennung
- `users` (neu): Auth & vertrauliche Felder (email, passwordHash/magicLink Pending, Sessions FK optional)
- `graph_objects` (bestehend): Öffentliche Knoten (type: 'user' | 'hub' | 'quest')

Trennungsprinzip: Alles was privat / sensibel ist bleibt ausschließlich in `users`. Öffentliche Profilattribute (displayName, locale, scl, flags.githubLinked) werden in den zugehörigen `graph_objects` user-Knoten projiziert.

### 15.2 Key / ID Strategie
- `users._key` = stable `userId`
- Korrespondierender Graph Node: Dokument in `graph_objects` mit `_key = userId`, `type = 'user'`, `name = displayName` (Fallback: 'User')

Damit bleibt Edge-Referenzierung konsistent: `_from: graph_objects/<userId>`.

### 15.3 Projection Lifecycle
| Ereignis | Aktion |
|----------|--------|
| User erstellt | Insert user node in `graph_objects` (idempotent Upsert) |
| displayName Update | Patch user node `name` |
| scl Änderung | Patch user node `scl` Meta-Feld |
| githubLinked Flag | Patch user node `flags.githubLinked` |
| User Deletion (später) | Soft-Delete: Markierung im user node (`deletedAt`) statt Hard-Remove (Edge-Integrität) |

### 15.4 Konsistenz-Mechanik
Kurzfristig (Phase 1): Synchronous dual-write (Transaktion optional). Risiko: Divergenz bei Fehler nach erstem Write – mitigiert durch Upsert-Replay beim nächsten /me Aufruf.

Mittelfristig: Event-Emitter `user.updated` → Graph Projection Worker (Retry + Dead-Letter).

### 15.5 Edges (Beispiele)
- Follows / soziale Beziehungen: `_from: graph_objects/<userId>` ↔ `_to: graph_objects/<userId>` type: `follows`
- Joins Hub: user → hub (`joins`)
- Recommends Quest: user → quest (`recommends`)

Auth-System selbst erzeugt keine sensiblen Edges; nur Domain-Services bauen Beziehungen. Auth liefert stabile IDs.

### 15.6 SCL & Governance
SCL Änderungen passieren im Auth/Profil-Service; Graph Projection aktualisiert `graph_objects.scl` (Meta). Recommendation & Bridge-Algorithmen nutzen diese Werte read-only.

### 15.7 Migrationspfad Aktuelle Mock-User
Aktuell: Ephemerer Client-User (authStore Mock). Migration:
1. Bei erstem echten Login → persistenter `users` Eintrag.
2. Graph Upsert `graph_objects` user node, falls nicht vorhanden.
3. Client-State ersetzt durch `/me` Response.

### 15.8 Fehler- & Retry-Strategie
Bei Projection-Write Fehler: Log + Flag `needsGraphSync` im `users` Dokument. Health-Endpoint kann Anzahl offener Syncs melden. Geplanter Periodic Job synchronisiert ausstehende Nutzer.

### 15.9 Teststrategie
- Unit: Projection Helper (user → graph object payload)
- Integration: Erstellen / Update User -> Graph Query validiert Node Felder
- Property-Based (später): Randomisierte displayName / scl Updates erzeugen keine Duplikate

### 15.10 Performance / Indexe
- `graph_objects` bereits allgemein; zusätzliche Felder (scl, flags) ohne neue Indizes zunächst OK (<10k Nodes). Später: Sparse Index auf `type` + `scl` falls Query benötigt.

---
End of TAO Integration Section.

---
End of Spec.
