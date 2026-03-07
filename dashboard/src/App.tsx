import { useState, useEffect } from 'react';
import { Activity, Brain, Users, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for our SSE event data
interface LogEvent {
  id: string;
  type: 'info' | 'decision' | 'insight' | 'composio' | 'research';
  message: string;
  timestamp: string;
}

interface CampaignState {
  round: number;
  hypothesis: string;
  control: { hook: string; ctr: number };
  variant: { hook: string; ctr: number };
  winner: string | null;
  insight: string | null;
  status: 'planning' | 'simulating' | 'evaluating' | 'complete';
}

function App() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [campaign, setCampaign] = useState<CampaignState | null>(null);
  const [marketSignals, setMarketSignals] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/stream');

    eventSource.addEventListener('log', (e) => {
      const data = JSON.parse(e.data);
      setLogs((prev) => [...prev, data]);
    });

    eventSource.addEventListener('state', (e) => {
      const data = JSON.parse(e.data);
      setCampaign((prev) => ({ ...prev, ...data }));
      if (data.status === 'complete') setIsRunning(false);
    });

    eventSource.addEventListener('signals', (e) => {
      const data = JSON.parse(e.data);
      setMarketSignals(data);
    });

    return () => eventSource.close();
  }, []);

  const startEngine = async () => {
    setIsRunning(true);
    setLogs([]);
    try {
      await fetch('http://localhost:3000/start', { method: 'POST' });
    } catch (e) {
      console.error("Failed to start engine", e);
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-400" />
            Autonomous Growth Lab
          </h1>
          <p className="text-zinc-400 mt-2">AI-driven marketing team: researching, generating, simulating, and learning.</p>
        </div>

        <button
          onClick={startEngine}
          disabled={isRunning}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${isRunning
            ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'
            }`}
        >
          {isRunning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
          {isRunning ? 'Engine Running...' : 'Start Autonomous Loop'}
        </button>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COL: Research & Strategy */}
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-200">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Live Market Signals (Composio)
            </h2>
            <div className="space-y-3">
              {marketSignals.length === 0 ? (
                <div className="text-zinc-500 text-sm italic py-4 text-center">Waiting for Strategist to research...</div>
              ) : (
                marketSignals.map((signal, i) => (
                  <div key={i} className="text-sm bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-300">
                    {signal}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-200">
              <Activity className="w-5 h-5 text-indigo-400" />
              Agent Event Stream
            </h2>
            <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-zinc-500 text-sm italic py-4 text-center">System idle...</div>
              ) : (
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={log.id}
                      className="text-sm border-l-2 border-indigo-500 pl-3 py-1 text-zinc-300"
                    >
                      <span className="text-zinc-500 text-xs mr-2">{log.timestamp}</span>
                      {log.message}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE COL: Active Experiment */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-xl relative overflow-hidden">

            {/* Status indicator */}
            <div className="absolute top-0 right-0 p-4">
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-indigo-400 border border-indigo-500/30 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-600'}`}></div>
                {campaign?.status?.toUpperCase() || 'IDLE'}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-zinc-100">
              <BarChart2 className="w-6 h-6 text-purple-400" />
              Active A/B Experiment {campaign ? `(Round ${campaign.round})` : ''}
            </h2>

            {!campaign ? (
              <div className="py-20 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl mt-6">
                Start the engine to generate the first experiment
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Hypothesis</div>
                  <div className="font-medium text-zinc-200">"{campaign.hypothesis}"</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-xl border transition-colors ${campaign.winner === 'Control' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Control Ad</div>
                      {campaign.winner === 'Control' && <div className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">WINNER</div>}
                    </div>
                    <div className="text-lg font-medium text-white mb-6">"{campaign.control.hook}"</div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-zinc-500">Simulated CTR</div>
                      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                        {campaign.control.ctr > 0 ? `${(campaign.control.ctr * 100).toFixed(2)}%` : '--'}
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl border transition-colors ${campaign.winner === 'Variant' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Variant Ad</div>
                      {campaign.winner === 'Variant' && <div className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">WINNER</div>}
                    </div>
                    <div className="text-lg font-medium text-white mb-6">"{campaign.variant.hook}"</div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-zinc-500">Simulated CTR</div>
                      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                        {campaign.variant.ctr > 0 ? `${(campaign.variant.ctr * 100).toFixed(2)}%` : '--'}
                      </div>
                    </div>
                  </div>
                </div>

                {campaign.insight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl mt-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="text-xs text-indigo-400 mb-1 font-semibold uppercase tracking-wider">Evaluator Insight</div>
                    <div className="font-medium text-zinc-200">"{campaign.insight}"</div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-200">
              <Users className="w-5 h-5 text-rose-400" />
              Consumer Simulator Stream
            </h2>
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl">
              <div className="text-zinc-500 text-sm">Consumer simulation visualizer coming soon...</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
