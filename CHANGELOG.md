# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.2.0] - 2026-05-22

### Added
- **GitHub OAuth web sign-in** — one-click "Sign in with GitHub" button on the login screen so new users no longer have to create and paste a Personal Access Token to get started
  - Standard OAuth 2.0 authorization-code flow against a GitHub OAuth App (`gist` + `read:user` scopes)
  - Token exchange handled by Azure Static Web Apps managed Functions under `/api/github/login` and `/api/github/callback`
  - Returned access token is stored in the existing `localStorage` slot, so all subsequent gist-sync calls work unchanged
- **PAT paste flow retained** as a fallback for users who prefer it or who run into OAuth issues

### Improved
- OAuth callback handler now correctly derives the public origin from the `x-ms-original-url` header so it works behind the SWA managed Functions proxy (no more `redirect_uri_mismatch` due to internal `127.0.0.1:*` URLs)
- `oauth_error` query parameter is surfaced as a visible message on the login screen instead of failing silently

### Fixed
- **Changelog popup not opening**: hardened the in-app changelog renderer so a release entry missing the `items` array no longer throws (previously the `v3.0.2` entry used a `highlights` field, which caused `release.items.map` to throw a `TypeError` and prevented the modal from ever showing the `.show` class). Older `highlights`-style entries now render as plain notes.

---

## [3.1.0] - 2026-05-01

### Added
- **Dark / Light theme toggle** across the entire app UI
  - Moon icon button in the dashboard header (next to Logout)
  - Moon icon button in the editor header (next to Preview / Save)
  - Fixed moon icon button on the login screen (top-right corner)
  - Automatically respects the OS `prefers-color-scheme` setting on first visit
  - User preference persisted to `localStorage` so the choice survives page reloads
  - Anti-FOUC inline `<script>` in `<head>` applies the saved theme before first paint
- Dark theme variables: `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--shadow` all override to dark-palette equivalents via `[data-theme="dark"]`
- Dark-specific overrides for: token entry box, form inputs/textareas, status badges, success/error alerts, icon buttons

---

## [3.0.1] - prior release

### Fixed
- Initial stable release of the Widget Studio app with GitHub Gist storage, live preview, and embed code generation.
