import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Stripe "mo:caffeineai-stripe/stripe";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Storage "mo:caffeineai-object-storage/Storage";
import AuthMixin "mixins/auth-api";
import AuthTypes "types/auth";
import Migration "migration";

(with migration = Migration.run)
actor {
    let accessControlState = AccessControl.initState();
    include MixinAuthorization(accessControlState);
    include MixinObjectStorage();

    // Custom email+password auth state
    let authCredentials = Map.empty<Text, Text>();                          // email -> passwordHash
    let authSessions = Map.empty<Text, Text>();                             // token -> email
    let authProfiles = Map.empty<Text, AuthTypes.ExtendedProfile>();        // email -> full profile
    include AuthMixin(authCredentials, authSessions, authProfiles);

    // Core data types
    public type UserProfile = {
        name : Text;
    };

    let userProfiles = Map.empty<Principal, UserProfile>();

    type PrintId = Nat;
    var nextPrintId : PrintId = 0;

    let prints = Map.empty<PrintId, Print>();

    type Print = {
        id : PrintId;
        title : Text;
        description : Text;
        image : Storage.ExternalBlob;
        active : Bool;
    };

    public type PrintSize = {
        width : Nat;
        height : Nat;
    };

    public type PrintFinish = {
        #matte;
        #glossy;
        #satin;
    };

    public type Product = {
        printId : PrintId;
        productLabel : Text;
        finish : PrintFinish;
        price : Nat;
        printSize : PrintSize;
    };

    let products = Map.empty<Text, Product>();

    public type PrintUpdate = {
        title : Text;
        description : Text;
        image : Storage.ExternalBlob;
        active : Bool;
    };

    module Print {
        public func compareById(p1 : Print, p2 : Print) : Order.Order {
            Nat.compare(p1.id, p2.id);
        };
    };

    // Utility functions for shared functionality
    func getPrintInternal(printId : PrintId) : Print {
        switch (prints.get(printId)) {
            case (?print) { print };
            case (null) { Runtime.trap("Print with id " # printId.toText() # " does not exist") };
        };
    };

    func updateExistingPrint(print : Print, update : PrintUpdate) : Print {
        {
            id = print.id;
            title = update.title;
            description = update.description;
            image = update.image;
            active = update.active;
        };
    };

    // User Profile functions
    public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Runtime.trap("Unauthorized: Only users can access profiles");
        };
        userProfiles.get(caller);
    };

    public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
        if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only view your own profile");
        };
        userProfiles.get(user);
    };

    public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Runtime.trap("Unauthorized: Only users can save profiles");
        };
        userProfiles.add(caller, profile);
    };

    // Print functions

    public query ({ caller }) func getPrint(printId : PrintId) : async Print {
        getPrintInternal(printId);
    };

    public query ({ caller }) func getAllPrints() : async [Print] {
        prints.values().toArray().sort(Print.compareById);
    };

    public query ({ caller }) func getActivePrints() : async [Print] {
        prints.values().toArray().filter(func(p) { p.active });
    };

    // Product functions
    public query func getProduct(productId : Text) : async Product {
        switch (products.get(productId)) {
            case (?product) { product };
            case (null) { Runtime.trap("Product does not exist") };
        };
    };

    public query func getAllProducts() : async [Product] {
        products.values().toArray();
    };

    // --- Admin functions ---

    // Print Management
    public shared ({ caller }) func createPrint(newPrint : PrintUpdate) : async PrintId {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Runtime.trap("Unauthorized: Only admins can create prints");
        };

        let print = {
            id = nextPrintId;
            title = newPrint.title;
            description = newPrint.description;
            image = newPrint.image;
            active = newPrint.active;
        };

        prints.add(nextPrintId, print);
        nextPrintId += 1;
        print.id;
    };

    public shared ({ caller }) func updatePrint(printId : PrintId, updates : PrintUpdate) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Runtime.trap("Unauthorized: Only admins can update prints");
        };
        let existingPrint = getPrintInternal(printId);
        let updatedPrint = updateExistingPrint(existingPrint, updates);
        prints.add(printId, updatedPrint);
    };

    public shared ({ caller }) func deletePrint(printId : PrintId) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Runtime.trap("Unauthorized: Only admins can delete prints");
        };
        if (not prints.containsKey(printId)) {
            Runtime.trap("Print does not exist");
        };
        prints.remove(printId);
    };

    // Product Management
    public shared ({ caller }) func addProduct(product : Product) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Runtime.trap("Unauthorized: Only admins can add products");
        };
        products.add(product.productLabel, product);
    };

    public shared ({ caller }) func updateProduct(product : Product) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Runtime.trap("Unauthorized: Only admins can update products");
        };
        if (not products.containsKey(product.productLabel)) {
            Runtime.trap("Product does not exist");
        };
        products.add(product.productLabel, product);
    };

    public shared ({ caller }) func deleteProduct(productId : Text) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Runtime.trap("Unauthorized: Only admins can delete products");
        };
        if (not products.containsKey(productId)) {
            Runtime.trap("Product does not exist");
        };
        products.remove(productId);
    };

    // --- Payments ---

    var stripeConfig : ?Stripe.StripeConfiguration = null;

    public query func isStripeConfigured() : async Bool {
        stripeConfig != null;
    };

    public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Runtime.trap("Unauthorized: Only admins can change Stripe settings");
        };
        stripeConfig := ?config;
    };

    func getStripeConfiguration() : Stripe.StripeConfiguration {
        switch (stripeConfig) {
            case (null) { Runtime.trap("Stripe not configured") };
            case (?config) { config };
        };
    };

    // HTTP Outcall Transform
    public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
        OutCall.transform(input);
    };

    // Actual payment logic -- only authenticated users (non-guests)
    public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
        };
        let config = getStripeConfiguration();
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
    };

    public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Runtime.trap("Unauthorized: Only authenticated users can check session status");
        };
        let config = getStripeConfiguration();
        await Stripe.getSessionStatus(config, sessionId, transform);
    };
};
