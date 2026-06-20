import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  recentSubmissions: any[];
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
      } catch (err) {
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
          {error || "Failed to load dashboard"}
        </div>
      </main>
    );
  }

  const userJson = localStorage.getItem("user");
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-400">CodeBattle Arena</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.username || "User"}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">XP</p>
            <p className="mt-1 text-2xl font-bold text-indigo-300">{stats.xp}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">Coins</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">{stats.coins}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">Rank</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{stats.rank}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">Total Solved</p>
            <p className="mt-1 text-2xl font-bold text-slate-200">{stats.totalSolved}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">Easy</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{stats.solvedByDifficulty.Easy}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">Medium</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">{stats.solvedByDifficulty.Medium}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
          <p className="text-sm text-slate-400">Hard</p>
          <p className="mt-1 text-2xl font-bold text-rose-300">{stats.solvedByDifficulty.Hard}</p>
        </div>

        <p className="mt-8 text-sm text-slate-400">{user?.email || ""}</p>
      </div>
    </main>
  );
}

export default Dashboard;
