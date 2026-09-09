/**
 * Developer-portal Cloud Functions.
 *
 * All three functions sit *behind* the Cloudflare WAF IP gate that protects
 * /developer-portal, but each one also independently checks the caller's
 * developer custom claim. Defence in depth: a leaked client trick or
 * misconfigured WAF rule still cannot escalate privilege.
 *
 * Exposed callables:
 *   setDeveloperClaim   grant / revoke `developer:true` on a target uid
 *   enrollTotp          generate a TOTP secret + otpauth URL for first-time setup
 *   verifyTotp          validate a 6-digit code against the stored secret
 *   createLocalSale     walk-in POS: write localSales + decrement inventory/stock
 *   setBranchInventoryQuantities  staff stock receive / set per-branch qty
 *
 * Bootstrap chicken-and-egg: the very first developer claim is granted by
 * running `firebase functions:shell` (or the gcloud CLI) once against your
 * own uid. After that the portal manages itself.
 */

import {onCall, onRequest, HttpsError, type CallableRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore, FieldValue, type DocumentReference} from "firebase-admin/firestore";
import {authenticator} from "otplib";
import * as QRCode from "qrcode";
import {createHmac, randomBytes, timingSafeEqual} from "node:crypto";

initializeApp();

const paystackSecretKey = defineSecret("PAYSTACK_SECRET_KEY");

// 30s step + ±1 window = ~90s tolerance for clock drift.
authenticator.options = {window: 1, step: 30};

const APP_NAME = "Cofkans Electricals";
const COMPANY_DOMAIN = "@cofkanselectricals.com";
const STAFF_ROLES = new Set([
  "admin",
  "customer",
  "manager",
  "developer",
  "branch_manager",
  "front_desk",
  "branch_desk",
  "rider",
  "driver",
  "technician",
  "warehouse",
  "accountant",
  "hr",
  "procurement",
  "marketing",
  "management_support",
  "support_agent",
]);

const BRANCH_ORDER_STATUSES = new Set([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
]);

const STOCK_TRANSFER_STATUSES = new Set(["pending", "approved", "rejected", "in_transit", "delivered", "cancelled"]);

function requireDeveloper(req: CallableRequest): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");
  if (req.auth?.token?.developer !== true) {
    throw new HttpsError("permission-denied", "Developer claim required.");
  }
  return uid;
}

function requireStaffProvisioner(req: CallableRequest): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");
  // Developer claim alone is enough (Staff portal developer may not carry role=developer).
  if (req.auth?.token?.developer === true) return uid;
  if (req.auth?.token?.staff !== true) {
    throw new HttpsError("permission-denied", "Staff claim required.");
  }
  const role = req.auth?.token?.role;
  if (role !== "manager" && role !== "developer") {
    throw new HttpsError("permission-denied", "Manager or developer role required.");
  }
  return uid;
}

function requireStaff(req: CallableRequest, roles: string[]): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");
  if (req.auth?.token?.staff !== true && req.auth?.token?.developer !== true) {
    throw new HttpsError("permission-denied", "Staff access required.");
  }
  const role = typeof req.auth?.token?.role === "string" ? req.auth.token.role : "";
  if (req.auth?.token?.developer !== true && !roles.includes(role)) {
    throw new HttpsError("permission-denied", "Insufficient staff role.");
  }
  return uid;
}

function cleanString(value: unknown, field: string, max: number): string {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", `${field} must be a string.`);
  }
  // Treat every callable payload as hostile input. Normalize Unicode, remove
  // control characters, collapse whitespace, then enforce the limit.
  const cleaned = value
    .normalize("NFKC")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned.length > max) {
    throw new HttpsError("invalid-argument", `${field} is required and must be ${max} characters or fewer.`);
  }
  return cleaned;
}

function cleanUid(value: unknown, field: string): string {
  const uid = cleanString(value, field, 128);
  if (!/^[A-Za-z0-9:_-]+$/.test(uid)) {
    throw new HttpsError("invalid-argument", `${field} is invalid.`);
  }
  return uid;
}

function cleanBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw new HttpsError("invalid-argument", `${field} must be boolean.`);
  return value;
}

function cleanAuditMeta(value: unknown, depth = 0): Record<string, unknown> | null {
  if (value == null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value) || depth > 2) {
    throw new HttpsError("invalid-argument", "meta must be a plain object.");
  }
  const output: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>).slice(0, 40)) {
    const safeKey = cleanString(key, "meta key", 80);
    if (typeof raw === "string") output[safeKey] = cleanString(raw, `meta.${safeKey}`, 500);
    else if (typeof raw === "number" || typeof raw === "boolean" || raw === null) output[safeKey] = raw;
    else if (Array.isArray(raw)) output[safeKey] = raw.slice(0, 20).map((item) => typeof item === "string" ? cleanString(item, `meta.${safeKey}`, 200) : item);
    else output[safeKey] = cleanAuditMeta(raw, depth + 1);
  }
  return output;
}

function optionalCleanString(value: unknown, field: string, max: number): string | null {
  if (value == null || value === "") return null;
  return cleanString(value, field, max);
}

function normalizeEmail(value: unknown): string {
  const email = cleanString(value, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }
  if (!email.endsWith(COMPANY_DOMAIN)) {
    throw new HttpsError("permission-denied", `Staff email must use ${COMPANY_DOMAIN}.`);
  }
  return email;
}

function normalizeAnyEmail(value: unknown): string {
  const email = cleanString(value, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }
  return email;
}

function normalizeRole(value: unknown): string {
  const role = cleanString(value, "role", 64);
  if (!STAFF_ROLES.has(role)) {
    throw new HttpsError("invalid-argument", "Unsupported staff role.");
  }
  return role;
}

function cleanNumber(value: unknown, field: string, opts: {min: number; max: number; int?: boolean}): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpsError("invalid-argument", `${field} must be a number.`);
  }
  if (opts.int && !Number.isInteger(value)) {
    throw new HttpsError("invalid-argument", `${field} must be a whole number.`);
  }
  if (value < opts.min || value > opts.max) {
    throw new HttpsError("invalid-argument", `${field} is out of range.`);
  }
  return value;
}

function optionalUrl(value: unknown): string | null {
  if (value == null || value === "") return null;
  const text = cleanString(value, "image", 1000);
  return /^https?:\/\//.test(text) || text.startsWith("/") ? text : "";
}

function cleanCheckoutAddress(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new HttpsError("invalid-argument", "shippingAddress is required.");
  }
  const data = value as Record<string, unknown>;
  const email = cleanString(data.email, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }
  return {
    fullName: cleanString(data.fullName, "fullName", 120),
    phone: cleanString(data.phone, "phone", 32),
    email,
    region: cleanString(data.region, "region", 80),
    city: cleanString(data.city, "city", 80),
    street: cleanString(data.street, "street", 240),
    postalCode: optionalCleanString(data.postalCode, "postalCode", 32) ?? "",
    additionalInfo: optionalCleanString(data.additionalInfo, "additionalInfo", 500) ?? "",
  };
}

function cleanCheckoutItems(value: unknown): Array<{productId: string; variantId: string | null; quantity: number}> {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) {
    throw new HttpsError("invalid-argument", "Order must include 1-100 items.");
  }
  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new HttpsError("invalid-argument", `items.${index} is invalid.`);
    }
    const data = item as Record<string, unknown>;
    return {
      productId: cleanString(data.productId, `items.${index}.productId`, 160),
      variantId: optionalCleanString(data.variantId, `items.${index}.variantId`, 160),
      quantity: cleanNumber(data.quantity, `items.${index}.quantity`, {min: 1, max: 99, int: true}),
    };
  });
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(18);
  let out = "";
  for (const byte of bytes) out += chars[byte % chars.length];
  return `${out}!9`;
}

function getPaystackSignature(req: {header(name: string): string | undefined}): string {
  const header = req.header("x-paystack-signature");
  return typeof header === "string" ? header.trim() : "";
}

function hasValidPaystackSignature(rawBody: Buffer, signature: string, secretKey: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function extractPaystackReference(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as {data?: unknown}).data;
  if (!data || typeof data !== "object") return null;
  const reference = (data as {reference?: unknown}).reference;
  return typeof reference === "string" && reference.trim() ? reference.trim() : null;
}

function requireCustomer(req: CallableRequest): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");
  return uid;
}

function getPaystackSecretKey(): string {
  const secretKey = paystackSecretKey.value() || process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new HttpsError("failed-precondition", "Paystack secret key is not configured.");
  }
  return secretKey;
}

function getPaystackPublicKey(): string {
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY;
  if (!publicKey || !publicKey.startsWith("pk_")) {
    throw new HttpsError("failed-precondition", "Paystack public key is not configured.");
  }
  return publicKey;
}

