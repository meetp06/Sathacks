// sim.ts

// A dictionary of psychological triggers that increase Click-Through Rate
const powerPhrases = {
    urgency: ["now", "today", "limited", "fast", "instant", "quick", "seconds", "hurry"],
    exclusivity: ["exclusive", "secret", "members", "insider", "beta", "invite", "hidden"],
    authority: ["proven", "guaranteed", "certified", "expert", "best", "top", "award"],
    curiosity: ["discover", "reveal", "secret", "truth", "why", "how", "unveil"],
    simplicity: ["easy", "simple", "effortless", "magic", "automatic", "done-for-you"]
};

function scoreAdText(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;

    // Base score based on length (shorter is generally better for hooks, sweet spot ~50 chars)
    const lengthPenalty = Math.abs(lowerText.length - 50) * 0.0001;
    score -= lengthPenalty;

    // Check for power words
    for (const [category, words] of Object.entries(powerPhrases)) {
        for (const word of words) {
            if (lowerText.includes(word)) {
                // Different triggers have different weights
                if (category === 'urgency') score += 0.005;
                if (category === 'curiosity') score += 0.007;
                if (category === 'simplicity') score += 0.006;
                else score += 0.004;
            }
        }
    }

    // Question marks often increase engagement
    if (lowerText.includes('?')) score += 0.008;

    // Numbers (e.g. "10x", "5 tips") increase engagement
    if (/\d/.test(lowerText)) score += 0.012;

    return Math.max(-0.01, score); // Floor at slight penalty
}

export function runSimulation(control: any, variant: any) {
    const impressions = 10000; // Increased to 10k synthetic users

    // Base CTR floor
    const baseCtr = 0.012;

    // Dynamically calculate the algorithmic strength of each generated ad
    const controlAlgorithmicBoost = scoreAdText(control.hook);
    const variantAlgorithmicBoost = scoreAdText(variant.hook);

    // Add a tiny bit of noise to simulate real-world variance
    const noiseC = (Math.random() * 0.004) - 0.002;
    const noiseV = (Math.random() * 0.004) - 0.002;

    const controlCtr = Math.max(0.005, baseCtr + controlAlgorithmicBoost + noiseC);
    const variantCtr = Math.max(0.005, baseCtr + variantAlgorithmicBoost + noiseV);

    const controlClicks = Math.floor(impressions * controlCtr);
    const controlConversions = Math.floor(controlClicks * (0.05 + Math.random() * 0.05)); // 5-10% CVR

    const variantClicks = Math.floor(impressions * variantCtr);
    const variantConversions = Math.floor(variantClicks * (0.05 + Math.random() * 0.05));

    return {
        control: { name: "Control", impressions, clicks: controlClicks, conversions: controlConversions, ctr: controlClicks / impressions },
        variant: { name: "Variant", impressions, clicks: variantClicks, conversions: variantConversions, ctr: variantClicks / impressions }
    };
}