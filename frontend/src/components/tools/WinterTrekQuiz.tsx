import { useEffect, useMemo, useState } from 'react';
import type { MarketingTrek } from '@/lib/types';
import { track } from '@/lib/marketing/analytics';
import {
  answersToParams,
  buildQuestions,
  rankTreks,
  type QuizAnswerKey,
  type QuizAnswers,
} from '@/lib/marketing/quiz';

interface WinterTrekQuizProps {
  treks: MarketingTrek[];
  cities: { slug: string; name: string }[];
  resultBasePath: string;
}

export default function WinterTrekQuiz({ treks, cities, resultBasePath }: WinterTrekQuizProps) {
  const questions = useMemo(() => buildQuestions(cities), [cities]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [finishing, setFinishing] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  useEffect(() => {
    track('quiz_start', { treks: treks.length });
  }, [treks.length]);

  const question = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  const choose = (id: QuizAnswerKey, value: string) => {
    const next = { ...answers, [id]: value } as Partial<QuizAnswers>;
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    const complete = next as QuizAnswers;
    const result = rankTreks(treks, complete);
    if (!result) {
      setNoMatch(true);
      return;
    }
    setFinishing(true);
    track('quiz_complete', { result: result.primary.trek.slug, from_city: complete.from });
    const params = answersToParams(complete);
    window.location.href = `${resultBasePath}${result.primary.trek.slug}/?${params.toString()}`;
  };

  if (noMatch) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-semibold text-neutral-900">We couldn't find a safe match for those answers.</p>
        <p className="mt-2 text-sm text-neutral-700">
          Talk to a trek expert on WhatsApp and we'll suggest an option, or restart the quiz.
        </p>
        <button type="button" className="btn-secondary mt-4" onClick={() => { setNoMatch(false); setStep(0); setAnswers({}); }}>
          Restart quiz
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg md:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
          <span>Question {step + 1} of {questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Quiz progress"
        >
          <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <fieldset disabled={finishing}>
        <legend className="mb-5 text-xl font-bold text-secondary-600 md:text-2xl">{question.prompt}</legend>
        <div className="grid gap-3">
          {question.options.map((option) => {
            const selected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(question.id, option.value)}
                aria-pressed={selected}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all md:text-base ${
                  selected
                    ? 'border-primary-500 bg-primary-50 text-neutral-900'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-primary-300 hover:bg-primary-50/40'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0 || finishing}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-800 disabled:invisible"
        >
          ← Back
        </button>
        {finishing && <span className="text-sm font-medium text-primary-600">Finding your trek…</span>}
      </div>
    </div>
  );
}
