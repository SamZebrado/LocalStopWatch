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
