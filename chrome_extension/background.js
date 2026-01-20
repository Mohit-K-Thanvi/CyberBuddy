chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        chrome.storage.local.set({ currentUrl: tab.url });
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scan") {

        // Fetch token first
        chrome.storage.local.get(['token'], (result) => {
            const headers = { "Content-Type": "application/json" };
            if (result.token) {
                headers['Authorization'] = `Bearer ${result.token}`;
            }

            fetch("http://127.0.0.1:8000/scan/input", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ url: request.url, source: "google_search" })
            })
                .then(res => res.json())
                .then(data => {
                    sendResponse(data);
                })
                .catch(err => {
                    console.error("Scan failed:", err);
                    sendResponse({ error: "Scan failed" });
                });
        });

        return true; // Indicates we will respond asynchronously
    }
});
