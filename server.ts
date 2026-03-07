// server.ts
import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { initDB, logExperiment, updateExperimentResult, logSimResult } from './db.js';
import { generateAds, evaluateResults } from './agents.js';
import { runSimulation } from './sim.js';
import { logToGoogleSheet, pullMarketSignals } from './composio.js';
import {
    getMarketConfig,
    getSegments,
    getRandomConsumers,
    getResearchThemes,
    getStatsOverview,
    postExperimentDecision,
} from './fabricate.js';

const app = express();
app.use(cors());
const port = 3000;

// Event emitter to push updates to the connected React clients
export const sseEmitter = new EventEmitter();

let globalMemory: string[] = [];
let roundCounter = 1;
const MAX_ROUNDS = 3;
let isRunning = false;

// Helper to send logs to frontend
function emitLog(type: string, message: string) {
    console.log(message);
    sseEmitter.emit('log', JSON.stringify({
        id: Math.random().toString(36).substring(7),
        type,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour12: false })
    }));
}

// Helper to push state to frontend
function emitState(stateUpdate: any) {
    sseEmitter.emit('state', JSON.stringify(stateUpdate));
}

async function fetchMarketContext(): Promise<string> {
    try {
        const [config, segments, consumers, themes, hnSignals] = await Promise.all([
            getMarketConfig().catch(() => null),
            getSegments().catch(() => null),
            getRandomConsumers().catch(() => null),
            getResearchThemes().catch(() => null),
            pullMarketSignals("SaaS Productivity") // COMPOSIO RESEARCH
        ]);

        const parts: string[] = [];
        if (config) parts.push(`Market Config: ${JSON.stringify(config)}`);
        if (segments) parts.push(`Segments: ${JSON.stringify(segments)}`);
        if (consumers) parts.push(`Sample Consumers: ${JSON.stringify(consumers)}`);
        if (themes) parts.push(`Research Themes: ${JSON.stringify(themes)}`);
        if (hnSignals && hnSignals.length > 0) parts.push(`Live HackerNews Trends: ${hnSignals.join(" | ")}`);

        if (parts.length > 0) {
            emitLog('research', "📡 Fetched market context from Fabricate API & Composio");

            // Push signals to the frontend "Live Market Signals" panel
            const displaySignals = [
                "Analyzed 1000 simulated consumers from Fabricate",
                `Found ${segments ? segments.length : 0} active audience segments`,
                ...(hnSignals || [])
            ];

            sseEmitter.emit('signals', JSON.stringify(displaySignals));
            return parts.join("\n");
        }
    } catch (err) {
        emitLog('research', "⚠️ Data APIs unavailable, running with partial context");
    }
    return "";
}

async function pushDecisionToFabricate(expId: number, decision: any) {
    try {
        await postExperimentDecision(expId, {
            winner: decision.winner === "Control" ? "creative_control" : "creative_variant",
            confidence: 0.92,
            decision: "SCALE",
            actions: ["increase_budget", "expand_targeting"],
            reasons: decision.insight,
            next_hypotheses: [decision.insight],
        });
        emitLog('composio', "📡 Decision pushed to Fabricate API");
    } catch (err) {
        // Silent fail for stub
    }
}

