// @ts-check
// ==UserScript==
// @name         TELUS CHR - Lab Table Row Collapse/Expand
// @namespace    github.com/dgrant/telus-chr-userscripts
// @version      2.0
// @description  Adds collapse/expand buttons to table sections (within the TH column), collapsing rows by default. Also hides completely empty rows. Debounced execution with debug logging.
// @author       Your Name/AI Assistant
// @match        *://*.inputhealth.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  console.log('TamperMonkey script initializing...');

  // 1. Inject the CSS for collapsed rows and for button alignment
  const style = document.createElement('style');
  style.textContent = `
        .collapsed-row {
            display: none !important;
        }
        /* No display: flex on th.result-name-column to avoid unwanted wrapping/layout issues */

        /* Only apply nowrap on rows that actually have a collapse toggle button */
        th.result-name-column.has-collapse-toggle > span.result-name {
            white-space: nowrap;
            display: inline-block;
            vertical-align: middle;
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
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // Function to apply the collapse/expand logic
  function applyCollapseExpand() {
    console.log('applyCollapseExpand triggered.');
    /** @type {NodeListOf<HTMLElement>} */
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

      const rowsToCollapse = [];
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

      rowsToCollapse.forEach((row) => {
        row.classList.add('collapsed-row');
      });

      let toggleButton = /** @type {HTMLElement|null} */ (thElement.querySelector('.collapse-toggle-button'));

      if (!toggleButton) {
        toggleButton = document.createElement('button');
        toggleButton.textContent = '[+]';
        toggleButton.classList.add('collapse-toggle-button');

        thElement.classList.add('has-collapse-toggle');
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
        rowsToCollapse.forEach((row) => {
          row.classList.toggle('collapsed-row');
        });
        toggleButton.textContent = isCollapsed ? '[-]' : '[+]';
      };
    });
    console.log('applyCollapseExpand finished.');
  }

  // Function to hide completely empty rows (no visible text content at all)
  function hideEmptyRows() {
    /** @type {NodeListOf<HTMLElement>} */
    const rows = document.querySelectorAll('tr.row.result-item');
    let hiddenCount = 0;
    rows.forEach((row) => {
      if (row.dataset.emptyRowProcessed) return;
      row.dataset.emptyRowProcessed = 'true';
      if (row.textContent.trim() === '') {
        row.style.display = 'none';
        hiddenCount++;
      }
    });
    if (hiddenCount > 0) {
      console.log(`hideEmptyRows: hid ${hiddenCount} empty rows.`);
    }
  }

  function applyAll() {
    applyCollapseExpand();
    hideEmptyRows();
  }

  const debouncedApplyAll = debounce(applyAll, 150);

  applyAll();

  const observer = new MutationObserver(() => {
    debouncedApplyAll();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log('MutationObserver started on document.body.');
})();
