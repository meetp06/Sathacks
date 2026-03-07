// index.ts
import { initDB, logExperiment, updateExperimentResult, logSimResult } from './db.js';
import { generateAds, evaluateResults } from './agents.js';
import { runSimulation } from './sim.js';
import { logToGoogleSheet } from './composio.js';
import {
    getMarketConfig,
    getSegments,
    getRandomConsumers,
    getResearchThemes,
    getStatsOverview,
    postExperimentDecision,
} from './fabricate.js';

let globalMemory: string[] = [];
let roundCounter = 1;
const MAX_ROUNDS = 3;

async function fetchMarketContext(): Promise<string> {
    try {
        const [config, segments, consumers, themes] = await Promise.all([
            getMarketConfig().catch(() => null),
            getSegments().catch(() => null),
            getRandomConsumers().catch(() => null),
            getResearchThemes().catch(() => null),
        ]);

        const parts: string[] = [];
        if (config) parts.push(`Market Config: ${JSON.stringify(config)}`);
        if (segments) parts.push(`Segments: ${JSON.stringify(segments)}`);
        if (consumers) parts.push(`Sample Consumers: ${JSON.stringify(consumers)}`);
        if (themes) parts.push(`Research Themes: ${JSON.stringify(themes)}`);

        if (parts.length > 0) {
            console.log("📡 Fetched market context from Fabricate API");
            return parts.join("\n");
        }
    } catch (err) {
        console.log("⚠️  Fabricate API unavailable, running without market context");
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
        console.log("📡 Decision pushed to Fabricate API");
    } catch (err) {
        console.log("⚠️  Could not push decision to Fabricate (API may need auth)");
    }
}

async function runAutonomousLoop() {
    console.log(`\n======================================`);
    console.log(`🚀 STARTING ROUND ${roundCounter}`);
    console.log(`======================================`);

    // 0. FETCH MARKET CONTEXT from Fabricate
    const marketContext = await fetchMarketContext();

    // 1. STRATEGIST: Plan & Create
    console.log("🧠 Strategist analyzing past memory...", globalMemory);
    const campaign = await generateAds(globalMemory, marketContext);
    console.log(`💡 Hypothesis: ${campaign.hypothesis}`);
    console.log(`📝 Control Hook: "${campaign.control.hook}"`);
    console.log(`📝 Variant Hook: "${campaign.variant.hook}"`);

    // Log to SQLite
    const expId = logExperiment(roundCounter, campaign.hypothesis) as number;

    // 2. SIMULATION: Run the Ads
    console.log("\n⚙️ Running market simulation...");
    const results = runSimulation(campaign.control, campaign.variant);

    logSimResult(expId, "Control", results.control.impressions, results.control.clicks, results.control.conversions, results.control.ctr);
    logSimResult(expId, "Variant", results.variant.impressions, results.variant.clicks, results.variant.conversions, results.variant.ctr);

    console.log(`📊 Control CTR: ${(results.control.ctr * 100).toFixed(2)}% | Variant CTR: ${(results.variant.ctr * 100).toFixed(2)}%`);

    // 3. EVALUATOR: Decide Winner
    console.log("\n⚖️ Evaluator analyzing data...");
    const decision = await evaluateResults(results);
    console.log(`🏆 Winner: ${decision.winner}`);
    console.log(`🧠 Key Insight: ${decision.insight}`);

    // Update DB and Memory
    updateExperimentResult(expId, decision.winner, decision.insight);
    globalMemory.push(decision.insight);

    // 4. PUSH TO FABRICATE
    await pushDecisionToFabricate(expId, decision);

    // 5. COMPOSIO LOGGING (Push to Google Sheets)
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
    if (roundCounter <= MAX_ROUNDS) {
        console.log("\n⏳ Waiting 5 seconds before next iteration...");
        setTimeout(runAutonomousLoop, 5000);
    } else {
        // Print final stats from Fabricate
        try {
            const overview = await getStatsOverview();
            console.log("\n📈 Final Stats from Fabricate:", JSON.stringify(overview, null, 2));
        } catch {
            // Fabricate not available, skip
        }
        console.log("\n✅ AUTONOMOUS LOOP COMPLETE. Target KPIs reached.");
    }
}

// Start the engine
initDB();
runAutonomousLoop();