function normalizeAmountPesewas(total: unknown): number {
  if (typeof total !== "number" || !Number.isFinite(total) || total <= 0) {
    throw new HttpsError("failed-precondition", "Order has an invalid total.");
  }
  return Math.round(total * 100);
}

function normalizePaystackReference(value: unknown): string {
  const reference = cleanString(value, "reference", 120);
  if (!/^[A-Za-z0-9._=-]+$/.test(reference)) {
    throw new HttpsError("invalid-argument", "Invalid Paystack reference.");
  }
  return reference;
}

function newPaystackReference(orderId: string): string {
  const suffix = randomBytes(5).toString("hex").toUpperCase();
  return `CFK-${Date.now()}-${orderId.slice(-6).toUpperCase()}-${suffix}`;
}

async function initializePaystackTransaction(input: {
  secretKey: string;
  email: string;
  amount: number;
  reference: string;
  callbackUrl?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.secretKey}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl ?? undefined,
      metadata: input.metadata ?? {},
    }),
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Paystack initialize returned non-JSON response (${res.status})`);
  }
  if (!res.ok || json?.status !== true) {
    throw new Error(`Paystack initialize failed (${res.status}): ${json?.message ?? text.slice(0, 200)}`);
  }
  return json as {
    status: true;
    data: {
      authorization_url?: string;
      access_code?: string;
      reference: string;
    };
  };
}

async function verifyPaystackTransaction(reference: string, secretKey: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${secretKey}`,
      accept: "application/json",
    },
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Paystack verify returned non-JSON response (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(`Paystack verify failed (${res.status}): ${json?.message ?? text.slice(0, 200)}`);
  }
  return json as {
    status?: boolean;
    data?: {
      status?: string;
      reference?: string;
      amount?: number;
      currency?: string;
      id?: number;
      paid_at?: string;
      channel?: string;
      gateway_response?: string;
    };
  };
}

async function markOrderPaidFromPaystack(reference: string, data: {
  status?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  id?: number;
  paid_at?: string;
  channel?: string;
  gateway_response?: string;
}) {
  if (data.status !== "success" || data.reference !== reference) {
    return {processed: false, result: "not_success"};
  }

  const db = getFirestore();
  const orders = await db.collection("orders").where("paymentReference", "==", reference).limit(1).get();
  if (orders.empty) return {processed: false, result: "order_not_found"};

  const orderRef = orders.docs[0].ref;
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    if (!snap.exists) return "missing";

    const order = snap.data() as {
      paymentStatus?: string;
      total?: number;
      items?: Array<{productId?: string; quantity?: number}>;
    };
    if (order.paymentStatus === "paid") return "already_paid";

    const expectedAmount = normalizeAmountPesewas(order.total);
    if (data.amount !== expectedAmount || data.currency !== "GHS") {
      console.warn("paystack amount/currency mismatch", {
        reference,
        expectedAmount,
        verifiedAmount: data.amount,
        verifiedCurrency: data.currency,
      });
      return "amount_or_currency_mismatch";
    }

    // Decrement stock for each ordered item inside the same transaction.
    // This prevents oversell (race conditions) by validating available
    // inventory and decrementing atomically when payment is confirmed.
    if (Array.isArray(order.items)) {
      for (const it of order.items) {
        if (!it || !it.productId) continue;
        const productRef = db.collection('products').doc(it.productId);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists) {
          console.warn('markOrderPaid: product missing', it.productId);
          return 'product_missing';
        }
        const product = productSnap.data() as { totalStock?: number; status?: string };
        const available = typeof product.totalStock === 'number' ? product.totalStock : 0;
        const qty = typeof it.quantity === 'number' ? it.quantity : 0;
        if (available < qty) {
          console.warn('markOrderPaid: insufficient stock', {productId: it.productId, available, qty});
          return 'insufficient_stock';
        }
        // Decrement stock
        tx.update(productRef, {
          totalStock: FieldValue.increment(-qty),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    tx.update(orderRef, {
      paymentStatus: "paid",
      status: "confirmed",
      paymentProvider: "paystack",
      transactionId: data.id ? String(data.id) : null,
      transactionReference: reference,
      paystackVerified: true,
      paystackTransactionId: data.id ?? null,
      paystackReference: reference,
      paystackAmount: data.amount ?? null,
      paystackCurrency: data.currency ?? null,
      paystackChannel: data.channel ?? null,
      paystackGatewayResponse: data.gateway_response ?? null,
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      "statusTimeline.confirmed": FieldValue.serverTimestamp(),
    });
    return "marked_paid";
  });

  return {processed: result === "marked_paid" || result === "already_paid", result};
}

// ---------------------------------------------------------------------------
// createCheckoutOrder — server-authoritative order creation.
// The client sends product ids, quantities, fulfillment, and contact details.
// The server reads product prices/stock, computes totals, and writes the order.
// ---------------------------------------------------------------------------
export const createCheckoutOrder = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireCustomer(req);
    if (req.auth?.token?.email_verified !== true && !req.auth?.token?.phone_number) {
      throw new HttpsError("permission-denied", "Verified account required to place an order.");
    }

    const items = cleanCheckoutItems(req.data?.items);
    const shippingAddress = cleanCheckoutAddress(req.data?.shippingAddress);
    const fulfillment = req.data?.fulfillment && typeof req.data.fulfillment === "object" ?
      req.data.fulfillment as Record<string, unknown> : {};
    const fulfillmentType = cleanString(fulfillment.type, "fulfillment.type", 20);
    if (fulfillmentType !== "pickup" && fulfillmentType !== "delivery") {
      throw new HttpsError("invalid-argument", "Unsupported fulfillment type.");
    }
    const branchSlug = cleanString(fulfillment.branchSlug, "fulfillment.branchSlug", 120);
    const scheduledDate = optionalCleanString(fulfillment.scheduledDate, "fulfillment.scheduledDate", 20);
    const deliveryFee = fulfillmentType === "pickup" ? 0 : 50;

    const db = getFirestore();
    const productRefs = items.map((item) => db.doc(`products/${item.productId}`));
    const orderRef = db.collection("orders").doc();
    const now = FieldValue.serverTimestamp();

    const result = await db.runTransaction(async (tx) => {
      const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));
      let subtotal = 0;
      const orderItems = items.map((item, index) => {
        const snap = productSnaps[index];
        if (!snap.exists) {
          throw new HttpsError(
            "failed-precondition",
            "A product in your cart is no longer available.",
            {productId: item.productId, reason: "not-found"},
          );
        }
        const product = snap.data() as {
          sku?: string;
          name?: string;
          image?: string;
          images?: Array<{url?: string}>;
          price?: number;
          status?: string;
          isAvailable?: boolean;
          totalStock?: number;
          description?: string;
          specs?: Record<string, string>;
        };
        const price = cleanNumber(product.price, "product.price", {min: 0.01, max: 1000000});
        const totalStock = typeof product.totalStock === "number" ? product.totalStock : 0;
        if (product.status !== "active" || product.isAvailable === false || totalStock < item.quantity) {
          throw new HttpsError("failed-precondition", `${product.name ?? "Product"} is out of stock.`);
        }
        const lineSubtotal = Number((price * item.quantity).toFixed(2));
        subtotal = Number((subtotal + lineSubtotal).toFixed(2));
        const primaryImage = product.image || product.images?.find((img) => img?.url)?.url || "";
        return {
          productId: item.productId,
          variantId: item.variantId,
          sku: product.sku ?? "",
          name: product.name ?? "Product",
          image: optionalUrl(primaryImage) ?? "",
          price,
          quantity: item.quantity,
          subtotal: lineSubtotal,
          taxAmount: 0,
          productSnapshot: {
            name: product.name ?? "Product",
            price,
            description: product.description ?? "",
            specs: product.specs ?? {},
          },
        };
      });

      const total = Number((subtotal + deliveryFee).toFixed(2));
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

      tx.set(orderRef, {
        id: orderRef.id,
        orderNumber,
        userId: uid,
        userEmail: req.auth?.token?.email ?? shippingAddress.email,
        customerEmail: req.auth?.token?.email ?? shippingAddress.email,
        customerName: shippingAddress.fullName,
        customerPhone: shippingAddress.phone,
        items: orderItems,
        itemCount,
        shippingAddress,
        subtotal,
        taxAmount: 0,
        shippingAmount: deliveryFee,
        discountAmount: 0,
        total,
        currency: "GHS",
        paymentMethod: "paystack",
        paymentProvider: "paystack",
        paymentStatus: "pending",
        transactionId: null,
        transactionReference: null,
        paidAt: null,
        status: "pending",
        fulfillmentType,
        branchSlug,
        scheduledDate,
        deliveryMethod: fulfillmentType === "pickup" ? "pickup" : "standard",
        statusTimeline: {pending: now},
        createdAt: now,
        updatedAt: now,
      });

      return {orderId: orderRef.id, orderNumber, subtotal, taxAmount: 0, shippingAmount: deliveryFee, total};
    });

    return result;
  }
);

