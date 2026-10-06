import { useEffect, useState } from "react";
import Card from "../components/ui/Card";

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
    <main className="min-h-screen px-4 py-10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">CodeBattle Arena</p>
          <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">Setup Checkpoint</h1>
          <p className="mt-3 text-[#a1a1aa]">
            Frontend is running with React + TypeScript + Tailwind. This page verifies backend and Mongo
            connectivity.
          </p>
        </div>

        <Card className="mb-4">
          <p className="text-sm text-[#a1a1aa] font-mono">Backend URL</p>
          <p className="mt-1 font-mono text-sm text-[#e5e5e5]">{API_BASE_URL}</p>
        </Card>

        <Card>
          <p className="text-sm text-[#a1a1aa] font-mono">Health Check</p>

          {loading && <p className="mt-2 text-[#f59e0b]">Checking backend...</p>}

          {!loading && error && <p className="mt-2 text-[#f43f5e]">Error: {error}</p>}

          {!loading && health && (
            <div className="mt-3 space-y-1 text-sm text-[#e5e5e5]">
              <p>{health.message}</p>
              <p>Server Time: {new Date(health.serverTime).toLocaleString()}</p>
              <p>
                MongoDB:{" "}
                <span className={health.dbConnected ? "text-[#10b981]" : "text-[#f59e0b]"}>
                  {health.dbConnected ? "Connected" : "Not connected (check server .env)"}
                </span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

export default SetupCheck;
