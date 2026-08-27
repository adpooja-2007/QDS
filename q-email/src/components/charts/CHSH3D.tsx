import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

interface CHSH3DProps {
  chsh?: number;
}

const CorrelationScene: React.FC<{ chsh: number }> = ({ chsh }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const isQuantum = chsh > 2.0;
  const vectorLength = Math.min(2.5, (chsh / 2.828) * 2.2);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <group ref={groupRef}>
        {/* X, Y, Z Axis Grid */}
        <axesHelper args={[2.5]} />

        {/* Classical Bound Plane (S = 2.0) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[1.4, 1.45, 64]} />
          <meshBasicMaterial color="#94A3B8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>

        {/* Quantum Tsirelson Bound (S = 2.828) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[2.15, 2.2, 64]} />
          <meshBasicMaterial color="#4F46E5" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Correlation Vector */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
          <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            {/* Vector Cylinder */}
            <mesh position={[0, vectorLength / 2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, vectorLength, 16]} />
              <meshStandardMaterial color={isQuantum ? '#059669' : '#DC2626'} roughness={0.3} />
            </mesh>
            {/* Vector Tip */}
            <mesh position={[0, vectorLength, 0]}>
              <coneGeometry args={[0.12, 0.25, 16]} />
              <meshStandardMaterial color={isQuantum ? '#059669' : '#DC2626'} roughness={0.2} />
            </mesh>
            <mesh position={[0, vectorLength + 0.35, 0]}>
              <Html center distanceFactor={8}>
                <div className="px-2 py-0.5 rounded bg-slate-900/90 text-white font-mono-tech text-[10px] whitespace-nowrap border border-slate-700 pointer-events-none">
                  S = {chsh.toFixed(2)}
                </div>
              </Html>
            </mesh>
          </group>
        </Float>
      </group>
    </>
  );
};

export const CHSH3D: React.FC<CHSH3DProps> = ({ chsh = 2.74 }) => {
  return (
    <div className="w-full h-48 bg-slate-950 rounded-lg overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 2.5, 4.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0B1120']} />
        <CorrelationScene chsh={chsh} />
        <OrbitControls enablePan={false} maxDistance={8} minDistance={3} />
      </Canvas>
      <div className="absolute bottom-2 left-3 text-[10px] font-mono-tech text-slate-400 pointer-events-none">
        3D Correlation Vector Space
      </div>
    </div>
  );
};