export const updateOrderFulfillment = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireStaff(req, ["admin", "manager", "branch_manager", "front_desk", "branch_desk", "rider", "driver"]);
    const role = typeof req.auth?.token?.role === "string" ? req.auth.token.role : "";
    const branchClaim = typeof req.auth?.token?.branchSlug === "string" ? req.auth.token.branchSlug : null;
    const orderId = cleanString(req.data?.orderId, "orderId", 160);
    const status = cleanString(req.data?.status, "status", 40);
    if (!BRANCH_ORDER_STATUSES.has(status)) throw new HttpsError("invalid-argument", "Invalid order status.");

    const db = getFirestore();
    const orderRef = db.doc(`orders/${orderId}`);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(orderRef);
      if (!snap.exists) throw new HttpsError("not-found", "Order not found.");
      const order = snap.data() as {branchSlug?: string; driverId?: string | null; status?: string; fulfillmentType?: string};
      const canGlobal = req.auth?.token?.developer === true || role === "admin" || role === "manager";
      const canBranch = branchClaim && order.branchSlug === branchClaim && ["branch_manager", "front_desk", "branch_desk"].includes(role);
      const canRider = branchClaim && order.branchSlug === branchClaim && ["rider", "driver"].includes(role);
      if (!canGlobal && !canBranch && !canRider) {
        throw new HttpsError("permission-denied", "You cannot update this order.");
      }
      const patch: Record<string, unknown> = {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        lastUpdatedBy: uid,
        [`statusTimeline.${status}`]: FieldValue.serverTimestamp(),
      };
      if (status === "out_for_delivery" && canRider) {
        patch.driverId = uid;
        patch.driverName = req.auth?.token?.name ?? null;
      }
      if (status === "completed") patch.deliveredAt = FieldValue.serverTimestamp();
      tx.update(orderRef, patch);
    });
    return {ok: true};
  }
);

export const setUserRole = onCall(
  {region: "us-central1"},
  async (req) => {
    const actorUid = requireDeveloper(req);
    const targetUid = cleanString(req.data?.targetUid, "targetUid", 160);
    const role = normalizeRole(req.data?.role);
    const branchSlug = optionalCleanString(req.data?.branchSlug, "branchSlug", 120);
    if (role === "developer") {
      throw new HttpsError("invalid-argument", "Use setDeveloperClaim for developer access.");
    }
    if (targetUid === actorUid) {
      throw new HttpsError("failed-precondition", "Cannot change your own role via setUserRole.");
    }
    const auth = getAuth();
    const db = getFirestore();
    const existingClaims = (await auth.getUser(targetUid)).customClaims ?? {};
    await auth.setCustomUserClaims(targetUid, {
      ...existingClaims,
      role,
      branchSlug,
      staff: role !== "customer",
      developer: role === "developer" ? true : false,
    });
    await db.doc(`users/${targetUid}`).set({
      role,
      isDeveloper: false,
      promotedBy: actorUid,
      promotedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    const staffPatch: Record<string, unknown> = {
      role,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
    };
    if (branchSlug !== undefined) staffPatch.branchSlug = branchSlug;
    if (role === "customer") {
      staffPatch.active = false;
      staffPatch.status = "suspended";
      staffPatch.revokedAt = FieldValue.serverTimestamp();
    }
    await db.doc(`staffAccounts/${targetUid}`).set(staffPatch, {merge: true});
    await db.collection("auditLogs").add({
      action: "set_user_role",
      actorUid,
      targetUid,
      role,
      branchSlug,
      at: FieldValue.serverTimestamp(),
    });
    return {ok: true};
  }
);

export const createStockTransfer = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireStaff(req, ["admin", "manager", "branch_manager", "front_desk", "branch_desk", "warehouse"]);
    const fromBranch = cleanString(req.data?.fromBranch, "fromBranch", 120);
    const toBranch = cleanString(req.data?.toBranch, "toBranch", 120);
    const items = cleanCheckoutItems(req.data?.items).map((item) => ({
      productId: item.productId,
      name: optionalCleanString((req.data?.items as Array<Record<string, unknown>>)?.find((x) => x?.productId === item.productId)?.name, "name", 200) ?? "Stock item",
      quantity: item.quantity,
    }));
    const db = getFirestore();
    const ref = await db.collection("stockTransfers").add({
      fromBranch,
      toBranch,
      items,
      status: "pending",
      driverId: null,
      createdBy: uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {id: ref.id};
  }
);

export const updateStockTransfer = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireStaff(req, ["admin", "manager", "branch_manager", "front_desk", "branch_desk", "warehouse", "rider", "driver"]);
    const transferId = cleanString(req.data?.transferId, "transferId", 160);
    const status = cleanString(req.data?.status, "status", 40);
    if (!STOCK_TRANSFER_STATUSES.has(status)) throw new HttpsError("invalid-argument", "Invalid transfer status.");
    const db = getFirestore();
    await db.runTransaction(async (tx) => {
      const ref = db.doc(`stockTransfers/${transferId}`);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpsError("not-found", "Transfer not found.");
      const current = snap.data() as {
        status?: string;
        driverId?: string | null;
        fromBranch?: string;
        toBranch?: string;
        fromBranchId?: string;
        toBranchId?: string;
      };
      if (current.status === "delivered") throw new HttpsError("failed-precondition", "Transfer is already delivered.");
      const role = typeof req.auth?.token?.role === "string" ? req.auth.token.role : "";
      const branchClaim = typeof req.auth?.token?.branchSlug === "string" ? req.auth.token.branchSlug : null;
      const canGlobal = req.auth?.token?.developer === true || role === "admin" || role === "manager";
      const from = current.fromBranch || current.fromBranchId;
      const to = current.toBranch || current.toBranchId;
      const canBranch = branchClaim && (from === branchClaim || to === branchClaim);
      if (!canGlobal && !canBranch) {
        throw new HttpsError("permission-denied", "You cannot update this transfer.");
      }
      const patch: Record<string, unknown> = {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        lastUpdatedBy: uid,
      };
      if (status === "in_transit") patch.driverId = uid;
      if (status === "delivered") patch.deliveredAt = FieldValue.serverTimestamp();
      if (status === "approved" || status === "rejected") {
        patch.reviewedBy = uid;
        patch.reviewedAt = FieldValue.serverTimestamp();
      }
      tx.update(ref, patch);
    });
    return {ok: true};
  }
);

