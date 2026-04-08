import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, User } from "lucide-react";

function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
}

export default function AccountPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div
          className="text-center max-w-sm w-full"
          data-ocid="account.signin.prompt"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display font-light tracking-wider text-foreground mb-2">
            Sign In
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Sign in to track your orders and manage your account.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="account.signin.button"
            className="w-full text-xs tracking-widest uppercase"
          >
            {loginStatus === "logging-in"
              ? "Signing in…"
              : "Sign In with Internet Identity"}
          </Button>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Browsing and checkout work without signing in.
          </p>
        </div>
      </main>
    );
  }

  const principal = identity.getPrincipal().toText();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          ← Back to Shop
        </a>

        {/* Greeting */}
        <div className="mb-12" data-ocid="account.profile.section">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
            My Account
          </p>
          <h1 className="text-3xl font-display font-light tracking-wider text-foreground mb-1">
            Welcome to Achromis
          </h1>
          <p className="text-sm text-muted-foreground">You are signed in.</p>
        </div>

        {/* Principal card */}
        <div className="border border-border p-6 mb-6">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
            Identity
          </p>
          <p
            className="text-sm font-mono text-foreground break-all"
            data-ocid="account.principal.display"
            title={principal}
          >
            {shortenPrincipal(principal)}
          </p>
        </div>

        {/* Coming soon card */}
        <div className="border border-border p-6 mb-10 bg-muted/30">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
            Profile &amp; Orders
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Profile details, saved addresses, and order history are coming soon.
          </p>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => {
            clear();
            window.location.href = "/";
          }}
          data-ocid="account.logout.button"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </main>
  );
}
