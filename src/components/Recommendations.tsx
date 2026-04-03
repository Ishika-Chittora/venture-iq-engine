import { ArrowRight } from 'lucide-react';

interface Props {
  recommendations: string[];
}

export function Recommendations({ recommendations }: Props) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
      <div className="space-y-2">
        {recommendations.map((r, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ArrowRight className="h-3 w-3 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{r}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
