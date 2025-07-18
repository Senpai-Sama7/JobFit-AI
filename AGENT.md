# AGENTS.md — JobFit AI

## Universal Agent Environment

- Runs in [codex-universal](https://github.com/openai/codex-universal): Node.js, pnpm, Python, TypeScript, system tools preinstalled.
- Use pnpm for all package installs.
- Agents must use root-level scripts for build/lint/typecheck/test.
- Environment variables must be set via `.env`.

---

## 1. Setup

1. Install dependencies:

   ```
   pnpm install
   ```

2. Prepare environment variables:

   - Copy `.env.example` to `.env` and fill in required values (e.g., `DATABASE_URL` for Neon, any API keys).

3. Set up DB (optional for local dev):

   - See [docs/DB\_SETUP.md] (if you have one).

---

## 2. Validation (CI and Agent Steps)

- **Lint:**
  ```
  pnpm run lint
  ```
- **Type-check:**
  ```
  pnpm run typecheck
  ```
- **Test:**
  ```
  pnpm run test
  ```
- **Build:**
  ```
  pnpm run build
  ```

*All scripts must exit successfully for a valid merge/commit.*

---

## 3. Project Scripts

See `package.json` for available scripts, e.g.:

- `pnpm run dev` — dev server(s)
- `pnpm run build` — builds everything
- `pnpm run lint` — lints all code
- `pnpm run typecheck` — full TypeScript check
- `pnpm run test` — all tests (Jest/Vitest, etc.)

---

## 4. Coding & Contribution

- Add/update tests for all new code/features.
- PRs must pass all scripts above before merge.
- Describe any setup changes in PRs.