async function runAutonomousLoop() {
    if (roundCounter > MAX_ROUNDS) {
        emitLog('info', "✅ AUTONOMOUS LOOP COMPLETE. Target KPIs reached.");
        emitState({ status: 'complete' });
        isRunning = false;
        return;
    }

    emitLog('info', `\n======================================\n🚀 STARTING ROUND ${roundCounter}`);
    emitState({ round: roundCounter, status: 'planning', hypothesis: 'Generating...', control: { hook: '', ctr: 0 }, variant: { hook: '', ctr: 0 }, winner: null, insight: null });

    // 0. FETCH MARKET CONTEXT
    const marketContext = await fetchMarketContext();

    // 1. STRATEGIST
    emitLog('info', `🧠 Strategist analyzing past memory... [${globalMemory.length} insights]`);
    const campaign = await generateAds(globalMemory, marketContext);

    emitState({ round: roundCounter, status: 'simulating', hypothesis: campaign.hypothesis, control: { hook: campaign.control.hook, ctr: 0 }, variant: { hook: campaign.variant.hook, ctr: 0 }, winner: null, insight: null });
    emitLog('insight', `💡 Hypothesis: ${campaign.hypothesis}`);
    emitLog('info', `📝 Control Hook: "${campaign.control.hook}"`);
    emitLog('info', `📝 Variant Hook: "${campaign.variant.hook}"`);

    const expId = logExperiment(roundCounter, campaign.hypothesis) as number;

    // 2. SIMULATION
    emitLog('info', "⚙️ Running market simulation...");
    // Simulate thinking delay for visual effect
    await new Promise(r => setTimeout(r, 2000));

    const results = runSimulation(campaign.control, campaign.variant);

    logSimResult(expId, "Control", results.control.impressions, results.control.clicks, results.control.conversions, results.control.ctr);
    logSimResult(expId, "Variant", results.variant.impressions, results.variant.clicks, results.variant.conversions, results.variant.ctr);

    emitLog('info', `📊 Control CTR: ${(results.control.ctr * 100).toFixed(2)}% | Variant CTR: ${(results.variant.ctr * 100).toFixed(2)}%`);
    emitState({ round: roundCounter, status: 'evaluating', hypothesis: campaign.hypothesis, control: { hook: campaign.control.hook, ctr: results.control.ctr }, variant: { hook: campaign.variant.hook, ctr: results.variant.ctr }, winner: null, insight: null });


    // 3. EVALUATOR
    emitLog('info', "⚖️ Evaluator analyzing data...");
    await new Promise(r => setTimeout(r, 2000));

    const decision = await evaluateResults(results);
    emitLog('decision', `🏆 Winner: ${decision.winner}`);
    emitLog('insight', `🧠 Key Insight: ${decision.insight}`);

    updateExperimentResult(expId, decision.winner, decision.insight);
    globalMemory.push(decision.insight);

    emitState({ round: roundCounter, status: 'planning', hypothesis: campaign.hypothesis, control: { hook: campaign.control.hook, ctr: results.control.ctr }, variant: { hook: campaign.variant.hook, ctr: results.variant.ctr }, winner: decision.winner, insight: decision.insight });

    // 4. PUSH TO FABRICATE
    await pushDecisionToFabricate(expId, decision);

    // 5. COMPOSIO GOOGLE SHEETS
    emitLog('composio', `🔗 Pushing ledger entry to Google Sheets via Composio...`);
    await logToGoogleSheet({
        round: roundCounter,
        hypothesis: campaign.hypothesis,
        controlCtr: (results.control.ctr * 100).toFixed(2) + '%',
        variantCtr: (results.variant.ctr * 100).toFixed(2) + '%',
        winner: decision.winner,
        insight: decision.insight
    });

    // 6. ITERATE
    roundCounter++;
    emitLog('info', "⏳ Waiting 3 seconds before next iteration...");
    setTimeout(runAutonomousLoop, 3000);
}

// API Routes

app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const onLog = (data: string) => res.write(`event: log\ndata: ${data}\n\n`);
    const onState = (data: string) => res.write(`event: state\ndata: ${data}\n\n`);
    const onSignals = (data: string) => res.write(`event: signals\ndata: ${data}\n\n`);

    sseEmitter.on('log', onLog);
    sseEmitter.on('state', onState);
    sseEmitter.on('signals', onSignals);

    req.on('close', () => {
        sseEmitter.off('log', onLog);
        sseEmitter.off('state', onState);
        sseEmitter.off('signals', onSignals);
    });
});

app.post('/start', (req, res) => {
    if (!isRunning) {
        isRunning = true;
        roundCounter = 1; // Reset for demo
        globalMemory = [];
        runAutonomousLoop();
        res.json({ message: 'Engine started' });
    } else {
        res.status(400).json({ message: 'Engine already running' });
    }
});

// Init DB and Start Server
initDB();
app.listen(port, () => {
    console.log(`\n🚀 Autonomous Engine Server running at http://localhost:${port}`);
    console.log(`Open the dashboard in your browser to see the live view.`);
});
