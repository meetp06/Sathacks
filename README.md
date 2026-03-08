# AdsGency AI

**Autonomous AI-Powered Ad Optimization Platform** — Built at SatHacks

AdsGency AI is a multi-agent system that autonomously researches markets, generates ad copy, and simulates consumer behavior to optimize marketing performance — all in real time. Instead of spending thousands on A/B testing, AdsGency lets AI write, test, and score its own ads using synthetic consumer simulations.

---

## How It Works

The platform runs an autonomous growth loop powered by four specialized AI agents that execute sequentially and stream their progress to a live dashboard.

### 1. Input (React Dashboard)

The user enters a product name (e.g., "Developer IDE") into the frontend and kicks off a cycle. The React dashboard sends a POST request to the Node.js backend with the product details.

### 2. Multi-Agent Growth Loop

Once the backend receives the product, it spins up four AI agents in sequence:

| Agent | Role | What It Does |
|-------|------|-------------|
| **Market Researcher** | Live market intelligence | Uses the Composio API to pull trending signals (HackerNews data, competitor analysis) and simulates scanning 500+ products in the niche |
| **Strategic Analyst** | Strategy formulation | Analyzes the research data alongside its own past memory to identify winning marketing strategies for the product category |
| **Creative Engine** | Ad copy generation | Takes the analyst's strategy and uses Google Gemini to write two distinct ads — a "Control" and a mutated "Variant" — each testing a specific hypothesis |
| **Consumer Simulator** | Algorithmic ad testing | Parses the generated ad text and scores it against psychological triggers (Urgency, Curiosity, Simplicity, etc.) to simulate how thousands of synthetic users would react. Outputs simulated CTR, CPA, and ROAS |

### 3. Real-Time Streaming (SSE)

Instead of waiting for the full loop to complete, the backend uses **Server-Sent Events (SSE)** to stream each agent's internal thoughts, decisions, and data back to the frontend as they happen.

### 4. Live Dashboard

The React frontend listens to the SSE stream and renders results in real time:
- Plots winning CPA and CTR onto interactive Recharts graphs
- Updates neural text logs with agent reasoning
- Flashes active agent status icons as each phase completes

**The result:** a closed, autonomous loop where AI researches → AI writes copy → AI tests its own copy → streams results to the user.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Dashboard                       │
│           (Product Input → Live Graphs/Logs)            │
└──────────────┬──────────────────────▲────────────────────┘
               │ POST /run            │ SSE Stream
               ▼                      │
┌──────────────────────────────────────────────────────────┐
│                    server.ts (Node.js)                    │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ agents.ts    │───▶│ composio.ts  │  Composio API      │
│  │              │    └──────────────┘                     │
│  │  Agent 1: Market Researcher                           │
│  │  Agent 2: Strategic Analyst                           │
│  │  Agent 3: Creative Engine ──────▶ Google Gemini       │
│  │  Agent 4: Consumer Simulator ──▶ sim.ts               │
│  └──────────────┘                                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ db.ts        │    │ fabricate.ts │                     │
│  │ (Data Store) │    │ (Data Gen)   │                     │
│  └──────────────┘    └──────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

- **Frontend:** React, Recharts, CSS
- **Backend:** Node.js, TypeScript, Express
- **AI/LLM:** Google Gemini
- **Integrations:** Composio API (market research tooling)
- **Streaming:** Server-Sent Events (SSE)
- **Simulation:** Custom algorithmic consumer scoring engine (`sim.ts`)

---

## Project Structure

```
Sathacks/
├── dashboard/          # React frontend (live dashboard UI)
├── agents.ts           # Multi-agent orchestration logic
├── composio.ts         # Composio API integration for market research
├── db.ts               # Data storage layer
├── fabricate.ts         # Data generation utilities
├── index.ts            # Application entry point
├── server.ts           # Express server with SSE streaming
├── sim.ts              # Consumer simulation & psychological scoring engine
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
git clone https://github.com/meetp06/Sathacks.git
cd Sathacks
npm install
```

### Running the App

```bash
# Start the backend server
npx ts-node server.ts

# In a separate terminal, start the dashboard
cd dashboard
npm install
npm start
```

---

## How the Consumer Simulation Works

The simulation engine (`sim.ts`) doesn't just randomly score ads. It parses the exact words generated by Gemini and evaluates them against weighted psychological triggers:

- **Urgency** — Does the copy create time pressure?
- **Curiosity** — Does it provoke a need to know more?
- **Simplicity** — Is the message clear and digestible?

These scores are aggregated across thousands of synthetic consumer profiles to produce realistic:
- **CTR** (Click-Through Rate)
- **CPA** (Cost Per Acquisition)
- **ROAS** (Return on Ad Spend)

---

## Team

Built at **SatHacks** hackathon.

---

## License

This project was built for a hackathon and is open for educational and demonstration purposes.
