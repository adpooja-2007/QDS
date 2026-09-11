/**
 * Binary PCAP (Libpcap standard format) generator for QDS Sentinel forensic threat captures.
 * Generates true .pcap files adhering to the tcpdump/Wireshark packet capture specification.
 */

// Helper to compute IPv4 header checksum
function computeIpChecksum(header: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < header.length; i += 2) {
    if (i === 10) continue; // Skip checksum field during computation
    const word = (header[i] << 8) + (header[i + 1] || 0);
    sum += word;
  }
  while (sum >> 16) {
    sum = (sum & 0xffff) + (sum >> 16);
  }
  return ~sum & 0xffff;
}

// Convert IP string e.g. "10.0.1.1" to 4 bytes
function ipToBytes(ipStr: string): number[] {
  return ipStr.split('.').map((octet) => parseInt(octet, 10) & 0xff);
}

// Convert MAC string e.g. "00:11:22:33:44:55" to 6 bytes
function macToBytes(macStr: string): number[] {
  return macStr.split(':').map((b) => parseInt(b, 16) & 0xff);
}

export interface ThreatPcapData {
  id?: string;
  severity?: string;
  type?: string;
  origin?: string;
  time?: string;
  baselineQber?: number;
  measuredQber?: number;
  chshScore?: number;
  isCritical?: boolean;
  pqcDefense?: string;
}

/**
 * Builds a standard binary .pcap file representing a multi-packet quantum telemetry capture.
 */
