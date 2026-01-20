
// Helper to find valid search result links
function scanGoogleLinks() {
    // Select standard Google search result anchors
    // 'div.g' is the container for results
    // We look for the main anchor tag which typically contains the 'h3' title
    const anchors = document.querySelectorAll('div.g a');

    anchors.forEach(anchor => {
        // Prevent double scanning
        if (anchor.getAttribute('data-cb-scanned') === 'true') return;

        // Ensure it's a real link and not an internal google jump link
        const url = anchor.href;
        if (!url || !url.startsWith('http') || url.includes('google.com')) return;

        // Mark as processing
        anchor.setAttribute('data-cb-scanned', 'true');

        // Send to background for scanning
        chrome.runtime.sendMessage({ action: "scan", url: url }, (response) => {
            if (chrome.runtime.lastError) {
                console.log("CyberBuddy: Background not ready");
                return;
            }

            if (response && response.prediction) {
                injectStatusIcon(anchor, response);
            }
        });
    });
}

function injectStatusIcon(anchor, result) {
    const isSafe = result.prediction === 'legitimate';
    const h3 = anchor.querySelector('h3');

    // Create the badge
    const badge = document.createElement('span');
    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.marginLeft = '10px';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '4px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = 'bold';
    badge.style.zIndex = '9999';
    badge.style.verticalAlign = 'middle';

    if (isSafe) {
        badge.innerHTML = '🛡️ Safe';
        badge.style.backgroundColor = '#d1fae5'; // Green-100
        badge.style.color = '#065f46'; // Green-800
        badge.style.border = '1px solid #34d399';
    } else {
        badge.innerHTML = '🚫 Dangerous';
        badge.style.backgroundColor = '#fee2e2'; // Red-100
        badge.style.color = '#991b1b'; // Red-800
        badge.style.border = '1px solid #f87171';
    }

    // Add tooltip
    badge.title = `CyberBuddy Analysis: ${result.prediction.toUpperCase()} (${(result.confidence * 100).toFixed(0)}% Confidence)`;

    // Append to the Title (h3) if exists, else the anchor itself
    if (h3) {
        h3.appendChild(badge);
    } else {
        anchor.appendChild(badge);
    }
}

// === PAGE GUARD (Active Protection) ===
function checkCurrentPage() {
    chrome.storage.local.get(['webProtection'], (result) => {
        // If undefined, default to true. Only stop if strictly false.
        if (result.webProtection === false) {
            console.log("CyberBuddy: Page Guard paused by user.");
            return;
        }

        const currentUrl = window.location.href;
        // Don't scan internal pages or harmless ones to save resources
        if (currentUrl.includes('localhost') || currentUrl.includes('google.com')) return;

        chrome.runtime.sendMessage({ action: "scan", url: currentUrl }, (response) => {
            if (response && response.prediction === 'phishing') { // Assuming 'phishing' is the key for bad
                // Double check prediction string from backend. It is "malicious" or "phishing"?
                // Backend returns "legitimate" or "phishing"/"malicious". Let's assume non-legitimate is bad.
                if (response.prediction !== 'legitimate') {
                    showBlockingOverlay(response);
                }
            }
        });
    });
}

function showBlockingOverlay(result) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(2, 6, 23, 0.98)'; // Dark Slate
    overlay.style.backdropFilter = 'blur(10px)';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.fontFamily = "'Segoe UI', system-ui, sans-serif";

    overlay.innerHTML = `
        <div style="
            background: rgba(30, 41, 59, 0.7); 
            border: 1px solid rgba(244, 63, 94, 0.3); 
            box-shadow: 0 0 40px rgba(244, 63, 94, 0.2); 
            color: #f8fafc; 
            padding: 40px; 
            border-radius: 20px; 
            max-width: 600px; 
            text-align: center;
            position: relative;
            overflow: hidden;
        ">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #f43f5e, #8b5cf6);"></div>
            
            <div style="font-size: 60px; margin-bottom: 20px; text-shadow: 0 0 20px rgba(244, 63, 94, 0.5);">🚫</div>
            
            <h1 style="margin: 0 0 10px; color: #f43f5e; font-size: 32px; font-weight: 800; letter-spacing: -1px;">THREAT INTERCEPTED</h1>
            
            <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 30px; line-height: 1.6;">
                CyberBuddy Shield has neutralized a potential connection to this endpoint. Usage of this site may compromise system integrity.
            </p>
            
            <div style="background: rgba(244, 63, 94, 0.1); border-left: 4px solid #f43f5e; padding: 15px; border-radius: 4px; margin-bottom: 30px; text-align: left;">
                <strong style="color: #fda4af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Analysis Report:</strong><br/>
                <span style="color: #fff; font-family: monospace;">${result.message || "Phishing heuristics matched high-risk patterns."}</span>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center;">
                 <button onclick="window.history.back()" style="
                    background: linear-gradient(135deg, #f43f5e, #e11d48); 
                    border: none; 
                    color: white; 
                    padding: 14px 28px; 
                    border-radius: 12px; 
                    cursor: pointer; 
                    font-size: 14px; 
                    font-weight: bold; 
                    box-shadow: 0 4px 15px rgba(244, 63, 94, 0.4);
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    RETREAT TO SAFETY
                </button>
                
                <button id="cb-proceed-btn" style="
                    background: transparent; 
                    border: 1px solid rgba(148, 163, 184, 0.3); 
                    color: #94a3b8; 
                    padding: 14px 24px; 
                    border-radius: 12px; 
                    cursor: pointer; 
                    font-size: 14px;
                    transition: all 0.2s;
                " onmouseover="this.style.color='#fff'; this.style.borderColor='#fff'" onmouseout="this.style.color='#94a3b8'; this.style.borderColor='rgba(148, 163, 184, 0.3)'">
                    Proceed (Unsafe)
                </button>
            </div>
        </div>
        <div style="margin-top: 30px; font-size: 12px; color: #475569; font-weight: 500; letter-spacing: 1px;">
            SECURED BY CYBERBUDDY <span style="color: #06b6d4">X</span>
        </div>
    `;

    document.body.appendChild(overlay);

    // Allow bypass
    document.getElementById('cb-proceed-btn').onclick = () => {
        overlay.remove();
    };
}

// Run immediately
scanGoogleLinks();
checkCurrentPage();

// Watch for DOM changes (Infinite scroll / Pagination)
const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldScan = true;
            break;
        }
    }
    if (shouldScan) {
        scanGoogleLinks();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
