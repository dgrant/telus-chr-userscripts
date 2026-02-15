# TELUS CHR - Lab PDF Fixer

Converts base64-encoded PDF data in TELUS CHR lab result cells into clickable PDF links. The link label is automatically derived from the row's section name.

## Changelog

### v1.6
- Code formatting and quality tooling (no functional changes)

### v1.5
- Updated script metadata (name, namespace, author)

### v1.2
- Initial public release
- Detects `^TEXT^PDF^Base64^` content in lab result cells
- Creates blob URLs and renders clickable PDF links
- Automatic cleanup of orphaned blob URLs
- MutationObserver for dynamically loaded content
