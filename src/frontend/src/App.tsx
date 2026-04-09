import { Toaster } from "@/components/ui/sonner";
import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { useValidateSession } from "./hooks/useQueries";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import CollectionsPage from "./pages/CollectionsPage";
import LoginPage from "./pages/LoginPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import StorefrontPage from "./pages/StorefrontPage";

// ---------------------------------------------------------------------------
// Error boundary — catches any runtime error in the tree so the page never
// goes fully blank. Shows a minimal recovery UI instead.
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: "" });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            fontFamily: "sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p style={{ color: "#666", maxWidth: "400px", fontSize: "0.9rem" }}>
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: "0.5rem 1.5rem",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// SessionValidator — runs once on mount, isolated in its own error boundary
// so any unexpected throw cannot crash the rest of the app.
// ---------------------------------------------------------------------------

function SessionValidator() {
  useValidateSession();
  return null;
}

function SafeSessionValidator() {
  return (
    <AppErrorBoundary>
      <SessionValidator />
    </AppErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function Router() {
  const path = window.location.pathname;
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  if (path === "/admin") {
    return <AdminPage />;
  }

  if (path === "/collections") {
    return <CollectionsPage />;
  }

  if (path === "/about") {
    return <AboutPage />;
  }

  if (path === "/account") {
    return <AccountPage />;
  }

  if (path === "/login") {
    return <LoginPage />;
  }

  if (sessionId) {
    return <OrderConfirmationPage sessionId={sessionId} />;
  }

  return <StorefrontPage />;
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <AppErrorBoundary>
      <InternetIdentityProvider>
        <AuthProvider>
          <SafeSessionValidator />
          <CurrencyProvider>
            <CartProvider>
              <AppErrorBoundary>
                <Router />
              </AppErrorBoundary>
              <Toaster position="top-center" />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </InternetIdentityProvider>
    </AppErrorBoundary>
  );
}
