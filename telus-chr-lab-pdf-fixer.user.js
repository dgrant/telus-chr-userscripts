// ==UserScript==
// @name         TELUS CHR Inputhealth Lab PDF Fixer
// @namespace    github.com/dgrant/telus-chr-userscripts
// @version      1.4
// @description  Converts specific base64-encoded text in lab table cells to clickable PDF links.
// @author       David Grant <davidgrant@gmail.com> (https://github.com/dgrant)
// @match        *://*.inputhealth.com/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// ==/UserScript==
(function() {
    'use strict';

    console.log("[PDF Link Creator] Started initialization.");

    let blobUrlCount = 0;
    const activeBlobUrls = new Map();

    const cleanupOrphanedUrls = () => {
        let cleaned = 0;
        for (const [td, url] of activeBlobUrls) {
            if (!document.contains(td)) {
                URL.revokeObjectURL(url);
                activeBlobUrls.delete(td);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`[PDF Link Creator] Cleaned up ${cleaned} orphaned blob URLs. Active: ${activeBlobUrls.size}`);
        }
    };

    const processPdfLinks = () => {
        cleanupOrphanedUrls();

        const targetElements = document.querySelectorAll('td.result-value-item.abnormal-none');
        console.log(`[PDF Link Creator] Found ${targetElements.length} target elements. Active blob URLs: ${activeBlobUrls.size}`);

        targetElements.forEach((td, index) => {
            if (td.querySelector('a[target="_blank"][data-pdf-link]')) {
                return;
            }

            const textContent = td.textContent.trim();

            if (textContent.startsWith('^TEXT^PDF^Base64^')) {
                console.log(`[PDF Link Creator] Element ${index} contains PDF Base64 data. Attempting to convert.`);
                const base64Data = textContent.substring('^TEXT^PDF^Base64^'.length);
                const mimeType = 'application/pdf';

                try {
                    if (activeBlobUrls.has(td)) {
                        URL.revokeObjectURL(activeBlobUrls.get(td));
                        activeBlobUrls.delete(td);
                    }

                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: mimeType });
                    const objectUrl = URL.createObjectURL(blob);

                    activeBlobUrls.set(td, objectUrl);
                    blobUrlCount++;
                    console.log(`[PDF Link Creator] Blob URLs - created total: ${blobUrlCount}, currently active: ${activeBlobUrls.size}`);

                    const link = document.createElement('a');
                    link.href = objectUrl;

                    // Get the label from the sibling th's result-name span
                    let label = 'View PDF';
                    const row = td.closest('tr');
                    if (row) {
                        const nameSpan = row.querySelector('th.result-name-column .result-name');
                        if (nameSpan) {
                            const sectionName = nameSpan.querySelector('.section-name');
                            if (sectionName && sectionName.textContent.trim()) {
                                label = `${sectionName.textContent.trim()} (PDF)`;
                            } else {
                                const directText = Array.from(nameSpan.childNodes)
                                .filter(node => node.nodeType === Node.TEXT_NODE)
                                .map(node => node.textContent.trim())
                                .filter(Boolean)
                                .join(' ');
                                if (directText) {
                                    label = `${directText} (PDF)`;
                                }
                            }
                        }
                    }
                    link.textContent = label;

                    link.target = '_blank';
                    link.dataset.pdfLink = 'true';
                    td.innerHTML = '';
                    td.appendChild(link);
                    Object.assign(link.style, {
                        color: 'blue',
                        textDecoration: 'underline',
                        whiteSpace: 'normal'
                    });

                    console.log(`[PDF Link Creator] Successfully created PDF link for element ${index}.`);
                } catch (e) {
                    console.error(`[PDF Link Creator] Error processing element ${index}:`, td, e);
                }
            }
        });
    };

    processPdfLinks();

    let timeout;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(processPdfLinks, 300);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("[PDF Link Creator] Setup complete.");
})();