export function generateThreatPcap(threat: ThreatPcapData): Uint8Array {
  const isCritical = threat.isCritical || threat.severity === 'CRITICAL' || (threat.measuredQber || 0) > 0.05;
  const qberPct = ((threat.measuredQber || 0.142) * 100).toFixed(2);
  const chsh = (threat.chshScore || 1.86).toFixed(3);
  const threatType = threat.type || 'Intercept-resend attack';
  const threatId = threat.id || 'THR-104';
  const originNode = threat.origin || 'EVE';

  // Packets to include in the PCAP capture:
  const packetsPayloads = [
    // Packet 1: ARBITRATOR EPR Distribution
    {
      srcMac: '02:00:00:00:00:01',
      dstMac: '02:00:00:00:00:02',
      srcIp: '10.0.1.254',
      dstIp: '10.0.1.1',
      srcPort: 9933,
      dstPort: 8001,
      payload: JSON.stringify({
        protocol: 'QDS/1550nm',
        session_id: 'QKD-260827-91F4',
        type: 'EPR_DISTRIBUTION',
        source: 'ARB-CORE',
        photons: 100,
        pump_wavelength_nm: 775.0,
        emission_wavelength_nm: 1550.0,
        state: '|Ψ+⟩ = (|01⟩ + |10⟩)/√2'
      })
    },
    // Packet 2: Signer (ALICE) Bell State Measurement
    {
      srcMac: '02:00:00:00:00:02',
      dstMac: '02:00:00:00:00:03',
      srcIp: '10.0.1.1',
      dstIp: '10.0.1.2',
      srcPort: 8001,
      dstPort: 8002,
      payload: JSON.stringify({
        protocol: 'QDS/1550nm',
        session_id: 'QKD-260827-91F4',
        type: 'BELL_MEASUREMENT_SYNC',
        source: 'QN-ALICE',
        document_hash: 'af7c4b8e21d3f9e91b0728c4125a',
        basis_choices: ['X', 'Z', 'Z', 'X', 'Z', 'X', 'X', 'Z'],
        pauli_frame: 'σXZ_ALIGNED'
      })
    },
    // Packet 3: ADVERSARY (EVE) Quantum Intercept & Disturbance
    {
      srcMac: '02:00:00:00:00:66',
      dstMac: '02:00:00:00:00:03',
      srcIp: '10.0.1.66',
      dstIp: '10.0.1.2',
      srcPort: 6666,
      dstPort: 8002,
      payload: JSON.stringify({
        alert_id: threatId,
        anomaly_type: threatType,
        intercept_rate: isCritical ? '35.0%' : '5.0%',
        measured_qber: `${qberPct}%`,
        chsh_score: chsh,
        hoeffding_bound_breach: isCritical,
        disturbance_status: 'COLLAPSED_ENTANGLEMENT'
      })
    },
    // Packet 4: SOC Sentinel Threat Telemetry & PQC Quarantine Guard
    {
      srcMac: '02:00:00:00:00:99',
      dstMac: 'FF:FF:FF:FF:FF:FF',
      srcIp: '10.0.1.100',
      dstIp: '10.0.1.255',
      srcPort: 51820,
      dstPort: 51820,
      payload: JSON.stringify({
        sentinel_action: isCritical ? 'QUARANTINE_ISOLATE_NODE' : 'NOMINAL_MONITOR',
        target_node: originNode,
        security_policy: 'NIST_FIPS_204_PQC_FAILOVER',
        pqc_algorithm: threat.pqcDefense || 'CRYSTALS-Dilithium3 / ML-DSA-65',
        forensic_signature: 'SHA3-512-QDS-AUDIT-VERIFIED'
      })
    }
  ];

  const nowSec = Math.floor(Date.now() / 1000);
  const nowUsec = (Date.now() % 1000) * 1000;

  // Compute total byte size required
  let totalLength = 24; // PCAP Global Header size

  const assembledPackets: { header: Uint8Array; data: Uint8Array }[] = [];

  packetsPayloads.forEach((pkt, idx) => {
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(pkt.payload);

    // UDP Header (8 bytes)
    const udpLen = 8 + payloadBytes.length;
    const udpHeader = new Uint8Array(8);
    const udpView = new DataView(udpHeader.buffer);
    udpView.setUint16(0, pkt.srcPort, false);
    udpView.setUint16(2, pkt.dstPort, false);
    udpView.setUint16(4, udpLen, false);
    udpView.setUint16(6, 0x0000, false); // Checksum optional in IPv4 UDP

    // IPv4 Header (20 bytes)
    const ipTotalLen = 20 + udpLen;
    const ipHeader = new Uint8Array(20);
    const ipView = new DataView(ipHeader.buffer);
    ipHeader[0] = 0x45; // Version 4, IHL 5
    ipHeader[1] = 0x00; // DSCP / ECN
    ipView.setUint16(2, ipTotalLen, false);
    ipView.setUint16(4, 0x1000 + idx, false); // ID
    ipView.setUint16(6, 0x4000, false); // Don't Fragment
    ipHeader[8] = 64; // TTL
    ipHeader[9] = 17; // Protocol: UDP (17)
    ipHeader.set(ipToBytes(pkt.srcIp), 12);
    ipHeader.set(ipToBytes(pkt.dstIp), 16);
    const ipChecksum = computeIpChecksum(ipHeader);
    ipView.setUint16(10, ipChecksum, false);

    // Ethernet Header (14 bytes)
    const ethHeader = new Uint8Array(14);
    ethHeader.set(macToBytes(pkt.dstMac), 0);
    ethHeader.set(macToBytes(pkt.srcMac), 6);
    ethHeader[12] = 0x08; // EtherType IPv4
    ethHeader[13] = 0x00;

    // Full packet data on wire
    const packetData = new Uint8Array(14 + 20 + 8 + payloadBytes.length);
    packetData.set(ethHeader, 0);
    packetData.set(ipHeader, 14);
    packetData.set(udpHeader, 34);
    packetData.set(payloadBytes, 42);

    // Packet Record Header (16 bytes)
    const pktRecordHeader = new Uint8Array(16);
    const pktView = new DataView(pktRecordHeader.buffer);
    const pktSec = nowSec + idx;
    const pktUsec = (nowUsec + idx * 12500) % 1000000;
    pktView.setUint32(0, pktSec, true);
    pktView.setUint32(4, pktUsec, true);
    pktView.setUint32(8, packetData.length, true); // incl_len
    pktView.setUint32(12, packetData.length, true); // orig_len

    assembledPackets.push({ header: pktRecordHeader, data: packetData });
    totalLength += 16 + packetData.length;
  });

  // Global PCAP Header (24 bytes)
  const pcapGlobalHeader = new Uint8Array(24);
  const gView = new DataView(pcapGlobalHeader.buffer);
  gView.setUint32(0, 0xa1b2c3d4, true); // Magic Number (microseconds)
  gView.setUint16(4, 2, true);          // Major version 2
  gView.setUint16(6, 4, true);          // Minor version 4
  gView.setInt32(8, 0, true);           // GMT to local correction
  gView.setUint32(12, 0, true);         // Accuracy of timestamps
  gView.setUint32(16, 65535, true);     // Max snapshot length
  gView.setUint32(20, 1, true);         // Link-Layer Header Type: LINKTYPE_ETHERNET (1)

  // Merge into final buffer
  const finalPcap = new Uint8Array(totalLength);
  finalPcap.set(pcapGlobalHeader, 0);

  let offset = 24;
  for (const pkt of assembledPackets) {
    finalPcap.set(pkt.header, offset);
    offset += 16;
    finalPcap.set(pkt.data, offset);
    offset += pkt.data.length;
  }

  return finalPcap;
}

/**
 * Initiates browser download of standard binary .pcap file
 */
export function downloadThreatPcap(threat: ThreatPcapData) {
  const pcapBytes = generateThreatPcap(threat);
  const blob = new Blob([pcapBytes.buffer as ArrayBuffer], { type: 'application/vnd.tcpdump.pcap' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const idStr = (threat.id || 'THR-104').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `threat_capture_${idStr}_${Date.now()}.pcap`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
