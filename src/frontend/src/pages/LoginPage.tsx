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
    "w-full border border-border bg-background text-foreground text-sm px-4 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground";

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
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      data-ocid="login.page"
    >
      {/* Back link */}
      <div className="w-full max-w-sm mb-8">
        <a
          href="/"
          className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </a>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand heading */}
        <h1 className="font-display text-4xl font-normal tracking-wider text-foreground mb-1">
          Achromis
        </h1>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-10">
          Monochrome Prints
        </p>

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
            className={`pb-3 mr-8 text-xs tracking-widest uppercase transition-colors ${
              tab === "signin"
                ? "text-foreground border-b-2 border-foreground -mb-px"
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
            className={`pb-3 text-xs tracking-widest uppercase transition-colors ${
              tab === "signup"
                ? "text-foreground border-b-2 border-foreground -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate data-ocid="login.form">
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs tracking-widest uppercase text-muted-foreground mb-2"
              >
                Email
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
                className="block text-xs tracking-widest uppercase text-muted-foreground mb-2"
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
                  className="block text-xs tracking-widest uppercase text-muted-foreground mb-2"
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
              className="mt-2 w-full bg-foreground text-background text-xs tracking-widest uppercase py-3.5 transition-opacity hover:opacity-80 disabled:opacity-50"
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
        <p className="text-xs text-muted-foreground mt-8 leading-relaxed text-center">
          Browsing and checkout work without signing in.
        </p>
      </div>
    </main>
  );
}
