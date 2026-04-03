import { Shield, AlertTriangle, Lightbulb, Crosshair } from 'lucide-react';
import type { SwotAnalysis, SwotItem } from '@/types/evaluation';

interface Props {
  swot: SwotAnalysis;
}

const impactColors: Record<string, string> = {
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-primary/10 text-primary border-primary/20',
};

const sections = [
  { key: 'strengths' as const, label: 'Strengths', icon: Shield, color: 'text-primary' },
  { key: 'weaknesses' as const, label: 'Weaknesses', icon: AlertTriangle, color: 'text-destructive' },
  { key: 'opportunities' as const, label: 'Opportunities', icon: Lightbulb, color: 'text-accent' },
  { key: 'threats' as const, label: 'Threats', icon: Crosshair, color: 'text-warning' },
];

function SwotCard({ items, label, icon: Icon, color }: {
  items: SwotItem[];
  label: string;
  icon: typeof Shield;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 mt-0.5 ${impactColors[item.impact]}`}>
              {item.impact}
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SwotGrid({ swot }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">SWOT Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((s) => (
          <SwotCard key={s.key} items={swot[s.key]} label={s.label} icon={s.icon} color={s.color} />
        ))}
      </div>
    </div>
  );
}
