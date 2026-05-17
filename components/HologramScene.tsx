"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ComponentLabels } from "@/lib/i18n";

export type SceneMode = "setup" | "interference" | "reconstruction";

type HologramSceneProps = {
  mode: SceneMode;
  labels: ComponentLabels;
};

const referencePath: [number, number, number][] = [
  [-4.5, 0, 0],
  [-2.7, 0, 0],
  [-1.35, 1.25, 0],
  [0.75, 1.25, 0],
  [2.65, 0.1, 0]
];

const objectPath: [number, number, number][] = [
  [-2.7, 0, 0],
  [-1.35, -1.25, 0],
  [0.45, -1.25, 0],
  [1.55, -0.62, 0],
  [2.65, -0.08, 0]
];

const reconstructionPaths: [number, number, number][][] = [
  [
    [2.75, 0.05, 0],
    [4.35, 0.88, 0.38]
  ],
  [
    [2.75, 0, 0],
    [4.45, 0.02, 0]
  ],
  [
    [2.75, -0.05, 0],
    [4.35, -0.82, -0.42]
  ]
];

export default function HologramScene({ mode, labels }: HologramSceneProps) {
  return (
    <div className="h-[420px] w-full cursor-grab overflow-hidden rounded border border-lab-line bg-[#081012] active:cursor-grabbing md:h-[520px]">
      <Canvas camera={{ position: [0, 2.2, 6.7], fov: 44 }} dpr={[1, 1.8]} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={["#081012"]} />
        <ambientLight intensity={0.85} />
        <pointLight position={[-3, 4, 4]} intensity={18} color="#9be8ff" />
        <CameraControls />
        <SceneAssembly mode={mode} labels={labels} />
      </Canvas>
    </div>
  );
}

function CameraControls() {
  const { camera, gl, invalidate } = useThree();
  const controlsRef = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 3.1;
    controls.maxDistance = 11;
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI - 0.08;
    controls.panSpeed = 0.58;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.82;
    controls.target.set(0, -0.05, 0);
    const handleChange = () => invalidate();
    controls.addEventListener("change", handleChange);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener("change", handleChange);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, invalidate]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function SceneAssembly({ mode, labels }: { mode: SceneMode; labels: ComponentLabels }) {
  return (
    <group position={[0, 0, 0]} rotation={[0, -0.15, 0]}>
      <Grid />
      <OpticalComponents labels={labels} />
      <Beam path={referencePath} color="#ff5b5b" radius={0.025} pulse active />
      <Beam path={objectPath} color="#42f2b4" radius={0.025} pulse active />
      {mode === "interference" && <InterferenceField />}
      {mode === "reconstruction" &&
        reconstructionPaths.map((path, index) => (
          <Beam key={index} path={path} color="#35d7ff" radius={0.03} pulse active />
        ))}
    </group>
  );
}

function OpticalComponents({ labels }: { labels: ComponentLabels }) {
  return (
    <>
      <mesh position={[-4.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.55, 32]} />
        <meshStandardMaterial color="#192427" metalness={0.5} roughness={0.35} emissive="#10252a" />
      </mesh>
      <TextLabel text={labels.laser} position={[-4.78, 0.55, 0]} color="#ff8a8a" />
      <mesh position={[-4.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.18, 24]} />
        <meshStandardMaterial color="#ff5b5b" emissive="#ff2020" emissiveIntensity={1.4} />
      </mesh>

      <mesh position={[-2.7, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.48, 0.48, 0.48]} />
        <meshPhysicalMaterial color="#9bdff2" transparent opacity={0.42} roughness={0.05} transmission={0.35} />
      </mesh>
      <TextLabel text={labels.beamSplitter} position={[-2.7, 0.65, 0]} color="#9be8ff" scale={1.45} />

      <Mirror position={[-1.35, 1.25, 0]} rotationZ={-0.75} />
      <Mirror position={[-1.35, -1.25, 0]} rotationZ={0.75} />
      <Lens position={[0.75, 1.25, 0]} color="#ffcf6b" />
      <Lens position={[0.45, -1.25, 0]} color="#8effd8" />
      <TextLabel text={labels.mirror} position={[-1.35, 1.9, 0]} />
      <TextLabel text={labels.mirror} position={[-1.35, -0.6, 0]} />
      <TextLabel text={labels.expandingLens} position={[0.75, 1.9, 0]} color="#ffcf6b" scale={1.45} />
      <TextLabel text={labels.expandingLens} position={[0.45, -0.62, 0]} color="#8effd8" scale={1.45} />

      <group position={[1.55, -0.62, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.045, 16, 48]} />
          <meshStandardMaterial color="#d2dee2" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.16, 32, 16]} />
          <meshStandardMaterial color="#ffbf47" roughness={0.4} emissive="#2c1c05" />
        </mesh>
      </group>
      <TextLabel text={labels.object} position={[1.55, -0.03, 0]} color="#ffbf47" />

      <group position={[2.75, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 1.8, 1.55]} />
          <meshPhysicalMaterial color="#6fe6ff" transparent opacity={0.22} roughness={0.2} transmission={0.2} />
        </mesh>
        <mesh position={[-0.05, 0, 0]}>
          <boxGeometry args={[0.035, 1.9, 1.65]} />
          <meshBasicMaterial color="#35d7ff" transparent opacity={0.16} />
        </mesh>
      </group>
      <TextLabel text={labels.film} position={[2.75, 1.18, 0]} color="#35d7ff" scale={1.7} />
    </>
  );
}

