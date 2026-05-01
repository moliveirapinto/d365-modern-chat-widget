# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
