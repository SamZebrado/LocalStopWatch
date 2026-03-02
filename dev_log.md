# Dev Log

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
