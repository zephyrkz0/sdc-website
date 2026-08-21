import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ChromeOrbSceneProps {
  interactive?: boolean;
  className?: string;
}

export const ChromeOrbScene: React.FC<ChromeOrbSceneProps> = ({
  interactive = true,
  className = 'w-full h-full',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWireframe, setIsWireframe] = useState(false);
  const isWireframeRef = useRef(false);

  useEffect(() => {
    isWireframeRef.current = isWireframe;
  }, [isWireframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for complex rotation
    const group = new THREE.Group();
    scene.add(group);

    // Procedural CubeMap / Environment reflection approximation
    const sphereGeo = new THREE.TorusKnotGeometry(1.2, 0.38, 128, 32, 2, 3);
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(sphereGeo, chromeMaterial);
    group.add(mesh);

    // Outer Orbiting Cyber Rings
    const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 4;
    group.add(ring2);

    // Core Wireframe Polyhedron
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // High contrast lights for liquid chrome effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(5, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 2.0); // Subtle cyber violet
    fillLight.position.set(-5, -4, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 3.0, 10); // Cyan rim highlight
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 1.5;
      targetRotX = -y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mesh rotation & idle wobble
      mesh.rotation.x += 0.008;
      mesh.rotation.y += 0.012;

      ring1.rotation.z += 0.005;
      ring2.rotation.x += 0.007;

      coreMesh.rotation.y -= 0.015;
      coreMesh.rotation.x -= 0.01;

      // Smooth mouse follow interpolation
      group.rotation.x += (targetRotX - group.rotation.x) * 0.05;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.05;

      // Update wireframe state
      chromeMaterial.wireframe = isWireframeRef.current;

      // Morph scale subtly with time
      const scaleWobble = 1 + Math.sin(elapsedTime * 2) * 0.03;
      mesh.scale.set(scaleWobble, scaleWobble, scaleWobble);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      chromeMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, [interactive]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* 3D Model Control Badges */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 hover:border-white text-zinc-300 hover:text-white transition-colors"
          title="Toggle Wireframe Mesh"
        >
          [MESH: {isWireframe ? 'WIREFRAME' : 'CHROME'}]
        </button>
      </div>

      {/* Crosshair Corner Marks */}
      <div className="absolute top-2 left-2 font-mono text-[9px] text-white/40 tracking-widest pointer-events-none select-none">
        + MAT_01 // REFLECT_95
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[9px] text-white/40 tracking-widest pointer-events-none select-none">
        ROT_XYZ // 120_FPS
      </div>
    </div>
  );
};