export const resolveStockRequest = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireStaff(req, ["admin", "manager", "front_desk", "branch_desk", "warehouse"]);
    const requestId = cleanString(req.data?.requestId, "requestId", 160);
    const decision = cleanString(req.data?.decision, "decision", 20);
    if (decision !== "approved" && decision !== "declined") throw new HttpsError("invalid-argument", "Invalid decision.");
    const db = getFirestore();
    let transferId: string | null = null;
    await db.runTransaction(async (tx) => {
      const requestRef = db.doc(`stockRequests/${requestId}`);
      const requestSnap = await tx.get(requestRef);
      if (!requestSnap.exists) throw new HttpsError("not-found", "Stock request not found.");
      const data = requestSnap.data() as {
        status?: string;
        branchSlug?: string;
        branchId?: string;
        productId?: string;
        productName?: string;
        name?: string;
        quantityRequested?: number;
        quantity?: number;
      };
      if (data.status && data.status !== "pending") throw new HttpsError("failed-precondition", "Request already resolved.");
      if (decision === "approved") {
        const transferRef = db.collection("stockTransfers").doc();
        transferId = transferRef.id;
        tx.set(transferRef, {
          fromBranch: "kumasi-asuoyeboa",
          toBranch: data.branchSlug ?? data.branchId ?? "",
          items: [{
            productId: data.productId ?? requestId,
            name: data.productName ?? data.name ?? "Stock item",
            quantity: cleanNumber(data.quantityRequested ?? data.quantity ?? 1, "quantityRequested", {min: 1, max: 100000, int: true}),
          }],
          status: "pending",
          driverId: null,
          sourceRequestId: requestId,
          createdBy: uid,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      tx.update(requestRef, {
        status: decision,
        resolvedBy: uid,
        resolvedAt: FieldValue.serverTimestamp(),
        ...(decision === "approved" ? {approvedAt: FieldValue.serverTimestamp(), transferId} : {declinedAt: FieldValue.serverTimestamp()}),
      });
    });
    return {ok: true, transferId};
  }
);

// ---------------------------------------------------------------------------
// initializePaystackPayment — creates a server-owned Paystack transaction for
// an existing pending order. The client never supplies amount or secret data.
// ---------------------------------------------------------------------------
export const initializePaystackPayment = onCall(
  {region: "us-central1", secrets: [paystackSecretKey]},
  async (req) => {
    const uid = requireCustomer(req);
    const orderId = cleanString(req.data?.orderId, "orderId", 160);
    const callbackUrl = optionalCleanString(req.data?.callbackUrl, "callbackUrl", 500);
    const db = getFirestore();
    const orderRef = db.doc(`orders/${orderId}`);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }

    const order = orderSnap.data() as {
      userId?: string;
      paymentStatus?: string;
      total?: number;
      userEmail?: string;
      shippingAddress?: {email?: unknown; fullName?: unknown; phone?: unknown; region?: unknown; city?: unknown};
      paymentReference?: string;
    };
    if (order.userId !== uid) {
      throw new HttpsError("permission-denied", "You can only initialize your own order payment.");
    }
    if (order.paymentStatus === "paid") {
      throw new HttpsError("failed-precondition", "Order is already paid.");
    }

    const email = cleanString(order.shippingAddress?.email ?? order.userEmail, "email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError("failed-precondition", "Order needs a valid customer email.");
    }

    const amount = normalizeAmountPesewas(order.total);
    const reference = order.paymentReference || newPaystackReference(orderId);
    const secretKey = getPaystackSecretKey();
    const publicKey = getPaystackPublicKey();
    const initialized = await initializePaystackTransaction({
      secretKey,
      email,
      amount,
      reference,
      callbackUrl,
      metadata: {
        orderId,
        userId: uid,
        customerName: order.shippingAddress?.fullName ?? null,
        customerPhone: order.shippingAddress?.phone ?? null,
        region: order.shippingAddress?.region ?? null,
        city: order.shippingAddress?.city ?? null,
      },
    });

    await orderRef.set({
      paymentMethod: "paystack",
      paymentProvider: "paystack",
      paymentStatus: "processing",
      paymentReference: initialized.data.reference,
      transactionReference: initialized.data.reference,
      paystackAccessCode: initialized.data.access_code ?? null,
      paystackAuthorizationUrl: initialized.data.authorization_url ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return {
      publicKey,
      reference: initialized.data.reference,
      accessCode: initialized.data.access_code ?? null,
      authorizationUrl: initialized.data.authorization_url ?? null,
      amount,
      currency: "GHS",
      email,
    };
  }
);

// ---------------------------------------------------------------------------
// verifyPaystackPayment — customer-callable verification after popup success.
// Webhook remains the primary async confirmation path; this closes the loop
// immediately when the customer returns from Paystack.
// ---------------------------------------------------------------------------
export const verifyPaystackPayment = onCall(
  {region: "us-central1", secrets: [paystackSecretKey]},
  async (req) => {
    const uid = requireCustomer(req);
    const reference = normalizePaystackReference(req.data?.reference);
    const db = getFirestore();
    const orders = await db.collection("orders").where("paymentReference", "==", reference).limit(1).get();
    if (orders.empty) {
      throw new HttpsError("not-found", "Order not found for payment reference.");
    }
    const order = orders.docs[0].data() as {userId?: string};
    if (order.userId !== uid) {
      throw new HttpsError("permission-denied", "You can only verify your own order payment.");
    }

    const verified = await verifyPaystackTransaction(reference, getPaystackSecretKey());
    if (verified.status !== true || !verified.data) {
      return {ok: true, processed: false, result: "verify_failed"};
    }
    const result = await markOrderPaidFromPaystack(reference, verified.data);
    return {ok: true, ...result};
  }
);

// ---------------------------------------------------------------------------
// paystackWebhook — authoritative payment confirmation endpoint.
// The client only creates pending orders. This function verifies Paystack's
// HMAC signature, re-checks the reference against Paystack's API, and marks
// the matching Firestore order as paid in an idempotent transaction.
// ---------------------------------------------------------------------------
export const paystackWebhook = onRequest(
  {region: "us-central1", secrets: [paystackSecretKey]},
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const secretKey = paystackSecretKey.value() || process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("paystackWebhook missing PAYSTACK_SECRET_KEY");
      res.status(500).send("Webhook not configured");
      return;
    }

    const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(JSON.stringify(req.body ?? {}));
    const signature = getPaystackSignature(req);
    if (!hasValidPaystackSignature(rawBody, signature, secretKey)) {
      console.warn("paystackWebhook rejected invalid signature", {
        hasSignature: Boolean(signature),
        bodyLength: rawBody.length,
      });
      res.status(401).send("Invalid signature");
      return;
    }

    const reference = extractPaystackReference(req.body);
    if (!reference) {
      console.warn("paystackWebhook missing transaction reference");
      res.status(400).send("Missing reference");
      return;
    }

    try {
      const verified = await verifyPaystackTransaction(reference, secretKey);
      const data = verified.data;
      if (verified.status !== true || data?.status !== "success" || data.reference !== reference) {
        console.warn("paystackWebhook verification did not pass", {
          reference,
          verifyStatus: verified.status,
          transactionStatus: data?.status,
          verifiedReference: data?.reference,
        });
        res.status(202).json({ok: true, processed: false});
        return;
      }

      const result = await markOrderPaidFromPaystack(reference, data);
      console.info("paystackWebhook processed", {reference, result});
      res.status(200).json({ok: true, ...result});
    } catch (err) {
      console.error("paystackWebhook processing failed", {reference, err});
      res.status(500).send("Webhook processing failed");
    }
  }
);

// ---------------------------------------------------------------------------
// provisionStaffAccount — server-side staff account creation.
// Only callers with custom claims {staff:true, role:'manager'|'developer'} may
// create staff users. The temporary password/reset link are returned to the
// caller for manual handoff; v1 never emails credentials automatically.
// ---------------------------------------------------------------------------
export const provisionStaffAccount = onCall(
  {region: "us-central1"},
  async (req) => {
    const actorUid = requireStaffProvisioner(req);
    const name = cleanString(req.data?.name, "name", 120);
    const email = normalizeEmail(req.data?.email);
    const role = normalizeRole(req.data?.role);
    const branchSlug = optionalCleanString(req.data?.branchSlug, "branchSlug", 120);
    const phone = optionalCleanString(req.data?.phone, "phone", 32);

    if (["branch_manager", "front_desk", "branch_desk", "rider", "driver"].includes(role) && !branchSlug) {
      throw new HttpsError("invalid-argument", "branchSlug is required for branch-scoped staff roles.");
    }

    const auth = getAuth();
    const db = getFirestore();
    const tempPassword = generateTempPassword();

    let createdUid: string | null = null;
    try {
      const user = await auth.createUser({
        email,
        password: tempPassword,
        displayName: name,
        phoneNumber: phone ?? undefined,
        emailVerified: false,
        disabled: false,
      });
      createdUid = user.uid;

      await auth.setCustomUserClaims(user.uid, {
        role,
        branchSlug,
        staff: true,
      });

      const resetLink = await auth.generatePasswordResetLink(email);
      const now = FieldValue.serverTimestamp();

      await db.doc(`users/${user.uid}`).set({
        uid: user.uid,
        email,
        displayName: name,
        phoneNumber: phone,
        photoURL: null,
        provider: "email",
        emailVerified: false,
        role,
        isDeveloper: role === "developer",
        mustChangePassword: true,
        createdBy: actorUid,
        createdAt: now,
        updatedAt: now,
      });

      await db.doc(`staffAccounts/${user.uid}`).set({
        uid: user.uid,
        email,
        displayName: name,
        phone,
        role,
        branchSlug,
        active: true,
        mustResetPassword: true,
        createdBy: actorUid,
        createdAt: now,
        updatedAt: now,
      });

      await db.collection("auditLogs").add({
        actorUid,
        actorEmail: req.auth?.token?.email ?? null,
        action: "staff_account_provisioned",
        target: user.uid,
        meta: {email, role, branchSlug, hasPhone: !!phone},
        at: now,
      });

      return {
        ok: true,
        uid: user.uid,
        email,
        role,
        branchSlug,
        tempPassword,
        resetLink,
      };
    } catch (err: any) {
      if (createdUid) {
        await auth.deleteUser(createdUid).catch(() => undefined);
        await db.doc(`users/${createdUid}`).delete().catch(() => undefined);
        await db.doc(`staffAccounts/${createdUid}`).delete().catch(() => undefined);
      }
      if (err?.code === "auth/email-already-exists") {
        throw new HttpsError("already-exists", "A user with that email already exists.");
      }
      if (err instanceof HttpsError) throw err;
      console.error("provisionStaffAccount failed", err);
      throw new HttpsError("internal", "Failed to provision staff account.");
    }
  }
);

