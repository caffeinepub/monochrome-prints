import Map "mo:core/Map";
import AuthLib "../lib/auth";
import Types "../types/auth";

mixin (
    authCredentials : Map.Map<Text, Text>,
    authSessions : Map.Map<Text, Text>,
    authProfiles : Map.Map<Text, Text>,
) {
    var authTokenCounter : Nat = 0;

    /// Register a new user. Password must be SHA-256 hex string (hashed on frontend).
    /// Returns a session token on success.
    public func signUp(email : Text, passwordHash : Text) : async Types.AuthResult {
        let (result, newCounter) = AuthLib.signUp(authCredentials, authSessions, authTokenCounter, email, passwordHash);
        authTokenCounter := newCounter;
        result;
    };

    /// Authenticate with email and password hash.
    /// Returns a session token on success.
    public func signIn(email : Text, passwordHash : Text) : async Types.AuthResult {
        let (result, newCounter) = AuthLib.signIn(authCredentials, authSessions, authTokenCounter, email, passwordHash);
        authTokenCounter := newCounter;
        result;
    };

    /// Validate a session token.
    /// Returns the email associated with the token on success.
    public func validateSession(token : Text) : async Types.AuthResult {
        AuthLib.validateSession(authSessions, token);
    };

    /// Invalidate a session token (sign out).
    public func signOut(token : Text) : async () {
        AuthLib.signOut(authSessions, token);
    };

    /// Get the profile for the token owner.
    public func getMyProfile(token : Text) : async Types.ProfileResult {
        AuthLib.getMyProfile(authSessions, authProfiles, token);
    };

    /// Save or update the display name for the token owner.
    public func saveMyName(token : Text, name : Text) : async Types.AuthResult {
        AuthLib.saveMyName(authSessions, authProfiles, token, name);
    };

    /// Permanently delete the account of the token owner.
    public func deleteMyAccount(token : Text) : async Types.AuthResult {
        AuthLib.deleteMyAccount(authCredentials, authSessions, authProfiles, token);
    };
};
