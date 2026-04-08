module {
    /// Result type for auth operations
    public type AuthResult = {
        #ok : Text; // session token or success message
        #err : Text; // error message
    };

    /// Result type for profile fetch
    public type ProfileResult = {
        #ok : UserInfo;
        #err : Text;
    };

    /// Public user info returned to the client
    public type UserInfo = {
        email : Text;
        name : Text;
    };
};
