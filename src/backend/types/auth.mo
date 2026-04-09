module {
    /// Result type for auth operations
    public type AuthResult = {
        #ok : Text; // session token or success message
        #err : Text; // error message
    };

    /// Extended profile stored per user (all optional address fields)
    public type ExtendedProfile = {
        name : Text;
        phone : Text;
        addressLine1 : Text;
        addressLine2 : Text;
        city : Text;
        country : Text;
    };

    /// Public user info returned to the client (includes email + profile fields)
    public type UserInfo = {
        email : Text;
        name : Text;
        phone : Text;
        addressLine1 : Text;
        addressLine2 : Text;
        city : Text;
        country : Text;
    };

    /// Result type for profile fetch
    public type ProfileResult = {
        #ok : UserInfo;
        #err : Text;
    };
};
