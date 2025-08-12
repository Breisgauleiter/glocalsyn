# glocalsyn
Syntopia / GLOCALSPIRIT monorepo (PWA + services). MIT-first, community-operated (12 roles + SCL 1–25).


## How to run & test

1. **Install dependencies**
	```sh
	pnpm install
	```
2. **Start dev server**
	```sh
	pnpm --filter @syntopia/app dev
	```
	App runs at http://localhost:5173
3. **Run unit tests**
	```sh
	pnpm --filter @syntopia/app test
	```
4. **Run E2E tests (Playwright)**
	First time only:
	```sh
	pnpm --filter @syntopia/app e2e:install
	```
	Then:
	```sh
	pnpm --filter @syntopia/app e2e
	```

More details: see [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

## Testing Conventions (UI Interaction)

We use React Testing Library + `user-event` wrapped in small helper utilities (`src/test/testActions.ts`) to keep tests realistic (event sequencing, async flushing) and readable.

### Helpers

`click(el)` – wraps `userEvent.click` in `act`.

`type(el, text)` – realistic typing (fires input + change) wrapped in `act`.

`tab(times=1)` – keyboard navigation for a11y focus order checks.

`selectOption(selectEl, value)` – change native `<select>` value.

`submit(target)` – either `requestSubmit()` on a `<form>` or falls back to `click` on a button element.

### Rationale

1. Avoid manual `act()` everywhere (helpers centralize it).
2. Prefer `user-event` over `fireEvent` so we mirror browser behavior (focus, key events, value updates).
3. Sequential async interactions (like multiple clicks) are awaited to reduce flakiness and ensure state commits before assertions.

### Pattern

```ts
import { click, type } from '../test/testActions';

it('submits note proof', async () => {
	render(<QuestDetail id="q2" />);
	await click(screen.getByTestId('detail-accept'));
	await click(screen.getByTestId('detail-start'));
	await click(screen.getByTestId('toggle-proof'));
	await type(screen.getByTestId('proof-note'), 'Learned something.');
	await click(screen.getByTestId('submit-proof'));
	await screen.findByText(/Eingereicht/);
});
```

### When NOT to use helpers

Readonly DOM queries / pure render assertions (no user interaction) do not need them.

If you add a new interaction type (hover, drag, etc.) extend `testActions.ts` rather than duplicating act+userEvent code inline.

### Image/Canvas in tests (photo proofs)

jsdom doesn't implement real Canvas APIs. We provide light mocks in `apps/app/src/setupTests.ts` for `createImageBitmap`, `HTMLCanvasElement.getContext`, and `toDataURL` to avoid errors when components touch canvas. For unit tests, prefer seeding state over exercising file uploads end-to-end. Validate the true photo flow via Playwright E2E.

Tip: If you need deeper canvas behavior, install a canvas polyfill, but keep unit tests fast and deterministic.

Note: The previous UI unit test for photo upload was removed in favor of:
- Pure math tests in `apps/app/src/utils/image.test.ts`
- E2E coverage in `apps/app/tests/*.spec.ts`

---

## Quests & Proofs Overview

- Proof types: `check_in` (alias: `complete`), `text_note`, `link`, `photo`, `peer_confirm`, `github_pr`.
- Instant completion: `check_in`/`complete` complete immediately on submit.
- Reviewed proofs: other types are stored as "submitted" until approved in Review Queue.
- XP per proof: check_in/complete 5, text_note/link 8, photo 9, peer_confirm 10, github_pr 15.

Photo storage: photos are downscaled client-side and saved as a Data URL along with the proof in local storage. This stays on-device; treat it as user content. If you add sync later, document privacy/size caps.

Review Queue: shows pending proofs with filters (all/photo/peer/text/link) and type-aware rendering (image preview, peer note, link). Peer confirmations use a “Bestätigen” label.

### Per-user GitHub settings (optional)

To enable read-only GitHub issues as quests (for SCL ≥ 4 and linked GitHub):
- Set `VITE_USE_GITHUB_ADAPTER=true` in your env.
- Set `VITE_GITHUB_REPOS="owner1/repo1,owner2/repo2"` (comma-separated).
- Optionally: `VITE_GITHUB_TOKEN=ghp_xxx` for higher rate limits.
- Optionally: `VITE_GITHUB_PER_REPO_LIMIT=10` (default 10).

After linking GitHub, you can set your own repo list, issue state, labels, and token in the "Ich" tab. These override the env settings for your client only (read-only).
