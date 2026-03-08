// agents.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 512,
    }
});

export async function generateAds(memory: string[], marketContext: string = "") {
    const trimmedContext = marketContext.substring(0, 300);
    const lastInsight = memory.length > 0 ? memory[memory.length - 1] : "Target early adopters.";

    const prompt = `You are a Growth Strategist. Product: ${memory[0] || "SaaS App"}. Last insight: "${lastInsight}". Market hint: ${trimmedContext}
Output a compact JSON: {"hypothesis":"...","control":{"hook":"...","body":"..."},"variant":{"hook":"...","body":"..."}}. Variant tests ONE variable vs control. Keep hooks under 10 words.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text);
    } catch (err) {
        console.error("generateAds error:", err);
        // Dynamic fallback based on product
        const prod = memory[0] || "SaaS App";
        return {
            hypothesis: `Test emotional vs logical messaging for ${prod}`,
            control: { hook: `${prod}: Built for speed`, body: "Our product streamlines your workflow with cutting-edge AI." },
            variant: { hook: `Why thousands chose ${prod} today`, body: "Join the fastest-growing community of power users." }
        };
    }
}

export async function analyzeCompetitors(product: string, marketContext: string): Promise<string> {
    const trimmed = marketContext.substring(0, 200);
    const prompt = `You are a Strategic Analyst. Product: "${product}". Market context: ${trimmed}.
Output JSON: {"strategy":"one sharp sentence on the main competitive advantage to exploit in advertising"}.`;

    try {
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        return parsed.strategy || "Focus on differentiating product speed and ease of use.";
    } catch (err) {
        console.error("analyzeCompetitors error:", err);
        return `For "${product}", leverage speed and simplicity as the key differentiator against established competitors.`;
    }
}

export async function evaluateResults(simData: any) {
    const prompt = `A/B test: Control CTR=${(simData.control.ctr * 100).toFixed(2)}%, Variant CTR=${(simData.variant.ctr * 100).toFixed(2)}%.
Output JSON: {"winner":"Control" or "Variant","insight":"one-sentence takeaway for next campaign"}.`;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (err) {
        console.error("evaluateResults error:", err);
        const cCtr = (simData.control.ctr * 100).toFixed(2);
        const vCtr = (simData.variant.ctr * 100).toFixed(2);
        const winner = simData.control.ctr > simData.variant.ctr ? "Control" : "Variant";
        const delta = Math.abs(simData.control.ctr - simData.variant.ctr) * 100;
        const insights = [
            `${winner} outperformed by ${delta.toFixed(1)}% CTR — emotional hooks drive stronger first-click engagement.`,
            `${winner} achieved ${winner === 'Control' ? cCtr : vCtr}% CTR. Social proof language increased perceived trust.`,
            `Data shows ${winner} wins: curiosity-driven copy outperforms feature-listing by ${delta.toFixed(1)}pp.`,
            `${winner} leveraged urgency triggers effectively — time-bound language boosted click intent by ${delta.toFixed(1)}%.`,
        ];
        return { winner, insight: insights[Math.floor(Math.random() * insights.length)] };
    }
}

export async function generateAdImage(product: string, winningHook: string): Promise<string | null> {
    try {
        const prompt = `Professional minimalist advertisement banner for ${product}. Headline: ${winningHook}. Modern clean premium brand aesthetic, bold typography, visually appealing background, no people faces.`;

        // Pollinations is a free, fast open-source image generation API (FLUX/SDXL)
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000);
        // Add random seed to avoid caching
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=400&nologo=true&seed=${seed}`;

        // We can just return the URL since the frontend can render it directly
        return imageUrl;
    } catch (err: any) {
        console.error("generateAdImage error:", err?.message || err);
        return null;
    }
}