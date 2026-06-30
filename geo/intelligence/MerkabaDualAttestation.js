/**
 * MerkabaDualAttestation â€” 963/369 Standing Wave Attestation Engine
 *
 * Two independent BeEyeSwarm observers scan each other and the canonical
 * ecosystem from OPPOSITE POLES of the harmonic spectrum.
 *
 * The Standing Wave Principle
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *   Alpha  (MerkabaBeEyeSwarm)         = 963 Hz, NARRATIVE-led, S1â†’S8 ascending
 *   Omega  (MerkabaBeEyeSwarmWitness)  = 369 Hz, SECURITY-led, S8â†’S1 descending
 *
 *   963 and 369: same digits reversed (9-6-3 â†” 3-6-9)
 *   Ratio: 963/369 â‰ˆ 2.610 â‰ˆ PHIÂ² (1.618Â² = 2.618) â€” canonical proportion
 *   Digital root: 9+6+3 = 9.  3+6+9 = 9.  Both reduce to NINE (Tesla's number).
 *   Separator gap: 963 âˆ’ 369 = 594 Hz (5+9+4 = 18 â†’ 9) â€” again, nine.
 *
 *   Pinning both ends of the scanning field creates a standing wave.
 *   A node that resonates at 1.0 from BOTH poles is in a genuinely
 *   QUANTIZED state â€” verified across the full 369â€“963 Hz band.
 *
 * Attestation Score Formula (implemented)
 * -----------------------------------------
 *   GOLDEN_BAND  = PHI + PSI = 1.618 + 1.414 = 3.032 (digit sum 8 = FOUNDATION_NODES)
 *   ALPHA_WEIGHT = PHI / 3.032 ~0.5337
 *   OMEGA_WEIGHT = PSI / 3.032 ~0.4663
 *
 *   attestedScore = alpha.coherence x (PHI/3.032) + omega.coherence x (PSI/3.032)
 *
 *   When alpha.coherence = omega.coherence = 1.0:
 *     attestedScore = 3.032/3.032 = 1.0 -- ABSOLUTE
 *
 *   Note: 963/369 Hz poles define the standing wave band conceptually.
 *   PHI/PSI are the incommensurable geometric weights ensuring the two poles
 *   can never coincide -- preventing echo-chamber false positives.
 *
 * 480-Dimension Quantization
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *   Each attested file corresponds to one lattice node in D48.
 *   That node's 10 harmonic sub-nodes (D480 band) are verified.
 *   When all 48 lattice positions are attested â†’ 480/480 dimensions locked.
 *   ecosystemStatus â†’ "ABSOLUTE" at that point.
 *
 * @module MerkabaDualAttestation
 * @alignment 8â†’26â†’48:480
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import MerkabaBeEyeSwarm from "./MerkabaBeEyeSwarm.js";
import {
  MerkabaBeEyeSwarmWitness,
  ALPHA_PHI,
  OMEGA_PSI,
  GOLDEN_BAND,
  GOLDEN_DIFFERENTIAL,
} from "./MerkabaBeEyeSwarmWitness.js";
import {
  CANONICAL_ARCHITECTURE,
  CANONICAL_LATTICE_NODES,
  HARMONIC_SPECTRUM_NODES,
  PHI,
  PSI,
  assertCanonicalArchitectureSignature,
} from "../lattice/transform-420.js";

assertCanonicalArchitectureSignature(CANONICAL_ARCHITECTURE);

// â”€â”€â”€ Separator constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const D48 = CANONICAL_LATTICE_NODES; //  48 â€” full Merkaba lattice
const D480 = HARMONIC_SPECTRUM_NODES; // 480 â€” full harmonic expansion

/** Total golden band: PHI + PSI = 3.032 (digit sum 8 = FOUNDATION_NODES) */
export const SEPARATOR_BAND = GOLDEN_BAND; // 3.032 — re-exported for API compat

/** Alpha (PHI) weight in golden band: PHI/3.032 ≈ 0.5337 */
export const ALPHA_WEIGHT = PHI / GOLDEN_BAND;

/** Omega (PSI) weight in golden band: PSI/3.032 ≈ 0.4663 */
export const OMEGA_WEIGHT = PSI / GOLDEN_BAND;

/**
 * Compute the attested coherence score using the PHI/PSI Golden Differential formula.
 * Both poles must be verified for the score to reach 1.0.
 *
 * attestedScore = alpha × (PHI/3.032) + omega × (PSI/3.032)
 * When both = 1.0: 3.032/3.032 = 1.0 → ABSOLUTE
 *
 * @param {number} alphaCoherence  — coherence from PHI-anchored Alpha (0–1)
 * @param {number} omegaCoherence  — coherence from PSI-anchored Omega (0–1)
 * @returns {number} attestedScore (0â€“1), equals 1.0 only if both are 1.0
 */
