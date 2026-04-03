import { useCallback } from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import { useEvaluationStore } from '@/store/evaluationStore';
import { runEvaluation } from '@/services/evaluationService';
import { EvaluationForm } from '@/components/EvaluationForm';
import { StepProgress } from '@/components/StepProgress';
import { ScoreOverview } from '@/components/ScoreOverview';
import { FeasibilityRadar } from '@/components/FeasibilityRadar';
import { ProjectionChart } from '@/components/ProjectionChart';
import { SwotGrid } from '@/components/SwotGrid';
import { CompetitorTable } from '@/components/CompetitorTable';
import { Recommendations } from '@/components/Recommendations';
import type { IdeaInput } from '@/types/evaluation';

const Index = () => {
  const { step, result, error, latency, setStep, setResult, setError, startEvaluation, reset } =
    useEvaluationStore();

  const isLoading = step !== 'idle' && step !== 'complete' && step !== 'error';

  const handleSubmit = useCallback(
    async (input: IdeaInput) => {
      startEvaluation(input);
      try {
        const res = await runEvaluation(input, setStep);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Evaluation failed');
      }
    },
    [startEvaluation, setStep, setResult, setError]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">VentureIQ</h1>
              <p className="text-xs text-muted-foreground">AI Startup Risk Engine</p>
            </div>
          </div>
          {step !== 'idle' && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Analysis
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Input Phase */}
        {(step === 'idle' || isLoading) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EvaluationForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
            <div>
              <StepProgress currentStep={step} />
            </div>
          </div>
        )}

        {/* Error */}
        {step === 'error' && error && (
          <div className="glass rounded-2xl p-6 border-destructive/30">
            <p className="text-destructive font-medium">Error: {error}</p>
            <button
              onClick={reset}
              className="mt-3 px-4 py-2 rounded-lg text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {step === 'complete' && result && (
          <div className="space-y-6 animate-in fade-in-0 duration-500">
            <ScoreOverview result={result} latency={latency} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeasibilityRadar scores={result.feasibility} />
              <ProjectionChart projections={result.projections} breakEvenMonth={result.breakEvenMonth} />
            </div>

            <SwotGrid swot={result.swot} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompetitorTable competitors={result.competitors} />
              <Recommendations recommendations={result.recommendations} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
