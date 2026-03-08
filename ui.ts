import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Activity, Brain, Database, MessageSquare,
    CheckCircle, Search, BarChart3, Zap, Target,
    RefreshCw, Cpu, Network, Sparkles, Fingerprint, Coins,
    ArrowRight, Layers, Power, XCircle, ChevronDown, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';

// --- HACKATHON SCENARIO ENGINE (TRACK 1 & 2) ---
const SCENARIOS = [
    {
        segment: "College Students",
        themes: [{ theme: "Desperate for faster note-taking before finals", confidence: 0.92 }],
        evolution: {
            mutationType: "Pain-Point Amplification",
            control: "Your AI study assistant.",
            variant: "Take notes 3x faster before your next final.",
            fitnessScore: 88
        },
        sim_results: { impressions: 1250, ctr: 0.084, cpa: 3.79, spend: 145.50, roas: 1.8, cvr: 0.022, feedback: "High resonance with 'finals' keyword. Ad fatigue reset." },
        decision: { action: "SCALE", winner: "Variant A (Pain Hook)", reason: "Outperformed control CTR by 45%. Budget reallocated." }
    },
    {
        segment: "Software Developers",
        themes: [{ theme: "Tool fatigue, hate writing boilerplate", confidence: 0.89 }],
        evolution: {
            mutationType: "Feature-to-Outcome Shift",
            control: "Take notes 3x faster.",
            variant: "Automate your boilerplate and log off early.",
            fitnessScore: 94
        },
        sim_results: { impressions: 2100, ctr: 0.125, cpa: 1.54, spend: 210.00, roas: 3.2, cvr: 0.045, feedback: "Segment showed high novelty-seeking behavior for 'automation'." },
        decision: { action: "PIVOT & SCALE", winner: "Variant B (Automation)", reason: "Massive CTR lift (+48%). CPA dropped by $2.25." }
    },
    {
        segment: "Startup Founders",
        themes: [{ theme: "Require ROI proof, ignore fluffy features", confidence: 0.96 }],
        evolution: {
            mutationType: "Risk-Reversal Guarantee",
            control: "Automate your boilerplate.",
            variant: "Save 10 hours a week or your money back.",
            fitnessScore: 98
        },
        sim_results: { impressions: 3400, ctr: 0.155, cpa: 0.94, spend: 320.00, roas: 5.4, cvr: 0.081, feedback: "Segment trust established. High conversion on guarantee." },
        decision: { action: "LOCK STRATEGY", winner: "Variant C (ROI Guarantee)", reason: "CPA goal of <$1.00 achieved. Winning formula locked." }
    },
    {
        segment: "E-commerce Brands",
        themes: [{ theme: "High ad spend, poor conversion rates", confidence: 0.94 }],
        evolution: {
            mutationType: "Aggressive Fear-Appeal",
            control: "Boost your conversions today.",
            variant: "Your competitors are stealing your sales. Stop the bleeding.",
            fitnessScore: 65
        },
        sim_results: { impressions: 4100, ctr: 0.042, cpa: 12.50, spend: 450.00, roas: 0.4, cvr: 0.008, feedback: "Segment repelled by overly negative tone. Brand safety flags triggered." },
        decision: { action: "KILL CAMPAIGN", winner: "Control (Boost Conversions)", reason: "Variant CTR dropped 50%. CPA unacceptable. Reverting to control." }
    }
];

