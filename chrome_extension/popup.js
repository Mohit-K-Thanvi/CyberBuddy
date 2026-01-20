// Tab Switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.getAttribute('data-tab');

        // Buttons
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Helper to clear results on switch
        const resDiv = document.getElementById("result");
        if (resDiv) resDiv.innerHTML = "";

        // Panels
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    });
});

const urlDiv = document.getElementById("url-display");
const resultDiv = document.getElementById("result");
const scanBtn = document.getElementById("scanBtn");

// Settings Elements
const toggleProtection = document.getElementById('toggle-web-protection');
const toggleNotifications = document.getElementById('toggle-notifications');
const toggleSharing = document.getElementById('toggle-sharing');

// Auth Elements
const authBtn = document.getElementById('auth-btn');
const loginOverlay = document.getElementById('login-overlay');
const closeLoginBtn = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

// --- INIT SETTINGS & AUTH ---
chrome.storage.local.get(['webProtection', 'notifications', 'dataSharing', 'token', 'user'], (result) => {
    const isProtected = result.webProtection !== false;
    if (toggleProtection) toggleProtection.checked = isProtected;
    if (toggleNotifications) toggleNotifications.checked = result.notifications !== false;
    if (toggleSharing) toggleSharing.checked = result.dataSharing === true;
    updateAuthUI(result.token);
    updateProtectionStatusUI(isProtected);
});

if (toggleProtection) {
    toggleProtection.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ webProtection: isEnabled });
        updateProtectionStatusUI(isEnabled);
    });
}

if (toggleNotifications) toggleNotifications.addEventListener('change', (e) => chrome.storage.local.set({ notifications: e.target.checked }));
if (toggleSharing) toggleSharing.addEventListener('change', (e) => chrome.storage.local.set({ dataSharing: e.target.checked }));

function updateProtectionStatusUI(isEnabled) {
    const statusDiv = document.querySelector('#protection h3');
    const p = document.querySelector('#protection p');
    const icon = document.querySelector('#protection div[style*="font-size:48px"]');
    if (!statusDiv) return;

    if (isEnabled) {
        statusDiv.innerText = 'System Secure';
        statusDiv.style.color = '#fff';
        p.innerText = 'Real-time heuristics enabled';
        if (icon) icon.innerText = '🛡️';
    } else {
        statusDiv.innerText = 'Protection Paused';
        statusDiv.style.color = '#ef4444';
        p.innerText = 'You are vulnerable to threats';
        if (icon) icon.innerText = '⚠️';
    }
}



// --- AUTH LOGIC ---
function updateAuthUI(token) {
    if (token) {
        authBtn.textContent = "LOGOUT";
        authBtn.style.color = "#f43f5e";
        authBtn.style.borderColor = "rgba(244, 63, 94, 0.3)";
    } else {
        authBtn.textContent = "LOGIN";
        authBtn.style.color = "#06b6d4";
        authBtn.style.borderColor = "rgba(255, 255, 255, 0.1)";
    }
}

authBtn.onclick = () => {
    if (authBtn.textContent === "LOGOUT") {
        // Logout
        chrome.storage.local.remove(['token', 'user'], () => {
            updateAuthUI(null);
        });
    } else {
        // Open Login
        loginOverlay.classList.add('active');
    }
};

closeLoginBtn.onclick = () => {
    loginOverlay.classList.remove('active');
    loginError.style.display = 'none';
};

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    loginError.style.display = 'none';
    const submitBtn = loginForm.querySelector('button');
    submitBtn.textContent = "AUTHENTICATING...";
    submitBtn.disabled = true;

    try {
        const res = await fetch('http://127.0.0.1:8000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        // Save Token
        chrome.storage.local.set({ token: data.token, user: email }, () => {
            updateAuthUI(data.token);
            loginOverlay.classList.remove('active');
            // triggering refetch of user details could be here
        });

    } catch (err) {
        loginError.innerText = err.message;
        loginError.style.display = 'block';
    } finally {
        submitBtn.textContent = "ESTABLISH CONNECTION";
        submitBtn.disabled = false;
    }
};


// --- URL SCANNER ---
let currentUrl = "";

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
        currentUrl = tabs[0].url;
        urlDiv.textContent = currentUrl;
    } else {
        urlDiv.textContent = "Unknown URL";
    }
});

