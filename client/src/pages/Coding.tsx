import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

const difficultyStyles: Record<string, string> = {
  Easy: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  Hard: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
};

export default function Coding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/problems/random-set`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch problems');
      const problems: Problem[] = await res.json();

      // Navigate to the first problem (Easy), passing the full set via route state
      navigate(`/problems/${problems[0].slug}`, {
        state: {
          runProblems: problems,
          runIndex: 0,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-400">
          CodeBattle Arena
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-50">Daily Challenge</h1>
        <p className="mt-4 text-slate-400">
          You'll get 3 randomly selected problems — one Easy, one Medium, one Hard.
          Solve them in order at your own pace.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
            <div
              key={d}
              className={`rounded-xl border p-4 text-sm font-semibold ${difficultyStyles[d]}`}
            >
              {d}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={loading}
          className="mt-10 rounded-xl bg-indigo-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30 disabled:opacity-50"
        >
          {loading ? 'Picking problems...' : 'Start Daily Challenge'}
        </button>
      </div>
    </div>
  );
}
