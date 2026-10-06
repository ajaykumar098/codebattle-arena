import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

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
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">CodeBattle Arena</p>
          <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">Daily Challenge</h1>
        </div>

        <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
          Start a challenge to receive 3 randomly selected problems. Solve them in order at your own pace.
        </p>

        {error && (
          <div className="mb-6 bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-4 text-sm text-[#f43f5e] rounded-[var(--radius-lg)]" role="alert">
            {error}
          </div>
        )}

        <Button
          onClick={handleStart}
          disabled={loading}
          loading={loading}
          className="w-full"
        >
          {loading ? 'Loading problems...' : 'Start Challenge'}
        </Button>
      </div>
    </div>
  );
}
