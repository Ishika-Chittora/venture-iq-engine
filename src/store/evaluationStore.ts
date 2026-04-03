import { create } from 'zustand';
import type { EvaluationStep, EvaluationResult, IdeaInput } from '@/types/evaluation';

interface EvaluationState {
  step: EvaluationStep;
  input: IdeaInput | null;
  result: EvaluationResult | null;
  error: string | null;
  startTime: number | null;
  latency: number | null;

  setStep: (step: EvaluationStep) => void;
  setInput: (input: IdeaInput) => void;
  setResult: (result: EvaluationResult) => void;
  setError: (error: string) => void;
  reset: () => void;
  startEvaluation: (input: IdeaInput) => void;
}

export const useEvaluationStore = create<EvaluationState>((set) => ({
  step: 'idle',
  input: null,
  result: null,
  error: null,
  startTime: null,
  latency: null,

  setStep: (step) => set({ step }),
  setInput: (input) => set({ input }),
  setResult: (result) =>
    set((state) => ({
      result,
      step: 'complete',
      latency: state.startTime ? Date.now() - state.startTime : null,
    })),
  setError: (error) => set({ error, step: 'error' }),
  reset: () =>
    set({
      step: 'idle',
      input: null,
      result: null,
      error: null,
      startTime: null,
      latency: null,
    }),
  startEvaluation: (input) =>
    set({
      step: 'validating',
      input,
      result: null,
      error: null,
      startTime: Date.now(),
      latency: null,
    }),
}));
