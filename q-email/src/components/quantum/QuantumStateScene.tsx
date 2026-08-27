import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SessionState, SecurityDecision } from '../../types';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { RotateCcw, ShieldCheck, Cpu } from 'lucide-react';

interface QuantumStateSceneProps {
  sessionState?: SessionState;
  decision?: SecurityDecision | string;
  sessionId?: string;
  auditRunning?: boolean;
}

// Particle Stream moving along a 3D curve
const FlowingParticles: React.FC<{
  curve: THREE.Curve<THREE.Vector3>;
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
}> = ({ curve, count = 12, color = '#818CF8', speed = 0.3, size = 0.06 }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const [offsets] = useState(() => Array.from({ length: count }, (_, i) => i / count));

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    offsets.forEach((offset, i) => {
      const progress = (offset + delta * speed) % 1;
      offsets[i] = progress;
      const point = curve.getPoint(progress);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.85}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

// 3D Visual Mesh Network
const QuantumSceneContent: React.FC<{
  sessionState: SessionState;
  decision: SecurityDecision | string;
  auditRunning: boolean;
}> = ({ decision, auditRunning }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Status-dependent accent color
  const statusColor = useMemo(() => {
    if (decision === 'REJECT') return '#DC2626';
    if (decision === 'FLAG') return '#D97706';
    return '#059669'; // ACCEPT / Normal
  }, [decision]);

  // Coordinates
  const alicePos = useMemo(() => new THREE.Vector3(-3.2, 0.2, 0), []);
  const bobPos = useMemo(() => new THREE.Vector3(3.2, 0.2, 0), []);
  const arbPos = useMemo(() => new THREE.Vector3(0, 2.4, 0), []);
  const secPos = useMemo(() => new THREE.Vector3(0, -2.1, 0), []);

  // Connection Curves
  const eprCurve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      alicePos,
      new THREE.Vector3(0, 0.8, 0.5),
      bobPos
    );
  }, [alicePos, bobPos]);

  const arbToAliceCurve = useMemo(() => {
    return new THREE.LineCurve3(arbPos, alicePos);
  }, [arbPos, alicePos]);

  const arbToBobCurve = useMemo(() => {
    return new THREE.LineCurve3(arbPos, bobPos);
  }, [arbPos, bobPos]);

  const aliceToSecCurve = useMemo(() => {
    return new THREE.LineCurve3(alicePos, secPos);
  }, [alicePos, secPos]);

  const bobToSecCurve = useMemo(() => {
    return new THREE.LineCurve3(bobPos, secPos);
  }, [bobPos, secPos]);

  // Static Line Objects
  const eprLineMesh = useMemo(() => {
    const pts = eprCurve.getPoints(40);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#6366F1', transparent: true, opacity: 0.4 });
    return new THREE.Line(geo, mat);
  }, [eprCurve]);

  const arbAliceLineMesh = useMemo(() => {
    const pts = [arbPos, alicePos];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#94A3B8', transparent: true, opacity: 0.3 });
    return new THREE.Line(geo, mat);
  }, [arbPos, alicePos]);

  const arbBobLineMesh = useMemo(() => {
    const pts = [arbPos, bobPos];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#94A3B8', transparent: true, opacity: 0.3 });
    return new THREE.Line(geo, mat);
  }, [arbPos, bobPos]);

  const secAliceLineMesh = useMemo(() => {
    const pts = [alicePos, secPos];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#94A3B8', transparent: true, opacity: 0.25 });
    return new THREE.Line(geo, mat);
  }, [alicePos, secPos]);

  const secBobLineMesh = useMemo(() => {
    const pts = [bobPos, secPos];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#94A3B8', transparent: true, opacity: 0.25 });
    return new THREE.Line(geo, mat);
  }, [bobPos, secPos]);

  // Central Core rotation
  const coreRef = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (auditRunning ? 1.2 : 0.25);
      coreRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-4, 2, 2]} intensity={0.6} color="#6366F1" />
      <pointLight position={[4, 2, 2]} intensity={0.6} color="#3B82F6" />

      {/* Grid Floor */}
      <gridHelper args={[16, 16, '#CBD5E1', '#E2E8F0']} position={[0, -2.8, 0]} />

      {/* Static Connection Lines using Three.js Primitives */}
      <primitive object={eprLineMesh} />
      <primitive object={arbAliceLineMesh} />
      <primitive object={arbBobLineMesh} />
      <primitive object={secAliceLineMesh} />
      <primitive object={secBobLineMesh} />

      {/* Dynamic Flow Particles */}
      <FlowingParticles curve={eprCurve} count={16} color="#4F46E5" speed={0.25} size={0.07} />
      <FlowingParticles curve={arbToAliceCurve} count={8} color="#64748B" speed={0.18} size={0.05} />
      <FlowingParticles curve={arbToBobCurve} count={8} color="#64748B" speed={0.18} size={0.05} />

      {auditRunning && (
        <>
          <FlowingParticles curve={aliceToSecCurve} count={10} color={statusColor} speed={0.4} size={0.06} />
          <FlowingParticles curve={bobToSecCurve} count={10} color={statusColor} speed={0.4} size={0.06} />
        </>
      )}

      {/* Center Quantum Session Core */}
      <group ref={coreRef} position={[0, 0.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshPhysicalMaterial
            color="#4338CA"
            transparent
            opacity={0.2}
            roughness={0.1}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[0.95, 0.02, 16, 64]} />
          <meshStandardMaterial color="#6366F1" opacity={0.6} transparent />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.9, 0.015, 16, 64]} />
          <meshStandardMaterial color={statusColor} opacity={0.7} transparent />
        </mesh>
      </group>

      {/* Alice Node */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group
          position={alicePos}
          onPointerOver={() => setHoveredNode('alice')}
          onPointerOut={() => setHoveredNode(null)}
        >
          <mesh>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshStandardMaterial
              color="#4F46E5"
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
          <Html position={[0, 0.85, 0]} center distanceFactor={10}>
            <div className="flex flex-col items-center pointer-events-none select-none">
              <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white font-mono-tech text-[10px] font-semibold tracking-wider border border-slate-700 shadow-sm">
                ALICE
              </span>
              {hoveredNode === 'alice' && (
                <div className="mt-1 p-2 bg-white text-slate-800 rounded border border-slate-200 shadow-card text-[11px] w-36 text-center">
                  <strong className="block text-brand-dark">Signature Prep</strong>
                  <span className="text-slate-500 text-[10px]">Bell measurement node</span>
                </div>
              )}
            </div>
          </Html>
        </group>
      </Float>

      {/* Bob Node */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group
          position={bobPos}
          onPointerOver={() => setHoveredNode('bob')}
          onPointerOut={() => setHoveredNode(null)}
        >
          <mesh>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshStandardMaterial
              color="#2563EB"
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
          <Html position={[0, 0.85, 0]} center distanceFactor={10}>
            <div className="flex flex-col items-center pointer-events-none select-none">
              <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white font-mono-tech text-[10px] font-semibold tracking-wider border border-slate-700 shadow-sm">
                BOB
              </span>
              {hoveredNode === 'bob' && (
                <div className="mt-1 p-2 bg-white text-slate-800 rounded border border-slate-200 shadow-card text-[11px] w-36 text-center">
                  <strong className="block text-brand-dark">Verification</strong>
                  <span className="text-slate-500 text-[10px]">Pauli transform receiver</span>
                </div>
              )}
            </div>
          </Html>
        </group>
      </Float>

      {/* Arbitrator Node */}
      <group
        position={arbPos}
        onPointerOver={() => setHoveredNode('arbitrator')}
        onPointerOut={() => setHoveredNode(null)}
      >
        <mesh>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
        <Html position={[0, 0.75, 0]} center distanceFactor={10}>
          <div className="flex flex-col items-center pointer-events-none select-none">
            <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white font-mono-tech text-[10px] font-semibold tracking-wider border border-slate-700 shadow-sm">
              ARBITRATOR
            </span>
            {hoveredNode === 'arbitrator' && (
              <div className="mt-1 p-2 bg-white text-slate-800 rounded border border-slate-200 shadow-card text-[11px] w-40 text-center">
                <strong className="block text-brand-dark">EPR Distribution</strong>
                <span className="text-slate-500 text-[10px]">Entanglement source</span>
              </div>
            )}
          </div>
        </Html>
      </group>

      {/* Security Engine Node */}
      <group
        position={secPos}
        onPointerOver={() => setHoveredNode('secEngine')}
        onPointerOut={() => setHoveredNode(null)}
      >
        <mesh>
          <cylinderGeometry args={[0.65, 0.65, 0.25, 32]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial color={statusColor} side={THREE.DoubleSide} />
        </mesh>
        <Html position={[0, -0.65, 0]} center distanceFactor={10}>
          <div className="flex flex-col items-center pointer-events-none select-none">
            <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white font-mono-tech text-[10px] font-semibold tracking-wider border border-slate-700 shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              SECURITY ENGINE
            </span>
            {hoveredNode === 'secEngine' && (
              <div className="mt-1 p-2 bg-white text-slate-800 rounded border border-slate-200 shadow-card text-[11px] w-44 text-center">
                <strong className="block text-brand-dark">Deterministic SOC Engine</strong>
                <span className="text-slate-500 text-[10px]">Decision: <strong>{typeof decision === 'string' ? decision : decision?.decision || 'ACCEPT'}</strong></span>
              </div>
            )}
          </div>
        </Html>
      </group>
    </>
  );
};

export const QuantumStateScene: React.FC<QuantumStateSceneProps> = ({
  sessionState = 'AUDITED',
  decision = 'ACCEPT',
  sessionId = 'QSEC-2026-000001',
  auditRunning = false
}) => {
  const [controlsRef, setControlsRef] = useState<any>(null);

  const handleResetCamera = () => {
    if (controlsRef) {
      controlsRef.reset();
    }
  };

  return (
    <div className="soc-card overflow-hidden relative flex flex-col bg-slate-950 text-white border-slate-800">
      {/* Top Header inside 3D Container */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 uppercase font-mono-tech">
            3D Quantum Session Topology
          </span>
          <span className="text-[11px] text-slate-400 font-mono-tech hidden sm:inline">
            ({sessionId})
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-mono-tech hidden md:inline">
            Drag to Rotate · Scroll to Zoom
          </span>
          <button
            onClick={handleResetCamera}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas with Error Boundary and Fallback */}
      <div className="w-full h-[360px] sm:h-[400px] relative bg-slate-950">
        <SceneErrorBoundary sessionState={sessionState} decision={decision}>
          <Canvas
            camera={{ position: [0, 1.2, 7.5], fov: 48 }}
            className="w-full h-full"
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#090D16']} />
            <QuantumSceneContent
              sessionState={sessionState}
              decision={decision}
              auditRunning={auditRunning}
            />
            <OrbitControls
              ref={setControlsRef}
              enablePan={false}
              maxPolarAngle={Math.PI / 2 + 0.1}
              minPolarAngle={Math.PI / 6}
              minDistance={4.5}
              maxDistance={12}
            />
          </Canvas>
        </SceneErrorBoundary>

        {/* Legend Overlay at Bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] font-mono-tech text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Alice / Bob
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Arbitrator
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Security Engine
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>State: <strong className="text-slate-200">{sessionState}</strong></span>
            <span>·</span>
            <span>Decision: <strong className="text-emerald-400">{typeof decision === 'string' ? decision : decision?.decision || 'ACCEPT'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

