# Dev Log

## 2026-10-08 — Remember Long Press & Record History Entry (CodeX/Codex)

### Local candidate, not pushed or deployed
- Live remote main was `8888c31af6b33184bf1f9bd23d2db170892a2397`; the published page did not include the previous memo/CSV candidate. Fast-forwarded the local base and carried the existing candidate forward with a three-way merge, retaining all remote rendering-safety fixes, locked dependencies and regression tests. Prior candidate source and a recovery stash are preserved in the local evidence pack.
- Removed the main memo plus button. Remember short activation still records once. Holding for 550ms opens recent items and suppresses the release click. Movement over 10px, scrolling, cancellation, focus loss, multiple pointers and disabled state cancel a pending hold without creating a record.
- Added ArrowDown/ArrowUp keyboard access, screen-reader descriptions, a one-time persistent discovery hint, Escape/outside/focus dismissal and a close button. Touch context menus and blue tap highlighting are suppressed on these controls.
- Added history-clock buttons to current record editors, with the label “最近事项” / “Recent items”. Choosing an item follows the existing editor's input autosave convention; it does not add an interval, run parsing, or change timing/tag fields. Withdrawn record entries are disabled.
- Reduced the shared chooser to at most 264px and sized it against the target and visible viewport, including reduced-height views. The main input and Remember button remain available. Comparison keys and the prior CSV confirmation/`Cleared_` naming behavior are retained.
- Tests use synthetic records only. Added deterministic gesture boundary cases and real browser regression cases; updated isolated desktop/touch checks and previews. Runtime remains a single `index.html` file; no production dependencies added.

### Validation and local evidence
- `npm test` passes the CSV/statistics/memo checks, 18 deterministic gesture boundary checks, and all 7 Chromium regression cases. The separate UI script passes 70 synthetic-data desktop/touch checks, including real touch-hold release, targeted record editing, undo/redo freshness, CSV downloads and reduced visible viewports. A physical phone keyboard has not been tested.
- Saved desktop/mobile screenshots, synthetic CSV files and an isolated in-memory HTML preview under `test-results/memo-longpress-20261008/`. Browser contexts close in `finally`; no Playwright MCP session is created.
- Scoped Playwright output to `test-results/playwright/` after its default cleanup removed earlier preview evidence. Recovered the prior candidate sources and exact patch byte-for-byte from the retained Git stash; prior PNGs could not be recovered. Current previews are intact, and a subsequent full test run verified they remain intact. The evidence pack includes an explicit recovery report.
- Local base is `8888c31`; candidate edits remain uncommitted. No push, pull request, merge publication or deployment was performed. Independent review and release authorization remain pending.

## 2026-10-07 — Memo History Reuse & CSV Confirmation (CodeX/Codex)

### Implemented locally, pending independent review
- Confirmed `origin` is `SamZebrado/LocalStopWatch`, with a clean `main` checkout before edits (base `a8bde17`). No existing user changes were overwritten.
- Kept runtime changes in the actual single-file entry, `index.html`. Commit `ce7d08b` renamed `stopwatch_combined.html`; corrected the README entry instructions while preserving historical notes.
- Added a theme-aware rounded plus button and lightweight recent-memo popup. It sorts a copy by end time, excludes withdrawn/blank records, and scans until ten unique memos are found.
- Comparison keys remove repeated trailing “等效” and Arabic numeric suffixes (including decimals). Numeric-only or marker-only keys fall back to the trimmed original. Current saved memo text is used; stale `originalMemo` is not resurrected after edits. No memo parser or stored history changes.
- Added editable full-text refill, keyboard navigation, Escape and outside/focus dismissal, long-text ellipsis, and viewport-aware popup placement for narrow screens.
- Ordinary CSV export now has one modal confirmation; its filename remains `Uncleared_`. Export & Clear retains one destructive-action confirmation and now uses `Cleared_` filenames. Cancellation, Escape and backdrop clicks do not download or change records; duplicate confirm callbacks cannot download twice.
- Native `<dialog>` supplies modal focus and Escape behavior in current Chromium browsers. As before, clear occurs after a download is initiated; browsers do not provide confirmation that the user completed saving the file.

### Validation and handoff
- Added pure Node tests for normalization, source ordering, empty-key fallback, deduplication beyond ten candidates, unchanged history, CSV filename semantics, cancellation and duplicate confirmations; included these in `npm test`.
- All 55 isolated Chromium desktop/mobile checks passed: full-text refill, keyboard/focus behavior, languages, advanced-mode visibility, undo/redo freshness, actual button-triggered downloads and both cancellation paths. Browser contexts close in `finally`; no Playwright MCP session is created.
- Existing CSV round-trip and statistics tests remain passing. Inline scripts compile and `git diff --check` passes.
- Saved synthetic desktop/mobile screenshots and an isolated standalone HTML preview locally; no private browser records were read or captured. No dependencies installed, commits published, pull requests opened, or deployments performed.

## 2026-03-02

