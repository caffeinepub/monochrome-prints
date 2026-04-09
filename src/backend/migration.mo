import Map "mo:core/Map";
import Text "mo:core/Text";
import Types "types/auth";

module {
    // Old stable state: authProfiles was Map<Text, Text> (email -> name)
    type OldActor = {
        authProfiles : Map.Map<Text, Text>;
    };

    // New stable state: authProfiles is Map<Text, ExtendedProfile>
    type NewActor = {
        authProfiles : Map.Map<Text, Types.ExtendedProfile>;
    };

    public func run(old : OldActor) : NewActor {
        // Promote each plain name Text into a full ExtendedProfile, preserving the name
        let authProfiles = old.authProfiles.map<Text, Text, Types.ExtendedProfile>(
            func(_email, name) {
                {
                    name;
                    phone = "";
                    addressLine1 = "";
                    addressLine2 = "";
                    city = "";
                    country = "";
                };
            }
        );
        { authProfiles };
    };
};
