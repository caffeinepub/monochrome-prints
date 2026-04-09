import { Check, LogOut, Pencil, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useGetMyProfile,
  useSaveMyProfile,
  useSignOut,
} from "../hooks/useQueries";

// ---------------------------------------------------------------------------
// Country list — full ISO 3166-1 alpha-2, alphabetical by name
// ---------------------------------------------------------------------------
const COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua & Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia & Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DR)" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "KP", name: "North Korea" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts & Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent & the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "São Tomé & Príncipe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad & Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

// ---------------------------------------------------------------------------
// Form field types
// ---------------------------------------------------------------------------
interface ProfileForm {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
}

const EMPTY_FORM: ProfileForm = {
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
};

// ---------------------------------------------------------------------------
// Read-only field display
// ---------------------------------------------------------------------------
function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-black/8">
      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm text-foreground min-h-[1.25rem]">
        {value || <span className="text-muted-foreground/50">—</span>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit input field
// ---------------------------------------------------------------------------
function EditField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  id: string;
}) {
  return (
    <div className="py-1">
      <label
        htmlFor={id}
        className="block text-[10px] tracking-widest uppercase text-muted-foreground mb-1"
      >
        {label}
        {required && <span className="text-foreground ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none text-sm text-foreground py-1.5 placeholder:text-muted-foreground/40 transition-colors"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Country select field
// ---------------------------------------------------------------------------
function CountrySelect({
  value,
  onChange,
  editing,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
}) {
  const countryName = COUNTRIES.find((c) => c.code === value)?.name ?? value;

  if (!editing) {
    return <ReadField label="Country" value={countryName} />;
  }

  return (
    <div className="py-1">
      <label
        htmlFor="country-select"
        className="block text-[10px] tracking-widest uppercase text-muted-foreground mb-1"
      >
        Country
      </label>
      <select
        id="country-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none text-sm text-foreground py-1.5 transition-colors appearance-none cursor-pointer"
      >
        <option value="">Select country…</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AccountPage
// ---------------------------------------------------------------------------
export default function AccountPage() {
  const { email, token, isLoggedIn, isLoading } = useAuth();
  const signOutMutation = useSignOut();
  const { data: profileData, isLoading: profileLoading } =
    useGetMyProfile(token);
  const saveProfileMutation = useSaveMyProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<ProfileForm>(EMPTY_FORM);
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = "/login";
    }
  }, [isLoading, isLoggedIn]);

  // Populate form from loaded profile
  useEffect(() => {
    if (profileData) {
      const loaded: ProfileForm = {
        name: profileData.name ?? "",
        phone: profileData.phone ?? "",
        addressLine1: profileData.addressLine1 ?? "",
        addressLine2: profileData.addressLine2 ?? "",
        city: profileData.city ?? "",
        country: profileData.country ?? "",
      };
      setForm(loaded);
      setSavedForm(loaded);
      // If profile is completely empty, start in edit mode
      const hasData = Object.values(loaded).some((v) => v.trim() !== "");
      if (!hasData) setEditing(true);
    } else if (!profileLoading && profileData === null) {
      // No profile yet — start in edit mode
      setEditing(true);
    }
  }, [profileData, profileLoading]);

  const updateField = (field: keyof ProfileForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function handleEdit() {
    setSavedForm(form);
    setEditing(true);
    setSuccessMsg("");
  }

  function handleCancel() {
    setForm(savedForm);
    setEditing(false);
    setSuccessMsg("");
  }

  function handleSave() {
    if (!token) return;
    saveProfileMutation.mutate(
      {
        token,
        name: form.name,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        country: form.country,
      },
      {
        onSuccess: () => {
          setSavedForm(form);
          setEditing(false);
          setSuccessMsg("Profile saved.");
          setTimeout(() => setSuccessMsg(""), 4000);
        },
      },
    );
  }

  function handleSignOut() {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </main>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-6 py-16">
        {/* Back */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          ← Back to Shop
        </a>

        {/* Page heading */}
        <div className="mb-10">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
            My Account
          </p>
          <h1 className="font-display text-3xl tracking-wider text-foreground mb-1">
            Achromis
          </h1>
        </div>

        {/* Email (read-only) */}
        <div className="mb-10 pb-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p
              className="text-sm text-muted-foreground break-all"
              data-ocid="account.email.display"
            >
              {email}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Profile section                                                     */}
        {/* ------------------------------------------------------------------ */}
        <section className="mb-12" data-ocid="account.profile.section">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl tracking-wider text-foreground">
              My Profile
            </h2>
            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                data-ocid="account.profile.edit-btn"
                className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>

          {/* Profile loading skeleton */}
          {profileLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted/40 animate-pulse" />
              ))}
            </div>
          )}

          {/* Profile fields */}
          {!profileLoading && (
            <div className="space-y-1">
              {editing ? (
                <>
                  <EditField
                    id="profile-name"
                    label="Full Name"
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Your full name"
                  />
                  <EditField
                    id="profile-phone"
                    label="Phone Number"
                    value={form.phone}
                    onChange={updateField("phone")}
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                  <EditField
                    id="profile-addr1"
                    label="Address Line 1"
                    value={form.addressLine1}
                    onChange={updateField("addressLine1")}
                    placeholder="Street address, building name"
                  />
                  <EditField
                    id="profile-addr2"
                    label="Apt, suite, etc. (optional)"
                    value={form.addressLine2}
                    onChange={updateField("addressLine2")}
                    placeholder="Floor, unit number"
                  />
                  <EditField
                    id="profile-city"
                    label="City"
                    value={form.city}
                    onChange={updateField("city")}
                    placeholder="City"
                  />
                  <CountrySelect
                    value={form.country}
                    onChange={updateField("country")}
                    editing={true}
                  />
                </>
              ) : (
                <>
                  <ReadField label="Full Name" value={form.name} />
                  <ReadField label="Phone Number" value={form.phone} />
                  <ReadField label="Address Line 1" value={form.addressLine1} />
                  <ReadField
                    label="Apt, suite, etc."
                    value={form.addressLine2}
                  />
                  <ReadField label="City" value={form.city} />
                  <CountrySelect
                    value={form.country}
                    onChange={updateField("country")}
                    editing={false}
                  />
                </>
              )}
            </div>
          )}

          {/* Edit mode actions */}
          {editing && !profileLoading && (
            <div className="flex items-center gap-4 mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveProfileMutation.isPending}
                data-ocid="account.profile.save-btn"
                className="flex items-center gap-2 bg-foreground text-background text-[10px] tracking-widest uppercase px-5 py-2.5 disabled:opacity-50 transition-opacity hover:opacity-80"
              >
                <Check className="h-3.5 w-3.5" />
                {saveProfileMutation.isPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saveProfileMutation.isPending}
                data-ocid="account.profile.cancel-btn"
                className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <p
              className="mt-4 text-[10px] tracking-widest uppercase text-foreground"
              data-ocid="account.profile.success-msg"
            >
              {successMsg}
            </p>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Orders placeholder                                                  */}
        {/* ------------------------------------------------------------------ */}
        <section
          className="mb-12 pt-8 border-t border-border"
          data-ocid="account.orders.section"
        >
          <h2 className="font-display text-xl tracking-wider text-foreground mb-4">
            My Orders
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Order history coming in the next update.
          </p>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Sign out                                                            */}
        {/* ------------------------------------------------------------------ */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signOutMutation.isPending}
            data-ocid="account.logout.button"
            className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 mt-6"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signOutMutation.isPending ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>
    </main>
  );
}
