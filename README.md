# 🛡️ CyberBuddy X - Next-Gen Personal Security Assistant

![CyberBuddy Dashboard](https://raw.githubusercontent.com/Mohit-K-Thanvi/CyberBuddy/main/screenshots/dashboard_preview.png)
*(Note: Replace with your own screenshot)*

**CyberBuddy X** is an advanced, AI-powered cybersecurity platform designed to protect users from modern digital threats. Unlike traditional antiviruses that rely on simple blocklists, CyberBuddy uses **Real-Time Generative AI (Llama 3)**, **Computer Vision**, and **Forensic Analysis** to "read" websites and emails like a human analyst.

---

## 🌟 Key Features

### 1. 🧠 Cognitive URL Scanner
*   **AI Analysis:** Uses **Groq (Llama 3)** to scan URLs and explain *why* a website is safe or dangerous in plain English (ELI5).
*   **Deep Inspection:** Checks Domain Age, SSL Certificates, and Hosting Reputation.
*   **Whitelisting:** Built-in Top 1M domains whitelist for instant verification.

### 2. 👁️ Visual Identity Guard
*   **Computer Vision:** Uses **Tesseract OCR + OpenCV** to scan webpage screenshots.
*   **Brand Protection:** Detects if a phishing site is visually impersonating brands like Google, PayPal, or Microsoft, even if the URL is obfuscated.

### 3. 📧 Email Forensics
*   **Header Analysis:** Detects spoofed senders (e.g., `ceo@cornpany.com` vs `ceo@company.com`).
*   **Context Awareness:** AI analyzes email body text for urgency patterns, financial requests, and social engineering triggers.

### 4. 📰 Live Threat Intelligence
*   **Global Map:** Visualizes cyber attacks in real-time.
*   **News Feed:** Aggregates breaking security news from *The Hacker News* & *BleepingComputer*.

### 5. 🌐 Chrome Extension
*   **Real-time Protection:** Brings all scanner capabilities directly into your browser via a popup.
*   **Tools:** Includes a Secure Password Generator and IP Identity Checker.

---

## 🛠️ Technology Stack (Zero-Cost "Free Tier" Architecture)

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** (React) | Modern, responsive UI with TailwindCSS & Framer Motion. |
| **Backend** | **FastAPI** (Python) | High-performance async API handling AI & Logic. |
| **AI Engine** | **Groq Cloud** (Llama 3) | Free-tier usage of state-of-the-art LLMs (300 tokens/s). |
| **Vision** | **EasyOCR / Tesseract** | Local OCR for reading text from images. |
| **Database** | **SQLite** | Lightweight, file-based database (No server needed). |
| **Deploy** | **Vercel** + **Render** | Full cloud deployment for $0/month. |

---

## 🚀 Installation & Setup

### Option 1: One-Click Run (Windows)
Simply double-click the `run_cyberbuddy.py` script provided in the root directory.

### Option 2: Manual Developer Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Mohit-K-Thanvi/CyberBuddy.git
cd CyberBuddy
```

#### 2. Setup Backend
```bash
cd backend
python -m venv venv
# Activate venv: .\venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*Note: Ensure you create a `backend/.env` file with your API Keys (GROQ_API_KEY, HF_TOKEN).*

#### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the app at `http://localhost:3000`.

---

## 🌐 Deployment Logic

### Backend (Render.com)
1.  Connect repo to Render.
2.  **Root Dir:** `backend`
3.  **Build:** `pip install -r requirements.txt`
4.  **Start:** `uvicorn main:app --host 0.0.0.0 --port 10000`

### Frontend (Vercel)
1.  Connect repo to Vercel.
2.  **Root Dir:** `frontend`
3.  **Env Var:** `NEXT_PUBLIC_API_URL` = Your Render Backend URL.

---

## 📂 Project Structure

*   `backend/` - FastAPI server, AI logic, Database models.
*   `frontend/` - Next.js application, Dashboard UI.
*   `chrome_extension/` - Browser extension source code.
*   `models/` - Local ML models (if any).
*   `tests/` - Unit and integration tests.

---

## 🏆 Credits & License

**Author:** Mohit K Thanvi
**License:** MIT
**Status:** Final Year Project (Industry Ready)
