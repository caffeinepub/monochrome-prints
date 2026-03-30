import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type PrintFinish, UserRole } from "../backend";
import type { Print, Product } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useAllPrints,
  useAllProducts,
  useCreatePrint,
  useDeletePrint,
  useDeleteProduct,
  useIsAdmin,
  useSetStripeConfig,
  useUpdatePrint,
} from "../hooks/useQueries";

type AdminSection = "prints" | "products" | "stripe";

export default function AdminPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [section, setSection] = useState<AdminSection>("prints");
  const [claimingAdmin, setClaimingAdmin] = useState(false);

  const handleClaimAdmin = async () => {
    if (!actor || !identity) return;
    setClaimingAdmin(true);
    try {
      const principal = identity.getPrincipal();
      await actor.assignCallerUserRole(principal, UserRole.admin);
      toast.success("You are now an admin. Refreshing…");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast.error("Failed to claim admin role.");
    } finally {
      setClaimingAdmin(false);
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-display text-3xl uppercase tracking-widest text-foreground">
          Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm">
          Please log in to continue.
        </p>
        <Button
          onClick={() => login()}
          disabled={loginStatus === "logging-in"}
          data-ocid="admin.login.button"
          className="bg-primary text-primary-foreground uppercase tracking-widest text-xs rounded-none px-8 py-6"
        >
          {loginStatus === "logging-in" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Log In
        </Button>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-display text-3xl uppercase tracking-widest text-foreground">
          Not Authorized
        </h1>
        <p className="text-sm text-muted-foreground">
          You do not have admin access.
        </p>
        <Button
          onClick={handleClaimAdmin}
          disabled={claimingAdmin}
          data-ocid="admin.claim_admin.button"
          className="bg-primary text-primary-foreground uppercase tracking-widest text-xs rounded-none px-8 py-6"
        >
          {claimingAdmin ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Claim Admin (First-Time Setup)
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            data-ocid="admin.back.link"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </a>
          <h1 className="font-display text-lg uppercase tracking-widest text-foreground">
            Admin Panel
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Nav */}
        <div className="flex gap-1 mb-10 border-b border-border">
          {(["prints", "products", "stripe"] as AdminSection[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              data-ocid={`admin.${s}.tab`}
              className={`px-6 py-3 text-xs tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                section === s
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "stripe" ? "Stripe Config" : s}
            </button>
          ))}
        </div>

        {section === "prints" && <PrintsSection />}
        {section === "products" && <ProductsSection />}
        {section === "stripe" && <StripeSection />}
      </div>
    </div>
  );
}

/* ──────────────────── Prints Section ──────────────────── */

function PrintsSection() {
  const { data: prints = [], isLoading } = useAllPrints();
  const createPrint = useCreatePrint();
  const updatePrint = useUpdatePrint();
  const deletePrint = useDeletePrint();

  const [showForm, setShowForm] = useState(false);
  const [editingPrint, setEditingPrint] = useState<Print | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditingPrint(null);
    setForm({ title: "", description: "", active: true });
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (p: Print) => {
    setEditingPrint(p);
    setForm({ title: p.title, description: p.description, active: p.active });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editingPrint && !imageFile) {
      toast.error("Image is required");
      return;
    }
    setSubmitting(true);
    try {
      let imageBlob: ExternalBlob;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob =
          ExternalBlob.fromBytes(bytes).withUploadProgress(setUploadProgress);
      } else {
        imageBlob = editingPrint!.image;
      }
      const printUpdate = {
        title: form.title,
        description: form.description,
        active: form.active,
        image: imageBlob,
      };
      if (editingPrint) {
        await updatePrint.mutateAsync({
          id: editingPrint.id,
          updates: printUpdate,
        });
        toast.success("Print updated.");
      } else {
        await createPrint.mutateAsync(printUpdate);
        toast.success("Print created.");
      }
      setShowForm(false);
    } catch {
      toast.error("Failed to save print.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deletePrint.mutateAsync(id);
      toast.success("Print deleted.");
    } catch {
      toast.error("Failed to delete print.");
    }
  };

  if (showForm) {
    return (
      <div className="max-w-lg">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          data-ocid="admin.prints.cancel_button"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-8">
          {editingPrint ? "Edit Print" : "Add Print"}
        </h2>
        <div className="space-y-6">
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">
              Title
            </Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="admin.print.title.input"
              className="mt-2 bg-card border-border rounded-none"
              placeholder="Mountain Mist"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="admin.print.description.textarea"
              className="mt-2 bg-card border-border rounded-none"
              rows={4}
              placeholder="Describe the print…"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">
              Image
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              data-ocid="admin.print.image.upload_button"
              className="mt-2 bg-card border-border rounded-none"
            />
            {editingPrint && !imageFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to keep existing image.
              </p>
            )}
            {submitting && uploadProgress > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Uploading: {uploadProgress}%
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              data-ocid="admin.print.active.switch"
            />
            <Label className="text-sm text-muted-foreground">
              Active (visible in store)
            </Label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              data-ocid="admin.print.save_button"
              className="bg-primary text-primary-foreground uppercase tracking-widest text-xs rounded-none px-6 py-5"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingPrint ? "Save Changes" : "Create Print"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              data-ocid="admin.print.cancel_button"
              className="rounded-none uppercase tracking-widest text-xs px-6 py-5"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl uppercase tracking-wide text-foreground">
          Prints
        </h2>
        <Button
          onClick={openCreate}
          data-ocid="admin.prints.add_button"
          className="bg-primary text-primary-foreground uppercase tracking-widest text-xs rounded-none px-6 py-5"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Print
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="admin.prints.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : prints.length === 0 ? (
        <div
          data-ocid="admin.prints.empty_state"
          className="text-center py-16 border border-border"
        >
          <p className="font-display text-xl uppercase tracking-widest text-muted-foreground">
            No prints yet
          </p>
        </div>
      ) : (
        <Table data-ocid="admin.prints.table">
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prints.map((p, idx) => (
              <TableRow
                key={String(p.id)}
                data-ocid={`admin.prints.row.${idx + 1}`}
              >
                <TableCell>
                  <div className="w-12 h-14 bg-card overflow-hidden">
                    <img
                      src={p.image.getDirectURL()}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-display uppercase tracking-wide text-sm">
                  {p.title}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs uppercase tracking-widest ${p.active ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(p)}
                      data-ocid={`admin.prints.edit_button.${idx + 1}`}
                      className="rounded-none text-xs uppercase tracking-widest"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          data-ocid={`admin.prints.delete_button.${idx + 1}`}
                          className="rounded-none text-xs uppercase tracking-widest border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border rounded-none">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display uppercase tracking-wide">
                            Delete Print
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            This will permanently delete "{p.title}". This
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            data-ocid="admin.prints.delete.cancel_button"
                            className="rounded-none uppercase tracking-widest text-xs"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(p.id)}
                            data-ocid="admin.prints.delete.confirm_button"
                            className="bg-destructive text-destructive-foreground rounded-none uppercase tracking-widest text-xs"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

/* ──────────────────── Products Section ──────────────────── */

function ProductsSection() {
  const { data: prints = [] } = useAllPrints();
  const { data: products = [], isLoading } = useAllProducts();
  const addProduct = useAddProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    printId: "",
    width: "",
    height: "",
    finish: "matte",
    productLabel: "",
    price: "",
  });

  const handleAdd = async () => {
    if (
      !form.printId ||
      !form.width ||
      !form.height ||
      !form.price ||
      !form.productLabel
    ) {
      toast.error("All fields are required.");
      return;
    }
    try {
      await addProduct.mutateAsync({
        printId: BigInt(form.printId),
        printSize: { width: BigInt(form.width), height: BigInt(form.height) },
        finish: form.finish as PrintFinish,
        productLabel: form.productLabel,
        price: BigInt(Math.round(Number.parseFloat(form.price) * 100)),
      });
      toast.success("Product added.");
      setShowForm(false);
      setForm({
        printId: "",
        width: "",
        height: "",
        finish: "matte",
        productLabel: "",
        price: "",
      });
    } catch {
      toast.error("Failed to add product.");
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const getPrintTitle = (id: bigint) =>
    prints.find((p) => p.id === id)?.title ?? String(id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl uppercase tracking-wide text-foreground">
          Products
        </h2>
        <Button
          onClick={() => setShowForm((v) => !v)}
          data-ocid="admin.products.add_button"
          className="bg-primary text-primary-foreground uppercase tracking-widest text-xs rounded-none px-6 py-5"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {showForm && (
        <div
          className="bg-card border border-border p-6 mb-8 max-w-xl"
          data-ocid="admin.products.form"
        >
          <h3 className="font-display text-lg uppercase tracking-wide text-foreground mb-6">
            New Product
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                Print
              </Label>
              <Select
                value={form.printId}
                onValueChange={(v) => setForm((f) => ({ ...f, printId: v }))}
              >
                <SelectTrigger
                  data-ocid="admin.product.print.select"
                  className="mt-2 bg-background border-border rounded-none"
                >
                  <SelectValue placeholder="Select a print…" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-none">
                  {prints.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                Width (in)
              </Label>
              <Input
                value={form.width}
                onChange={(e) =>
                  setForm((f) => ({ ...f, width: e.target.value }))
                }
                data-ocid="admin.product.width.input"
                className="mt-2 bg-background border-border rounded-none"
                placeholder="8"
              />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                Height (in)
              </Label>
              <Input
                value={form.height}
                onChange={(e) =>
                  setForm((f) => ({ ...f, height: e.target.value }))
                }
                data-ocid="admin.product.height.input"
                className="mt-2 bg-background border-border rounded-none"
                placeholder="10"
              />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                Finish
              </Label>
              <Select
                value={form.finish}
                onValueChange={(v) => setForm((f) => ({ ...f, finish: v }))}
              >
                <SelectTrigger
                  data-ocid="admin.product.finish.select"
                  className="mt-2 bg-background border-border rounded-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-none">
                  <SelectItem value="matte">Matte</SelectItem>
                  <SelectItem value="satin">Satin</SelectItem>
                  <SelectItem value="glossy">Glossy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                Price (USD)
              </Label>
              <Input
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                data-ocid="admin.product.price.input"
                className="mt-2 bg-background border-border rounded-none"
                placeholder="45.00"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                Product Label
              </Label>
              <Input
                value={form.productLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productLabel: e.target.value }))
                }
                data-ocid="admin.product.label.input"
                className="mt-2 bg-background border-border rounded-none"
                placeholder="8x10 Matte"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleAdd}
              disabled={addProduct.isPending}
              data-ocid="admin.product.save_button"
              className="bg-primary text-primary-foreground uppercase tracking-widest text-xs rounded-none px-6 py-5"
            >
              {addProduct.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              data-ocid="admin.product.cancel_button"
              className="rounded-none uppercase tracking-widest text-xs px-6 py-5"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div
          data-ocid="admin.products.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="admin.products.empty_state"
          className="text-center py-16 border border-border"
        >
          <p className="font-display text-xl uppercase tracking-widest text-muted-foreground">
            No products yet
          </p>
        </div>
      ) : (
        <Table data-ocid="admin.products.table">
          <TableHeader>
            <TableRow>
              <TableHead>Print</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Finish</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p, idx) => (
              <TableRow
                key={`${p.printId}-${p.productLabel}`}
                data-ocid={`admin.products.row.${idx + 1}`}
              >
                <TableCell className="text-sm">
                  {getPrintTitle(p.printId)}
                </TableCell>
                <TableCell className="text-sm">
                  {String(p.printSize.width)}×{String(p.printSize.height)}
                </TableCell>
                <TableCell className="text-sm capitalize">{p.finish}</TableCell>
                <TableCell className="text-sm">{p.productLabel}</TableCell>
                <TableCell className="text-sm">
                  ${(Number(p.price) / 100).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-ocid={`admin.products.delete_button.${idx + 1}`}
                        className="rounded-none text-xs uppercase tracking-widest border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border rounded-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display uppercase tracking-wide">
                          Delete Product
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Delete "{p.productLabel}"? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          data-ocid="admin.products.delete.cancel_button"
                          className="rounded-none uppercase tracking-widest text-xs"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(`${p.printId}-${p.productLabel}`)
                          }
                          data-ocid="admin.products.delete.confirm_button"
                          className="bg-destructive text-destructive-foreground rounded-none uppercase tracking-widest text-xs"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

/* ──────────────────── Stripe Section ──────────────────── */

function StripeSection() {
  const setConfig = useSetStripeConfig();
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US, CA, GB, AU");

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error("Secret key is required.");
      return;
    }
    try {
      const allowedCountries = countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      await setConfig.mutateAsync({ secretKey, allowedCountries });
      toast.success("Stripe configuration saved.");
      setSecretKey("");
    } catch {
      toast.error("Failed to save Stripe configuration.");
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-8">
        Stripe Configuration
      </h2>
      <div className="space-y-6">
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Stripe Secret Key
          </Label>
          <Input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            data-ocid="admin.stripe.secret_key.input"
            className="mt-2 bg-card border-border rounded-none"
            placeholder="sk_live_…"
          />
        </div>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Allowed Countries (comma separated)
          </Label>
          <Input
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            data-ocid="admin.stripe.countries.input"
            className="mt-2 bg-card border-border rounded-none"
            placeholder="US, CA, GB"
          />
          <p className="text-xs text-muted-foreground mt-2">
            ISO 3166-1 alpha-2 country codes.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={setConfig.isPending}
          data-ocid="admin.stripe.save_button"
          className="bg-primary text-primary-foreground uppercase tracking-widest text-xs rounded-none px-8 py-5"
        >
          {setConfig.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