scanBtn.onclick = async () => {
    if (!currentUrl.startsWith("http")) return;

    scanBtn.disabled = true;
    scanBtn.textContent = "Scanning...";
    resultDiv.innerHTML = "";

    // Get Token for Auth
    chrome.storage.local.get(['token'], async (result) => {
        const headers = { "Content-Type": "application/json" };
        if (result.token) {
            headers['Authorization'] = `Bearer ${result.token}`;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/scan/input", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ url: currentUrl, source: "extension" })
            });

            if (!res.ok) throw new Error("Server Error");
            const data = await res.json();
            const isSafe = data.prediction === 'legitimate';

            if (isSafe && window.confetti) {
                window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#22d3ee', '#34d399'] });
            }

            const color = isSafe ? '#10b981' : '#ef4444';
            const statusText = isSafe ? 'SAFE' : 'THREAT';

            resultDiv.innerHTML = `
                <div style="padding:12px; border-radius:8px; border:1px solid ${color}; background:${color}10;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; color:${color}; font-size:16px;">${statusText}</h3>
                        <span style="font-size:24px;">${isSafe ? '🛡️' : '🚨'}</span>
                    </div>
                    
                    <!-- AI AGENT SECTION -->
                    <div style="margin-top:12px; background:rgba(0,0,0,0.2); border-left:3px solid ${color}; padding:8px; border-radius:0 8px 8px 0;">
                        <div style="font-size:10px; font-weight:bold; color:var(--primary); margin-bottom:4px; text-transform:uppercase;">
                            🤖 CyberBuddy AI Insight
                        </div>
                        <div style="font-size:12px; color:#e2e8f0; line-height:1.4; font-style:italic;">
                            "${data.explanation || "I've analyzed this site and it appears consistent with known safe patterns."}"
                        </div>
                    </div>

                    <!-- TECH SPECS -->
                    <div style="margin-top:12px; font-size:11px; color:#94a3b8; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Confidence:</span> <b>${(data.confidence * 100).toFixed(0)}%</b>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Host/ISP:</span> <b>${data.asn || "Hidden"}</b>
                        </div>
                         <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>IP Address:</span> <b>${data.ip_address || "Hidden"}</b>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Location:</span> <b>${data.server_location || "Cloud"}</b>
                        </div>
                         <div style="display:flex; justify-content:space-between;">
                            <span>Domain Age:</span> <b>${data.domain_age || "Unknown"}</b>
                        </div>
                    </div>
                </div>
            `;

        } catch (err) {
            resultDiv.innerHTML = `
                <div style="color:#ef4444; font-size:12px; text-align:center; padding:10px; border:1px dashed #ef4444; border-radius:8px;">
                    <b>Connection Failed</b><br>
                    Please double-click <br><code>START_CYBERBUDDY.bat</code><br> on your computer
                </div>`;
        } finally {
            scanBtn.disabled = false;
            scanBtn.textContent = "SCAN NOW";
        }
    });
};

// --- CYBER TOOLS ---
// 1. Password Generator
const genLen = document.getElementById('gen-len');
const lenVal = document.getElementById('len-val');
const genSym = document.getElementById('gen-sym');
const btnGen = document.getElementById('btn-gen');
const btnCopy = document.getElementById('btn-copy');
const genOut = document.getElementById('gen-out');

if (genLen) {
    genLen.addEventListener('input', (e) => {
        lenVal.textContent = e.target.value;
    });

    btnGen.onclick = () => {
        const len = parseInt(genLen.value);
        const useSym = genSym.checked;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const syms = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        let alphabet = chars;
        if (useSym) alphabet += syms;

        let pass = "";
        // Ensure at least one number and one symbol if selected
        pass += "A"; pass += "a"; pass += "9";
        if (useSym) pass += "#";

        while (pass.length < len) {
            pass += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }

        // Shuffle
        pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
        genOut.value = pass;
    };

    btnCopy.onclick = () => {
        if (!genOut.value) return;
        navigator.clipboard.writeText(genOut.value);
        const original = btnCopy.innerText;
        btnCopy.innerText = "✅";
        setTimeout(() => btnCopy.innerText = original, 1000);
    };
}

// 2. IP Fetcher
function fetchIP() {
    const ipDiv = document.getElementById('my-ip');
    if (!ipDiv) return;

    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            ipDiv.textContent = data.ip;
        })
        .catch(() => {
            ipDiv.textContent = "Unavailable";
            ipDiv.style.color = "#ef4444";
        });
}

// Trigger IP fetch when Tools tab is clicked
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        if (e.currentTarget.getAttribute('data-tab') === 'tools') {
            fetchIP();
        }
    });
});
