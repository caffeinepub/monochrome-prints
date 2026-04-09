import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
  Print,
  PrintUpdate,
  Product,
  ShoppingItem,
  StripeConfiguration,
  UserInfo,
} from "../backend";
import { PrintFinish, UserRole, createActor } from "../backend";
import {
  EMAIL_KEY,
  SESSION_KEY,
  hashPassword,
  useAuthContext,
} from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Auth — session validation on mount
// ---------------------------------------------------------------------------

/**
 * Call this once at the top of the app tree (inside AuthProvider).
 * It validates the persisted token on load and clears it if expired.
 * Never throws — any failure just marks the user as logged out.
 */
export function useValidateSession() {
  const { actor, isFetching } = useActor(createActor);
  const { token, _clearSession, _setLoading } = useAuthContext();

  useEffect(() => {
    if (isFetching || !token) {
      _setLoading(false);
      return;
    }
    if (!actor) return;

    actor
      .validateSession(token)
      .then((result) => {
        try {
          if (result.__kind__ !== "ok") {
            _clearSession();
          }
        } catch {
          _clearSession();
        }
      })
      .catch(() => {
        _clearSession();
      })
      .finally(() => {
        try {
          _setLoading(false);
        } catch {
          // context may have unmounted
        }
      });
  }, [actor, isFetching, token, _clearSession, _setLoading]);
}

// ---------------------------------------------------------------------------
// Auth mutations — sign in / sign up / sign out
// ---------------------------------------------------------------------------

export function useSignUp() {
  const { actor } = useActor(createActor);
  const { _setSession } = useAuthContext();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: { email: string; password: string }) => {
      if (!actor) throw new Error("Not ready");
      const hash = await hashPassword(password);
      const result = await actor.signUp(email.trim().toLowerCase(), hash);
      if (result.__kind__ === "ok") {
        _setSession(result.ok, email.trim().toLowerCase());
        return null;
      }
      return result.err;
    },
  });
}

export function useSignIn() {
  const { actor } = useActor(createActor);
  const { _setSession } = useAuthContext();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: { email: string; password: string }) => {
      if (!actor) throw new Error("Not ready");
      const hash = await hashPassword(password);
      const result = await actor.signIn(email.trim().toLowerCase(), hash);
      if (result.__kind__ === "ok") {
        _setSession(result.ok, email.trim().toLowerCase());
        return null;
      }
      return result.err;
    },
  });
}

export function useSignOut() {
  const { actor } = useActor(createActor);
  const { token, _clearSession } = useAuthContext();
  return useMutation({
    mutationFn: async () => {
      if (actor && token) {
        await actor.signOut(token).catch(() => {});
      }
      _clearSession();
    },
  });
}

// ---------------------------------------------------------------------------
// Profile — authenticated queries and mutations
// ---------------------------------------------------------------------------

export function useGetMyProfile(token: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserInfo | null>({
    queryKey: ["myProfile", token],
    queryFn: async () => {
      if (!actor || !token) return null;
      const result = await actor.getMyProfile(token);
      if (result.__kind__ === "ok") return result.ok;
      return null;
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useSaveMyProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      country,
    }: {
      token: string;
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      country: string;
    }) => {
      if (!actor) throw new Error("Not ready");
      const result = await actor.saveMyProfile(
        token,
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        country,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["myProfile", variables.token] });
    },
  });
}

// ---------------------------------------------------------------------------
// READ queries — unauthenticated, use useActor for ICP actor lifecycle
// ---------------------------------------------------------------------------

export function useActivePrints() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Print[]>({
    queryKey: ["activePrints"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivePrints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPrints() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Print[]>({
    queryKey: ["allPrints"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPrints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["allProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["sessionStatus", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

// ---------------------------------------------------------------------------
// Admin mutations — use useActor (Internet Identity caller)
// ---------------------------------------------------------------------------

export function useCreatePrint() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newPrint: PrintUpdate) => {
      if (!actor) throw new Error("No actor");
      return actor.createPrint(newPrint);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPrints"] });
      qc.invalidateQueries({ queryKey: ["activePrints"] });
    },
  });
}

export function useUpdatePrint() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: { id: bigint; updates: PrintUpdate }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePrint(id, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPrints"] });
      qc.invalidateQueries({ queryKey: ["activePrints"] });
    },
  });
}

export function useDeletePrint() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (printId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePrint(printId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPrints"] });
      qc.invalidateQueries({ queryKey: ["activePrints"] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("No actor");
      return actor.addProduct(product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProduct(product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useSetStripeConfig() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("No actor");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stripeConfigured"] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

// Admin-only: still uses Internet Identity for the caller principal
export function useClaimAdmin() {
  const { actor } = useActor(createActor);
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor || !identity) throw new Error("Not logged in");
      const principal = identity.getPrincipal();
      return actor.assignCallerUserRole(principal, UserRole.admin);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export { PrintFinish, SESSION_KEY, EMAIL_KEY };
