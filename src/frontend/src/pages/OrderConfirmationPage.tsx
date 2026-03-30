import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useStripeSessionStatus } from "../hooks/useQueries";

interface OrderConfirmationPageProps {
  sessionId: string;
}

export default function OrderConfirmationPage({
  sessionId,
}: OrderConfirmationPageProps) {
  const { data: status, isLoading } = useStripeSessionStatus(sessionId);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {isLoading ? (
          <div
            data-ocid="order.loading_state"
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="font-display text-lg uppercase tracking-widest text-muted-foreground">
              Confirming your order…
            </p>
          </div>
        ) : status?.__kind__ === "completed" ? (
          <div data-ocid="order.success_state">
            <CheckCircle className="h-16 w-16 text-foreground mx-auto mb-6" />
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
              Order Confirmed
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Thank you for your purchase. Your prints will be carefully
              prepared and shipped within 5–7 business days.
            </p>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs font-bold px-8 py-6 rounded-none"
            >
              <a href="/" data-ocid="order.continue_shopping.button">
                Continue Shopping
              </a>
            </Button>
          </div>
        ) : (
          <div data-ocid="order.error_state">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
              Payment Issue
            </h1>
            <p className="text-muted-foreground mb-8">
              {status?.__kind__ === "failed"
                ? status.failed.error
                : "Something went wrong with your order. Please try again."}
            </p>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs font-bold px-8 py-6 rounded-none"
            >
              <a href="/" data-ocid="order.go_home.button">
                Return to Store
              </a>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
