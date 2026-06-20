import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

const difficultyGlow: Record<string, string> = {
  Easy: 'hover:shadow-emerald-500/10',
  Medium: 'hover:shadow-amber-500/10',
  Hard: 'hover:shadow-rose-500/10',
};

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/problems`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch problems');
        return res.json();
      })
      .then((data) => setProblems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-400">
            CodeBattle Arena
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-50">Problems</h1>
          <p className="mt-2 text-slate-400">
            {problems.length} challenges ready to solve
          </p>
        </div>

        <div className="space-y-4">
          {problems.map((problem, index) => (
            <Link
              key={problem._id}
              to={`/problems/${problem.slug}`}
              className="block animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <div
                className={`group rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:shadow-xl ${difficultyGlow[problem.difficulty]}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-100 transition-colors group-hover:text-indigo-300">
                    {problem.title}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyles[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
