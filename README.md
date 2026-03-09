# AdLabs: Autonomous AI Marketing OS 🚀

**Autonomous AI-Powered Ad Optimization Platform** — Built at SatHacks 2026

AdLabs is a multi-agent system that autonomously researches markets, generates ad copy, and simulates consumer behavior to optimize marketing performance — all in real time. Instead of spending thousands on A/B testing, AdLabs lets AI write, test, and score its own ads using synthetic consumer simulations and live external data.

---

## ✨ Features

*   **🤖 Autonomous Agent Swarm:** A coordinated team of specialized AI agents:
    *   **Researcher:** Scours live market trends, competitor data, and consumer sentiment.
    *   **Analyst:** Synthesizes research into actionable competitive strategies and hypotheses.
    *   **Creator:** Designs hyper-targeted ad variants (copy and visuals) based on strategic insights using Gemini 2.0.
    *   **Evaluator:** Analyzes synthetic simulation results to declare winning variants and extract core learnings.
*   **🌐 Real-Time Market Ingestion (via Composio SDK):** Integrates seamlessly with external continuous data feeds:
    *   **HackerNews & Reddit:** Live community sentiment and trending discussions.
    *   **Google Search Console:** Live search analytics and keyword performance.
    *   **TikTok:** Viral video trends and audio signals.
    *   **Google Docs:** Custom user-provided context and brand guidelines.
*   **🧪 Synthetic A/B Testing Simulator:** Before spending a dime, AdLabs simulates ad performance against thousands of synthetic consumer profiles (built from demographic data and psychological profiles) to predict Click-Through Rates (CTR).
*   **📈 Automated Ledger & Deployment:** Automatically logs experiment results, pushes winning ad copy to Google Sheets/Docs via Composio, and pushes scaling decisions to external Fabricate APIs.
*   **💻 Interactive Streaming Dashboard:** A beautiful React-based frontend to visualize the autonomous loop, read live market signals, and review final generated ad creatives using Server-Sent Events (SSE).

---

## 🏗️ System Architecture

AdLabs operates on a continuous, multi-round autonomous loop (`server.ts`):

1.  **Context Gathering:** The Researcher uses the `composio-core` SDK to pull live data from external platforms (Reddit, TikTok, Search Console, Docs, HackerNews).
2.  **Strategy Generation:** The Analyst agent formulates a competitive battle plan using Google Gemini.
3.  **Creative Design:** The Creator agent drafts a Control and a Variant ad based on a specific testing hypothesis.
4.  **Simulation:** The `sim.ts` engine scores the generated text for psychological triggers (Urgency, Curiosity, Simplicity) and pits both ads against a synthetic audience.
5.  **Evaluation:** The Evaluator declares a winner and generates a final visual creative representation.
6.  **Action & Logging:** The system pushes the winning ad text to Google Docs/Sheets and iterates into the next round, learning from previous results.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS, Recharts (for live graphs)
*   **Backend:** Node.js, Express, TypeScript
*   **AI Models:** Google Gemini Pro (`gemini-2.0-flash`) via `@google/generative-ai`
*   **Integrations:** Composio SDK (`composio-core`) for connecting to Reddit, Google Workspace, Search Console, and TikTok.
*   **Streaming & Simulation:** Server-Sent Events (SSE) for UI streaming, Custom algorithmic consumer scoring engine (`sim.ts`)
*   **Database:** SQLite (local experiment ledger)

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   npm
*   A Google Gemini API Key
*   A Composio API Key (with authenticated connections for Reddit, G-Docs, G-Sheets, etc. via `npx composio connections`)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/meetp06/Sathacks.git
cd Sathacks/ads-os
\`\`\`

### 2. Install Dependencies
\`\`\`bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd dashboard
npm install
cd ..
\`\`\`

### 3. Environment Setup
Create a `.env` file in the root `ads-os/` directory and add the following keys:

\`\`\`env
# Core AI API 
GEMINI_API_KEY="your_gemini_api_key_here"

# Composio Auth
COMPOSIO_API_KEY="your_composio_api_key_here"
GOOGLE_DOC_ID="your_google_doc_id_for_context_and_output"
\`\`\`

### 4. Running the Application
The project is configured to run both the backend server and the Vite frontend concurrently.

\`\`\`bash
# From the ads-os root folder
npm start
\`\`\`

*   **Backend Server:** Boots up on `http://localhost:3000` (handles the agentic loop and SSE events).
*   **Frontend Dashboard:** Opens automatically at `http://localhost:5173`.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Built with ❤️ for the Sathacks 2026 hackathon.
