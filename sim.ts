// sim.ts
export function runSimulation(control: any, variant: any) {
    const impressions = 1000;
    
    // Simulate Control Performance (Baseline ~2% CTR)
    const controlClicks = Math.floor(impressions * (0.015 + Math.random() * 0.01));
    const controlConversions = Math.floor(controlClicks * 0.1); 

    // Simulate Variant Performance (Impacted by a hidden variable, e.g., if it uses "speed" it gets a boost)
    let variantBoost = 0;
    if (variant.hook.toLowerCase().includes("fast") || variant.hook.toLowerCase().includes("speed")) {
        variantBoost = 0.015; // 1.5% CTR boost for speed messaging
    }
    
    const variantClicks = Math.floor(impressions * (0.015 + variantBoost + Math.random() * 0.01));
    const variantConversions = Math.floor(variantClicks * 0.12);

    return {
        control: { name: "Control", impressions, clicks: controlClicks, conversions: controlConversions, ctr: controlClicks / impressions },
        variant: { name: "Variant", impressions, clicks: variantClicks, conversions: variantConversions, ctr: variantClicks / impressions }
    };
}