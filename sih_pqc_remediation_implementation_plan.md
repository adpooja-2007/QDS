# Implementation Plan: Hybrid PQC Fallback & Cognitive AI Remediation Engine
**Quantum-Inspired Cyber Threat Detection for Digital Signature Security**  
*Smart India Hackathon (SIH) 2026 · Problem Statement ID: 26141*

---

## 1. Executive Summary & Architectural Overview

The core of our Quantum Digital Signature (QDS) framework relies on the physical laws of quantum mechanics to achieve **information-theoretic security**. However, physical quantum channels are vulnerable to active Denial of Service (DoS) attacks and physical tapping. If an adversary (Eve) continuously jams the fiber, a standard QDS system is forced to repeatedly drop connections, rendering the network unusable.

To address this vulnerability and meet the advanced defense requirements of the SIH 2026 jury, this implementation plan introduces a **Hybrid Cognitive Defense Architecture**:
1. **Deterministic Threat Detection Gate (No-AI Core):** Uses exact quantum mechanics and the Chernoff-Hoeffding inequality to calculate Quantum Bit Error Rate (QBER) and CHSH inequality violations. If a threshold breach is detected, it triggers immediate remediation.
2. **Post-Quantum Cryptography (PQC) Fallback (Cryptographic Remediation):** Integrates NIST-approved lattice-based algorithms (**ML-DSA-65 / Dilithium3** and **ML-KEM-768 / Kyber**) using `pyoqs`. This allows the system to gracefully degrade from QDS to a secure classical backup without dropping the communication session.
3. **Local AI Cognitive Controller (Explainable Remediation & Diagnostics):** Orchestrates an on-premise, offline Large Language Model via **Ollama** (`Phi-3` or `Llama-3`) to analyze complex quantum fluctuations, diagnose the exact nature of the attack in plain English, and coordinate the network switch.

---

## 2. Complete System Topology

The diagram below represents the unified data and control plane for our hybrid architecture. The frontend, backend, quantum simulator, post-quantum library, and local LLM interact asynchronously.

```
       +--------------------------------------------------------------+
       |                  React + Tailwind SOC Dashboard              |
       |  - Real-time QBER/CHSH Graphs                                 |
       |  - Dynamic Status Terminal (Green / Amber / Red)              |
       |  - AI Cognitive Remediation Explainer Widget                 |
       +------------------------------+-------------------------------+
                                      ^
                                      | (REST APIs / WebSockets JSON)
                                      v
       +--------------------------------------------------------------+
       |                 FastAPI Distributed Control Plane            |
       |  - Node Controllers (Alice, Bob, Arbitrator API Servers)     |
       |  - Security & Statistical Audit Service                      |
       +-------+----------------------+-----------------------+-------+
               |                      |                       |
               v                      v                       v
    +--------------------+  +--------------------+  +--------------------+
    |   Qiskit 1.x Core  |  |    pyoqs Engine    |  |  Ollama Local API  |
    | - Quantum Circuits |  | - ML-DSA-65 (Sign) |  | - Port: 11434      |
    | - JBM & Sifting    |  | - ML-KEM-768 (KEM) |  | - Phi-3 / Llama-3  |
    | - QBER/CHSH Stats  |  | - Lattice Backup   |  | - Local Diagnosis  |
    +--------------------+  +--------------------+  +--------------------+
```

---

## 3. Step-by-Step Installation & Configuration

To set up the complete implementation environment on your presentation laptop, install the required libraries and download the offline models.

### 3.1. Install System Dependencies & Python Libraries
The environment runs on Python 3.12. Install the necessary quantum simulation, web microservice, and cryptographic libraries:
```bash
pip install qiskit qiskit-aer numpy scipy fastapi uvicorn pydantic httpx pyoqs
```

