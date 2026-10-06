import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

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
      <div className="min-h-screen p-8 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[#121212] border border-[#6b7280] rounded-[var(--radius-lg)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-6 text-[#f43f5e] rounded-[var(--radius-lg)]">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-[#0a0a0a] md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">CodeBattle Arena</p>
          <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">Problems</h1>
          <p className="mt-2 text-[#a1a1aa]">
            {problems.length} challenges ready to solve
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {problems.map((problem) => (
            <Link
              key={problem._id}
              to={`/problems/${problem.slug}`}
              className="block"
            >
              <Card className="group transition-colors hover:bg-[#1a1a1a]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-lg font-semibold text-[#e5e5e5] group-hover:text-[#f59e0b] transition-colors font-mono">
                    {problem.title}
                  </h2>
                  <Badge variant={problem.difficulty.toLowerCase() as "easy" | "medium" | "hard" | "success" | "error" | "neutral" | "accent"}>
                    {problem.difficulty}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-[#a1a1aa] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