// ---------------------------------------------------------------------------
// setDeveloperClaim — grant / revoke developer:true on a target uid.
// Audit row is written by the caller via the auditLog function (Phase 2).
// ---------------------------------------------------------------------------
export const setDeveloperClaim = onCall(
  {region: "us-central1"},
  async (req) => {
    const actor = requireDeveloper(req);
    const targetUid = cleanUid(req.data?.targetUid, "targetUid");
    const grant = cleanBoolean(req.data?.grant, "grant");
    if (targetUid === actor && !grant) {
      throw new HttpsError("failed-precondition", "Cannot revoke your own claim from the portal — use the CLI.");
    }

    const auth = getAuth();
    const target = await auth.getUser(targetUid);
    const existing = target.customClaims ?? {};
    const next = {...existing, developer: grant};
    await auth.setCustomUserClaims(targetUid, next);

    await getFirestore().doc(`staffAccounts/${targetUid}`).set(
      {
        developerClaimGrantedAt: grant ? FieldValue.serverTimestamp() : null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      {merge: true}
    );

    return {ok: true};
  }
);

// ---------------------------------------------------------------------------
// enrollTotp — generates a TOTP secret + otpauth URL on first setup.
// The secret is stored in totpSecrets/{uid} which is *never* readable by any
// client (Firestore rule denies all client access). Recovery codes are
// returned once and only once; we store their bcrypt-style hashes.
// ---------------------------------------------------------------------------
export const enrollTotp = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireDeveloper(req);
    const userRecord = await getAuth().getUser(uid);
    const label = userRecord.email ?? uid;

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(label, APP_NAME, secret);
    const qrPng = await QRCode.toDataURL(otpauthUrl, {width: 256, margin: 1});

    // Single-use recovery codes (six 8-char codes). Hashed at rest.
    const recovery = Array.from({length: 6}, () =>
      Math.random().toString(36).slice(2, 10).toUpperCase()
    );
    const hashed = await Promise.all(
      recovery.map((c) => hashString(c))
    );

    await getFirestore().doc(`totpSecrets/${uid}`).set({
      secret,
      recoveryHashes: hashed,
      createdAt: FieldValue.serverTimestamp(),
    });
    await getFirestore().doc(`staffAccounts/${uid}`).set(
      {mfaEnrolled: true, updatedAt: FieldValue.serverTimestamp()},
      {merge: true}
    );

    return {otpauthUrl, qrPng, recoveryCodes: recovery};
  }
);

// ---------------------------------------------------------------------------
// verifyTotp — checks a 6-digit code (or recovery code) against the stored
// secret. On success, sets a short-lived `mfaVerifiedAt` on the user's
// session doc so the client-side gate knows MFA passed for this login.
// ---------------------------------------------------------------------------
export const verifyTotp = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireDeveloper(req);
    const code = cleanString(req.data?.code, "code", 32).toUpperCase();
    if (!/^\d{6}$/.test(code) && !/^[A-Z0-9]{8}$/.test(code)) {
      throw new HttpsError("invalid-argument", "Invalid verification code.");
    }

    const snap = await getFirestore().doc(`totpSecrets/${uid}`).get();
    if (!snap.exists) {
      throw new HttpsError("failed-precondition", "TOTP not enrolled.");
    }
    const data = snap.data() as {secret: string; recoveryHashes: string[]};

    let ok = false;
    let usedRecoveryIndex = -1;
    if (/^\d{6}$/.test(code)) {
      ok = authenticator.verify({token: code, secret: data.secret});
    } else {
      const hash = await hashString(code.toUpperCase());
      usedRecoveryIndex = data.recoveryHashes.indexOf(hash);
      ok = usedRecoveryIndex >= 0;
    }

    if (!ok) throw new HttpsError("permission-denied", "Invalid code.");

    // Burn the recovery code once used.
    if (usedRecoveryIndex >= 0) {
      const next = [...data.recoveryHashes];
      next.splice(usedRecoveryIndex, 1);
      await snap.ref.update({recoveryHashes: next});
    }

    await getFirestore().doc(`staffSessions/${uid}`).set(
      {mfaVerifiedAt: FieldValue.serverTimestamp()},
      {merge: true}
    );

    return {ok: true};
  }
);

// SHA-256 hex; recovery codes are short and high-entropy so a salt isn't
// load-bearing here — we just don't want them stored verbatim.
async function hashString(input: string): Promise<string> {
  const {createHash} = await import("node:crypto");
  return createHash("sha256").update(input).digest("hex");
}

// ---------------------------------------------------------------------------
// auditLog — single sink for every portal action. Writes an immutable row to
// /auditLog (rules deny all client writes) and mirrors to the `audit-log`
// Pub/Sub topic so a BigQuery sink can land the same row in a tamper-resistant
// warehouse. The Pub/Sub publish is best-effort — Firestore is the source of
// truth for the in-app UI; BigQuery is for retention + offline analysis.
// ---------------------------------------------------------------------------
export const auditLog = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireDeveloper(req);
    const action = cleanString(req.data?.action, "action", 120);
    const target = req.data?.target == null ? null : cleanString(req.data.target, "target", 160);
    const meta = cleanAuditMeta(req.data?.meta);

    const row = {
      actorUid: uid,
      actorEmail: req.auth?.token?.email ?? null,
      action,
      target,
      meta,
      ip: req.rawRequest.ip ?? null,
      userAgent: req.rawRequest.headers["user-agent"] ?? null,
      at: FieldValue.serverTimestamp(),
    };
    const ref = await getFirestore().collection("auditLogs").add(row);

    // Best-effort mirror to Pub/Sub. Failure here must not block the audit
    // row itself — Firestore is authoritative for the in-portal view.
    try {
      const {PubSub} = await import("@google-cloud/pubsub");
      await new PubSub().topic("audit-log").publishMessage({
        json: {id: ref.id, ...row, at: new Date().toISOString()},
      });
    } catch (err) {
      console.warn("audit pubsub publish failed", err);
    }

    return {ok: true, id: ref.id};
  }
);

// ---------------------------------------------------------------------------
// setFeatureFlag — flips a boolean inside featureFlags/global. Used for kill
// switches (checkout, orders, maintenance banner). Every change is mirrored
// to auditLog by the caller — but we also write actor info onto the doc so
// the portal can show "last changed by" inline without a join.
// ---------------------------------------------------------------------------
export const setFeatureFlag = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireDeveloper(req);
    const key = cleanString(req.data?.key, "key", 80);
    if (!/^[A-Za-z0-9_-]+$/.test(key)) throw new HttpsError("invalid-argument", "Invalid feature key.");
    const value = cleanBoolean(req.data?.value, "value");
    await getFirestore().doc("featureFlags/global").set(
      {
        [key]: value,
        [`${key}__updatedBy`]: uid,
        [`${key}__updatedAt`]: FieldValue.serverTimestamp(),
      },
      {merge: true}
    );
    return {ok: true};
  }
);

// ---------------------------------------------------------------------------
// forceSignOut — revokes a target user's refresh tokens. Their existing ID
// tokens stay valid until expiry (≤1h), then every API call forces re-auth.
// Used when a staff account is suspected compromised, or on offboarding.
// ---------------------------------------------------------------------------
export const forceSignOut = onCall(
  {region: "us-central1"},
  async (req) => {
    requireDeveloper(req);
    const targetUid = cleanUid(req.data?.targetUid, "targetUid");
    await getAuth().revokeRefreshTokens(targetUid);
    await getFirestore().doc(`staffSessions/${targetUid}`).set(
      {revokedAt: FieldValue.serverTimestamp(), mfaVerifiedAt: null},
      {merge: true}
    );
    return {ok: true};
  }
);

// ---------------------------------------------------------------------------
// recordLoginAttempt — Admin-only writes to /loginAttempts (client rules deny
// all access). Callable may be invoked before the user is signed in.
// ---------------------------------------------------------------------------
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
const LOGIN_DELAYS_MS = [0, 1000, 2000, 4000, 8000];

