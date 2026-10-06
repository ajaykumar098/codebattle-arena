import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
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
          <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">Create Account</h1>
        </div>

        <div className="bg-[#121212] border border-[#6b7280] rounded-[var(--radius-lg)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="fullName"
              label="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <Input
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
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
            <Input
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="text-sm text-[#f43f5e]" role="alert">{error}</p>
            )}
            {success && (
              <p className="text-sm text-[#10b981]" role="status">{success}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#a1a1aa]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#f59e0b] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
