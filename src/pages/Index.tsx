import { useCallback, Suspense } from 'react';
import { RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEvaluationStore } from '@/store/evaluationStore';
import { runEvaluation } from '@/services/evaluationService';
import { saveEvaluation } from '@/services/evaluationStorage';
import { EvaluationForm } from '@/components/EvaluationForm';
import { StepProgress } from '@/components/StepProgress';
import { ScoreOverview } from '@/components/ScoreOverview';
import { FeasibilityRadar } from '@/components/FeasibilityRadar';
import { ProjectionChart } from '@/components/ProjectionChart';
import { SwotGrid } from '@/components/SwotGrid';
import { CompetitorTable } from '@/components/CompetitorTable';
import { Recommendations } from '@/components/Recommendations';
import { SensitivityAnalysis } from '@/components/SensitivityAnalysis';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { ExportButton } from '@/components/ExportButton';
import { AIChatDrawer } from '@/components/AIChatDrawer';
import { SkeletonDashboard } from '@/components/SkeletonDashboard';
import { ActionPlan } from '@/components/ActionPlan';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'sonner';
import type { IdeaInput } from '@/types/evaluation';

const Index = () => {
  const { step, input, result, error, latency, setStep, setResult, setError, startEvaluation, reset } =
    useEvaluationStore();

  const isLoading = step !== 'idle' && step !== 'complete' && step !== 'error';

  const handleSubmit = useCallback(
    async (formInput: IdeaInput) => {
      startEvaluation(formInput);
      try {
        const res = await runEvaluation(formInput, setStep);
        setResult(res);
        // Auto-save to database
        try {
          await saveEvaluation(formInput, res);
          toast.success('Evaluation saved to history');
        } catch {
          toast.error('Failed to save evaluation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Evaluation failed');
        toast.error('Evaluation failed');
      }
    },
    [startEvaluation, setStep, setResult, setError]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      {/* Skeleton while loading */}
      {isLoading && (
        <div className="mt-6">
          <SkeletonDashboard />
        </div>
      )}

      {/* Error */}
      {step === 'error' && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 border-destructive/30"
        >
          <p className="text-destructive font-medium">Error: {error}</p>
          <button
            onClick={reset}
            className="mt-3 px-4 py-2 rounded-lg text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Results */}
      {step === 'complete' && result && (
        <div className="space-y-6">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{input?.name}</h2>
              <p className="text-xs text-muted-foreground">{input?.industry} · {input?.fundingStage}</p>
            </div>
            <div className="flex items-center gap-3">
              {input && <ExportButton result={result} input={input} />}
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New Analysis
              </button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfidenceMeter score={result.confidenceScore ?? Math.round(result.marketSentiment * 100)} />
          </motion.div>

          <ScoreOverview result={result} latency={latency} />

          <ErrorBoundary>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeasibilityRadar scores={result.feasibility} />
              <ProjectionChart projections={result.projections} breakEvenMonth={result.breakEvenMonth} />
            </div>
          </ErrorBoundary>

          <SensitivityAnalysis
            baseProjections={result.projections}
            baseBurn={result.burnRate}
            baseBreakEven={result.breakEvenMonth}
          />

          <SwotGrid swot={result.swot} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompetitorTable competitors={result.competitors} />
            <Recommendations recommendations={result.recommendations} />
          </div>
        </div>
      )}

      {/* AI Chat Drawer */}
      {step === 'complete' && result && input && (
        <AIChatDrawer result={result} input={input} />
      )}
    </div>
  );
};

export default Index;
