import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Print,
  PrintUpdate,
  Product,
  ShoppingItem,
  StripeConfiguration,
} from "../backend";
import { PrintFinish, UserRole, createActor } from "../backend";

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

export { PrintFinish };
