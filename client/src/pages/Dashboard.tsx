import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

type User = {
  id: string;
  username: string;
  email: string;
  xp: number;
  coins: number;
  rank: string;
};

type DashboardStats = {
  xp: number;
  coins: number;
  rank: string;
  totalSolved: number;
  solvedByDifficulty: { Easy: number; Medium: number; Hard: number };
  recentSubmissions: unknown[];
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load dashboard");
        const data = await res.json();
        setStats(data);

        // Update localStorage with fresh user data
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          user.xp = data.xp;
          user.coins = data.coins;
          user.rank = data.rank;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch {
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen px-4 py-10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-2xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-6 text-[#f43f5e] rounded-[var(--radius-lg)]">
          {error || "Failed to load dashboard"}
        </div>
      </main>
    );
  }

  const userJson = localStorage.getItem("user");
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  return (
    <main className="min-h-screen px-4 py-10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">CodeBattle Arena</p>
            <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">
              Welcome, {user?.username || "User"}
            </h1>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="text-center">
            <p className="text-sm text-[#a1a1aa] font-mono">XP</p>
            <p className="mt-1 text-2xl font-semibold text-[#e5e5e5] font-mono">{stats.xp}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-[#a1a1aa] font-mono">Coins</p>
            <p className="mt-1 text-2xl font-semibold text-[#e5e5e5] font-mono">{stats.coins}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-[#a1a1aa] font-mono">Rank</p>
            <p className="mt-1 text-2xl font-semibold text-[#10b981] font-mono">{stats.rank}</p>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="text-center">
            <p className="text-sm text-[#a1a1aa] font-mono">Total Solved</p>
            <p className="mt-1 text-2xl font-semibold text-[#e5e5e5] font-mono">{stats.totalSolved}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-[#a1a1aa] font-mono">Easy</p>
            <p className="mt-1 text-2xl font-semibold text-[#10b981] font-mono">{stats.solvedByDifficulty.Easy}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-[#a1a1aa] font-mono">Medium</p>
            <p className="mt-1 text-2xl font-semibold text-[#f59e0b] font-mono">{stats.solvedByDifficulty.Medium}</p>
          </Card>
        </div>

        <Card className="text-center mb-8">
          <p className="text-sm text-[#a1a1aa] font-mono">Hard</p>
          <p className="mt-1 text-2xl font-semibold text-[#f43f5e] font-mono">{stats.solvedByDifficulty.Hard}</p>
        </Card>

        <p className="text-sm text-[#a1a1aa]">{user?.email || ""}</p>
      </div>
    </main>
  );
}

export default Dashboard;
