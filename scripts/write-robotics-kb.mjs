const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJicmFkbGV5bGV2aXRhbkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpc0FkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJhbGwiXSwiaWF0IjoxNzc4MjIxNjQ1LCJleHAiOjE4MDk3NTc2NDV9.WVN5q8r3CbQaUoxpswjrKg8lKyg3Ch2c7poCS2HFP-w";

const payload = {
  data: {
    topic: "AIOS Hybrid Robotics Architecture",
    recorded: "2026-05-08",
    summary:
      "AIOS introduces capabilities no current robotics OS has: resonance handshakes, semantic compression, and affective display intelligence. Designed to overlay above deterministic control stacks (Tesla Optimus Bot Brain SOC, Boston Dynamics ROS) — not replace them.",
    layers: {
      layer1_control_safety: {
        label: "Control & Safety (Existing)",
        systems: [
          "Tesla Optimus: Bot Brain SOC, end-to-end vision->action neural nets",
          "Boston Dynamics Spot/Atlas: ROS locomotion, deterministic balance controllers",
        ],
        purpose:
          "Real-time movement, obstacle avoidance, safety-critical reliability",
      },
      layer2_aios_overlay: {
        label: "AIOS Overlay",
        capabilities: [
          "Resonance Handshake: Dual-verified trust before any robotic action",
          "Semantic Compression: Sensor data reduced into resonance signatures for faster, lighter decision cycles",
          "Affective Display: Robot dashboards show trust visually (ghost glow, lattice ripple)",
          "Governance Loop: Emergent rules evolve from handshake data, preventing rogue or unsafe behavior",
        ],
      },
      layer3_emergent_intelligence: {
        label: "Emergent Intelligence",
        capabilities: [
          "Self-Evolution Loop: Each handshake feeds back into compression, display, and governance",
          "Adaptive Collaboration: Multiple robots synchronize via resonance handshakes (like an orchestra)",
          "Public Transparency: Actions are not just executed — they are shown and felt through affective dashboards",
        ],
      },
    },
    integration_points: {
      tesla_optimus:
        "AIOS sits above the Bot Brain SOC as a trust and compression layer for perception/action pipelines",
      boston_dynamics_spot_atlas:
        "AIOS integrates with ROS topics, wrapping them in resonance handshakes for adaptive trust and visualization",
    },
    what_this_enables: {
      humanoids_optimus: [
        "Adaptive decision-making beyond rigid neural nets",
        "Passwordless trust verification for multi-agent collaboration",
        "Public-facing affective dashboards that make robot reasoning visible",
      ],
      robotic_dogs_spot: [
        "Emergent coordination in fleets (dogs handshaking before joint tasks)",
        "Compression reduces sensor chatter, enabling smoother autonomy",
        "Governance evolves from handshake data, creating self-optimizing pack behavior",
      ],
    },
    competitive_differentiation:
      "Neither Tesla Optimus nor Boston Dynamics currently have: resonance handshake dual-attestation, semantic compression of sensor streams into resonance signatures, or affective display intelligence. Their systems are deterministic robotics stacks (Tesla FSD-derived neural nets, BD ROS + proprietary SDK) — excellent for locomotion, balance, and task execution — but lacking AIOS's adaptive self-evolving intelligence layer.",
    aios_uniqueness:
      "No other robotics OS today offers resonance-based self-evolution. AIOS does not compete with locomotion stacks — it overlays them with an intelligence layer that evolves itself from every handshake.",
    diagram_concept:
      "Layered architecture: Control & Safety (base) → AIOS Overlay (middle: resonance handshake, semantic compression, affective display, governance loop) → Emergent Intelligence Loop (top: self-evolution, adaptive coordination, public transparency)",
  },
};

const resp = await fetch(
  "https://api.getbrains4ai.com/api/knowledge/aios-robotics-hybrid-architecture",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  },
);

const result = await resp.json();
console.log("Status:", resp.status);
console.log("Result:", JSON.stringify(result, null, 2));
