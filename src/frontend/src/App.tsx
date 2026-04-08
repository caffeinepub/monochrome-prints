import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import CollectionsPage from "./pages/CollectionsPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import StorefrontPage from "./pages/StorefrontPage";

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

  if (sessionId) {
    return <OrderConfirmationPage sessionId={sessionId} />;
  }

  return <StorefrontPage />;
}

export default function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <Router />
        <Toaster position="top-center" />
      </CartProvider>
    </CurrencyProvider>
  );
}
