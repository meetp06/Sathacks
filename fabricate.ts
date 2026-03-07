// fabricate.ts
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.FABRICATE_BASE_URL!;
const API_KEY = process.env.FABRICATE_API_KEY!;

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
};

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        throw new Error(`Fabricate API error [${res.status}]: ${await res.text()}`);
    }
    return res.json();
}

// ── Read Endpoints ──

export async function getStatsOverview() {
    return fetchAPI('/stats/overview');
}

export async function getMarketConfig() {
    return fetchAPI('/market-config');
}

export async function getExperiments() {
    return fetchAPI('/experiments');
}

export async function getExperiment(id: string | number) {
    return fetchAPI(`/experiments/${id}`);
}

export async function getExperimentResults(id: string | number) {
    return fetchAPI(`/experiments/${id}/results`);
}

export async function getCreatives() {
    return fetchAPI('/creatives');
}

export async function getConsumers() {
    return fetchAPI('/consumers');
}

export async function getRandomConsumers() {
    return fetchAPI('/consumers/random');
}

export async function getSegments() {
    return fetchAPI('/segments');
}

export async function getSegmentConsumers(id: string | number) {
    return fetchAPI(`/segments/${id}/consumers`);
}

export async function getResearchThemes() {
    return fetchAPI('/research-themes');
}

export async function getResultsSummary() {
    return fetchAPI('/results/summary');
}

export async function getCreativePerformance() {
    return fetchAPI('/results/creative-performance');
}

export async function getDailyPerformance() {
    return fetchAPI('/results/daily-performance');
}

// ── Write Endpoints ──

export async function postExperimentDecision(id: string | number, decision: {
    winner: string;
    confidence: number;
    decision: string;
    actions: string[];
    reasons: string;
    next_hypotheses: string[];
}) {
    return fetchAPI(`/experiments/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify(decision),
    });
}
