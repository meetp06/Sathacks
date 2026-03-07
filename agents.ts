// agents.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export async function generateAds(memory: string[], marketContext: string = "") {
    const contextSection = marketContext ? `\n    Market Data: ${marketContext}` : "";
    const prompt = `You are an AI Growth Strategist. 
    Past Learnings: ${memory.length > 0 ? memory.join(" | ") : "None yet. Target university students."}${contextSection}
    
    Output a JSON object with a 'hypothesis', a 'control' ad (hook, body), and a 'variant' ad (hook, body). The variant must test ONE new variable.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
}

export async function evaluateResults(simData: any) {
    const prompt = `You are an AI Evaluator. Analyze this A/B test data: ${JSON.stringify(simData)}. 
    Determine the winner based on highest CTR.
    Output a JSON object with 'winner' ("Control" or "Variant") and 'insight' (A one-sentence rule learned from this test to use in the future).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
}