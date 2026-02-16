# CLAUDE.md

## Project

Tampermonkey userscripts and userstyles for TELUS CHR (inputhealth.com), published on Greasy Fork.

## Rules

- **Always bump `@version`** in the userscript/userstyle header when modifying a file, even for metadata-only changes.
- **Every userscript/userstyle must have a companion `.info.md` file** describing what it does.

## Naming Conventions

- **Filenames**: `telus-chr-<area>-<description>.user.{js,css}` (e.g. `telus-chr-lab-summary-pdf-fixer.user.js`)
- **Info files**: same base name with `.info.md` suffix (e.g. `telus-chr-lab-summary-pdf-fixer.info.md`)
- **`@name` header**: `TELUS CHR - <Human-Readable Description>` (e.g. `TELUS CHR - Lab Summary PDF Fixer`)
- Do **not** use "Inputhealth" in names — TELUS has dropped that branding.