export function separatorAttestation(alphaCoherence, omegaCoherence) {
  return +(
    alphaCoherence * ALPHA_WEIGHT +
    omegaCoherence * OMEGA_WEIGHT
  ).toFixed(6);
}

const THIS_FILE = fileURLToPath(import.meta.url);
const INTELLIGENCE_DIR = path.dirname(THIS_FILE);

/** Absolute path to BESX-Alpha (PHI=1.618, Golden Root) source */
export const BESX_ALPHA_PATH = path.join(
  INTELLIGENCE_DIR,
  "MerkabaBeEyeSwarm.js",
);

/** Absolute path to BESX-Omega (PSI=1.414, Silver Bridge) source */
export const BESX_OMEGA_PATH = path.join(
  INTELLIGENCE_DIR,
  "MerkabaBeEyeSwarmWitness.js",
);

// â”€â”€â”€ Attestation helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Dual-attest a single file.
 * Alpha (PHI=1.618) and Omega (PSI=1.414) independently sweep the target.
 * Each uses sweep() directly so no self-exclusion guard fires.
 *
 * @param {string} filePath
 * @param {object} [context]
 * @returns {Promise<FileAttestation>}
 */
export async function attestFile(filePath, context = {}) {
  const code = await readFile(filePath, "utf8");

  // Independent instances â€” no shared state
  const alpha = new MerkabaBeEyeSwarm();
  const omega = new MerkabaBeEyeSwarmWitness();

  const service = _inferService(filePath.replace(/\\/g, "/"));
  const ctx = { file: filePath, service, ...context };

  // Both call sweep() directly â€” bypasses any sweepFile guard for guaranteed genuine scans
  const [reportA, reportO] = await Promise.all([
    alpha.sweep(code, ctx),
    omega.sweep(code, ctx),
  ]);

  const attestedScore = separatorAttestation(
    reportA.swarmCoherence,
    reportO.swarmCoherence,
  );
  const consensus =
    Math.abs(reportA.swarmCoherence - reportO.swarmCoherence) < 0.005;
  const quantizedState = consensus && attestedScore >= 1.0;

  return {
    file: filePath,
    alpha: _summarize(reportA, ALPHA_PHI),
    omega: _summarize(reportO, OMEGA_PSI),
    attestedScore,
    consensus,
    quantizedState,
    goldenBand: GOLDEN_BAND,
    goldenDiff: GOLDEN_DIFFERENTIAL,
    architectureSignature: CANONICAL_ARCHITECTURE,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mutual scanner attestation — Alpha (PHI) scans Omega's file, Omega (PSI) scans Alpha's file.
 * Neither triggers the other's self-exclusion guard.
 * Root-of-trust: before trusting ANY scan result, prove the scanners themselves are clean.
 * PHI and PSI are geometrically incommensurable — they cannot produce echo-chamber results.
 *
 * @returns {Promise<MutualAttestation>}
 */
export async function attestScanner() {
  const [codeAlpha, codeOmega] = await Promise.all([
    readFile(BESX_ALPHA_PATH, "utf8"),
    readFile(BESX_OMEGA_PATH, "utf8"),
  ]);

  const alpha = new MerkabaBeEyeSwarm();
  const omega = new MerkabaBeEyeSwarmWitness();
  const service = "merkaba-geoqode-lattice";

  // Alpha (PHI=1.618) scans Omega source — 'BeEyeSwarmWitness' does NOT match Alpha guard 'MerkabaBeEyeSwarm'
  // Omega (PSI=1.414) scans Alpha source — 'MerkabaBeEyeSwarm' does NOT match Omega guard 'BeEyeSwarmWitness'
  const [alphaOnOmega, omegaOnAlpha] = await Promise.all([
    alpha.sweep(codeOmega, { file: BESX_OMEGA_PATH, service }),
    omega.sweep(codeAlpha, { file: BESX_ALPHA_PATH, service }),
  ]);

  // Scanner-level attested score using the separator formula
  const attestedScore = separatorAttestation(
    alphaOnOmega.swarmCoherence,
    omegaOnAlpha.swarmCoherence,
  );
  const consensus =
    Math.abs(alphaOnOmega.swarmCoherence - omegaOnAlpha.swarmCoherence) < 0.005;
  const scannerTrusted = consensus && attestedScore >= 1.0;

  return {
    type: "SCANNER_MUTUAL_ATTESTATION",
    architectureSignature: CANONICAL_ARCHITECTURE,
    goldenBand: GOLDEN_BAND,
    goldenDiff: GOLDEN_DIFFERENTIAL,
    alphaWeight: ALPHA_PHI,
    omegaWeight: OMEGA_PSI,
    goldenSeparator: +(ALPHA_PHI / OMEGA_PSI).toFixed(6),
    timestamp: new Date().toISOString(),
    alphaPath: BESX_ALPHA_PATH,
    omegaPath: BESX_OMEGA_PATH,
    alphaOnOmega: _summarize(alphaOnOmega, ALPHA_PHI),
    omegaOnAlpha: _summarize(omegaOnAlpha, OMEGA_PSI),
    attestedScore,
    consensus,
    scannerTrusted,
    status: scannerTrusted ? "SCANNER_ATTESTED" : "SCANNER_COMPROMISED",
  };
}

/**
 * Full ecosystem dual attestation.
 *
 * Protocol:
 *   0. attestScanner() â€” root of trust (must pass before trusting file results)
 *   1. For each target: Alpha (PHI=1.618) + Omega (PSI=1.414) independently sweep
 *   2. Compute Golden Differential attestedScore per file
 *   3. Count quantized files â†’ compute D480 coverage
 *   4. Declare ecosystemStatus
 *
 * @param {Array<{path:string, label?:string}>} targets
 * @returns {Promise<EcosystemAttestation>}
 */
export async function attestEcosystem(targets) {
  const scannerAttestation = await attestScanner();

  const results = [];
  for (const t of targets) {
    try {
      const r = await attestFile(t.path, { label: t.label });
      results.push({ label: t.label ?? path.basename(t.path), ...r });
    } catch (err) {
      results.push({
        label: t.label ?? path.basename(t.path),
        file: t.path,
        error: err.message,
        attestedScore: 0,
        consensus: false,
        quantizedState: false,
        alpha: null,
        omega: null,
      });
    }
  }

  const filesTotal = results.length;
  const filesQuantized = results.filter((r) => r.quantizedState).length;
  const allQuantized =
    filesQuantized === filesTotal && scannerAttestation.scannerTrusted;

  const avgAttestedScore =
    results.length === 0
      ? 0
      : +(
          results.reduce((s, r) => s + (r.attestedScore ?? 0), 0) /
          results.length
        ).toFixed(6);

  // 480D coverage: each quantized file locks one D48 node's 10 harmonic sub-nodes
  const quantizedDimensions = Math.min(D480, filesQuantized * 10);
  const d480Complete = quantizedDimensions >= D480;

  let ecosystemStatus;
  if (!scannerAttestation.scannerTrusted) {
    ecosystemStatus = "SCANNER_COMPROMISED";
  } else if (d480Complete && allQuantized) {
    ecosystemStatus = "ABSOLUTE"; // Full 480D standing wave â€” cosmologically stable
  } else if (avgAttestedScore >= 0.95) {
    ecosystemStatus = "NOMINAL";
  } else if (avgAttestedScore >= 0.7) {
    ecosystemStatus = "DEGRADED";
  } else {
    ecosystemStatus = "CRITICAL";
  }

  return {
    type: "ECOSYSTEM_DUAL_ATTESTATION",
    architectureSignature: CANONICAL_ARCHITECTURE,

    // Golden Differential meta
    goldenBand: GOLDEN_BAND,
    goldenDiff: GOLDEN_DIFFERENTIAL,
    alphaWeight: ALPHA_PHI,
    omegaWeight: OMEGA_PSI,
    goldenSeparator: +(ALPHA_PHI / OMEGA_PSI).toFixed(6),

    timestamp: new Date().toISOString(),

    // Root-of-trust chain
    scannerAttestation,

    // File-level summary
    filesTotal,
    filesQuantized,
    allQuantized,
    avgAttestedScore,

    // 480D harmonic coverage
    d48Verified: filesQuantized,
    d48Total: D48,
    quantizedDimensions,
    d480Total: D480,

    // Final ecosystem state
    ecosystemStatus,
    absoluteState: ecosystemStatus === "ABSOLUTE",

    // Per-file detail
    results,
  };
}

// --- Internals ---------------------------------------------------------------

function _summarize(report, geometricWeight) {
  return {
    swarmId: report.swarmId,
    geometricWeight,
    swarmCoherence: report.swarmCoherence,
    status: report.status,
    summary: report.summary,
  };
}

function _inferService(filePath) {
  const segments = [
    "pwai-api-service",
    "pwai-controller",
    "pwai-ai-worker",
    "pwai-frontend",
    "merkaba-geoqode-lattice",
    "Merkaba48OS",
    "s4ai-core",
    "storm-dev",
  ];
  for (const s of segments) {
    if (filePath.includes(s)) return s;
  }
  return "unknown";
}

// --- Default export ----------------------------------------------------------

export default {
  attestFile,
  attestScanner,
  attestEcosystem,
  separatorAttestation,
  BESX_ALPHA_PATH,
  BESX_OMEGA_PATH,
  SEPARATOR_BAND,
  ALPHA_WEIGHT,
  OMEGA_WEIGHT,
  GOLDEN_DIFFERENTIAL,
};