export default function AutonomousGlassOS() {
    const [systemState, setSystemState] = useState('IDLE'); // IDLE, RUNNING, COMPLETE
    const [currentRound, setCurrentRound] = useState(1);
    const [activeAgent, setActiveAgent] = useState(null);
    const [agentStatuses, setAgentStatuses] = useState({});
    const [logs, setLogs] = useState([]);
    const [data, setData] = useState(null);
    const [chartData, setChartData] = useState([{ name: 'Base', segment: 'Control', ctr: 2.1, cpa: 6.5 }]);

    const [isAutoPilot, setIsAutoPilot] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState('AUTO');

    const [telemetry, setTelemetry] = useState({ tokens: 1240, latency: 45 });
    const [budget, setBudget] = useState(15000.00);
    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }, [logs]);

    useEffect(() => {
        if (systemState === 'COMPLETE' && isAutoPilot && budget > 0) {
            const timer = setTimeout(() => {
                runAutonomousLoop();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [systemState, isAutoPilot, budget]);

    useEffect(() => {
        let interval;
        if (systemState === 'RUNNING') {
            interval = setInterval(() => {
                setTelemetry(prev => ({
                    tokens: prev.tokens + Math.floor(Math.random() * 80) + 20,
                    latency: Math.floor(Math.random() * 40) + 15
                }));
                setBudget(prev => Math.max(0, prev - (Math.random() * 12 + 4)));
            }, 300);
        }
        return () => clearInterval(interval);
    }, [systemState]);

    const runAutonomousLoop = async () => {
        if (systemState === 'RUNNING') return;
        setSystemState('RUNNING');
        setLogs([]);
        setData(null);

        let scenarioIndex = (currentRound - 1) % SCENARIOS.length;
        if (selectedSegment !== 'AUTO') {
            scenarioIndex = SCENARIOS.findIndex(s => s.segment === selectedSegment);
        }

        const baseScenario = SCENARIOS[scenarioIndex];
        const targetSegment = baseScenario.segment;

        const steps = [
            { agent: 'STRATEGIST', time: 500, log: `Scanning social signals for [${targetSegment}]...` },
            { agent: 'STRATEGIST', time: 2000, log: `Theme extracted: Core pain-points identified.` },
            { agent: 'CREATOR', time: 3500, log: "Applying Evolutionary Mutation to ad copy..." },
            { agent: 'CREATOR', time: 5000, log: "Fitness score calculated. Deploying to Sandbox." },
            { agent: 'SIMULATOR', time: 6500, log: `Booting synthetic consumer agents...` },
            { agent: 'SIMULATOR', time: 8000, log: "Running impression auction. Calculating fatigue penalties..." },
            { agent: 'EVALUATOR', time: 9500, log: "Analyzing statistical significance. Guardrails checked." },
            { agent: 'SYSTEM', time: 11000, log: `Cycle complete. Insights ready.` }
        ];

        for (let i = 0; i < steps.length; i++) {
            setTimeout(() => {
                setActiveAgent(steps[i].agent);
                setAgentStatuses(prev => ({ ...prev, [steps[i].agent]: steps[i].log }));
                setLogs(prev => [...prev, { agent: steps[i].agent, text: steps[i].log }]);
            }, steps[i].time);
        }

        setTimeout(() => {
            const ctrJitter = (Math.random() * 0.03) - 0.015;
            const cpaJitter = (Math.random() * 0.6) - 0.3;
            const roasJitter = (Math.random() * 0.4) - 0.2;
            const cvrJitter = (Math.random() * 0.01) - 0.005;

            const finalCtr = Math.max(0.01, baseScenario.sim_results.ctr + ctrJitter);
            const finalCpa = Math.max(0.5, baseScenario.sim_results.cpa + cpaJitter);
            const finalRoas = Math.max(0.1, baseScenario.sim_results.roas + roasJitter);
            const finalCvr = Math.max(0.001, baseScenario.sim_results.cvr + cvrJitter);

            const roundData = {
                round_number: currentRound,
                ...baseScenario,
                sim_results: {
                    ...baseScenario.sim_results,
                    ctr: finalCtr,
                    cpa: finalCpa,
                    roas: finalRoas,
                    cvr: finalCvr
                }
            };
            setData(roundData);

            setChartData(prev => [
                ...prev,
                {
                    name: `R${currentRound}`,
                    segment: targetSegment,
                    ctr: parseFloat((finalCtr * 100).toFixed(1)),
                    cpa: parseFloat(finalCpa.toFixed(2))
                }
            ].slice(-10));

            setSystemState('COMPLETE');
            setActiveAgent(null);
            setAgentStatuses({});
            setCurrentRound(prev => prev + 1);
        }, 11500);
    };

    const glassPanel = "bg-[#b8a792]/95 backdrop-blur-3xl border border-white/40 shadow-xl rounded-[32px] p-6 text-slate-800";
    const innerGlass = "bg-white/30 backdrop-blur-md border border-white/30 shadow-sm rounded-2xl p-4";

    return (
        <div 
      className= "min-h-screen font-sans p-4 md:p-8 flex flex-col gap-6 selection:bg-black/10"
    style = {{
        backgroundColor: '#866a4f',
            backgroundImage: `
          radial-gradient(circle at 50% 20%, #a18567 0%, #664d34 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.35'/%3E%3C/svg%3E")
        `
    }
}
    >
    <header className={ `${glassPanel} !p-4 !rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-4` }>
        <div className="flex items-center gap-4" >
            <div className="w-12 h-12 rounded-2xl bg-white border border-white/80 flex items-center justify-center shadow-sm" >
                <Sparkles className="text-slate-800" size = { 24} />
                    </div>
                    < div >
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2" >
                        AdLabs
                        < span className = "text-[10px] font-bold uppercase tracking-widest bg-black/5 text-slate-700 px-2 py-1 rounded-full border border-black/5" > Track 1 & 2 </span>
                            </h1>
                            < p className = "text-slate-500 font-medium text-xs flex items-center gap-2" >
                                Autonomous Growth Engine < span className = "w-1 h-1 rounded-full bg-slate-400" > </span> Live Prototype
                                    </p>
                                    </div>
                                    </div>

                                    < div className = "flex flex-wrap items-center gap-3" >
                                        <div className={ `${innerGlass} !py-2 !px-4 hidden xl:flex items-center gap-4 text-xs font-bold text-slate-700` }>
                                            <span className="flex items-center gap-1.5" > <Coins size={ 14 } className = "text-amber-500" /> ${ budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } </span>
                                                < div className = "w-[1px] h-4 bg-black/10" > </div>
                                                    < span className = "flex items-center gap-1.5" > <Cpu size={ 14 } className = "text-blue-500" /> { telemetry.tokens } t / s </span>
                                                        < div className = "w-[1px] h-4 bg-black/10" > </div>
                                                            < span className = "flex items-center gap-1.5" > <Activity size={ 14 } className = "text-emerald-500" /> { telemetry.latency }ms </span>
                                                                </div>

                                                                < div className = "relative" >
                                                                    <select
              value={ selectedSegment }
onChange = {(e) => setSelectedSegment(e.target.value)}
disabled = { systemState === 'RUNNING'}
className = "appearance-none bg-white/40 border border-white/60 text-slate-700 text-sm font-bold py-3 pl-4 pr-10 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-50 transition-all cursor-pointer"
    >
    <option value="AUTO" > Auto - Cycle Targets </option>
{ SCENARIOS.map(s => <option key={ s.segment } value = { s.segment } > { s.segment } </option>) }
</select>
    < ChevronDown size = { 16} className = "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        < button
onClick = {() => setIsAutoPilot(!isAutoPilot)}
className = {`px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all border shadow-sm ${isAutoPilot ? 'bg-emerald-500/20 text-emerald-800 border-emerald-500/40 shadow-emerald-500/20' : 'bg-white/40 text-slate-700 border-white/60 hover:bg-white/60'}`}
          >
    <Power size={ 18 } className = { isAutoPilot? 'text-emerald-600 animate-pulse': 'text-slate-500' } />
        Auto - Pilot
        </button>

        < button
onClick = { runAutonomousLoop }
disabled = { systemState === 'RUNNING' || isAutoPilot}
className = "bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900/50 disabled:text-white/50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md disabled:shadow-none"
    >
    { systemState === 'RUNNING' ? <RefreshCw className="animate-spin" size = { 18} /> : (currentRound > 1 ? <RefreshCw size= { 18} /> : <Play size={ 18 } />)}
{ systemState === 'RUNNING' ? 'Simulating...' : `Run Cycle ${currentRound}` }
</button>
    </div>
    </header>

    < div className = "grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1" >
        <div className="lg:col-span-4 flex flex-col gap-6" >
            <div className={ `${glassPanel} relative overflow-hidden` }>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/40 rounded-full blur-3xl" > </div>
                    < h2 className = "text-xs font-bold text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2" >
                        <Network size={ 16 } className = "text-slate-600" /> Active Agents
                            </h2>

                            < div className = "flex flex-col gap-4 relative" >
                                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-black/10 to-transparent z-0" > </div>

{
    [
        { id: 'STRATEGIST', name: 'Strategist', icon: Search, color: 'text-violet-600', bg: 'bg-violet-100', border: 'border-violet-200' },
        { id: 'CREATOR', name: 'Creative Evolution', icon: Fingerprint, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' },
        { id: 'SIMULATOR', name: 'Market Simulator', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
        { id: 'EVALUATOR', name: 'Decision Engine', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' }
    ].map((agent, i) => (
        <div key= { agent.id } className = {`relative z-10 flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 ${activeAgent === agent.id ? 'bg-white shadow-md scale-[1.02] border border-white/80' : 'bg-transparent'}`}>
            <div className={ `w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${activeAgent === agent.id ? `${agent.bg} ${agent.color} ${agent.border} border animate-pulse` : 'bg-black/5 text-slate-500 border border-black/5'}` }>
                <agent.icon size={ 20 } />
                    </div>
                    < div className = "flex-1 min-w-0" >
                        <div className={ `font-bold text-sm ${activeAgent === agent.id ? 'text-slate-900' : 'text-slate-600'}` }> { agent.name } </div>
                            < div className = {`text-[10px] truncate transition-all duration-300 ${activeAgent === agent.id ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                                { agentStatuses[agent.id] || `Node ${i + 1} • Online` }
                                </div>
                                </div>
                                </div>
              ))}
</div>
    </div>

    < div className = "bg-gradient-to-b from-[#b8a792]/95 to-[#a89682]/95 backdrop-blur-2xl border border-white/40 shadow-xl rounded-[32px] p-6 flex-1 flex flex-col min-h-[250px] relative overflow-hidden" >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" > </div>
            < div className = "absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" > </div>

                < div className = "flex justify-between items-center mb-4 relative z-10" >
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2" >
                        <Brain size={ 16 } className = "text-slate-700" /> Neural Logs
                            </h2>
                            </div>
                            < div ref = { terminalRef } className = "flex-1 overflow-y-auto font-mono text-[11px] space-y-3 pr-2 custom-scrollbar relative z-10" >
                                { logs.length === 0 && <span className="text-slate-600 italic font-medium"> Awaiting simulation trigger...</span> }
{
    logs.map((log, i) => (
        <div key= { i } className = "flex gap-3 leading-relaxed animate-in fade-in slide-in-from-left-2" >
        <span className="font-bold text-slate-950 shrink-0 w-[80px]" > { log.agent } </span>
    < span className = "text-slate-800 font-medium" > { log.text } </span>
    </div>
    ))
}
{
    systemState === 'RUNNING' && (
        <div className="flex gap-3 animate-pulse" >
            <span className="text-slate-600 w-[80px] font-bold" > SYS </span>
                < span className = "text-slate-600 font-medium" > Processing...</span>
                    </div>
              )
}
</div>
    </div>
    </div>

    < div className = "lg:col-span-8 flex flex-col gap-6" >
        {!data ? (
            <div className= {`${glassPanel} flex-1 flex items-center justify-center flex-col gap-6`}>
                <div className="relative" >
                    <div className="absolute inset-0 bg-white blur-3xl rounded-full opacity-40 animate-pulse" > </div>
                        < Layers size = { 64} className = "text-slate-400 relative z-10 opacity-50" />
                            </div>
                            < p className = "font-medium text-slate-700 tracking-wide" > Press "Run Cycle" to generate AI insights.</p>
                                </div>
          ) : (
    <div className= "space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col relative" >
    { systemState === 'RUNNING' && (
        <div className="absolute inset-0 z-50 bg-[#b8a792]/30 backdrop-blur-sm rounded-[32px] flex items-center justify-center border border-white/30 overflow-hidden animate-in fade-in duration-500" >
            <div className="absolute left-0 w-full h-[2px] bg-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" > </div>
                < div className = "bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-white" >
                    <Loader2 size={ 18 } className = "text-blue-600 animate-spin" />
                        <span className="font-bold text-slate-800 text-sm tracking-wide" > Synthesizing Market Data...</span>
                            </div>
                            </div>
              )}

<div className={ `${glassPanel} !pb-2 h-64 shrink-0` }>
    <div className="flex justify-between items-center mb-2" >
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2" >
            <BarChart3 size={ 16 } className = "text-slate-600" /> Optimization Trajectory(CTR vs CPA)
                </h2>
                </div>
                < ResponsiveContainer width = "100%" height = "100%" >
                    <ComposedChart data={ chartData } margin = {{ top: 10, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                        <linearGradient id="colorCtr" x1 = "0" y1 = "0" x2 = "0" y2 = "1" >
                            <stop offset="5%" stopColor = "#1e3a8a" stopOpacity = { 0.5} />
                                <stop offset="95%" stopColor = "#1e3a8a" stopOpacity = { 0} />
                                    </linearGradient>
                                    </defs>
                                    < XAxis dataKey = "name" stroke = "#94a3b8" fontSize = { 10} tickLine = { false} axisLine = { false} />
                                        <YAxis yAxisId="left" stroke = "#1e3a8a" fontSize = { 10} tickLine = { false} axisLine = { false} tickFormatter = {(val) => `${val}%`} />
                                            < YAxis yAxisId = "right" orientation = "right" stroke = "#000000" fontSize = { 10} tickLine = { false} axisLine = { false} tickFormatter = {(val) => `$${val}`} />
                                                < Tooltip
contentStyle = {{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
itemStyle = {{ color: '#0f172a', fontWeight: 'bold' }}
labelStyle = {{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
formatter = {(value, name) => [
    name === 'CTR (%)' ? `${value}%` : `$${value}`,
    name
]}
labelFormatter = {(label, payload) => {
    if (payload && payload.length > 0) return `${label} • ${payload[0].payload.segment}`;
    return label;
}}
                    />
    < Area yAxisId = "left" type = "monotone" dataKey = "ctr" name = "CTR (%)" stroke = "#1e3a8a" strokeWidth = { 3} fillOpacity = { 1} fill = "url(#colorCtr)" />
        <Line yAxisId="right" type = "monotone" dataKey = "cpa" name = "CPA" stroke = "#000000" strokeWidth = { 3} dot = {{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot = {{ r: 6 }} />
            </ComposedChart>
            </ResponsiveContainer>
            </div>

            < div className = "grid grid-cols-1 md:grid-cols-2 gap-6 flex-1" >
                <div className={ `${glassPanel} flex flex-col` }>
                    <div className="flex justify-between items-start mb-6" >
                        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2" >
                            <Zap size={ 16 } className = "text-amber-600" /> Creative Evolution
                                </h2>
                                < span className = "bg-white border border-black/5 text-slate-800 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider" > { data.evolution.mutationType } </span>
                                    </div>

                                    < div className = "flex-1 flex flex-col justify-center space-y-4 relative" >
                                        <div className={ `${innerGlass} opacity-70 grayscale` }>
                                            <div className="text-[10px] font-bold text-slate-700 uppercase mb-1" > Generation N - 1(Control) </div>
                                                < p className = "text-sm text-slate-800 font-medium" > "{data.evolution.control}" </p>
                                                    </div>

                                                    < div className = "absolute left-8 top-1/2 -translate-y-1/2 text-black/20 z-0" >
                                                        <ArrowRight size={ 32 } />
                                                            </div>

                                                            < div className = {`${innerGlass} !bg-white border-white shadow-lg relative z-10 translate-x-4`}>
                                                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shadow-sm" >
                                                                    <span className="text-xs font-bold text-amber-700" > { data.evolution.fitnessScore } </span>
                                                                        </div>
                                                                        < div className = "text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1" > <Sparkles size={ 10 } /> Generation N (Variant)</div >
                                                                            <p className="text-base text-slate-900 font-bold" > "{data.evolution.variant}" </p>
                                                                                </div>
                                                                                </div>
                                                                                </div>

                                                                                < div className = {`${glassPanel} flex flex-col justify-between`}>
                                                                                    <div>
                                                                                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2" >
                                                                                        <Target size={ 16 } className = "text-emerald-600" /> Sandbox Results
                                                                                            </h2>

                                                                                            < div className = "grid grid-cols-2 gap-3 mb-4" >
                                                                                                <div className={ `${innerGlass} !py-2 !px-3` }>
                                                                                                    <p className="text-[10px] text-slate-700 font-bold uppercase mb-0.5" > Sim.CTR </p>
                                                                                                        < p className = "text-lg font-extrabold text-slate-900" > {(data.sim_results.ctr * 100).toFixed(1)}% </p>
                                                                                                            </div>
                                                                                                            < div className = {`${innerGlass} !py-2 !px-3`}>
                                                                                                                <p className="text-[10px] text-slate-700 font-bold uppercase mb-0.5" > Sim.CPA </p>
                                                                                                                    < p className = "text-lg font-extrabold text-slate-900" > ${ data.sim_results.cpa.toFixed(2) } </p>
                                                                                                                        </div>
                                                                                                                        < div className = {`${innerGlass} !py-2 !px-3`}>
                                                                                                                            <p className="text-[10px] text-slate-700 font-bold uppercase mb-0.5" > Sim.ROAS </p>
                                                                                                                                < p className = {`text-lg font-extrabold ${data.sim_results.roas >= 2.0 ? 'text-emerald-600' : 'text-slate-900'}`}> { data.sim_results.roas.toFixed(2) }x </p>
                                                                                                                                    </div>
                                                                                                                                    < div className = {`${innerGlass} !py-2 !px-3`}>
                                                                                                                                        <p className="text-[10px] text-slate-700 font-bold uppercase mb-0.5" > Sim.CVR </p>
                                                                                                                                            < p className = "text-lg font-extrabold text-slate-900" > {(data.sim_results.cvr * 100).toFixed(1)}% </p>
                                                                                                                                                </div>
                                                                                                                                                </div>

                                                                                                                                                < div className = {`${innerGlass} !bg-white/70`}>
                                                                                                                                                    <p className="text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1" >
                                                                                                                                                        <MessageSquare size={ 12 }/> AI Market Feedback
                                                                                                                                                            </p>
                                                                                                                                                            < p className = "text-xs text-slate-800 italic" > "{data.sim_results.feedback}" </p>
                                                                                                                                                                </div>
                                                                                                                                                                </div>

                                                                                                                                                                < div className = "mt-4 pt-4 border-t border-black/10" >
                                                                                                                                                                    <p className="text-xs text-slate-700 font-bold uppercase mb-2" > Evaluator Action Executed: </p>
                                                                                                                                                                        < div className = {`flex items-center gap-3 bg-white border text-slate-900 p-3 rounded-2xl shadow-md ${data.decision.action.includes('KILL') ? 'border-red-200 bg-red-50/50' : 'border-white'}`}>
                                                                                                                                                                            {
                                                                                                                                                                                data.decision.action.includes('KILL') ? (
                                                                                                                                                                                    <XCircle className= "text-red-500 shrink-0" size={ 20} />
                      ) : (
                                                                                                                                                                                        <CheckCircle className="text-emerald-500 shrink-0" size = { 20} />
                      )}
<div>
    <p className={ `font-bold text-sm ${data.decision.action.includes('KILL') ? 'text-red-600' : ''}` }> { data.decision.action }: { data.decision.winner } </p>
        < p className = "text-[10px] text-slate-700" > { data.decision.reason } </p>
            </div>
            </div>
            </div>
            </div>
            </div>
            </div>
          )}
</div>
    </div>

    < style dangerouslySetInnerHTML = {{
    __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}