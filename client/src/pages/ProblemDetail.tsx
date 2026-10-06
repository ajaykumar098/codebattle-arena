import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { runPythonTestCase } from '../utils/runPython';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
  functionName: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
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
  const [submitError, setSubmitError] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [userClosedConsole, setUserClosedConsole] = useState(false);

  useEffect(() => {
    const loadProblem = async () => {
      setLoading(true);
      setError('');
      setSubmitError('');
      setResult(null);

      try {
        const res = await fetch(`${API_BASE}/api/problems/${slug}`);
        if (!res.ok) throw new Error('Problem not found');
        const data = await res.json();
        setProblem(data);
        setCode('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Problem not found');
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [slug]);

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setResult(null);
    setError('');
    setSubmitError('');

    try {
      // Check if Pyodide needs to be loaded
      const isFirstLoad = !(window as { pyodide?: unknown }).pyodide;
      if (isFirstLoad) {
        setPyodideLoading(true);
      }

      let passedTests = 0;
      const totalTests = problem.testCases.length;
      let lastError = '';

      for (const testCase of problem.testCases) {
        const { output, error: pyError } = await runPythonTestCase(
          code,
          problem.functionName,
          testCase.input
        );

        if (pyError) {
          lastError = pyError;
          continue;
        }

        const parsedOutput = JSON.parse(output);
        const parsedExpected = JSON.parse(testCase.expectedOutput);

        if (JSON.stringify(parsedOutput) === JSON.stringify(parsedExpected)) {
          passedTests++;
        }
      }

      const allPassed = passedTests === totalTests;
      let xpAwarded = null;

      if (allPassed) {
        try {
          const token = localStorage.getItem('token');
          const completeRes = await fetch(`${API_BASE}/api/problems/${problem.slug}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ allPassed, passedTests, totalTests }),
          });
          const completeData = await completeRes.json();
          xpAwarded = completeData.xpAwarded || null;
        } catch (xpErr) {
          console.error('Failed to save XP:', xpErr);
        }
      }

      setResult({ totalTests, passedTests, allPassed, xpAwarded });
      setSubmitError(lastError);
      setActiveTab('output');
      if (!userClosedConsole) {
        setConsoleOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
      setPyodideLoading(false);
    }
  };

  const getAnnouncement = () => {
    if (!result) return '';
    if (result.allPassed && !submitError) {
      return `Accepted, ${result.passedTests} of ${result.totalTests} tests passed`;
    }
    if (submitError) {
      return `Wrong answer, ${result.passedTests} of ${result.totalTests} tests passed`;
    }
    return `${result.passedTests} of ${result.totalTests} tests passed`;
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
      <div className="min-h-screen p-8 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[#121212] border border-[#6b7280] rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen p-8 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-6 text-[#f43f5e] rounded-[var(--radius-lg)]">
          {error || 'Problem not found'}
        </div>
      </div>
    );
  }

  const ProblemPanel = () => (
    <div className="space-y-4">
      {/* Daily Challenge run progress bar */}
      {isInRun && (
        <div className="flex items-center justify-between border border-[#6b7280] bg-[#121212] px-4 py-3 rounded-[var(--radius-lg)]">
          <div className="flex gap-2">
            {runProblems.map((p, i) => (
              <span
                key={p.slug}
                className={`h-2 w-2 rounded-full transition-all ${
                  i < runIndex
                    ? 'bg-[#10b981]'
                    : i === runIndex
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#6b7280]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#a1a1aa] font-mono">
            Problem {runIndex + 1} of {runProblems.length}
          </span>
        </div>
      )}

      {/* Back link */}
      {!isInRun && (
        <Link to="/" className="inline-block text-sm text-[#f59e0b] hover:underline">
          ← Back to problems
        </Link>
      )}

      {/* Problem header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#e5e5e5] font-mono">{problem.title}</h1>
        <Badge variant={problem.difficulty.toLowerCase() as "easy" | "medium" | "hard" | "success" | "error" | "neutral" | "accent"}>
          {problem.difficulty}
        </Badge>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {problem.tags.map((tag) => (
          <span key={tag} className="text-xs text-[#a1a1aa] font-mono">
            #{tag}
          </span>
        ))}
      </div>

      {/* Description */}
      <Card>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#e5e5e5]">{problem.description}</p>
      </Card>

      {/* Examples */}
      {problem.examples.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#a1a1aa] font-mono">Examples</h2>
          <div className="space-y-3">
            {problem.examples.map((ex, i) => (
              <div key={i} className="bg-[#121212] border border-[#6b7280] p-4 font-mono text-sm rounded-[var(--radius-lg)]">
                <div><span className="text-[#a1a1aa]">Input: </span><span className="text-[#e5e5e5]">{ex.input}</span></div>
                <div><span className="text-[#a1a1aa]">Output: </span><span className="text-[#e5e5e5]">{ex.output}</span></div>
                {ex.explanation && (
                  <div className="mt-1 text-[#a1a1aa]">Explanation: {ex.explanation}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const CodePanel = () => (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa] font-mono">Your Solution</h2>
        <Badge variant="accent">Python Only</Badge>
      </div>
      <div className="flex-1 min-h-0 border border-[#6b7280] rounded-[var(--radius-lg)] overflow-hidden">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="python"
          height="100%"
          options={{ automaticLayout: true }}
        />
      </div>
      <p className="mt-2 text-xs text-[#a1a1aa] shrink-0">
        Submit records your solution.
        <br />
        <span className="text-[#6b7280]">Tip: Press Esc then Tab to exit the editor</span>
      </p>
      <Button
        onClick={handleSubmit}
        disabled={submitting || pyodideLoading}
        loading={submitting || pyodideLoading}
        className="mt-4 shrink-0"
      >
        {pyodideLoading ? 'Loading Python...' : submitting ? 'Submitting...' : 'Submit Solution'}
      </Button>
    </div>
  );

  const OutputPanel = () => (
    <div className="space-y-4">
      {result ? (
        <Card className={`${result.allPassed && !submitError ? 'border-[#10b981]' : 'border-[#f43f5e]'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.allPassed && !submitError ? (
              <Check className="h-5 w-5 text-[#10b981]" />
            ) : (
              <X className="h-5 w-5 text-[#f43f5e]" />
            )}
            <p className={`font-semibold ${result.allPassed && !submitError ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
              {result.allPassed && !submitError ? 'All tests passed' : 'Some tests failed'}
            </p>
          </div>
          <p className="text-sm text-[#a1a1aa]">
            Passed {result.passedTests} / {result.totalTests} test cases
          </p>
          {submitError && (
            <div className="mt-3 bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-3 rounded-[var(--radius-md)]">
              <p className="text-xs font-semibold text-[#f43f5e] mb-1">Error:</p>
              <p className="text-xs text-[#f43f5e] font-mono whitespace-pre-wrap">{submitError}</p>
            </div>
          )}
          {result.xpAwarded != null && (
            <p className="mt-1 text-sm text-[#f59e0b]">
              XP awarded — your total XP is now {result.xpAwarded}
            </p>
          )}
          {isInRun && (
            <Button onClick={goToNext} className="mt-4">
              {runIndex + 1 < runProblems.length ? 'Next Problem →' : 'Finish Run'}
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-[#a1a1aa]">Submit your solution to see results</p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] h-[calc(100dvh-64px)] overflow-hidden">
      {/* Visually-hidden aria-live region for screen readers */}
      <div className="sr-only" aria-live="polite" role="status">
        {getAnnouncement()}
      </div>

      {/* Desktop/Tablet (>=768px): Console-below layout */}
      <div className="hidden md:block h-full">
        <div className="grid grid-cols-12 h-full">
          {/* Problem panel */}
          <div className="col-span-5 border-r border-[#6b7280] p-6 overflow-y-auto">
            {ProblemPanel()}
          </div>

          {/* Editor + Console panel */}
          <div className="col-span-7 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 p-6">
              {CodePanel()}
            </div>

            {/* Collapsible console */}
            {consoleOpen && (
              <div className="border-t border-[#6b7280] p-6 shrink-0" style={{ height: '35%' }} id="results-console">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa] font-mono">Results</h2>
                  <button
                    onClick={() => {
                      setConsoleOpen(false);
                      setUserClosedConsole(true);
                    }}
                    className="text-xs text-[#a1a1aa] hover:text-[#e5e5e5] focus-visible:outline-none flex items-center gap-1"
                    aria-expanded="true"
                    aria-controls="results-console"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Close
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 40px)' }}>
                  {OutputPanel()}
                </div>
              </div>
            )}

            {/* Console toggle bar */}
            {!consoleOpen && (
              <div className="border-t border-[#6b7280] p-2 shrink-0">
                <button
                  onClick={() => setConsoleOpen(true)}
                  className="w-full text-xs text-[#a1a1aa] hover:text-[#e5e5e5] focus-visible:outline-none font-mono flex items-center justify-center gap-1"
                  aria-expanded="false"
                  aria-controls="results-console"
                >
                  <ChevronDown className="h-4 w-4" />
                  Results Console
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Tab layout */}
      <div className="md:hidden pb-20 h-[calc(100dvh-120px)]">
        <div className="flex border-b border-[#6b7280] sticky top-0 bg-[#0a0a0a] z-10" role="tablist">
          <button
            onClick={() => setActiveTab('problem')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none ${
              activeTab === 'problem'
                ? 'border-[#f59e0b] text-[#e5e5e5]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#e5e5e5]'
            }`}
            role="tab"
            aria-selected={activeTab === 'problem'}
          >
            Problem
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none ${
              activeTab === 'code'
                ? 'border-[#f59e0b] text-[#e5e5e5]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#e5e5e5]'
            }`}
            role="tab"
            aria-selected={activeTab === 'code'}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none ${
              activeTab === 'output'
                ? 'border-[#f59e0b] text-[#e5e5e5]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#e5e5e5]'
            }`}
            role="tab"
            aria-selected={activeTab === 'output'}
          >
            Output
          </button>
        </div>

        <div className="h-full">
          {activeTab === 'problem' && (
            <div className="p-4 overflow-y-auto h-full" role="tabpanel">
              {ProblemPanel()}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="p-4 h-full flex flex-col min-h-0" role="tabpanel">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa] font-mono">Your Solution</h2>
                <Badge variant="accent">Python Only</Badge>
              </div>
              <div className="flex-1 min-h-0 border border-[#6b7280] rounded-[var(--radius-lg)] overflow-hidden" style={{ height: 'calc(100dvh - 280px)' }}>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="python"
                  height="100%"
                  options={{ automaticLayout: true }}
                />
              </div>
              <p className="mt-2 text-xs text-[#a1a1aa] shrink-0">
                Submit records your solution.
                <br />
                <span className="text-[#6b7280]">Tip: Press Esc then Tab to exit the editor</span>
              </p>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="p-4 h-full overflow-y-auto" role="tabpanel" aria-live="polite">
              {OutputPanel()}
            </div>
          )}
        </div>

        {/* Sticky bottom bar - mobile only */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-[#6b7280] p-4 flex gap-2 md:hidden" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          {isInRun && !result && (
            <Button variant="secondary" onClick={goToNext} className="flex-1">
              Skip
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={submitting || pyodideLoading}
            loading={submitting || pyodideLoading}
            className="flex-1"
          >
            {pyodideLoading ? 'Loading Python...' : submitting ? 'Submitting...' : 'Submit Solution'}
          </Button>
        </div>
      </div>
    </div>
  );
}
