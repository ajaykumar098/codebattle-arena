import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type HealthResponse = {
  message: string;
  serverTime: string;
  dbConnected: boolean;
};

function SetupCheck() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);

        if (!response.ok) {
          throw new Error("Backend responded with a non-200 status.");
        }

        const data = (await response.json()) as HealthResponse;
        setHealth(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to connect backend.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-400">CodeBattle Arena</p>
        <h1 className="mt-2 text-3xl font-bold">Setup Checkpoint</h1>
        <p className="mt-3 text-slate-300">
          Frontend is running with React + TypeScript + Tailwind. This page verifies backend and Mongo
          connectivity.
        </p>

        <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950/60 p-5">
          <p className="text-sm text-slate-400">Backend URL</p>
          <p className="mt-1 font-mono text-sm text-slate-200">{API_BASE_URL}</p>
        </div>

        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-5">
          <p className="text-sm text-slate-400">Health Check</p>

          {loading && <p className="mt-2 text-amber-300">Checking backend...</p>}

          {!loading && error && <p className="mt-2 text-red-300">Error: {error}</p>}

          {!loading && health && (
            <div className="mt-3 space-y-1 text-sm text-slate-200">
              <p>{health.message}</p>
              <p>Server Time: {new Date(health.serverTime).toLocaleString()}</p>
              <p>
                MongoDB:{" "}
                <span className={health.dbConnected ? "text-emerald-300" : "text-amber-300"}>
                  {health.dbConnected ? "Connected" : "Not connected (check server .env)"}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SetupCheck;
