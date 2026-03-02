# AGENTS.md

Project preferences for future Codex sessions.

## Product Direction
- Maintain single-file app: update only `stopwatch_combined.html`.
- Mobile-first offline usage is the default target.

## UI / UX Preferences
- Default appearance: dark mode in black/gray tones.
- Avoid blue-tinted themes (sleep-friendly preference).
- Keep core timer flow simple; avoid accidental destructive actions.

## Feature Visibility Rules
- `Advanced Mode` is default OFF.
- When Advanced Mode is OFF:
  - hide `Tag` input in interval records
  - hide `指定时间（分钟）` input in interval records
  - hide Tomato Export tab button
- When Advanced Mode is ON:
  - show the advanced fields and Tomato Export tab

## Backup Workflow Preferences
- Keep manual backup operations in `运行日志和备份` tab (not in timer tab).
- Keep restore-history operations in `运行日志和备份` tab.
- Backup reminder should use:
  - popup warning with elapsed time since last backup
  - explicit action button text: `现在下载备份`
  - CSV file name prefix: `backup_`
  - no data clearing on reminder-triggered backup

## Nutstore / WebDAV Policy
- Browser-side Nutstore upload is currently disabled in UI due CORS constraints.
- Keep code available for future re-enable, but default state should remain hidden/off until a stable proxy/native path exists.

## Collaboration / Change Log Preference
- Mark notable updates as implemented with `CodeX/Codex` in documentation.
- Keep `README.md` and `dev_log.md` updated when shipping significant behavior changes.
