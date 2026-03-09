import { useState, useEffect, useRef } from 'react';
import {
  Play, Activity, Brain, MessageSquare,
  CheckCircle, Search, BarChart3, Zap, Target,
  RefreshCw, Cpu, Network, Sparkles, Fingerprint,
  ArrowRight, Layers, XCircle, Loader2, Send
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line, Area } from 'recharts';

export default function App() {
  const [systemState, setSystemState] = useState('IDLE'); // IDLE, RUNNING, COMPLETE
  const [currentRound, setCurrentRound] = useState(1);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<{ agent: string, text: string }[]>([]);

  // For rendering the active experiment
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState([{ name: 'Base', segment: 'Control', ctr: 0, cpa: 0 }]);

  const [productInput, setProductInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [signals, setSignals] = useState<string[]>([]);
  const [adImage, setAdImage] = useState<string | null>(null);
  const [roundHistory, setRoundHistory] = useState<{ round: number, winner: string, ctr: string, cpa: string, insight: string }[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs]);

  // Live Event Source Connection (fuses the old App.tsx logic into the new UI)
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/stream');

    eventSource.addEventListener('log', (e) => {
      const raw = JSON.parse(e.data);

      // Map our backend log types to the AdLabs UI agent names
      let agentId = 'SYSTEM';
      if (raw.type === 'research') agentId = 'RESEARCHER';
      if (raw.type === 'analysis') agentId = 'ANALYST';
      if (raw.type === 'insight' || raw.message?.includes('Hypothesis') || raw.message?.includes('Hook') || raw.type === 'creator') agentId = 'CREATOR';
      if (raw.message?.includes('simulation') || raw.type === 'info' && raw.message?.includes('CTR') || raw.message?.includes('Evaluator')) agentId = 'SIMULATOR';
      if (raw.type === 'decision') agentId = 'SIMULATOR';
      if (raw.type === 'composio') agentId = 'SYSTEM';

      setLogs((prev) => [...prev, { agent: agentId, text: raw.message }]);
      setActiveAgent(agentId);
      setAgentStatuses((prev) => ({ ...prev, [agentId]: raw.message }));
    });

    eventSource.addEventListener('state', (e) => {
      const raw = JSON.parse(e.data);

      setSystemState(raw.status === 'complete' ? 'COMPLETE' : 'RUNNING');
      if (raw.round) setCurrentRound(raw.round);

      // Once evaluated, we can populate the rich UI cards
      if (raw.status === 'planning' && raw.winner) {

        const bestVariant = raw.variant.ctr > raw.control.ctr ? raw.variant : raw.control;

        setData({
          round_number: raw.round,
          evolution: {
            mutationType: "Live Server Generation",
            control: raw.control.hook,
            variant: raw.variant.hook,
            fitnessScore: Math.min(99, Math.round(bestVariant.ctr * 2500))
          },
          sim_results: {
            ctr: bestVariant.ctr,
            cpa: bestVariant.cpa,
            roas: bestVariant.roas,
            cvr: bestVariant.cvr,
            feedback: raw.insight || "AI detected higher resonance in variant"
          },
          decision: {
            action: raw.winner.includes('Control') ? "KILL VARIANT" : "SCALE VARIANT",
            winner: raw.winner,
            reason: "Winning variant identified via Live Algorithm Simulation"
          }
        });

        // Update Chart
        setChartData(prev => [
          ...prev,
          {
            name: `R${raw.round}`,
            segment: raw.winner.includes('Variant') ? "Variant" : "Control",
            ctr: parseFloat((bestVariant.ctr * 100).toFixed(2)),
            cpa: parseFloat((bestVariant.cpa).toFixed(2))
          }
        ].slice(-10));

        setSystemState('COMPLETE');
        setActiveAgent(null);

        // Track in round history for Memory Bank
        setRoundHistory(prev => [
          ...prev,
          {
            round: raw.round,
            winner: raw.winner,
            ctr: (bestVariant.ctr * 100).toFixed(2) + '%',
            cpa: bestVariant.cpa.toFixed(2),
            insight: raw.insight || 'No insight'
          }
        ]);
      }
    });

    eventSource.addEventListener('signals', (e) => {
      const raw = JSON.parse(e.data);
      setSignals(raw);
    });

    eventSource.addEventListener('adImage', (e) => {
      setAdImage(e.data);
    });

    return () => eventSource.close();
  }, []);

  const runAutonomousLoop = async (overrideProduct?: string) => {
    const product = overrideProduct || productInput;
    if (!product.trim() || systemState === 'RUNNING') return;
    setProductInput(product);
    setHasStarted(true);
    setSystemState('RUNNING');
    setLogs([]);
    setData(null);
    setRoundHistory([]);
    setChartData([{ name: 'Base', segment: 'Control', ctr: 0, cpa: 0 }]);
    setAdImage(null);

    try {
      await fetch('http://localhost:3000/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product })
      });
    } catch (e) {
      console.error("Failed to start engine", e);
      setSystemState('IDLE');
    }
  };

  const suggestions = ['Energy Drink', 'Fitness App', 'Luxury Perfume', 'SaaS Tool'];

  const glassPanel = "bg-[#b8a792]/95 backdrop-blur-3xl border border-white/40 shadow-xl rounded-[32px] p-6 text-slate-800";
  const innerGlass = "bg-white/30 backdrop-blur-md border border-white/30 shadow-sm rounded-2xl p-4";

  const bgStyle = {
    backgroundColor: '#866a4f',
    backgroundImage: `
      radial-gradient(circle at 50% 20%, #a18567 0%, #664d34 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.35'/%3E%3C/svg%3E")
    `
  };

  // ─── LANDING PAGE ───
  if (!hasStarted) {
    return (
      <div className="min-h-screen font-sans flex flex-col items-center justify-center selection:bg-black/10" style={bgStyle}>
        <div className="w-full max-w-2xl mx-auto px-6 flex flex-col items-center gap-8 animate-in fade-in duration-700">

          {/* Logo */}
          <div className="w-16 h-16 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-lg">
            <Sparkles className="text-slate-800" size={30} />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
              Meet <span className="text-amber-200">AdLabs</span>
            </h1>
            <p className="text-white/60 text-lg font-medium">
              Your autonomous AI ad strategist
            </p>
          </div>

          {/* Input */}
          <div className="w-full relative">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80 p-2">
              <form onSubmit={(e) => { e.preventDefault(); runAutonomousLoop(); }} className="flex items-center">
                <input
                  type="text"
                  placeholder="What product do you want to advertise?"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-slate-800 text-base font-medium py-3 px-5 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!productInput.trim()}
                  className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white flex items-center justify-center transition-all shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setProductInput(s); runAutonomousLoop(s); }}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white/90 border border-white/20 px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Subtle footer */}
          <p className="text-white/30 text-xs font-medium mt-8">
            Powered by Gemini AI · Composio · Fabricate
          </p>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  return (
    <div
      className="min-h-screen font-sans p-4 md:p-8 flex flex-col gap-6 selection:bg-black/10"
      style={bgStyle}
    >
      <header className={`${glassPanel} !p-4 !rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-white/80 flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => { if (systemState !== 'RUNNING') setHasStarted(false); }}>
            <Sparkles className="text-slate-800" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              AdLabs
              <span className="text-[10px] font-bold uppercase tracking-widest bg-black/5 text-slate-700 px-2 py-1 rounded-full border border-black/5">Track 1 & 2</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs flex items-center gap-2">
              Autonomous Growth Engine <span className="w-1 h-1 rounded-full bg-slate-400"></span> Live Prototype
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`${innerGlass} !py-2 !px-4 hidden xl:flex items-center gap-4 text-xs font-bold text-slate-700`}>
            <span className="flex items-center gap-1.5"><Cpu size={14} className="text-blue-500" /> Round {currentRound}/3</span>
            <div className="w-[1px] h-4 bg-black/10"></div>
            <span className="flex items-center gap-1.5"><Activity size={14} className={systemState === 'RUNNING' ? 'text-emerald-500 animate-pulse' : 'text-slate-400'} /> {systemState === 'RUNNING' ? 'Live' : systemState === 'COMPLETE' ? 'Done' : 'Idle'}</span>
            <div className="w-[1px] h-4 bg-black/10"></div>
            <span className="flex items-center gap-1.5"><Network size={14} className="text-amber-500" /> {logs.length} events</span>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="Enter product to advertise..."
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runAutonomousLoop(); }}
              disabled={systemState === 'RUNNING'}
              className="w-full bg-white/40 border border-white/60 text-slate-700 text-sm font-bold py-3 px-4 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-50 transition-all placeholder:text-slate-500/70"
            />
          </div>

          <button
            onClick={() => runAutonomousLoop()}
            disabled={systemState === 'RUNNING' || !productInput.trim()}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900/50 disabled:text-white/50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md disabled:shadow-none"
          >
            {systemState === 'RUNNING' ? <RefreshCw className="animate-spin" size={18} /> : (currentRound > 1 ? <RefreshCw size={18} /> : <Play size={18} />)}
            <span className="text-sm">{systemState === 'RUNNING' ? 'Processing...' : currentRound > 1 ? 'Run Again' : 'Run Cycle'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className={`${glassPanel} relative overflow-hidden`}>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/40 rounded-full blur-3xl"></div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Network size={16} className="text-slate-600" /> Active Agents
            </h2>

            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-black/10 to-transparent z-0"></div>

              {[
                { id: 'RESEARCHER', name: 'Market Researcher', icon: Search, color: 'text-violet-600', bg: 'bg-violet-100', border: 'border-violet-200' },
                { id: 'ANALYST', name: 'Strategic Analyst', icon: Brain, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
                { id: 'CREATOR', name: 'Creative Engine', icon: Fingerprint, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' },
                { id: 'SIMULATOR', name: 'Consumer Simulator', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' }
              ].map((agent, i) => (
                <div key={agent.id} className={`relative z-10 flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 ${activeAgent === agent.id ? 'bg-white shadow-md scale-[1.02] border border-white/80' : 'bg-transparent'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${activeAgent === agent.id ? `${agent.bg} ${agent.color} ${agent.border} border animate-pulse` : 'bg-black/5 text-slate-500 border border-black/5'}`}>
                    <agent.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm ${activeAgent === agent.id ? 'text-slate-900' : 'text-slate-600'}`}>{agent.name}</div>
                    <div className={`text-[10px] truncate transition-all duration-300 ${activeAgent === agent.id ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                      {agentStatuses[agent.id] || `Node ${i + 1} • Online`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {signals.length > 0 && (
            <div className={`${glassPanel} !p-4`}>
              <h2 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={12} className="text-amber-600" /> Live Market Signals (Composio)
              </h2>
              <div className="space-y-1">
                {signals.slice(0, 8).map((s, i) => (
                  <p key={i} className="text-[11px] text-slate-800 font-medium truncate">• {s}</p>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-b from-[#b8a792]/95 to-[#a89682]/95 backdrop-blur-2xl border border-white/40 shadow-xl rounded-[32px] p-6 flex-1 flex flex-col min-h-[250px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Brain size={16} className="text-slate-700" /> Neural Logs
              </h2>
            </div>
            <div ref={terminalRef} className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 pr-2 custom-scrollbar relative z-10">
              {logs.length === 0 && <span className="text-slate-600 italic font-medium">Awaiting simulation trigger...</span>}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-left-2">
                  <span className="font-bold text-slate-950 shrink-0 w-[80px] truncate">{log.agent}</span>
                  <span className="text-slate-800 font-medium">{log.text}</span>
                </div>
              ))}
              {systemState === 'RUNNING' && (
                <div className="flex gap-3 animate-pulse">
                  <span className="text-slate-600 w-[80px] font-bold">SYS</span>
                  <span className="text-slate-600 font-medium">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          {!data ? (
            <div className={`${glassPanel} flex-1 flex items-center justify-center flex-col gap-6`}>
              <div className="relative">
                <div className="absolute inset-0 bg-white blur-3xl rounded-full opacity-40 animate-pulse"></div>
                <Layers size={64} className="text-slate-400 relative z-10 opacity-50" />
              </div>
              <p className="font-medium text-slate-700 tracking-wide">Press "Run Cycle" to generate AI insights.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col relative">
              {systemState === 'RUNNING' && (
                <div className="absolute inset-0 z-50 bg-[#b8a792]/30 backdrop-blur-sm rounded-[32px] flex items-center justify-center border border-white/30 overflow-hidden animate-in fade-in duration-500">
                  <div className="absolute left-0 w-full h-[2px] bg-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                  <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-white">
                    <Loader2 size={18} className="text-blue-600 animate-spin" />
                    <span className="font-bold text-slate-800 text-sm tracking-wide">Synthesizing Market Data...</span>
                  </div>
                </div>
              )}

              {/* Row 1: Chart */}
              <div className={`${glassPanel} !pb-2 !p-4 h-52 shrink-0`}>
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 size={14} className="text-slate-600" /> Optimization Trajectory
                  </h2>
                  <span className="text-[10px] font-bold text-slate-500">CTR vs CPA</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#1e3a8a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#000000" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(value, name) => [
                        name === 'CTR (%)' ? `${value}%` : `$${value}`,
                        name
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) return `${label} • ${payload[0].payload.segment}`;
                        return label;
                      }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorCtr)" />
                    <Line yAxisId="right" type="monotone" dataKey="cpa" name="CPA" stroke="#000000" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Row 2: Creative Evolution + Sandbox Results side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Creative Evolution - tighter */}
                <div className={`${glassPanel} !p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-amber-600" /> Creative Evolution
                    </h2>
                    <span className="bg-white border border-black/5 text-slate-800 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm uppercase tracking-wider">Round {data.round_number}</span>
                  </div>

                  <div className="space-y-3 relative">
                    <div className={`${innerGlass} !p-3 opacity-70 grayscale`}>
                      <div className="text-[9px] font-bold text-slate-700 uppercase mb-1">Control</div>
                      <p className="text-xs text-slate-800 font-medium leading-snug">"{data.evolution.control}"</p>
                    </div>

                    <div className="flex items-center gap-2 px-2">
                      <ArrowRight size={14} className="text-black/20" />
                      <div className="flex-1 h-[1px] bg-black/10"></div>
                      <span className="text-[9px] font-bold text-amber-600">MUTATED</span>
                    </div>

                    <div className={`${innerGlass} !bg-white !p-3 border-white shadow-lg relative`}>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shadow-sm">
                        <span className="text-[10px] font-bold text-amber-700">{data.evolution.fitnessScore}</span>
                      </div>
                      <div className="text-[9px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1"><Sparkles size={9} /> Variant</div>
                      <p className="text-sm text-slate-900 font-bold leading-snug">"{data.evolution.variant}"</p>
                    </div>
                  </div>
                </div>

                {/* Sandbox Results - tighter */}
                <div className={`${glassPanel} !p-4 flex flex-col justify-between`}>
                  <div>
                    <h2 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Target size={14} className="text-emerald-600" /> Sandbox Results
                    </h2>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className={`${innerGlass} !py-2 !px-3`}>
                        <p className="text-[9px] text-slate-700 font-bold uppercase mb-0.5">Sim. CTR</p>
                        <p className="text-lg font-extrabold text-slate-900">{(data.sim_results.ctr * 100).toFixed(1)}%</p>
                      </div>
                      <div className={`${innerGlass} !py-2 !px-3`}>
                        <p className="text-[9px] text-slate-700 font-bold uppercase mb-0.5">Sim. CPA</p>
                        <p className="text-lg font-extrabold text-slate-900">${data.sim_results.cpa.toFixed(2)}</p>
                      </div>
                      <div className={`${innerGlass} !py-2 !px-3`}>
                        <p className="text-[9px] text-slate-700 font-bold uppercase mb-0.5">Sim. ROAS</p>
                        <p className={`text-lg font-extrabold ${data.sim_results.roas >= 2.0 ? 'text-emerald-600' : 'text-slate-900'}`}>{data.sim_results.roas.toFixed(2)}x</p>
                      </div>
                      <div className={`${innerGlass} !py-2 !px-3`}>
                        <p className="text-[9px] text-slate-700 font-bold uppercase mb-0.5">Sim. CVR</p>
                        <p className="text-lg font-extrabold text-slate-900">{(data.sim_results.cvr * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className={`${innerGlass} !bg-white/70 !p-3`}>
                      <p className="text-[9px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                        <MessageSquare size={10} /> AI Evaluator Insight
                      </p>
                      <p className="text-[11px] text-slate-800 italic leading-snug">"{data.sim_results.feedback}"</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-black/10">
                    <div className={`flex items-center gap-3 bg-white border text-slate-900 p-3 rounded-2xl shadow-md ${data.decision.action.includes('KILL') ? 'border-red-200 bg-red-50/50' : 'border-white'}`}>
                      {data.decision.action.includes('KILL') ? (
                        <XCircle className="text-red-500 shrink-0" size={18} />
                      ) : (
                        <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                      )}
                      <div>
                        <p className={`font-bold text-xs ${data.decision.action.includes('KILL') ? 'text-red-600' : ''}`}>{data.decision.action}: {data.decision.winner}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Memory Bank — shows accumulated learning */}
              {roundHistory.length > 0 && (
                <div className={`${glassPanel} !p-4`}>
                  <h2 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain size={14} className="text-violet-600" /> Memory Bank — Accumulated Learning
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-slate-600 font-bold uppercase text-[9px] tracking-wider">
                          <th className="text-left pb-2 pr-3">Round</th>
                          <th className="text-left pb-2 pr-3">Winner</th>
                          <th className="text-left pb-2 pr-3">CTR</th>
                          <th className="text-left pb-2 pr-3">CPA</th>
                          <th className="text-left pb-2">Insight Learned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roundHistory.map((r, i) => (
                          <tr key={i} className="border-t border-black/5">
                            <td className="py-2 pr-3 font-bold text-slate-900">R{r.round}</td>
                            <td className="py-2 pr-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${r.winner.includes('Variant') ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {r.winner}
                              </span>
                            </td>
                            <td className="py-2 pr-3 font-bold text-slate-800">{r.ctr}</td>
                            <td className="py-2 pr-3 font-bold text-slate-800">${r.cpa}</td>
                            <td className="py-2 text-slate-700 italic max-w-[300px] truncate">{r.insight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Row 4: Final Winning Ad — shows after all rounds complete */}
              {systemState === 'COMPLETE' && data && roundHistory.length >= 3 && (
                <div className={`${glassPanel} !p-5 border-2 !border-amber-300/50 relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400"></div>
                  <h2 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" /> 🏆 Final Winning Ad — Ready to Deploy
                  </h2>
                  <div className="bg-white rounded-2xl p-5 shadow-md border border-amber-100">
                    <p className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                      "{data.evolution.variant}"
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {data.sim_results.feedback}
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">
                        Best CTR: {(data.sim_results.ctr * 100).toFixed(2)}%
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold">
                        CPA: ${data.sim_results.cpa.toFixed(2)}
                      </span>
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold">
                        ROAS: {data.sim_results.roas.toFixed(2)}x
                      </span>
                    </div>

                    {/* AI Generated Ad Image */}
                    {adImage ? (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">🎨 AI-Generated Ad Creative</p>
                        <img src={adImage} alt="AI Generated Ad" className="w-full h-auto rounded-xl shadow-lg border border-slate-200 object-cover" />
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-amber-600/70 text-xs font-medium py-4 bg-amber-50/50 rounded-xl">
                        <Loader2 size={16} className="animate-spin" /> Generating ad visual with Gemini API...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
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
