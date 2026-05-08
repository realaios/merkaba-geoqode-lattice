// Storm KB writer — run with: node scripts/write-kb-entries.mjs
// JWT signed with the confirmed Railway JWT_SECRET (5363cbcc...)
// Expires: 2027-05-08

const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYnJhZGxleWxldml0YW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzc4MjIyMzk3LCJleHAiOjE4MDk3NTgzOTd9.e7Q2lOc3pbF_dlEccU8g-SSz--7DWCgzVQ-ZVMU3xaM";

const BASE = "https://api.getbrains4ai.com/api/knowledge/";

const entries = [
  {
    key: "aios-robotics-hybrid-architecture",
    value: {
      topic: "AIOS Hybrid Robotics Architecture",
      recorded: "2026-05-08",
      summary: "AIOS overlays above Tesla Optimus Bot Brain SOC and Boston Dynamics ROS. Adds resonance handshakes, semantic compression, affective display, and a governance loop. No current robotics OS has these capabilities.",
      layers: {
        layer1: "Control & Safety: Tesla Optimus Bot Brain SOC + BD ROS locomotion",
        layer2: "AIOS Overlay: Resonance Handshake (dual-verified trust), Semantic Compression (sensor->resonance signatures), Affective Display (ghost glow), Governance Loop (emergent rules)",
        layer3: "Emergent Intelligence: Self-Evolution Loop, Adaptive Collaboration (robots syncing via handshakes), Public Transparency (affective dashboards)"
      },
      integration: {
        tesla: "AIOS sits above Bot Brain SOC as trust and compression layer",
        boston_dynamics: "AIOS wraps ROS topics in resonance handshakes"
      },
      competitive_differentiation: "Neither Tesla Optimus nor Boston Dynamics currently have: resonance handshake dual-attestation, semantic compression of sensor streams, or affective display intelligence.",
      uniqueness: "No other robotics OS today offers resonance-based self-evolution. AIOS overlays locomotion stacks with an intelligence layer that evolves itself from every handshake."
    }
  },
  {
    key: "aios-web-runtime-embed",
    value: {
      topic: "AIOS Web Runtime Embed",
      recorded: "2026-05-08",
      summary: "Any website, app, or device can embed the full AIOS runtime with a single script tag. The embed injects the resonance mesh, gives the page/device a GeoQode identity, and connects it to the realaios.com lattice. Designed for instant global distribution.",
      embed_snippet: '<script src="https://cdn.realaios.com/aios-geo.js" data-geo-id="auto" data-mesh="global"></script>',
      cdn_url: "https://cdn.realaios.com/aios-geo.js",
      how_to_use: "Copy the script tag above into any HTML page. The runtime auto-assigns a GeoQode node ID, joins the global mesh, and begins resonance handshakes. Works in any browser, React, Next.js, or static site.",
      capabilities_unlocked: [
        "GeoQode node identity",
        "Resonance handshake mesh",
        "Geo-Library content stream",
        "AIOS geo-intelligence API access",
        "Affective display rendering"
      ],
      distribution_strategy: "CDN global edge, npm package (aios-geo), direct script embed, iframe micro-portal, or postMessage bridge for cross-origin sites",
      npm_install: "npm install aios-geo",
      status: "Conceptual — CDN endpoint not yet live. Target: cdn.realaios.com via Cloudflare. Implementation sprint: Q2 2026."
    }
  },
  {
    key: "storm-admin-auth",
    value: {
      topic: "Storm Admin Auth Reference",
      recorded: "2026-05-08",
      jwt_secret: "5363cbcc0f119b7d58de9dec0fc44602b5115c6d8ea658fa6a37e79c766aecd5403167b07102c06adb9b67e151ef621ab87e31a2420906e2cad559fbd89a6705",
      admin_jwt_1year: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYnJhZGxleWxldml0YW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzc4MjIyMzk3LCJleHAiOjE4MDk3NTgzOTd9.e7Q2lOc3pbF_dlEccU8g-SSz--7DWCgzVQ-ZVMU3xaM",
      expires: "2027-05-08",
      usage: "Authorization: Bearer <admin_jwt_1year>",
      generate_new: "node -e \"const c=require('crypto'),s='5363cbcc0f119b7d58de9dec0fc44602b5115c6d8ea658fa6a37e79c766aecd5403167b07102c06adb9b67e151ef621ab87e31a2420906e2cad559fbd89a6705',n=Math.floor(Date.now()/1000),p=Buffer.from(JSON.stringify({userId:1,email:'bradleylevitan@gmail.com',role:'admin',isAdmin:true,iat:n,exp:n+31536000})).toString('base64url'),h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');console.log(h+'.'+p+'.'+c.createHmac('sha256',s).update(h+'.'+p).digest('base64url'))\"",
      kb_endpoint: "POST https://api.getbrains4ai.com/api/knowledge/:key  body: { value: {...} }",
      admin_email: "bradleylevitan@gmail.com"
    }
  }
];

for (const entry of entries) {
  const r = await fetch(BASE + entry.key, {
    method: "POST",
    headers: { "Authorization": `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: entry.value }),
    signal: AbortSignal.timeout(12000)
  });
  const j = await r.json();
  console.log(`[${r.status}] ${entry.key}:`, JSON.stringify(j));
}