export const recordLoginAttempt = onCall(
  {region: "us-central1"},
  async (req) => {
    const email = normalizeAnyEmail(req.data?.email);
    const action = optionalCleanString(req.data?.action, "action", 16) ?? "fail";
    const ipAddress = optionalCleanString(req.data?.ipAddress, "ipAddress", 64) ?? "unknown";
    const trackerId = `login_${email}`;
    const trackerRef = getFirestore().doc(`loginAttempts/${trackerId}`);
    const now = new Date();

    if (action === "clear") {
      await trackerRef.set({
        email,
        attempts: 0,
        lockedUntil: null,
        lastAttemptAt: FieldValue.serverTimestamp(),
        ipAddresses: FieldValue.arrayUnion(ipAddress),
      }, {merge: true});
      return {ok: true, isLocked: false, attemptsRemaining: LOGIN_MAX_ATTEMPTS, delayMs: 0};
    }

    if (action === "status") {
      const snap = await trackerRef.get();
      if (!snap.exists) {
        return {ok: true, isLocked: false, attemptsRemaining: LOGIN_MAX_ATTEMPTS, delayMs: 0};
      }
      const data = snap.data() as {
        attempts?: number;
        lockedUntil?: {toDate?: () => Date} | null;
      };
      const lockedUntil = data.lockedUntil?.toDate?.() ?? null;
      if (lockedUntil && lockedUntil > now) {
        return {
          ok: true,
          isLocked: true,
          attemptsRemaining: 0,
          lockedUntil: lockedUntil.toISOString(),
          delayMs: 0,
        };
      }
      const attempts = Number(data.attempts ?? 0);
      return {
        ok: true,
        isLocked: false,
        attemptsRemaining: Math.max(0, LOGIN_MAX_ATTEMPTS - attempts),
        delayMs: 0,
      };
    }

    const snap = await trackerRef.get();
    if (snap.exists) {
      const data = snap.data() as {
        attempts?: number;
        lockedUntil?: {toDate?: () => Date} | null;
        ipAddresses?: string[];
      };
      const lockedUntil = data.lockedUntil?.toDate?.() ?? null;
      if (lockedUntil && lockedUntil > now) {
        return {
          ok: true,
          isLocked: true,
          attemptsRemaining: 0,
          lockedUntil: lockedUntil.toISOString(),
          delayMs: 0,
        };
      }
      const newAttempts = Number(data.attempts ?? 0) + 1;
      const ipAddresses = [...new Set([...(data.ipAddresses ?? []), ipAddress])];
      if (newAttempts >= LOGIN_MAX_ATTEMPTS) {
        const until = new Date(now.getTime() + LOGIN_LOCKOUT_MS);
        await trackerRef.set({
          email,
          attempts: newAttempts,
          lastAttemptAt: FieldValue.serverTimestamp(),
          lockedUntil: until,
          ipAddresses,
        }, {merge: true});
        return {
          ok: true,
          isLocked: true,
          attemptsRemaining: 0,
          lockedUntil: until.toISOString(),
          delayMs: 0,
        };
      }
      await trackerRef.set({
        email,
        attempts: newAttempts,
        lastAttemptAt: FieldValue.serverTimestamp(),
        lockedUntil: null,
        ipAddresses,
      }, {merge: true});
      const delayIndex = Math.min(newAttempts - 1, LOGIN_DELAYS_MS.length - 1);
      return {
        ok: true,
        isLocked: false,
        attemptsRemaining: LOGIN_MAX_ATTEMPTS - newAttempts,
        delayMs: LOGIN_DELAYS_MS[delayIndex],
      };
    }

    await trackerRef.set({
      email,
      attempts: 1,
      lastAttemptAt: FieldValue.serverTimestamp(),
      ipAddresses: [ipAddress],
    });
    return {
      ok: true,
      isLocked: false,
      attemptsRemaining: LOGIN_MAX_ATTEMPTS - 1,
      delayMs: 0,
    };
  }
);

// ---------------------------------------------------------------------------
// updateStaffAccount — manager/developer only. Role changes go through claims.
// Direct client writes to /staffAccounts are denied by rules.
// ---------------------------------------------------------------------------
export const updateStaffAccount = onCall(
  {region: "us-central1"},
  async (req) => {
    const actorUid = requireStaffProvisioner(req);
    const targetUid = cleanString(req.data?.targetUid, "targetUid", 160);
    const patch = (req.data?.patch ?? {}) as Record<string, unknown>;
    const allowedMeta = ["displayName", "phone", "active", "status", "branchSlug"] as const;
    const next: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
    };
    for (const key of allowedMeta) {
      if (patch[key] !== undefined) next[key] = patch[key];
    }

    const roleRaw = patch.role;
    if (roleRaw !== undefined) {
      const role = normalizeRole(roleRaw);
      if (role === "developer") {
        throw new HttpsError("invalid-argument", "Use setDeveloperClaim for developer access.");
      }
      const branchSlug = optionalCleanString(patch.branchSlug, "branchSlug", 120);
      const existingClaims = (await getAuth().getUser(targetUid)).customClaims ?? {};
      await getAuth().setCustomUserClaims(targetUid, {
        ...existingClaims,
        role,
        branchSlug,
        staff: role !== "customer",
      });
      next.role = role;
      if (branchSlug !== undefined) next.branchSlug = branchSlug;
    } else if (patch.branchSlug !== undefined) {
      // Branch-only update: refresh claim branchSlug without changing role.
      const existing = await getAuth().getUser(targetUid);
      const claims = existing.customClaims ?? {};
      const branchSlug = optionalCleanString(patch.branchSlug, "branchSlug", 120);
      await getAuth().setCustomUserClaims(targetUid, {...claims, branchSlug});
      next.branchSlug = branchSlug;
    }

    // Deactivate / reactivate mirrors Auth disabled flag (preserves Firestore history).
    if (patch.active === false || patch.status === "suspended" || patch.status === "deactivated") {
      next.active = false;
      if (patch.status === undefined) next.status = "suspended";
      await getAuth().updateUser(targetUid, {disabled: true});
      await getAuth().revokeRefreshTokens(targetUid);
    } else if (patch.active === true || patch.status === "active") {
      next.active = true;
      next.status = "active";
      await getAuth().updateUser(targetUid, {disabled: false});
    }

    await getFirestore().doc(`staffAccounts/${targetUid}`).set(next, {merge: true});
    await getFirestore().collection("auditLogs").add({
      action: "staff_account_updated",
      actorUid,
      targetUid,
      meta: {keys: Object.keys(next).filter((k) => k !== "updatedAt" && k !== "updatedBy")},
      at: FieldValue.serverTimestamp(),
    });
    return {ok: true};
  }
);

// ---------------------------------------------------------------------------
// permanentlyDeleteStaffAccount — irreversible Auth + staffAccounts removal.
// Historical orders/audit remain; only identity record is deleted.
// Developer-only.
// ---------------------------------------------------------------------------
export const permanentlyDeleteStaffAccount = onCall(
  {region: "us-central1"},
  async (req) => {
    const actorUid = requireDeveloper(req);
    const targetUid = cleanUid(req.data?.targetUid, "targetUid");
    const confirmEmail = normalizeAnyEmail(req.data?.confirmEmail);
    if (targetUid === actorUid) {
      throw new HttpsError("failed-precondition", "Cannot permanently delete your own account.");
    }
    const auth = getAuth();
    const db = getFirestore();
    const user = await auth.getUser(targetUid);
    if ((user.email ?? "").toLowerCase() !== confirmEmail) {
      throw new HttpsError("invalid-argument", "confirmEmail must match the staff member's email exactly.");
    }
    const staffSnap = await db.doc(`staffAccounts/${targetUid}`).get();
    if (staffSnap.exists && staffSnap.data()?.role === "developer") {
      throw new HttpsError("failed-precondition", "Cannot permanently delete a developer account via this flow.");
    }
    await auth.deleteUser(targetUid);
    await db.doc(`staffAccounts/${targetUid}`).delete().catch(() => undefined);
    await db.doc(`totpSecrets/${targetUid}`).delete().catch(() => undefined);
    await db.doc(`staffSessions/${targetUid}`).delete().catch(() => undefined);
    await db.collection("auditLogs").add({
      action: "staff_account_permanently_deleted",
      actorUid,
      targetUid,
      meta: {email: confirmEmail},
      at: FieldValue.serverTimestamp(),
    });
    return {ok: true};
  }
);

// ---------------------------------------------------------------------------
// resetStaffPassword — developer generates a one-time temporary password.
// Returned to the caller once; not stored. Sets mustChangePassword claim so
// Staff portal forces a password change after the next successful login.
// ---------------------------------------------------------------------------
export const resetStaffPassword = onCall(
  {region: "us-central1"},
  async (req) => {
    const actorUid = requireDeveloper(req);
    const targetUid = cleanUid(req.data?.targetUid, "targetUid");
    if (targetUid === actorUid) {
      throw new HttpsError("failed-precondition", "Use Firebase Auth account flows to change your own password.");
    }
    const auth = getAuth();
    const user = await auth.getUser(targetUid);
    if (user.disabled) {
      throw new HttpsError("failed-precondition", "Reactivate the account before resetting the password.");
    }
    const temporaryPassword = generateTempPassword();
    const claims = user.customClaims ?? {};
    await auth.updateUser(targetUid, {password: temporaryPassword, disabled: false});
    await auth.setCustomUserClaims(targetUid, {...claims, mustChangePassword: true});
    await auth.revokeRefreshTokens(targetUid);
    await getFirestore().doc(`staffAccounts/${targetUid}`).set({
      mustChangePassword: true,
      passwordResetAt: FieldValue.serverTimestamp(),
      passwordResetBy: actorUid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
    }, {merge: true});
    await getFirestore().collection("auditLogs").add({
      action: "staff_password_reset",
      actorUid,
      targetUid,
      meta: {email: user.email ?? null},
      at: FieldValue.serverTimestamp(),
    });
    return {ok: true, temporaryPassword, email: user.email ?? null};
  }
);

