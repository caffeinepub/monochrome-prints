import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Types "../types/auth";

module {
    /// Storage for email -> passwordHash
    public type CredentialStore = Map.Map<Text, Text>;

    /// Storage for email -> ExtendedProfile
    public type ProfileStore = Map.Map<Text, Types.ExtendedProfile>;

    /// Storage for token -> email
    public type SessionStore = Map.Map<Text, Text>;

    // -------------------------
    // Token generation
    // -------------------------

    /// Generate a unique opaque session token using time + email.
    /// The counter is maintained by the caller (actor state).
    public func generateToken(email : Text, counter : Nat) : Text {
        let ts = Time.now();
        // Combine timestamp, counter and email to form a unique string token
        "tok_" # ts.toText() # "_" # counter.toText() # "_" # email;
    };

    // -------------------------
    // Sign Up
    // -------------------------

    /// Create a new account. Returns a session token on success.
    public func signUp(
        credentials : CredentialStore,
        sessions : SessionStore,
        tokenCounter : Nat,
        email : Text,
        passwordHash : Text,
    ) : (Types.AuthResult, Nat) {
        let normalizedEmail = email.toLower();
        switch (credentials.get(normalizedEmail)) {
            case (?_) { (#err("An account with this email already exists"), tokenCounter) };
            case null {
                credentials.add(normalizedEmail, passwordHash);
                let newCounter = tokenCounter + 1;
                let token = generateToken(normalizedEmail, newCounter);
                sessions.add(token, normalizedEmail);
                (#ok(token), newCounter);
            };
        };
    };

    // -------------------------
    // Sign In
    // -------------------------

    /// Verify credentials and issue a session token.
    public func signIn(
        credentials : CredentialStore,
        sessions : SessionStore,
        tokenCounter : Nat,
        email : Text,
        passwordHash : Text,
    ) : (Types.AuthResult, Nat) {
        let normalizedEmail = email.toLower();
        switch (credentials.get(normalizedEmail)) {
            case null { (#err("No account found for this email"), tokenCounter) };
            case (?storedHash) {
                if (storedHash != passwordHash) {
                    (#err("Incorrect password"), tokenCounter);
                } else {
                    let newCounter = tokenCounter + 1;
                    let token = generateToken(normalizedEmail, newCounter);
                    sessions.add(token, normalizedEmail);
                    (#ok(token), newCounter);
                };
            };
        };
    };

    // -------------------------
    // Validate Session
    // -------------------------

    /// Check if a token is valid and return the associated email.
    public func validateSession(sessions : SessionStore, token : Text) : Types.AuthResult {
        switch (sessions.get(token)) {
            case null { #err("Invalid or expired session") };
            case (?email) { #ok(email) };
        };
    };

    // -------------------------
    // Sign Out
    // -------------------------

    /// Invalidate a session token.
    public func signOut(sessions : SessionStore, token : Text) {
        sessions.remove(token);
    };

    // -------------------------
    // Profile helpers
    // -------------------------

    /// Build a UserInfo from an email and an optional ExtendedProfile.
    func buildUserInfo(email : Text, profile : ?Types.ExtendedProfile) : Types.UserInfo {
        switch (profile) {
            case null {
                { email; name = ""; phone = ""; addressLine1 = ""; addressLine2 = ""; city = ""; country = "" };
            };
            case (?p) {
                { email; name = p.name; phone = p.phone; addressLine1 = p.addressLine1; addressLine2 = p.addressLine2; city = p.city; country = p.country };
            };
        };
    };

    // -------------------------
    // Profile
    // -------------------------

    /// Get full profile for the owner of the token.
    public func getMyProfile(
        sessions : SessionStore,
        profiles : ProfileStore,
        token : Text,
    ) : Types.ProfileResult {
        switch (sessions.get(token)) {
            case null { #err("Invalid or expired session") };
            case (?email) {
                #ok(buildUserInfo(email, profiles.get(email)));
            };
        };
    };

    /// Save or update display name for the owner of the token.
    /// Preserves all other existing profile fields.
    public func saveMyName(
        sessions : SessionStore,
        profiles : ProfileStore,
        token : Text,
        name : Text,
    ) : Types.AuthResult {
        switch (sessions.get(token)) {
            case null { #err("Invalid or expired session") };
            case (?email) {
                let existing = switch (profiles.get(email)) {
                    case null { { name = ""; phone = ""; addressLine1 = ""; addressLine2 = ""; city = ""; country = "" } };
                    case (?p) { p };
                };
                profiles.add(email, { existing with name });
                #ok("Profile updated");
            };
        };
    };

    /// Save or update the full extended profile for the owner of the token.
    public func saveMyProfile(
        sessions : SessionStore,
        profiles : ProfileStore,
        token : Text,
        name : Text,
        phone : Text,
        addressLine1 : Text,
        addressLine2 : Text,
        city : Text,
        country : Text,
    ) : Types.AuthResult {
        switch (sessions.get(token)) {
            case null { #err("Invalid or expired session") };
            case (?email) {
                profiles.add(email, { name; phone; addressLine1; addressLine2; city; country });
                #ok("Profile saved");
            };
        };
    };

    /// Delete the account and all sessions for the owner of the token.
    public func deleteMyAccount(
        credentials : CredentialStore,
        sessions : SessionStore,
        profiles : ProfileStore,
        token : Text,
    ) : Types.AuthResult {
        switch (sessions.get(token)) {
            case null { #err("Invalid or expired session") };
            case (?email) {
                // Remove all sessions belonging to this email
                let staleTokens = sessions.entries()
                    .filter(func((_, e)) { e == email })
                    .map(func((t, _) : (Text, Text)) : Text { t })
                    .toArray();
                for (t in staleTokens.values()) {
                    sessions.remove(t);
                };
                credentials.remove(email);
                profiles.remove(email);
                #ok("Account deleted");
            };
        };
    };
};
