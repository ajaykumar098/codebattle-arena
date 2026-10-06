import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">CodeBattle Arena</p>
          <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">Login</h1>
        </div>

        <div className="bg-[#121212] border border-[#6b7280] rounded-[var(--radius-lg)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              hint="At least 6 characters with uppercase, lowercase, number, and special character"
              required
            />

            {error && (
              <p className="text-sm text-[#f43f5e]" role="alert">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#a1a1aa]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#f59e0b] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