### Scope
- Clone project and add Nutstore (WebDAV) backup capability.
- Keep offline-first behavior unchanged.
- Ensure `stopwatch_combined.html` is updated for mobile single-file usage.

### Implemented
- Added Nutstore backup UI in `stopwatch.html`:
  - account email
  - app password
  - remote path
  - auto backup interval (hours)
  - save config / start-stop auto upload / upload now
- Added Nutstore backup logic in `timer.js`:
  - config persistence (`localStorage`, key: `nutstore_backup_config_v1`)
  - WebDAV `PUT` upload
  - hourly scheduled auto upload
  - status text and i18n messages
  - URL path segment encoding for remote path
- Kept path user-editable; default path set to:
  - `NewMars/LocalStopWatch_backup_latest.json`
- Re-generated `stopwatch_combined.html` after each related code update.

### Testing
- Static check:
  - `node --check timer.js` passed.
- Simulation test (mocked DOM/localStorage/fetch):
  - save config works
  - upload triggers HTTP `PUT`
  - 2-hour interval schedules as expected (`7200000 ms`)
- Real WebDAV smoke test:
  - direct `PUT` to `/dav/<file>` returned `404` (root not writable).
  - `PROPFIND /dav/` returned `207` and confirmed writable subfolders.
  - conclusion: remote path must target writable folder (e.g., `NewMars/...`).

### Security / Git Hygiene
- No credentials written into tracked project files.
- Added `.gitignore` entries for potential local backup/config JSON artifacts:
  - `LocalStopWatch_backup*.json`
  - `nutstore*config*.json`

### Notes
- Mobile browser WebDAV/CORS behavior may vary by browser.
- If upload fails on one browser, retry with another browser and verify app password.

## 2026-03-02 (Later Iteration, by CodeX/Codex)

### Implemented
- Migrated UI maintenance to `stopwatch_combined.html` only.
- Added scheduled backup reminder dialog:
  - popup content includes elapsed time since last backup download
  - warns about localStorage loss risk
  - action button text: `现在下载备份`
  - download file naming: `backup_YYYYMMDD_HHMMSS.csv`
  - backup download does not clear intervals
- Added `advanced mode` toggle under language button:
  - default OFF
  - when OFF: hide `Tag`, `指定时间（分钟）`, and Tomato Export tab button
  - when ON: show those advanced controls
- Moved `手动备份` and `恢复历史备份` from timer tab to log/backup tab.
- Reordered tabs so Tomato Export appears to the right of Log & Backups.
- Set default theme to black/gray dark mode (removed blue-tinted theme).
- Hid Nutstore UI and initialization by default (`NUTSTORE_FEATURE_ENABLED = false`) because browser-side CORS blocks practical usage.

### Automated Testing
- Inline JS syntax check passed for all 5 `<script>` blocks.
- Feature-presence and tab-scope checks passed:
  - advanced mode toggle exists
  - backup reminder dialog exists
  - backup buttons only in log tab
  - Nutstore feature flag set to hidden mode
- Runtime simulation passed:
  - reminder dialog opens
  - hidden Nutstore section remains hidden on init

## 2026-03-02 (UI Refinement + Accessibility, by CodeX/Codex)

### Implemented
- Timer controls layout refinement:
  - `记下` button is now on its own row, taller and thicker to reduce mis-taps
  - `导出并清空记录` + `导出CSV` share a single row
- CSV filename update:
  - regular export now prefixes filename with `Uncleared_`
- Fixed first-interval start-time display:
  - now computes from first interval (`first.endTime - first.durationMs`) instead of using `t_Initial` directly
- Header and tab layout updates:
  - language and advanced buttons moved below title
  - timer tab button occupies its own row
  - rules + log tabs share one row
- Added advanced-mode persistent size controls (range `1-50`):
  - non-title text size
  - button size
  - title size
- Input behavior improvement for size controls:
  - users can clear the input first, then type new value
  - if left empty on blur, previous valid value is kept/restored
- Button text auto-fit guard:
  - button font size is capped by button area to avoid overflow

### Automated Testing
- Inline script syntax checks passed (all script blocks).
- Runtime simulation passed:
  - size controls persist in localStorage
  - advanced panel visibility works
  - theme picker still works

### Follow-up UI Extensions
- Added advanced controls for:
  - input font size (`1-50`, persistent)
  - button heights by two groups (persistent):
    - main group: timer-tab button + remember button
    - secondary group: all other buttons
- Added safer number-input behavior:
  - users can clear then type new values
  - empty blur restores previous valid value
- Added button text auto-fit cap by button area to reduce overflow when button font is set large.

## 2026-10-02 — Codex engineering maintenance

- Corrected the documented single-file entry to `index.html` and locked the browser test dependencies.
- Render imported memos, tags, durations, prefixes, notes and backup keys as literal text; pass user values through DOM data attributes instead of inline JavaScript strings.
- Added browser regression coverage for synthetic markup and quoted tag/item identifiers, preserving existing text and editing behavior.
- No new timer or export features.
