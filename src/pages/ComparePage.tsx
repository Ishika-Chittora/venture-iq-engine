import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GitCompareArrows, Loader2, Swords } from 'lucide-react';
import { getEvaluations } from '@/services/evaluationStorage';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import type { EvaluationResult } from '@/types/evaluation';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function ComparePage() {
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: getEvaluations,
  });

  const evalA = evaluations?.find((e) => e.id === selectedA);
  const evalB = evaluations?.find((e) => e.id === selectedB);

  const resultA = evalA?.result_json as unknown as EvaluationResult | undefined;
  const resultB = evalB?.result_json as unknown as EvaluationResult | undefined;

  const radarData = resultA?.feasibility && resultB?.feasibility
    ? [
        { axis: 'Market', A: resultA.feasibility.market, B: resultB.feasibility.market },
        { axis: 'Technical', A: resultA.feasibility.technical, B: resultB.feasibility.technical },
        { axis: 'Financial', A: resultA.feasibility.financial, B: resultB.feasibility.financial },
        { axis: 'Team', A: resultA.feasibility.team, B: resultB.feasibility.team },
        { axis: 'Timing', A: resultA.feasibility.timing, B: resultB.feasibility.timing },
      ]
    : null;

  const generateSummary = async () => {
    if (!evalA || !evalB || !resultA || !resultB) return;
    setLoadingSummary(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/evaluate-startup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'x-chat-mode': 'true',
        },
        body: JSON.stringify({
          chatMode: true,
          messages: [
            {
              role: 'system',
              content: 'You are VentureIQ, a concise startup comparison analyst. Write exactly 3 sentences comparing two startups and recommending which is the better investment today.',
            },
            {
              role: 'user',
              content: `Compare:\n\nStartup A: "${evalA.name}" (${evalA.industry}) - Score: ${resultA.overallScore}/100, Risk: ${resultA.riskLevel}, Break-even: Month ${resultA.breakEvenMonth}, Burn: $${resultA.burnRate}/mo\nFeasibility: Market ${resultA.feasibility.market}, Tech ${resultA.feasibility.technical}, Financial ${resultA.feasibility.financial}\n\nStartup B: "${evalB.name}" (${evalB.industry}) - Score: ${resultB.overallScore}/100, Risk: ${resultB.riskLevel}, Break-even: Month ${resultB.breakEvenMonth}, Burn: $${resultB.burnRate}/mo\nFeasibility: Market ${resultB.feasibility.market}, Tech ${resultB.feasibility.technical}, Financial ${resultB.feasibility.financial}\n\nWhich is the better investment today and why? 3 sentences only.`,
            },
          ],
        }),
      });
      const data = await response.json();
      setAiSummary(data.reply || 'Unable to generate summary.');
    } catch {
      setAiSummary('Failed to generate comparison.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const MetricCard = ({ label, valueA, valueB }: { label: string; valueA: string; valueB: string }) => (
    <div className="glass rounded-xl p-3">
      <p className="text-[10px] text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[hsl(var(--primary))] font-mono">{valueA}</span>
        <span className="text-[10px] text-muted-foreground">vs</span>
        <span className="text-sm font-bold text-accent font-mono">{valueB}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GitCompareArrows className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Battle Mode</h2>
          <p className="text-xs text-muted-foreground">Compare two startups head-to-head</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading evaluations...</p>
      ) : !evaluations?.length ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Swords className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Run at least two evaluations to compare.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Startup A</label>
              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                className="w-full rounded-lg bg-muted/50 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              >
                <option value="">Select a startup...</option>
                {evaluations.filter((e) => e.id !== selectedB).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.overall_score}/100)</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Startup B</label>
              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                className="w-full rounded-lg bg-muted/50 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              >
                <option value="">Select a startup...</option>
                {evaluations.filter((e) => e.id !== selectedA).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.overall_score}/100)</option>
                ))}
              </select>
            </div>
          </div>

          {radarData && resultA && resultB && evalA && evalB && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Double Radar */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Feasibility Comparison</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {evalA.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      {evalB.name}
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(217 33% 18%)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name={evalA.name} dataKey="A" stroke="hsl(152 76% 36%)" fill="hsl(152 76% 36%)" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name={evalB.name} dataKey="B" stroke="hsl(187 92% 45%)" fill="hsl(187 92% 45%)" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Metric comparison */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Overall Score" valueA={`${resultA.overallScore ?? 0}`} valueB={`${resultB.overallScore ?? 0}`} />
                <MetricCard label="Break-even" valueA={`M${resultA.breakEvenMonth ?? 0}`} valueB={`M${resultB.breakEvenMonth ?? 0}`} />
                <MetricCard label="Burn Rate" valueA={`$${((resultA.burnRate ?? 0)/1000).toFixed(0)}K`} valueB={`$${((resultB.burnRate ?? 0)/1000).toFixed(0)}K`} />
                <MetricCard label="CAC/LTV" valueA={`${(resultA.cacLtvRatio ?? 0).toFixed(1)}x`} valueB={`${(resultB.cacLtvRatio ?? 0).toFixed(1)}x`} />
              </div>

              {/* AI Summary */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">AI Head-to-Head</h3>
                  <button
                    onClick={generateSummary}
                    disabled={loadingSummary}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition disabled:opacity-50"
                  >
                    {loadingSummary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Swords className="h-3.5 w-3.5" />}
                    {loadingSummary ? 'Analyzing...' : 'Generate Summary'}
                  </button>
                </div>
                {aiSummary ? (
                  <p className="text-sm text-foreground/80 leading-relaxed">{aiSummary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Click "Generate Summary" for an AI-powered head-to-head analysis.</p>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
