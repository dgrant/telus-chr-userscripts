// ==UserScript==
// @name         TELUS Collaborative Health Record (CHR) Inputhealth - Table Row Collapse/Expand (Reverted Placement Fix)
// @namespace    github.com/dgrant/telus-chr-userscripts
// @version      1.5
// @description  Adds collapse/expand buttons to table sections (within the TH column), collapsing rows by default, with debounced execution and debug logging.
// @author       Your Name/AI Assistant
// @match        *://*.inputhealth.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('TamperMonkey script initializing...');

    // 1. Inject the CSS for collapsed rows and for button alignment
    const style = document.createElement('style');
    style.textContent = `
        .collapsed-row {
            display: none !important;
        }
        /* No display: flex on th.result-name-column to avoid unwanted wrapping/layout issues */

        /* Ensure the span content doesn't wrap, which might force the button below it */
        th.result-name-column > span.result-name {
            white-space: nowrap; /* Prevent the text inside this span from wrapping */
            display: inline-block; /* Ensure it behaves well with adjacent inline-block elements */
            vertical-align: middle; /* Align vertically with the button */
        }

        /* Style for the toggle button */
        .collapse-toggle-button {
            margin-left: 5px; /* Space between the span and the button */
            cursor: pointer;
            background: green;
            color: white;
            border: 1px solid #ccc;
            border-radius: 3px;
            display: inline-block; /* Ensure button sits next to the span */
            padding: 2px 6px;
            font-size: 0.8em;
            line-height: 1;
            box-shadow: 0 1px 1px rgba(0,0,0,0.1);
            transition: background-color 0.2s ease;
            vertical-align: middle; /* Align vertically with the span */
        }
        .collapse-toggle-button:hover {
            background-color: darkgreen;
        }
        .collapse-toggle-button:active {
            background-color: #3e8e41;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        }
    `;
    document.head.append(style);
    console.log('CSS injected.');

    // Debounce function
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Function to apply the collapse/expand logic
    function applyCollapseExpand() {
        console.log('applyCollapseExpand triggered.');
        const allThElements = document.querySelectorAll('th.result-name-column');
        console.log(`Found ${allThElements.length} th.result-name-column elements.`);

        allThElements.forEach((thElement, index) => {
            if (thElement.dataset.collapseProcessed) {
                return;
            }
            thElement.dataset.collapseProcessed = 'true';

            const parentRow = thElement.closest('tr');
            if (!parentRow) {
                console.log(`  No parent <tr> found for thElement #${index}.`);
                return;
            }

            let rowsToCollapse = [];
            let currentRow = parentRow.nextElementSibling;
            let hasNextTh = false;

            while (currentRow) {
                if (currentRow.tagName === 'TR') {
                    const nextThInCurrentRow = currentRow.querySelector('th[scope="row"].result-name-column');
                    if (nextThInCurrentRow) {
                        hasNextTh = true;
                        break;
                    }
                    rowsToCollapse.push(currentRow);
                }
                currentRow = currentRow.nextElementSibling;
            }

            if (rowsToCollapse.length === 0 || !hasNextTh) {
                const existingButton = thElement.querySelector('.collapse-toggle-button');
                if (existingButton) {
                    existingButton.remove();
                }
                return;
            }

            rowsToCollapse.forEach(row => {
                row.classList.add('collapsed-row');
            });

            let toggleButton = thElement.querySelector('.collapse-toggle-button');

            if (!toggleButton) {
                toggleButton = document.createElement('button');
                toggleButton.textContent = '[+]';
                toggleButton.classList.add('collapse-toggle-button');

                // Append the button after the span.result-name for better flow
                const resultNameSpan = thElement.querySelector('span.result-name');
                if (resultNameSpan) {
                    resultNameSpan.after(toggleButton); // Insert after the span
                } else {
                    thElement.appendChild(toggleButton); // Fallback to appending to th
                }
            } else {
                 toggleButton.textContent = '[+]';
            }

            toggleButton.onclick = (event) => {
                event.stopPropagation();
                const isCollapsed = rowsToCollapse[0]?.classList.contains('collapsed-row');
                rowsToCollapse.forEach(row => {
                    row.classList.toggle('collapsed-row');
                });
                toggleButton.textContent = isCollapsed ? '[-]' : '[+]';
            };
        });
        console.log('applyCollapseExpand finished.');
    }

    const debouncedApplyCollapseExpand = debounce(applyCollapseExpand, 150);

    applyCollapseExpand();

    const observer = new MutationObserver(() => {
        debouncedApplyCollapseExpand();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log('MutationObserver started on document.body.');

})();
