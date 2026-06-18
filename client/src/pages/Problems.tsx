import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-600 bg-green-100',
  Medium: 'text-yellow-600 bg-yellow-100',
  Hard: 'text-red-600 bg-red-100'
};

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/problems')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch problems');
        return res.json();
      })
      .then((data) => setProblems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading problems...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Problems</h1>
      <div className="space-y-4">
        {problems.map((problem) => (
          <Link key={problem._id} to={`/problems/${problem.slug}`}>
            <div className="p-4 border border-gray-300 rounded-lg hover:shadow-lg cursor-pointer transition">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{problem.title}</h2>
                <span className={`px-3 py-1 rounded-full font-semibold ${difficultyColor[problem.difficulty]}`}>
                  {problem.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span key={tag} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
