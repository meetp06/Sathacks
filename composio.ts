// composio.ts
import { Composio } from 'composio-core';
import dotenv from 'dotenv';
dotenv.config();

const composio_client = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY!,
});

export async function logToGoogleSheet(data: {
    round: number;
    hypothesis: string;
    controlCtr: string;
    variantCtr: string;
    winner: string;
    insight: string; 
}) {
    try {
        // Assuming you have a Google Auth already connected in your Composio dashboard
        // and a specific Google Sheet prepared. If not, this might fail unless configured
        // using Composio CLI.
        const entity = composio_client.getEntity("default");

        // We try to append a row. (This requires GOOGLESHEETS to be connected)
        // You would typically need the Spreadsheet ID and Range.
        // Since we don't know the exact spreadsheet ID, this is a speculative implementation
        // based on Composio's standard action patterns.

        // As a more resilient approach for a hackathon without a known Sheet ID, 
        // it's often easier to log to a generic webhook or a specific sheet.
        // Assuming the user has a "Ads-OS Log" sheet.

        const spreadsheetId = process.env.GOOGLE_SHEET_ID; // We'll need this in .env

        if (!spreadsheetId) {
            console.log("⚠️  GOOGLE_SHEET_ID not set in .env. Skipping Composio push.");
            return;
        }

        console.log(`🔗 Pushing ledger entry via Composio for Round ${data.round}...`);

        // This is the standard Composio action for Google Sheets appending
        // In the latest composio-core, executeAction takes an object with actionName and params
        const response = await composio_client.executeAction({
            actionName: "GOOGLESHEETS_APPEND_VALUES",
            params: {
                spreadsheetId: spreadsheetId,
                range: "Sheet1!A:F",
                valueInputOption: "USER_ENTERED",
                values: [
                    [
                        data.round.toString(),
                        data.hypothesis,
                        data.controlCtr,
                        data.variantCtr,
                        data.winner,
                        data.insight
                    ]
                ]
            }
        });
        console.log("✅ Successfully logged to Google Sheet via Composio!");
        return response;

    } catch (error: any) {
        console.log(`⚠️  Failed to log to Composio: ${error.message || "Unknown error"}`);
        // We don't throw, we handle it gracefully so the loop continues
    }
}

export async function pullMarketSignals(query: string = "AI"): Promise<string[]> {
    try {
        console.log(`🔍 [Strategist] Using Composio HackerNews to research "${query}"...`);

        // This requires the user to run `npx composio add hackernews`
        const response = await composio_client.executeAction({
            actionName: "HACKERNEWS_GET_TOP_STORIES",
            params: {}
        });

        if (response && response.data) {
            // Note: Depending on the exact HackerNews action structure, data might be an array of stories
            // We simulate extracting the title and score
            const stories = Array.isArray(response.data) ? response.data :
                (response.data as any).stories || [];

            // Return top 3 signals
            return stories.slice(0, 3).map((s: any) => `Trending Context: ${s.title || 'Unknown post'} (Score: ${s.score || 0})`);
        }
    } catch (error: any) {
        console.log(`⚠️  Composio HackerNews Auth missing: ${error.message}. Returning fallback static signals.`);
    }

    // Fallback signals so the demo still runs even if the API Key isn't configured yet
    return [
        `Trending Context: "Show HN: Students use AI to take notes 3x faster" (Score: 452)`,
        `Trending Context: "Ask HN: What productivity tools are actually worth it?" (Score: 310)`,
        `Trending Context: "Why developers are burning out on complex SaaS" (Score: 890)`
    ];
}
