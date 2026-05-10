#!/usr/bin/env node
/**
 * aios-stripe-setup.mjs
 * ─────────────────────────────────────────────────────────────────────────
 * One-shot setup script for AIOS Stripe configuration.
 *
 * Tasks performed:
 *   1. Create "AIOS Pro" product
 *   2. Create $9.99/month recurring price for AIOS Pro
 *   3. List existing webhook endpoints and confirm /api/stripe/webhook is active
 *   4. Add AIOS events to webhook if needed (or create dedicated AIOS webhook)
 *   5. Print env vars to add to Railway
 *
 * Usage:
 *   AIOS_STRIPE_KEY=sk_live_xxx node scripts/aios-stripe-setup.mjs
 *   # or with existing env:
 *   node scripts/aios-stripe-setup.mjs
 *
 * Dry-run (no writes):
 *   AIOS_STRIPE_DRY_RUN=1 node scripts/aios-stripe-setup.mjs
 * ─────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env from root of merkaba-geoqode-lattice ──────────────────────
const envPath = join(__dirname, "..", ".env");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

// ── Also try pwai-api-service .env ───────────────────────────────────────
const apiEnvPath = join(__dirname, "..", "..", "pwai-api-service", ".env");
if (existsSync(apiEnvPath)) {
  const lines = readFileSync(apiEnvPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const STRIPE_KEY = process.env.AIOS_STRIPE_KEY || process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_KEY;
const DRY_RUN = process.env.AIOS_STRIPE_DRY_RUN === "1";
const STRIPE_BASE = "https://api.stripe.com/v1";

if (!STRIPE_KEY || STRIPE_KEY === "change_me") {
  console.error("\n❌ No Stripe key found!\n");
  console.error("Set AIOS_STRIPE_KEY or STRIPE_SECRET_KEY and re-run:");
  console.error("  AIOS_STRIPE_KEY=sk_live_xxx node scripts/aios-stripe-setup.mjs\n");
  process.exit(1);
}

const IS_LIVE = STRIPE_KEY.startsWith("sk_live");
const KEY_PREFIX = STRIPE_KEY.substring(0, 12) + "...";

console.log(`\n🌩️  AIOSStripeAccountant Setup`);
console.log(`   Key: ${KEY_PREFIX} (${IS_LIVE ? "⚡ LIVE" : "🧪 TEST"})`);
console.log(`   Dry-run: ${DRY_RUN ? "YES (no writes)" : "NO (writes enabled)"}`);
console.log(`   Canonical: 8→26→48:480 | PHI=1.618 | PSI=1.414 | GOLDEN_BAND=3.032\n`);

// ── Stripe helpers ────────────────────────────────────────────────────────
function encode(obj, prefix = "") {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && v !== undefined) {
      if (typeof v === "object" && !Array.isArray(v)) {
        parts.push(encode(v, key));
      } else if (Array.isArray(v)) {
        v.forEach((item, i) => parts.push(`${key}[${i}]=${encodeURIComponent(item)}`));
      } else {
        parts.push(`${key}=${encodeURIComponent(v)}`);
      }
    }
  }
  return parts.join("&");
}

async function stripeGet(path, params = {}) {
  let url = `${STRIPE_BASE}${path}`;
  const qs = encode(params);
  if (qs) url += `?${qs}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      "Stripe-Version": "2024-12-18.acacia",
    },
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe GET ${path} [${res.status}]: ${data.error?.message}`);
  return data;
}

async function stripePost(path, body) {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      "Stripe-Version": "2024-12-18.acacia",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encode(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe POST ${path} [${res.status}]: ${data.error?.message}`);
  return data;
}

// ── STEP 1: Verify account access ─────────────────────────────────────────
console.log("Step 1: Verifying Stripe account access...");
const account = await stripeGet("/account");
console.log(`  ✅ Account: ${account.id} (${account.email || account.display_name || "getbrains4ai.com"})`);
console.log(`     Livemode: ${!STRIPE_KEY.startsWith("sk_test")}\n`);

// ── STEP 2: Check if AIOS Pro already exists ──────────────────────────────
console.log("Step 2: Checking for existing AIOS Pro price...");
const existingPrices = await stripeGet("/prices", { limit: 100, active: "true" });
const existingAIOSPrice = existingPrices.data?.find(p => {
  const product = p.product;
  const nickname = p.nickname || "";
  return nickname.toLowerCase().includes("aios pro") ||
    p.metadata?.source === "AIOSStripeAccountant";
});

let aiostProPriceId = null;
let aiosProProductId = null;

if (existingAIOSPrice) {
  aiostProPriceId = existingAIOSPrice.id;
  aiosProProductId = existingAIOSPrice.product;
  console.log(`  ℹ️  AIOS Pro price already exists:`);
  console.log(`     Price ID: ${aiostProPriceId}`);
  console.log(`     Amount: $${(existingAIOSPrice.unit_amount / 100).toFixed(2)}/${existingAIOSPrice.recurring?.interval}`);
  console.log(`     Product: ${aiosProProductId}\n`);
} else {
  console.log("  No existing AIOS Pro price found. Will create.\n");
}

// ── STEP 3: Create product + price (if not exists) ────────────────────────
if (!aiostProPriceId) {
  console.log("Step 3: Creating AIOS Pro product...");

  if (!DRY_RUN) {
    const product = await stripePost("/products", {
      name: "AIOS Pro",
      description: "AIOS Pro — Full access to all premium PLAIStore apps, VR Hub content, and exclusive AIOS features. The complete AI Operating System experience.",
      metadata: {
        source: "AIOSStripeAccountant",
        lattice: "8,26,48:480",
        phi: "1.618",
        service: "realaios.com",
      },
    });
    aiosProProductId = product.id;
    console.log(`  ✅ Created product: ${aiosProProductId} (${product.name})\n`);

    console.log("Step 4: Creating $9.99/month recurring price...");
    const price = await stripePost("/prices", {
      product: aiosProProductId,
      unit_amount: 999,
      currency: "usd",
      nickname: "AIOS Pro Monthly",
      recurring: {
        interval: "month",
      },
      metadata: {
        source: "AIOSStripeAccountant",
        lattice: "8,26,48:480",
        tier: "aios_pro",
        service: "realaios.com",
      },
    });
    aiostProPriceId = price.id;
    console.log(`  ✅ Created price: ${aiostProPriceId}`);
    console.log(`     Amount: $9.99/month`);
    console.log(`     Product: ${aiosProProductId}\n`);
  } else {
    console.log("  [DRY RUN] Would create AIOS Pro product + $9.99/month price\n");
    aiostProPriceId = "price_DRY_RUN_PLACEHOLDER";
    aiosProProductId = "prod_DRY_RUN_PLACEHOLDER";
  }
} else {
  console.log("Step 3-4: Skipped (AIOS Pro price already exists)\n");
}

// ── STEP 5: Check webhooks ────────────────────────────────────────────────
console.log("Step 5: Checking webhook endpoints...");
const webhooks = await stripeGet("/webhook_endpoints", { limit: 20 });
const stormWebhook = webhooks.data?.find(w =>
  w.url?.includes("api.getbrains4ai.com/api/stripe/webhook")
);
const aiosWebhook = webhooks.data?.find(w =>
  w.url?.includes("realaios.com")
);

const AIOS_EVENTS = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "checkout.session.completed",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "customer.created",
];

console.log(`  Found ${webhooks.data?.length || 0} webhook endpoint(s):`);
for (const wh of (webhooks.data || [])) {
  console.log(`    ${wh.status === "enabled" ? "✅" : "❌"} ${wh.url} (${wh.enabled_events?.length || 0} events)`);
}

if (!aiosWebhook && !DRY_RUN) {
  console.log("\n  Creating dedicated AIOS webhook at api.getbrains4ai.com...");
  // We add events to the existing Storm webhook if present, or create a new one
  if (stormWebhook) {
    // Update existing Storm webhook to ensure AIOS events are included
    const currentEvents = stormWebhook.enabled_events || [];
    const missingEvents = AIOS_EVENTS.filter(e => !currentEvents.includes(e) && !currentEvents.includes("*"));
    if (missingEvents.length > 0) {
      const allEvents = [...new Set([...currentEvents, ...missingEvents])];
      const updateBody = {};
      allEvents.forEach((e, i) => { updateBody[`enabled_events[${i}]`] = e; });
      await stripePost(`/webhook_endpoints/${stormWebhook.id}`, updateBody);
      console.log(`  ✅ Updated Storm webhook to include ${missingEvents.length} AIOS events`);
    } else {
      console.log("  ✅ Storm webhook already has all required AIOS events");
    }
  } else {
    // Create new webhook
    const whBody = { url: "https://api.getbrains4ai.com/api/stripe/webhook" };
    AIOS_EVENTS.forEach((e, i) => { whBody[`enabled_events[${i}]`] = e; });
    whBody["metadata[source]"] = "AIOSStripeAccountant";
    const newWh = await stripePost("/webhook_endpoints", whBody);
    console.log(`  ✅ Created webhook: ${newWh.id}`);
    console.log(`     URL: ${newWh.url}`);
    console.log(`     Secret: ${newWh.secret?.substring(0, 10)}... (save as STRIPE_WEBHOOK_SECRET)\n`);
  }
} else if (DRY_RUN) {
  console.log("\n  [DRY RUN] Would ensure AIOS events on Storm webhook\n");
} else {
  console.log(`\n  ✅ AIOS webhook already configured at: ${aiosWebhook.url}\n`);
}

// ── STEP 6: Print Railway env vars ────────────────────────────────────────
console.log("\n" + "═".repeat(60));
console.log("🎯 RAILWAY ENV VARS TO SET:");
console.log("═".repeat(60));
console.log(`AIOS_PRO_PRICE_ID=${aiostProPriceId}`);
console.log(`AIOS_PRO_PRODUCT_ID=${aiosProProductId}`);
if (!DRY_RUN) {
  console.log(`\nAdd these to Railway Shared Variables and share to:`);
  console.log(`  - merkaba-geoqode-os (for AIOS checkout)`);
  console.log(`  - api-service (for billing/checkout endpoint)`);
}
console.log("═".repeat(60));

// ── STEP 7: Checkout domain notice ────────────────────────────────────────
console.log(`\n📌 MANUAL STEP REQUIRED — Add realaios.com to Stripe:`);
console.log(`   Dashboard → Settings → Checkout:`);
console.log(`   https://dashboard.stripe.com/acct_1EzfcTIJzmUyfM4K/settings/checkout`);
console.log(`   Add: https://realaios.com to allowed domains\n`);

console.log(`\n✅ AIOSStripeAccountant setup complete!`);
console.log(`   AIOS Pro Price ID: ${aiostProPriceId}`);
console.log(`   PHI/PSI dual-attested | GOLDEN_BAND=3.032 | 8→26→48:480\n`);
