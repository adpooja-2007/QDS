import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

const SpatialNetworkContent: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const nodes = [
    { name: 'ARBITRATOR', pos: [0, 2.2, 0] as [number, number, number], color: '#64748B' },
    { name: 'ALICE', pos: [-2.5, 0.5, 0] as [number, number, number], color: '#4F46E5' },
    { name: 'BOB', pos: [2.5, 0.5, 0] as [number, number, number], color: '#2563EB' },
    { name: 'EVE (TAP)', pos: [0, 0.3, 1.8] as [number, number, number], color: '#DC2626' },
    { name: 'QUANTUM ENGINE', pos: [-1.8, -1.8, 0] as [number, number, number], color: '#4338CA' },
    { name: 'SECURITY ENGINE', pos: [1.8, -1.8, 0] as [number, number, number], color: '#059669' }
  ];

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1} />

      <group ref={groupRef}>
        {/* Node Spheres */}
        {nodes.map((node, i) => (
          <Float key={i} speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={node.pos}>
              <mesh>
                <sphereGeometry args={[0.35, 24, 24]} />
                <meshStandardMaterial color={node.color} roughness={0.3} metalness={0.2} />
              </mesh>
              <Html position={[0, 0.55, 0]} center distanceFactor={8}>
                <div className="px-1.5 py-0.5 rounded bg-slate-900/90 text-white font-mono-tech text-[9px] font-semibold tracking-wider whitespace-nowrap border border-slate-700 pointer-events-none">
                  {node.name}
                </div>
              </Html>
            </group>
          </Float>
        ))}

        {/* Outer subtle orbital ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.9, 2.95, 64]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
};

export const NodeNetwork3D: React.FC = () => {
  return (
    <div className="w-full h-52 bg-slate-950 rounded-lg overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0B1120']} />
        <SpatialNetworkContent />
        <OrbitControls enablePan={false} maxDistance={10} minDistance={4} />
      </Canvas>
      <div className="absolute bottom-2 left-3 text-[10px] font-mono-tech text-slate-400 pointer-events-none">
        3D Cluster Spatial Topology
      </div>
    </div>
  );
};