/** Clear mustChangePassword after the staff member sets a new password client-side. */
export const clearMustChangePassword = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");
    const auth = getAuth();
    const user = await auth.getUser(uid);
    const claims = user.customClaims ?? {};
    if (!claims.mustChangePassword) return {ok: true};
    const {mustChangePassword: _drop, ...rest} = claims as Record<string, unknown>;
    await auth.setCustomUserClaims(uid, rest);
    await getFirestore().doc(`staffAccounts/${uid}`).set({
      mustChangePassword: false,
      passwordChangedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    return {ok: true};
  }
);

// ---------------------------------------------------------------------------
// createLocalSale — walk-in POS counter sale.
// Server prices + atomic inventory / products.totalStock decrement.
// ---------------------------------------------------------------------------
const POS_PAYMENT_METHODS = new Set(["cash", "momo", "card", "transfer"]);
const POS_VAT_RATE = 0.15;
const POS_SALE_ROLES = [
  "front_desk",
  "branch_desk",
  "branch_manager",
  "manager",
  "admin",
  "warehouse",
];

export const createLocalSale = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireStaff(req, POS_SALE_ROLES);
    const role = typeof req.auth?.token?.role === "string" ? req.auth.token.role : "";
    const isGlobal =
      req.auth?.token?.developer === true ||
      role === "manager" ||
      role === "admin";
    const claimBranch =
      typeof req.auth?.token?.branchSlug === "string" ? req.auth.token.branchSlug.trim() : "";
    const requestedBranch = optionalCleanString(req.data?.branchId, "branchId", 120);
    const branchId = isGlobal ? (requestedBranch || claimBranch) : claimBranch;
    if (!branchId) {
      throw new HttpsError("failed-precondition", "Staff account is not assigned to a branch.");
    }
    if (!isGlobal && requestedBranch && requestedBranch !== claimBranch) {
      throw new HttpsError("permission-denied", "You can only sell at your assigned branch.");
    }

    const items = cleanCheckoutItems(req.data?.items);
    const paymentMethod = cleanString(req.data?.paymentMethod, "paymentMethod", 20).toLowerCase();
    if (!POS_PAYMENT_METHODS.has(paymentMethod)) {
      throw new HttpsError("invalid-argument", "Unsupported payment method.");
    }
    const discountPct = req.data?.discountPct == null
      ? 0
      : cleanNumber(req.data.discountPct, "discountPct", {min: 0, max: 100});
    const customerName = optionalCleanString(req.data?.customerName, "customerName", 120);
    const customerPhone = optionalCleanString(req.data?.customerPhone, "customerPhone", 32);
    const momoRef = optionalCleanString(req.data?.momoRef, "momoRef", 80);
    const staffName =
      optionalCleanString(req.data?.staffName, "staffName", 120) ||
      (typeof req.auth?.token?.name === "string" ? req.auth.token.name : "") ||
      (typeof req.auth?.token?.email === "string" ? req.auth.token.email : "Staff");

    // Aggregate duplicate product lines before stock checks.
    const qtyByProduct = new Map<string, number>();
    for (const item of items) {
      qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.quantity);
    }
    const productIds = [...qtyByProduct.keys()];

    const db = getFirestore();

    // Resolve inventory doc ids outside the transaction (composite query).
    const inventoryRefs: Array<{productId: string; ref: DocumentReference}> = [];
    for (const productId of productIds) {
      let snap = await db.collection("inventory")
        .where("branchSlug", "==", branchId)
        .where("productId", "==", productId)
        .limit(1)
        .get();
      if (snap.empty) {
        snap = await db.collection("inventory")
          .where("branchId", "==", branchId)
          .where("productId", "==", productId)
          .limit(1)
          .get();
      }
      if (snap.empty) {
        throw new HttpsError(
          "failed-precondition",
          `No inventory row for product at this branch.`,
          {productId, branchId, reason: "inventory_missing"},
        );
      }
      inventoryRefs.push({productId, ref: snap.docs[0].ref});
    }

    const saleRef = db.collection("localSales").doc();
    const now = FieldValue.serverTimestamp();
    const prefix = branchId.slice(0, 3).toUpperCase();
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const receiptNumber = `${prefix}-${ymd}-${String(Date.now()).slice(-4)}`;

    const result = await db.runTransaction(async (tx) => {
      const productSnaps = await Promise.all(
        productIds.map((id) => tx.get(db.doc(`products/${id}`))),
      );
      const inventorySnaps = await Promise.all(inventoryRefs.map((row) => tx.get(row.ref)));

      let subtotal = 0;
      const saleItems: Array<Record<string, unknown>> = [];

      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        const qty = qtyByProduct.get(productId) ?? 0;
        const productSnap = productSnaps[i];
        const invSnap = inventorySnaps[i];
        if (!productSnap.exists) {
          throw new HttpsError("failed-precondition", "A product in the cart is no longer available.", {
            productId,
            reason: "product_missing",
          });
        }
        if (!invSnap.exists) {
          throw new HttpsError("failed-precondition", "Inventory row disappeared during checkout.", {
            productId,
            reason: "inventory_missing",
          });
        }
        const product = productSnap.data() as {
          sku?: string;
          name?: string;
          price?: number;
          totalStock?: number;
          status?: string;
          isAvailable?: boolean;
          lowStockThreshold?: number;
          images?: Array<{url?: string}>;
          image?: string;
        };
        const inv = invSnap.data() as {
          quantity?: number;
          qty?: number;
          stock?: number;
          current?: number;
          soldThisMonth?: number;
          lowStockThreshold?: number;
          reorderLevel?: number;
          minimum?: number;
        };
        const unitPrice = cleanNumber(product.price, "product.price", {min: 0.01, max: 1000000});
        const branchQty = Number(inv.quantity ?? inv.qty ?? inv.stock ?? inv.current ?? 0);
        const companyStock = typeof product.totalStock === "number" ? product.totalStock : 0;
        if (branchQty < qty) {
          throw new HttpsError(
            "failed-precondition",
            `${product.name ?? "Product"} has only ${branchQty} in stock at this branch.`,
            {productId, available: branchQty, requested: qty, reason: "insufficient_stock"},
          );
        }
        if (companyStock < qty) {
          throw new HttpsError(
            "failed-precondition",
            `${product.name ?? "Product"} company stock is insufficient.`,
            {productId, available: companyStock, requested: qty, reason: "insufficient_total_stock"},
          );
        }

        const lineSubtotal = Number((unitPrice * qty).toFixed(2));
        subtotal = Number((subtotal + lineSubtotal).toFixed(2));
        saleItems.push({
          productId,
          sku: product.sku ?? "",
          name: product.name ?? "Product",
          unitPrice,
          quantity: qty,
          lineTotal: lineSubtotal,
          image: product.image || product.images?.find((img) => img?.url)?.url || "",
        });

        const nextBranchQty = branchQty - qty;
        const threshold = Number(inv.lowStockThreshold ?? inv.reorderLevel ?? inv.minimum ?? 0);
        tx.update(inventoryRefs[i].ref, {
          quantity: nextBranchQty,
          qty: nextBranchQty,
          soldThisMonth: FieldValue.increment(qty),
          status: nextBranchQty <= 0 ? "out" : nextBranchQty <= threshold ? "low" : "ok",
          updatedAt: now,
        });

        const nextTotal = companyStock - qty;
        tx.update(productSnap.ref, {
          totalStock: nextTotal,
          isAvailable: nextTotal > 0,
          status: nextTotal > 0 ? (product.status === "draft" || product.status === "archived" ? product.status : "active") : "outOfStock",
          purchaseCount: FieldValue.increment(qty),
          updatedAt: now,
        });
      }

      const discountAmount = Number((subtotal * (discountPct / 100)).toFixed(2));
      const taxable = Number((subtotal - discountAmount).toFixed(2));
      const vat = Number((taxable * POS_VAT_RATE).toFixed(2));
      const total = Number((taxable + vat).toFixed(2));
      const amountPaidRaw = req.data?.amountPaid;
      const amountPaid = amountPaidRaw == null
        ? total
        : cleanNumber(amountPaidRaw, "amountPaid", {min: 0, max: 10000000});
      if (paymentMethod === "cash" && amountPaid < total) {
        throw new HttpsError("failed-precondition", "Cash received is less than the total due.");
      }
      const change = paymentMethod === "cash" ? Number(Math.max(0, amountPaid - total).toFixed(2)) : 0;

      tx.set(saleRef, {
        id: saleRef.id,
        receiptNumber,
        branchId,
        branch: branchId,
        staffUid: uid,
        staffName,
        channel: "walk-in",
        paymentMethod,
        paymentStatus: "paid",
        momoRef: momoRef ?? null,
        customerName: customerName ?? null,
        customerPhone: customerPhone ?? null,
        items: saleItems,
        itemCount: saleItems.reduce((s, it) => s + Number(it.quantity ?? 0), 0),
        subtotal,
        discountPct,
        discountAmount,
        vat,
        taxAmount: vat,
        total,
        amountPaid: paymentMethod === "cash" ? amountPaid : total,
        change,
        currency: "GHS",
        createdAt: now,
        updatedAt: now,
        serverCreatedAt: now,
      });

      return {saleId: saleRef.id, receiptNumber, subtotal, discountAmount, vat, total, amountPaid: paymentMethod === "cash" ? amountPaid : total, change};
    });

    await db.collection("auditLogs").add({
      action: "local_sale_created",
      actorUid: uid,
      targetId: result.saleId,
      meta: {branchId, receiptNumber: result.receiptNumber, total: result.total, itemCount: items.length},
      at: FieldValue.serverTimestamp(),
    });

    return result;
  }
);

