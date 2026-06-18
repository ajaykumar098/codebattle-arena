import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface ProblemData {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  examples: Example[];
  testCases: TestCase[];
  starterCode: string;
}

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-600 bg-green-100',
  Medium: 'text-yellow-600 bg-yellow-100',
  Hard: 'text-red-600 bg-red-100'
};

export default function ProblemDetail() {
  const { slug } = useParams();
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/problems/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Problem not found');
        return res.json();
      })
      .then((data) => setProblem(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-8">Loading problem...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!problem) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/problems" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to problems
      </Link>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold">{problem.title}</h1>
        <span className={`px-4 py-2 rounded-full font-semibold ${difficultyColor[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {problem.tags.map((tag) => (
          <span key={tag} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mb-8 text-gray-700 leading-relaxed">{problem.description}</div>

      <h2 className="text-2xl font-bold mb-4">Examples</h2>
      <div className="space-y-4 mb-8">
        {problem.examples.map((ex, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded-lg">
            <div className="mb-2"><strong>Input:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{ex.input}</code></div>
            <div className="mb-2"><strong>Output:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{ex.output}</code></div>
            {ex.explanation && (
              <div><strong>Explanation:</strong> {ex.explanation}</div>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">Starter Code</h2>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{problem.starterCode}</code>
      </pre>
    </div>
  );
}
