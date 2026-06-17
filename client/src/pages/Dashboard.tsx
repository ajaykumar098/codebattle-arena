import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  username: string;
  email: string;
  xp: number;
  coins: number;
  rank: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem("user");
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-400">CodeBattle Arena</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {user.username}</h1>
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
            <p className="mt-1 text-2xl font-bold text-indigo-300">{user.xp}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">Coins</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">{user.coins}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-400">Rank</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{user.rank}</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-400">{user.email}</p>
      </div>
    </main>
  );
}

export default Dashboard;