// ---------------------------------------------------------------------------
// setBranchInventoryQuantities — set absolute branch qty for a catalogue product.
// Used for stock arrivals / corrections. Inventory remains CF-only (rules deny
// client writes). Developer always allowed; GM / BM / front desk allowed when
// featureFlags/global.staffStockUpdates is not false. BM/FD scoped to own branch.
// ---------------------------------------------------------------------------
const STOCK_UPDATE_ROLES = [
  "front_desk",
  "branch_desk",
  "branch_manager",
  "manager",
  "admin",
  "warehouse",
];

export const setBranchInventoryQuantities = onCall(
  {region: "us-central1"},
  async (req) => {
    const uid = requireStaff(req, STOCK_UPDATE_ROLES);
    const role = typeof req.auth?.token?.role === "string" ? req.auth.token.role : "";
    const isDeveloper = req.auth?.token?.developer === true || role === "developer";
    const isGlobal =
      isDeveloper ||
      role === "manager" ||
      role === "admin";
    const claimBranch =
      typeof req.auth?.token?.branchSlug === "string" ? req.auth.token.branchSlug.trim() : "";

    const db = getFirestore();
    if (!isDeveloper) {
      const flagsSnap = await db.doc("featureFlags/global").get();
      const flags = flagsSnap.data() as {staffStockUpdates?: boolean} | undefined;
      if (flags?.staffStockUpdates === false) {
        throw new HttpsError(
          "permission-denied",
          "Staff stock updates are disabled by a Developer. Contact a Developer to re-enable.",
        );
      }
    }

    const productId = cleanString(req.data?.productId, "productId", 160);
    const rawUpdates = req.data?.updates;
    if (!Array.isArray(rawUpdates) || rawUpdates.length === 0 || rawUpdates.length > 40) {
      throw new HttpsError("invalid-argument", "Provide 1–40 branch quantity updates.");
    }

    type BranchQtyUpdate = {branchId: string; quantity: number};
    const updates: BranchQtyUpdate[] = rawUpdates.map((row, index) => {
      if (!row || typeof row !== "object") {
        throw new HttpsError("invalid-argument", `updates.${index} is invalid.`);
      }
      const data = row as Record<string, unknown>;
      return {
        branchId: cleanString(data.branchId, `updates.${index}.branchId`, 120),
        quantity: cleanNumber(data.quantity, `updates.${index}.quantity`, {min: 0, max: 100000, int: true}),
      };
    });

    // Deduplicate by branch (last write wins).
    const byBranch = new Map<string, number>();
    for (const u of updates) byBranch.set(u.branchId, u.quantity);
    const uniqueUpdates = [...byBranch.entries()].map(([branchId, quantity]) => ({branchId, quantity}));

    for (const u of uniqueUpdates) {
      if (!isGlobal && u.branchId !== claimBranch) {
        throw new HttpsError("permission-denied", "You can only update stock at your assigned branch.");
      }
    }
    if (!isGlobal && !claimBranch) {
      throw new HttpsError("failed-precondition", "Staff account is not assigned to a branch.");
    }

    const productRef = db.doc(`products/${productId}`);
    const productSnap = await productRef.get();
    if (!productSnap.exists) {
      throw new HttpsError("not-found", "Product not found.");
    }
    const product = productSnap.data() as {
      name?: string;
      sku?: string;
      price?: number;
      totalStock?: number;
      lowStockThreshold?: number;
      image?: string;
      images?: Array<{url?: string}>;
      description?: string;
    };

    type InvTarget = {
      branchId: string;
      quantity: number;
      ref: DocumentReference;
      exists: boolean;
    };
    const targets: InvTarget[] = [];
    for (const u of uniqueUpdates) {
      let snap = await db.collection("inventory")
        .where("branchSlug", "==", u.branchId)
        .where("productId", "==", productId)
        .limit(1)
        .get();
      if (snap.empty) {
        snap = await db.collection("inventory")
          .where("branchId", "==", u.branchId)
          .where("productId", "==", productId)
          .limit(1)
          .get();
      }
      if (!snap.empty) {
        targets.push({branchId: u.branchId, quantity: u.quantity, ref: snap.docs[0].ref, exists: true});
      } else {
        targets.push({
          branchId: u.branchId,
          quantity: u.quantity,
          ref: db.collection("inventory").doc(`inv_${u.branchId}_${productId}`),
          exists: false,
        });
      }
    }

    const now = FieldValue.serverTimestamp();
    const image =
      (typeof product.image === "string" && product.image) ||
      product.images?.find((img) => img?.url)?.url ||
      "";
    const threshold = Number(product.lowStockThreshold ?? 0);

    const result = await db.runTransaction(async (tx) => {
      const freshProduct = await tx.get(productRef);
      if (!freshProduct.exists) {
        throw new HttpsError("not-found", "Product disappeared during update.");
      }
      const invSnaps = await Promise.all(targets.map((t) => tx.get(t.ref)));
      let companyStock = Number((freshProduct.data() as {totalStock?: number}).totalStock ?? 0);
      let totalDelta = 0;
      const applied: Array<{branchId: string; previous: number; quantity: number}> = [];

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const invSnap = invSnaps[i];
        const prev = invSnap.exists
          ? Number((invSnap.data() as {quantity?: number; qty?: number; stock?: number; current?: number})
            .quantity ?? (invSnap.data() as {qty?: number}).qty ?? (invSnap.data() as {stock?: number}).stock ?? (invSnap.data() as {current?: number}).current ?? 0)
          : 0;
        const next = target.quantity;
        totalDelta += next - prev;
        const status = next <= 0 ? "out" : next <= threshold ? "low" : "ok";
        const payload: Record<string, unknown> = {
          productId,
          sku: product.sku ?? productId,
          name: product.name ?? "Product",
          branchSlug: target.branchId,
          branchId: target.branchId,
          quantity: next,
          qty: next,
          unitPrice: Number(product.price ?? 0),
          price: Number(product.price ?? 0),
          lowStockThreshold: threshold,
          status,
          updatedAt: now,
          updatedBy: uid,
        };
        if (image) payload.image = image;
        if (product.description) payload.description = product.description;
        if (invSnap.exists) {
          tx.update(target.ref, payload);
        } else {
          tx.set(target.ref, {
            ...payload,
            soldThisMonth: 0,
            createdAt: now,
            createdBy: uid,
          });
        }
        applied.push({branchId: target.branchId, previous: prev, quantity: next});
      }

      companyStock = Math.max(0, companyStock + totalDelta);
      tx.update(productRef, {
        totalStock: companyStock,
        isAvailable: companyStock > 0,
        status: companyStock > 0 ? "active" : "outOfStock",
        updatedAt: now,
      });

      return {productId, totalStock: companyStock, updates: applied};
    });

    await db.collection("auditLogs").add({
      action: "branch_inventory_set",
      actorUid: uid,
      targetId: productId,
      meta: {
        productId,
        branches: result.updates.map((u) => u.branchId),
        totalStock: result.totalStock,
      },
      at: FieldValue.serverTimestamp(),
    });

    return {ok: true, ...result};
  }
);
