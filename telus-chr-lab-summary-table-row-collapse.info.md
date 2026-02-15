# TELUS CHR - Lab Table Row Collapse/Expand

Adds collapse/expand buttons to table sections in the TELUS CHR lab results view. Rows under each section header are collapsed by default, with a toggle button to expand them. Completely empty rows are also hidden automatically.

## Changelog

### v1.9
- Code formatting and quality tooling (no functional changes)

### v1.8
- Hide completely empty table rows to reduce visual clutter

### v1.7
- Fix text wrapping on inbox page by scoping nowrap CSS to only rows with collapse toggle buttons

### v1.6
- Renamed script for Greasy Fork compatibility

### v1.5
- Initial public release
- Collapse/expand buttons on lab table section headers
- Rows collapsed by default
- Debounced MutationObserver for dynamic content
