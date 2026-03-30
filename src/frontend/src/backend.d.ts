import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Print {
    id: PrintId;
    title: string;
    active: boolean;
    description: string;
    image: ExternalBlob;
}
export interface http_header {
    value: string;
    name: string;
}
export interface PrintUpdate {
    title: string;
    active: boolean;
    description: string;
    image: ExternalBlob;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type PrintId = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PrintSize {
    height: bigint;
    width: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Product {
    printId: PrintId;
    finish: PrintFinish;
    productLabel: string;
    price: bigint;
    printSize: PrintSize;
}
export enum PrintFinish {
    matte = "matte",
    satin = "satin",
    glossy = "glossy"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPrint(newPrint: PrintUpdate): Promise<PrintId>;
    deletePrint(printId: PrintId): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    getActivePrints(): Promise<Array<Print>>;
    getAllPrints(): Promise<Array<Print>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPrint(printId: PrintId): Promise<Print>;
    getProduct(productId: string): Promise<Product>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePrint(printId: PrintId, updates: PrintUpdate): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
