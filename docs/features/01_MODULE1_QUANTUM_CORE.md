# Feature 01: Module 1 — Quantum Simulation Core

> **Location**: `backend/app/quantum/`  
> **Tests**: `backend/tests/quantum/` (20 Unit Tests)

---

## 1. Overview & Purpose

Module 1 is the **Quantum Simulation Core** powered by Qiskit. It implements quantum state preparation, EPR Bell pair entanglement generation, quantum teleportation protocol steps, Joint Bell State Measurement (BSM), Pauli unitary correction, and randomized projective measurement.

---

## 2. Core Protocol Steps & Implementation

### A. Entangled EPR Pair Generation (`epr.py`)
Generates $N$ Bell state pairs $\lvert \Phi^+ \rangle = \frac{1}{\sqrt{2}} (\lvert 00 \rangle + \lvert 11 \rangle)$:

```python
from qiskit import QuantumCircuit

def create_bell_pair() -> QuantumCircuit:
    qc = QuantumCircuit(2, 2)
    qc.h(0)         # Hadamard gate on Qubit 0
    qc.cx(0, 1)     # CNOT gate (Qubit 0 = Control, Qubit 1 = Target)
    return qc
```

- **Qubit Routing**: Qubit 0 is sent to Alice; Qubit 1 is sent to Bob across the quantum channel.

### B. Alice's Signature State Preparation (`state_preparation.py`)
Converts document hash $H(d)$ into binary signature keys and prepares qubits in bases $Z$ ($\lvert 0 \rangle, \lvert 1 \rangle$) or $X$ ($\lvert + \rangle, \lvert - \rangle$):

- Basis $Z$:
  - Bit `0`: $\lvert 0 \rangle$ (Identity gate `I`)
  - Bit `1`: $\lvert 1 \rangle$ (Pauli-X gate `X`)
- Basis $X$:
  - Bit `0`: $\lvert + \rangle = H \lvert 0 \rangle$
  - Bit `1`: $\lvert - \rangle = X H \lvert 0 \rangle$

### C. Joint Bell State Measurement — BSM (`bell_measurement.py`)
Alice performs a joint Bell measurement between her signature qubit and her half of the EPR pair:

1. Applies CNOT (Control: Signature Qubit, Target: EPR Qubit).
2. Applies Hadamard $H$ gate to Signature Qubit.
3. Measures both qubits to obtain classical feed-forward bits $(M_{a1}, M_{a2}) \in \{0, 1\}^2$.

### D. Classical Feed-Forward & Bob's Pauli Correction (`correction.py`)
Bob receives classical bits $(M_{a1}, M_{a2})$ and applies unitary transformation $\sigma = X^{M_{a2}} Z^{M_{a1}}$:

| Classical Bits $(M_{a1}, M_{a2})$ | Unitary Correction Gate $\sigma$ |
|---|---|
| `00` | $I$ (Identity) |
| `01` | $X$ (Pauli-X) |
| `10` | $Z$ (Pauli-Z) |
| `11` | $XZ$ (Pauli-X followed by Pauli-Z) |

### E. Basis Reconciliation & Sifting (`sifting.py`)
Compares Alice's and Bob's basis selections over a public channel:
- Keep indices where $\text{Basis}_A[i] == \text{Basis}_B[i]$.
- Discard indices where bases mismatch (expected discard rate $\approx 50\%$).

---

## 3. Quantum Core Service Interface (`service.py`)

The unified interface class `QuantumService` provides high-level routines:

- `generate_epr_pairs(num_pairs: int)`
- `prepare_signature(document_hash: str, num_pairs: int)`
- `run_bell_measurement(alice_qubits, epr_qubits)`
- `apply_correction(bob_qubits, bell_bits)`
- `measure(bob_qubits, bob_bases)`
- `sift(alice_bases, bob_bases, alice_bits, bob_measurements)`
