import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  examples: Example[];
  starterCode: string;
  javaStarterCode: string;
}

interface RunState {
  runProblems: { slug: string; title: string; difficulty: string }[];
  runIndex: number;
}

interface SubmitResult {
  totalTests: number;
  passedTests: number;
  allPassed: boolean;
  xpAwarded: number | null;
}

const difficultyStyles: Record<string, string> = {
  Easy: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  Hard: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
};

export default function ProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const runState = location.state as RunState | null;
  const isInRun = !!(runState?.runProblems && runState.runProblems.length > 0);
  const runIndex = runState?.runIndex ?? 0;
  const runProblems = runState?.runProblems ?? [];

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'python' | 'java'>('python');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setResult(null);

    fetch(`${API_BASE}/api/problems/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Problem not found');
        return res.json();
      })
      .then((data) => {
        setProblem(data);
        setCode(language === 'java' ? (data.javaStarterCode || '') : (data.starterCode || ''));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, language]);

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/problems/${problem.slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageChange = (newLang: 'python' | 'java') => {
    setLanguage(newLang);
    if (problem) {
      setCode(newLang === 'java' ? (problem.javaStarterCode || '') : (problem.starterCode || ''));
    }
  };

  const goToNext = () => {
    const nextIndex = runIndex + 1;
    if (nextIndex < runProblems.length) {
      navigate(`/problems/${runProblems[nextIndex].slug}`, {
        state: { runProblems, runIndex: nextIndex },
      });
    } else {
      navigate('/coding');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
          {error || 'Problem not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-3xl">

        {/* Daily Challenge run progress bar */}
        {isInRun && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
            <div className="flex gap-2">
              {runProblems.map((p, i) => (
                <span
                  key={p.slug}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    i < runIndex
                      ? 'bg-emerald-400'
                      : i === runIndex
                      ? 'bg-indigo-400'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">
              Problem {runIndex + 1} of {runProblems.length}
            </span>
          </div>
        )}

        {/* Back link (only when browsing normally, not in a run) */}
        {!isInRun && (
          <Link to="/" className="mb-4 inline-block text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to problems
          </Link>
        )}

        {/* Problem header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-50">{problem.title}</h1>
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyles[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
              #{tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{problem.description}</p>
        </div>

        {/* Examples */}
        {problem.examples.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Examples</h2>
            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-sm">
                  <div><span className="text-slate-500">Input: </span><span className="text-slate-200">{ex.input}</span></div>
                  <div><span className="text-slate-500">Output: </span><span className="text-slate-200">{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="mt-1 text-slate-500">Explanation: {ex.explanation}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code editor */}
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Your Solution</h2>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as 'python' | 'java')}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-700">
            <CodeEditor value={code} onChange={setCode} language={language} height="380px" />
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Solution'}
        </button>

        {/* Result panel */}
        {result && (
          <div className={`mt-4 rounded-xl border p-5 ${
            result.allPassed
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-rose-500/30 bg-rose-500/10'
          }`}>
            <p className={`font-semibold ${result.allPassed ? 'text-emerald-300' : 'text-rose-300'}`}>
              {result.allPassed ? '✓ All tests passed!' : '✗ Some tests failed'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Passed {result.passedTests} / {result.totalTests} test cases
            </p>
            {result.xpAwarded != null && (
              <p className="mt-1 text-sm text-indigo-300">
                XP awarded — your total XP is now {result.xpAwarded}
              </p>
            )}

            {/* Next problem button (only shown in a Daily Challenge run) */}
            {isInRun && (
              <button
                onClick={goToNext}
                className="mt-4 rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
              >
                {runIndex + 1 < runProblems.length ? 'Next Problem →' : 'Finish Run'}
              </button>
            )}
          </div>
        )}

        {/* Skip button (only in a run, before submitting) */}
        {isInRun && !result && (
          <button
            onClick={goToNext}
            className="mt-3 w-full rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          >
            Skip this problem →
          </button>
        )}

      </div>
    </div>
  );
}
