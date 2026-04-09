import { useState } from "react";
import { useSignIn, useSignUp } from "../hooks/useQueries";

type Tab = "signin" | "signup";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const signUpMutation = useSignUp();
  const signInMutation = useSignIn();

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLoading = signInMutation.isPending || signUpMutation.isPending;

  const inputClass =
    "w-full border-b border-foreground/25 bg-transparent text-foreground text-sm px-0 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground rounded-none";

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (tab === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      let err: string | null | undefined;
      if (tab === "signup") {
        err = await signUpMutation.mutateAsync({ email, password });
      } else {
        err = await signInMutation.mutateAsync({ email, password });
      }

      if (err) {
        setError(err);
      } else {
        window.location.href = "/account";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <main
      className="min-h-screen bg-background flex flex-col"
      data-ocid="login.page"
    >
      {/* Top navigation bar */}
      <div className="w-full border-b border-border px-8 py-5 flex items-center justify-between">
        <a
          href="/"
          className="font-display font-bold text-xl text-foreground"
          style={{ letterSpacing: "0.05em" }}
        >
          Achromis
        </a>
        <a
          href="/"
          className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Continue Shopping
        </a>
      </div>

      {/* Main content — vertically centred */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Brand identity block */}
          <div className="mb-10 text-center">
            <h1
              className="font-display font-bold text-foreground mb-2 leading-none"
              style={{
                fontSize: "clamp(2.5rem, 8vw, 3.75rem)",
                letterSpacing: "0.06em",
              }}
            >
              Achromis
            </h1>
            <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              Monochrome Prints
            </p>
          </div>

          {/* Thin divider */}
          <div className="border-t border-border mb-10" />

          {/* Tab switcher */}
          <div
            className="flex border-b border-border mb-8"
            role="tablist"
            aria-label="Authentication tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "signin"}
              onClick={() => switchTab("signin")}
              data-ocid="login.tab.signin"
              className={`pb-3 mr-8 text-[10px] tracking-[0.25em] uppercase transition-colors ${
                tab === "signin"
                  ? "text-foreground border-b-2 border-foreground -mb-px font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "signup"}
              onClick={() => switchTab("signup")}
              data-ocid="login.tab.signup"
              className={`pb-3 text-[10px] tracking-[0.25em] uppercase transition-colors ${
                tab === "signup"
                  ? "text-foreground border-b-2 border-foreground -mb-px font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate data-ocid="login.form">
            <div className="flex flex-col gap-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  data-ocid="login.email.input"
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete={
                    tab === "signup" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  data-ocid="login.password.input"
                  className={inputClass}
                />
              </div>

              {/* Confirm password (sign up only) */}
              {tab === "signup" && (
                <div>
                  <label
                    htmlFor="login-confirm"
                    className="block text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="login-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    data-ocid="login.confirm.input"
                    className={inputClass}
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <p
                  className="text-xs text-destructive leading-relaxed"
                  role="alert"
                  data-ocid="login.error.message"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                data-ocid="login.submit.button"
                className="mt-2 w-full bg-foreground text-background text-[10px] tracking-[0.3em] uppercase py-4 transition-opacity hover:opacity-75 disabled:opacity-40 font-medium"
              >
                {isLoading
                  ? "Please wait…"
                  : tab === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <p className="text-[10px] tracking-wider text-muted-foreground mt-10 leading-relaxed text-center uppercase">
            Browsing and checkout available without an account
          </p>
        </div>
      </div>

      {/* Bottom editorial strip */}
      <div className="border-t border-border px-8 py-4 flex items-center justify-center">
        <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
          © {new Date().getFullYear()} Achromis &nbsp;·&nbsp; Fine Art Prints
        </p>
      </div>
    </main>
  );
}
