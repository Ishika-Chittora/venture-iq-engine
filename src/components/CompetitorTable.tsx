import { Globe } from 'lucide-react';
import type { Competitor } from '@/types/evaluation';

interface Props {
  competitors: Competitor[];
}

const threatColors: Record<string, string> = {
  High: 'bg-destructive/10 text-destructive',
  Medium: 'bg-warning/10 text-warning',
  Low: 'bg-primary/10 text-primary',
};

export function CompetitorTable({ competitors }: Props) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Competitor Landscape</h3>
      </div>
      <div className="space-y-3">
        {competitors.map((c, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${threatColors[c.threat]}`}>
                  {c.threat}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