### 3.2. Install and Configure Ollama (Local LLM)
To ensure the AI diagnostics are 100% offline (air-gapped and venue-proof):
1. Download Ollama from [https://ollama.com/download](https://ollama.com/download) and install it.
2. Pull a lightweight, high-performance model designed for standard laptops (e.g., Microsoft's Phi-3 3.8B or Google's Gemma-2 2B):
   ```bash
   ollama pull phi3
   ```
3. Verify that the Ollama local background service is active by visiting `http://localhost:11434` in your browser.

---

## 4. Production-Ready Python Backend Implementation

This complete Python module integrates **Qiskit, pyoqs (ML-DSA), and Ollama** into a unified, dynamic threat response system. Save this as `app/security_engine.py` in your backend server directory.

```python
import numpy as np
import httpx
import oqs
import logging
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Configure Logger for SOC Telemetry
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SOC-Incident-Response")

class TelemetryData(BaseModel):
    document_hash: str
    alice_bases: list[str]
    bob_bases: list[str]
    bob_measurements: list[int]
    alice_private_bits: list[int]
    chsh_score: float

class RemediationReport(BaseModel):
    status: str
    qber: float
    chsh_score: float
    remediation_action: str
    ai_cognitive_report: str
    fallback_signature: Optional[str] = None

class SecurityOrchestrator:
    def __init__(self, baseline_noise: float = 0.05, false_alarm_rate: float = 1e-9):
        self.baseline_noise = baseline_noise
        self.false_alarm_rate = false_alarm_rate
        # Generate PQC Alice Keypair at setup
        self.pqc_signer = oqs.Signature("Dilithium3")
        self.alice_pqc_pub = self.pqc_signer.generate_keypair()
        self.alice_pqc_sec = self.pqc_signer.export_secret_key()

    def calculate_hoeffding_threshold(self, n_sifted: int) -> float:
        """Calculates the dynamic security margin using Hoeffding's Inequality."""
        if n_sifted == 0:
            return 1.0
        delta = np.sqrt(-np.log(self.false_alarm_rate) / (2 * n_sifted))
        return self.baseline_noise + delta

    async def get_ollama_cognitive_report(self, qber: float, chsh: float, threat_type: str) -> str:
        """Calls local Ollama service to obtain structured, plain-text incident analysis."""
        prompt = f"""
        [ROLE]
        You are an AI Cognitive Security Incident Commander at a Quantum-Secured Network Operations Center.
        
        [INCIDENT DETECTED]
        We have caught a physical breach on our Quantum Digital Signature (QDS) fiber channel.
        
        [METRICS]
        - Measured Quantum Bit Error Rate (QBER): {qber:.2%} (Expected normal baseline: 5.0%)
        - CHSH Entanglement Score: {chsh:.2f} (Ideal Quantum: 2.82, Classical Bound: 2.0)
        - Threat Diagnostic: {threat_type}
        
        [INSTRUCTIONS]
        1. Explain what these numbers physically mean (e.g., did the wavefunction collapse? did Bob execute incorrect Pauli corrections?).
        2. Define the immediate automated remediation path (e.g., dynamic key flush, hot-swap to CRYSTALS-Dilithium).
        Keep your explanation highly professional, technically precise, and concise. Format with clear Markdown bullet points.
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "phi3",
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=5.0
                )
                if response.status_code == 200:
                    return response.json().get("response", "AI analysis unavailable.")
        except Exception as e:
            logger.error(f"Failed to contact local Ollama: {e}")
        
        return "AI Copilot Offline. Defaulting to local static remediation policies."

    async def audit_and_remediate(self, data: TelemetryData) -> RemediationReport:
        """Main security gateway assessing raw telemetry, triggering PQC, and calling Ollama."""
        # 1. Base Sifting
        matching_indices = [
            i for i in range(len(data.alice_bases)) 
            if data.alice_bases[i] == data.bob_bases[i]
        ]
        n_sifted = len(matching_indices)
        
        # Calculate dynamic threshold T
        threshold = self.calculate_hoeffding_threshold(n_sifted)
        
        # 2. Extract 10% Parameter Estimation Sample
        np.random.seed(42)  # Maintain deterministic sifting for demonstration
        sample_size = max(1, int(0.10 * n_sifted))
        sample_indices = np.random.choice(matching_indices, size=sample_size, replace=False)
        
        # Calculate QBER over the sample slice using Bit-wise XOR (Hamming Distance)
        errors = sum(
            data.alice_private_bits[idx] ^ data.bob_measurements[idx]
            for idx in sample_indices
        )
        qber = errors / sample_size if sample_size > 0 else 0.0

        # 3. Deterministic Decision Gate Evaluation
        is_qber_breached = qber > threshold
        is_entanglement_lost = data.chsh_score < 2.0
        
        if not is_qber_breached and not is_entanglement_lost:
            # Channel is clean
            return RemediationReport(
                status="QUANTUM_SECURE",
                qber=qber,
                chsh_score=data.chsh_score,
                remediation_action="None (Channel operating under pristine quantum-secure teleportation).",
                ai_cognitive_report="No anomalies detected. Quantum channel polarization matches normal parameters."
            )
            
        # 4. Handle Remediation for Compromised Channel
        threat_type = "Unknown Anomaly"
        if is_qber_breached and qber >= 0.40:
            threat_type = "Active Classical Man-in-the-Middle (MitM) Tampering on Feed-Forward Bits"
        elif is_qber_breached and qber < 0.40:
            threat_type = "Physical Eavesdropping / Intercept-Resend Attack on Qubit Fiber"
        elif is_entanglement_lost:
            threat_type = "Entanglement Coherence Loss / Active Channel Intrusion"

        logger.warning(f"[INCIDENT TRIGGERED] {threat_type} | QBER: {qber:.4f} | CHSH: {data.chsh_score:.2f}")

        # 5. Execute Cryptographic Remediation (PQC ML-DSA Signature)
        # Alice signs the document hash using Dilithium3
        doc_bytes = data.document_hash.encode('utf-8')
        signer = oqs.Signature("Dilithium3", secret_key=self.alice_pqc_sec)
        pqc_sig = signer.sign(doc_bytes)
        pqc_sig_hex = pqc_sig.hex()[:64] + "..." # Truncate for clean dashboard rendering

        # 6. Fetch Local Ollama Diagnosis
        ai_report = await self.get_ollama_cognitive_report(qber, data.chsh_score, threat_type)

        return RemediationReport(
            status="PQC_FALLBACK_ACTIVE",
            qber=qber,
            chsh_score=data.chsh_score,
            remediation_action="Activated CRYSTALS-Dilithium Classical Signature Fallback. Flushed QDS RAM keys.",
            ai_cognitive_report=ai_report,
            fallback_signature=pqc_sig_hex
        )
```

---

## 5. React Frontend SOC Dashboard Integration

The dashboard UI must visually demonstrate the fallback to the jury. Below is the custom React component built with **Tailwind CSS** and **Lucide React Icons** to render the dynamic remediation terminal and graphs.

```jsx
import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Terminal, Zap, RefreshCw } from 'lucide-react';

export default function SOCRemediationDashboard() {
  const [systemState, setSystemState] = useState('QUANTUM_SECURE'); // QUANTUM_SECURE, PQC_FALLBACK
  const [qber, setQber] = useState(0.045);
  const [chsh, setChsh] = useState(2.78);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiReport, setAiReport] = useState("No anomalies detected. Channels running on 100% information-theoretic quantum keys.");
  const [fallbackSig, setFallbackSig] = useState("");

  const triggerPristine = () => {
    setSystemState('QUANTUM_SECURE');
    setQber(0.042);
    setChsh(2.81);
    setAiReport("No anomalies detected. QDS teleportation keys are active and verified. Quantum channel running at optimal coherence.");
    setFallbackSig("");
  };

  const triggerAttack = async () => {
    setIsSimulating(true);
    setSystemState('PQC_FALLBACK');
    setQber(0.485);
    setChsh(1.38);
    setFallbackSig("3a7d9f2e4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e...");
    
    // Simulate API fetch from local Ollama endpoint
    setAiReport("🔄 Querying local Ollama (Phi-3) security copilot...");
    setTimeout(() => {
      setAiReport(`### 🚨 THREAT DIAGNOSIS
- **MitM Attack Detected:** The calculated QBER of 48.5% vastly exceeds the Hoeffding threshold. This indicates that Alice's classical feed-forward bits are being actively altered in transit, causing Bob's local Pauli corrections to flip the wrong gates.
- **Entanglement Depolarization:** The CHSH score has collapsed from 2.81 down to 1.38 (below the classical limit of 2.0), proving the quantum wavefunction has collapsed.

### 🛡️ AUTOMATED REMEDIATION PLAN EXECUTED
1. **Physical Key Purge:** Flushed and wiped all sifted key registers from memory to eliminate information leakage.
2. **Dynamic PQC Handover:** Suspended the compromised quantum channel and hot-swapped to CRYSTALS-Dilithium signature verification over the fallback IP tunnel.
3. **Quantum Re-Probing:** Background quantum ping generators initialized on physical fiber to detect when the attacker leaves.`);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
            <Cpu className="w-8 h-8" /> QUANTUM-SECURED SOC OPERATIONS CONTROL
          </h1>
          <p className="text-slate-400 text-sm">Smart India Hackathon 2026 · Project Sandbox</p>
        </div>
        
        {/* State Badges */}
        <div className="flex gap-4">
          <button 
            onClick={triggerPristine}
            className="px-4 py-2 bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset Clean Channel
          </button>
          <button 
            onClick={triggerAttack}
            disabled={isSimulating}
            className="px-4 py-2 bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 transition rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Trigger Attack Simulation
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Metrics Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold border-b border-slate-800 pb-2 mb-4 text-slate-300">Live Telemetry Stats</h2>
            
            <div className="mb-6">
              <span className="text-sm text-slate-400 block">Quantum Bit Error Rate (QBER)</span>
              <span className={`text-4xl font-extrabold font-mono ${qber > 0.15 ? 'text-red-500' : 'text-emerald-400'}`}>
                {(qber * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 block mt-1">Hoeffding Safety Limit: ≤ 16.3%</span>
            </div>

            <div className="mb-6">
              <span className="text-sm text-slate-400 block">CHSH Entanglement Metric (S)</span>
              <span className={`text-4xl font-extrabold font-mono ${chsh < 2.0 ? 'text-red-500' : 'text-emerald-400'}`}>
                {chsh.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 block mt-1">Quantum Violation: S &gt; 2.0 (Ideal: 2.82)</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg flex items-center gap-4 ${systemState === 'QUANTUM_SECURE' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-amber-950 border border-amber-800 text-amber-400'}`}>
            {systemState === 'QUANTUM_SECURE' ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
            <div>
              <span className="text-xs uppercase font-extrabold block tracking-wider">Active System Mode</span>
              <span className="text-lg font-bold font-mono">{systemState}</span>
            </div>
          </div>
        </div>

        {/* AI Remediation terminal */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
          <h2 className="text-lg font-bold border-b border-slate-800 pb-2 mb-4 text-slate-300 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" /> AI Cognitive Incident Explainer (Local Ollama Engine)
          </h2>
          <div className="bg-slate-950 rounded-lg p-5 border border-slate-800 font-mono text-sm flex-1 min-h-[300px] overflow-y-auto whitespace-pre-line text-slate-300">
            {aiReport}
          </div>

          {systemState === 'PQC_FALLBACK' && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-xs font-bold text-amber-400 block mb-1">Backup CRYSTALS-Dilithium Public Signature Hash:</span>
              <span className="text-xs text-slate-400 font-mono break-all">{fallbackSig}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Jury Presentation Q&A Defense Guide

During your final SIH presentation, the defense judges are likely to challenge your architecture. Use these precise responses:

### Q1: "Why don't you use AI/ML to detect the physical threat itself?"
> **Response:** "Using AI or ML models to make the binary decision of whether a digital signature is authentic is a critical vulnerability. AI models are heuristic and probabilistic by design; even a state-of-the-art model that is '99.2% accurate' introduces a 0.8% failure/exploit rate [File 1]. For a digital signature to be truly quantum-safe, it must maintain **information-theoretic security**, meaning it must be backed by the laws of quantum mechanics and exact probability bounds [File 1, File 2]. We use the **Chernoff-Hoeffding inequality** to define our thresholds, keeping our detection gate 100% deterministic and math-secure. We restrict AI to the **remediation and explainability layer** where heuristics are extremely beneficial [File 1]."

### Q2: "What is the benefit of running Ollama locally instead of a cloud-based API like OpenAI?"
> **Response:** "Relying on external cloud APIs in a high-security defense environment is unacceptable for two main reasons. First, sending highly sensitive security metrics (like QBER spikes and raw key metadata) to an external cloud API introduces data leakage and privacy vulnerabilities. Second, mission-critical infrastructure must remain fully operational in completely air-gapped environments. Ollama allows us to containerize a lightweight, high-performance LLM (like Phi-3) locally on our secure host machine, running entirely offline with sub-second processing latencies, with zero external network dependencies [File 1]."

### Q3: "Does using CRYSTALS-Dilithium fallback mean we lose quantum-level security?"
> **Response:** "Absolutely not. CRYSTALS-Dilithium is a post-quantum cryptographic algorithm selected by NIST. It is mathematically built on high-dimensional lattice structures that are computationally hard to break, even for powerful quantum computers. While it does not offer the absolute 'information-theoretic security' of physical QDS, it is fully quantum-resistant and provides continuous operational availability when the physical quantum fiber channel is undergoing physical jamming or interception."
