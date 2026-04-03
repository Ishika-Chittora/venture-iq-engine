import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import type { FeasibilityScores } from '@/types/evaluation';

interface Props {
  scores: FeasibilityScores;
}

export function FeasibilityRadar({ scores }: Props) {
  const data = [
    { axis: 'Market', value: scores.market },
    { axis: 'Technical', value: scores.technical },
    { axis: 'Financial', value: scores.financial },
    { axis: 'Team', value: scores.team },
    { axis: 'Timing', value: scores.timing },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-2">Feasibility Map</h3>
      <p className="text-xs text-muted-foreground mb-4">5-axis assessment (0-100)</p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(217 33% 22%)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(215 20% 40%)', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="hsl(160 84% 39%)"
            fill="hsl(160 84% 39%)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
