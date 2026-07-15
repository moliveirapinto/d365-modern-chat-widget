# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.5.2] - 2026-07-15

### Changed
- The New Standard Widget's **Embed Widget Code** section now matches the Custom Widget's exactly — same card layout, output textarea, and **Generate Embed Code / Generate TamperMonkey Code / Copy to Clipboard** buttons.

### Fixed
- Each mode now shows a single embed section. The shared Custom Widget embed card is hidden while the New Standard Widget is selected, so you no longer see two "Embed Widget Code" cards at once.

---

## [3.5.1] - 2026-07-15

### Fixed
- The "configure D365 connection first" message shown when generating the Custom Widget's embed/Tampermonkey code now points to the correct place — **Widget Profiles → paste your D365 embed code → Apply to Settings** — instead of a non-existent "D365 Connection tab".

---

## [3.5.0] - 2026-07-15

### Changed
- **New Standard Widget adopts the Custom Widget's card layout.** The settings are now organized into the same clean, icon-led cards — Pre-chat Form, Header & Branding, Fonts, Colors, Avatars, and Localization — for a consistent experience. It keeps its own independent values (a separate copy from the Custom Widget).
- Controls the NextGen widget can't set (custom avatar image upload, time format) are omitted; the show/hide agent avatar and agent name toggles remain.

### Added
- A dedicated **NextGen Options** card groups the options specific to the NextGen widget: pre-chat landing page, action-button placement, disclaimer text, privacy link, widget sizing, hide chat button, disable telemetry, and LCW version.

---

## [3.4.0] - 2026-07-15

### Changed
- **New Standard Widget reuses the Widget Profile connection.** Removed the duplicate Connection inputs; the mode now takes the App ID / Org ID / Org URL from your selected Widget Profile automatically and shows which IDs it is using.

### Added
- **Pre-chat card** for the New Standard Widget: toggle the pre-chat landing page on/off (it uses your Greeting Title/Subtitle to prompt the customer for their question before the chat starts). A full pre-chat survey remains a D365 workstream setting.
- **Tampermonkey userscript generation** for the New Standard Widget, with a configurable `@match` target and the correct `@connect` directives, alongside the existing embed script.

---

## [3.3.1] - 2026-07-15

### Fixed
- **New Standard Widget preview now works with the IDs already entered in the connection area.** The mode has its own App ID / Org ID / Org URL fields; it now auto-fills them from the IDs parsed in the shared connection section (and still lets you type them directly), so the live preview generates instead of showing "Widget Not Configured."

---

## [3.3.0] - 2026-07-15

### Added
- **New Standard Widget mode.** The former "Standard Widget" mode is now Microsoft's **NextGen Modern Web Messaging** widget, hosted and served by Dynamics 365. Users enter their Widget App ID, Org ID, and Org URL (or paste an existing script tag to auto-extract them), optionally customize the full **BrandConfig** (brand name/logo, primary color and font, header/button/message-bubble colors, text labels, sizing, and display options such as landing page, avatar, agent name, action-button placement, hide button, telemetry, locale, and custom font), then generate a ready-to-embed script and preview it live.
- The generated script targets the **production CDN** (`https://oc-cdn-ocprod.azureedge.net/livechatwidget/v3/scripts/NextGenLiveChatBootstrapper.js`), includes an `onerror` re-injection fallback, and passes branding inline via `data-customization-callback`. Configuration is persisted to local storage.

### Changed
- The **Custom Widget** mode is unchanged.

---

## [3.2.2] - 2026-07-15

### Fixed
- **Widget scripts work again after the weekend platform migration.** The migration disabled GitHub Pages on this repository. Every generated embed snippet and Tampermonkey userscript loads the widget runtime (`dist/widget-core.js`) from GitHub Pages (`moliveirapinto.github.io`), so with Pages off **all** scripts — old and newly generated — silently failed to load. Re-enabling GitHub Pages (source: `main` branch, root) restored every distributed script immediately, with no regeneration required.

### Improved
- **Automatic CDN fallback so this cannot recur.** The embed loader (`dist/loader.js`), the compact embed snippet, and the Tampermonkey loader now fall back to the **jsDelivr** mirror (`cdn.jsdelivr.net/gh/...`) if the primary GitHub Pages host fails. jsDelivr serves the repo directly and does not depend on Pages being enabled. (`dist/widget-core.js` already had multi-source fallback for its own sub-resources.)
- **Added a `.nojekyll` marker** so the legacy GitHub Pages build always publishes the `dist/` runtime bundles verbatim (never processed/skipped by Jekyll).

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
