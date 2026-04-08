import { LogOut, User } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSignOut } from "../hooks/useQueries";

export default function AccountPage() {
  const { email, isLoggedIn, isLoading } = useAuth();
  const signOutMutation = useSignOut();

  // Redirect to /login if not authenticated (after loading)
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = "/login";
    }
  }, [isLoading, isLoggedIn]);

  // Show spinner while validating session
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return null; // redirect in progress
  }

  function handleSignOut() {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  }

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

        {/* Email card */}
        <div className="border border-border p-6 mb-6">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
            Account
          </p>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <p
              className="text-sm text-foreground break-all"
              data-ocid="account.email.display"
            >
              {email}
            </p>
          </div>
        </div>

        {/* Coming soon card */}
        <div
          className="border border-border p-6 mb-10 bg-muted/30"
          data-ocid="account.coming_soon.section"
        >
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
          onClick={handleSignOut}
          disabled={signOutMutation.isPending}
          data-ocid="account.logout.button"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signOutMutation.isPending ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </main>
  );
}