function TextLabel({
  text,
  position,
  color = "#eff9f8",
  scale = 1
}: {
  text: string;
  position: [number, number, number];
  color?: string;
  scale?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(8, 16, 18, 0.78)";
    context.strokeStyle = "rgba(112, 191, 202, 0.58)";
    roundRect(context, 18, 24, canvas.width - 36, 80, 16);
    context.fill();
    context.stroke();

    const fontSize = text.length > 22 ? 28 : text.length > 16 ? 34 : 42;
    context.font = `600 ${fontSize}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 10;
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.needsUpdate = true;
    return canvasTexture;
  }, [color, text]);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  if (!texture) return null;

  return (
    <sprite position={position} scale={[1.15 * scale, 0.29 * scale, 1]} renderOrder={20}>
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} />
    </sprite>
  );
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function Mirror({ position, rotationZ }: { position: [number, number, number]; rotationZ: number }) {
  return (
    <mesh position={position} rotation={[0, 0, rotationZ]}>
      <boxGeometry args={[0.12, 0.72, 0.5]} />
      <meshStandardMaterial color="#c9d3d5" metalness={0.8} roughness={0.18} />
    </mesh>
  );
}

function Lens({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <sphereGeometry args={[0.32, 32, 16]} />
      <meshPhysicalMaterial color={color} transparent opacity={0.34} roughness={0.04} transmission={0.42} />
    </mesh>
  );
}

function Beam({
  path,
  color,
  radius,
  active,
  pulse
}: {
  path: [number, number, number][];
  color: string;
  radius: number;
  active?: boolean;
  pulse?: boolean;
}) {
  return (
    <group>
      {path.slice(0, -1).map((start, index) => (
        <BeamSegment
          key={`${start.join("-")}-${index}`}
          start={start}
          end={path[index + 1]}
          color={color}
          radius={radius}
          active={active}
          pulse={pulse}
          phase={index * 0.7}
        />
      ))}
    </group>
  );
}

function BeamSegment({
  start,
  end,
  color,
  radius,
  active,
  pulse,
  phase
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  radius: number;
  active?: boolean;
  pulse?: boolean;
  phase: number;
}) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const { position, length, quaternion } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const segmentLength = direction.length();
    const midpoint = a.clone().add(b).multiplyScalar(0.5);
    const segmentQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );
    return { position: midpoint, length: segmentLength, quaternion: segmentQuaternion };
  }, [start, end]);

  useFrame(({ clock }) => {
    if (!materialRef.current || !pulse) return;
    materialRef.current.opacity = active ? 0.58 + Math.sin(clock.elapsedTime * 4 + phase) * 0.18 : 0.22;
  });

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 18]} />
      <meshBasicMaterial ref={materialRef} color={color} transparent opacity={active ? 0.62 : 0.2} />
    </mesh>
  );
}

function InterferenceField() {
  const groupRef = useRef<THREE.Group>(null);
  const strips = useMemo(() => Array.from({ length: 26 }, (_, index) => index), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.7) * 0.025;
  });

  return (
    <group ref={groupRef} position={[2.69, 0, 0]}>
      {strips.map((item) => {
        const z = -0.72 + item * 0.058;
        const opacity = item % 2 === 0 ? 0.56 : 0.22;
        return (
          <mesh key={item} position={[-0.08, 0, z]}>
            <boxGeometry args={[0.035, 1.78, 0.018]} />
            <meshBasicMaterial color={item % 2 === 0 ? "#ffbf47" : "#35d7ff"} transparent opacity={opacity} />
          </mesh>
        );
      })}
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.02, 1.88, 1.66]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function Grid() {
  const lines = useMemo(() => Array.from({ length: 15 }, (_, index) => index - 7), []);

  return (
    <group position={[0, -1.72, 0]}>
      {lines.map((line) => (
        <mesh key={`x-${line}`} position={[0, 0, line * 0.45]}>
          <boxGeometry args={[8.8, 0.008, 0.008]} />
          <meshBasicMaterial color="#244046" transparent opacity={0.36} />
        </mesh>
      ))}
      {lines.map((line) => (
        <mesh key={`z-${line}`} position={[line * 0.62, 0, 0]}>
          <boxGeometry args={[0.008, 0.008, 6.4]} />
          <meshBasicMaterial color="#244046" transparent opacity={0.28} />
        </mesh>
      ))}
    </group>
  );
}
