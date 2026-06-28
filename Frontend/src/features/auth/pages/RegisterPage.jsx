import { useNavigate, Link } from "react-router-dom";
import { useState, useContext } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { AuthContext } from "../AuthContext";

const RegisterPage = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/register", {
        username,
        email,
        password,
      });
      login(response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f7f3eb] text-[#1c1a17] flex flex-col lg:flex-row font-sans">
      {/* Brand panel */}
      <section className="bg-[#2f5d50] text-[#f7f3eb] lg:w-[45%] flex flex-col justify-between p-8 lg:p-12">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7f3eb] text-[#2f5d50] font-semibold">
            IP
          </span>
          <span className="text-lg font-semibold tracking-tight">
            InterviewPrep AI
          </span>
        </div>

        {/* Headline + concrete deliverables (not the same copy as Login) */}
        <div className="hidden lg:block max-w-md">
          <h1
            className="text-4xl leading-tight tracking-tight"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            One job description in. A full prep plan out.
          </h1>

          <div className="mt-8 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#f7f3eb]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <p className="text-[#f7f3eb]/85 leading-relaxed">
                See how well you actually match the role.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#f7f3eb]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 9h8M8 13h6" />
                <rect x="3" y="4" width="18" height="16" rx="2" />
              </svg>
              <p className="text-[#f7f3eb]/85 leading-relaxed">
                30 likely questions, with what each one is really testing.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#f7f3eb]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
              <p className="text-[#f7f3eb]/85 leading-relaxed">
                A 7-day plan that fits before your interview, not after.
              </p>
            </div>
          </div>
        </div>

        <p className="hidden lg:block text-xs text-[#f7f3eb]/60">
          &copy; {new Date().getFullYear()} InterviewPrep AI
        </p>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          <h2
            className="text-3xl tracking-tight"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Create your account
          </h2>
          <p className="mt-2 text-[#1c1a17]/60 leading-relaxed">
            Takes under a minute.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                autoComplete="username"
                required
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jane_doe"
                className="h-12 rounded-xl border border-[#1c1a17]/15 bg-white px-4 text-[#1c1a17] placeholder:text-[#1c1a17]/40 outline-none transition focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-xl border border-[#1c1a17]/15 bg-white px-4 text-[#1c1a17] placeholder:text-[#1c1a17]/40 outline-none transition focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                autoComplete="new-password"
                required
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-12 rounded-xl border border-[#1c1a17]/15 bg-white px-4 text-[#1c1a17] placeholder:text-[#1c1a17]/40 outline-none transition focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-[#c4623f]/10 px-3 py-2 text-sm text-[#c4623f]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-[#2f5d50] font-medium text-[#f7f3eb] transition hover:bg-[#264c41] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#1c1a17]/70">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#2f5d50] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
