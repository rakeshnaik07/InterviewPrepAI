import { useState, useContext } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { AuthContext } from "../AuthContext";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      login(response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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

        {/* Headline + trust cue (hidden on small screens to keep mobile compact) */}
        <div className="hidden lg:block max-w-md">
          <span className="inline-flex items-center rounded-full border border-[#f7f3eb]/25 px-3 py-1 text-xs font-medium text-[#f7f3eb]/80">
            Everything You Need to Land Your Next Job
          </span>
          <h1
            className="mt-6 text-5xl leading-tight tracking-tight"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Walk in prepared.
          </h1>
          <p className="mt-4 text-[#f7f3eb]/80 leading-relaxed">
            Match scores, AI-generated questions, and a focused plan, so you
            spend less time worrying and more time getting ready.
          </p>
          <figure className="mt-10 border-l-2 border-[#f7f3eb]/25 pl-4">
            <blockquote className="text-[#f7f3eb]/90 leading-relaxed">
              &ldquo;I felt calm walking into the room for the first time. I knew
              exactly what to expect.&rdquo;
            </blockquote>
            <figcaption className="mt-2 text-sm text-[#f7f3eb]/70">
              Maya R., Product Designer
            </figcaption>
          </figure>
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
            Welcome back
          </h2>
          <p className="mt-2 text-[#1c1a17]/60 leading-relaxed">
            Sign in to continue your prep.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-12 rounded-xl border border-[#1c1a17]/15 bg-white px-4 text-[#1c1a17] placeholder:text-[#1c1a17]/40 outline-none transition focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-xs text-[#1c1a17]/40">
            <span className="h-px flex-1 bg-[#1c1a17]/10" />
            <span>OR</span>
            <span className="h-px flex-1 bg-[#1c1a17]/10" />
          </div>

          <p className="mt-6 text-center text-sm text-[#1c1a17]/70">
            New here?{" "}
            <Link to="/register" className="font-medium text-[#2f5d50] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
