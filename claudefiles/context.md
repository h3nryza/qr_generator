# Project Context

## What This Project Is

A full-featured QR code generator platform inspired by online-qr-generator.com. Two-phase build:
- **Phase 1**: Static client-side QR generator on GitHub Pages (React + Vite + TypeScript)
- **Phase 2**: Backend platform with tracking, auth, storage, and multi-tenant white-labeling

Designed for white-labeling from the start — easy to rebrand per client.

## Current State

- **Status**: Planning complete. Phase 1 and Phase 2 specs written. GitHub security configured.
- **Files created this session**:
  - `phase-1.md` — Full checkbox spec (15 QR types, customization, export, UI/UX, white-label, project structure)
  - `phase-2.md` — Comparison tables + checkboxes (auth, storage, backend, DB, hosting, tracking, white-label, API)
  - `.github/dependabot.yml` — Dependency scanning enabled
  - `.github/workflows/codeql.yml` — CodeQL scanning enabled
- **Manual step pending**: Enable secret scanning in GitHub repo settings

## Where We Are Going

- **Next**: User reviews phase-1.md and phase-2.md, ticks desired features
- **Then**: Begin Phase 1 implementation (scaffold project, build wizard, implement QR types)
- **Later**: Phase 2 infrastructure decisions, backend build, deployment

## Where We Left Off

- Completed 5-pass deep research on QR code generator features, competitor analysis, and infrastructure options
- Created both phase specification documents with interactive checkboxes
- Enabled Dependabot and CodeQL on the repo
- Commit prefix not yet set for this session
- No code written yet — specs only

## Key Links

- `phase-1.md` — Phase 1 specification
- `phase-2.md` — Moved to `charged_qr_generator` repo
- `learning/sessions/2026-03-25_session.md` — Today's session log
- `claudefiles/changelog.md` — Change log
