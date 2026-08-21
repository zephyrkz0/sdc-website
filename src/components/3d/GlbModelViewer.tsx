import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';

interface GlbModelViewerProps {
  modelUrl?: string;
  className?: string;
  interactive?: boolean;
  autoRotateSpeed?: number;
}

export const GlbModelViewer: React.FC<GlbModelViewerProps> = ({
  modelUrl = '/assets/model.glb',
  className = 'w-full h-full',
  interactive = true,
  autoRotateSpeed = 0.008,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const isWireframeRef = useRef(false);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    isWireframeRef.current = isWireframe;
    if (modelGroupRef.current) {
      modelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              (m as unknown as { wireframe: boolean }).wireframe = isWireframe;
            });
          } else if (mesh.material) {
            (mesh.material as unknown as { wireframe: boolean }).wireframe = isWireframe;
          }
        }
      });
    }
  }, [isWireframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setHasError(false);

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 2.0); // Subtle cyber violet
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xc084fc, 3.5, 15); // Purple accent rim
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0x38bdf8, 2.0, 10); // Cyan underside
    bottomGlow.position.set(0, -3, 2);
    scene.add(bottomGlow);

    // Outer Orbiting Cyber Blueprint Rings
    const ringGeo = new THREE.TorusGeometry(1.9, 0.015, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.8;
    rootGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3.5;
    rootGroup.add(ring2);

    // Load GLTF Model with MeshoptDecoder
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        modelGroupRef.current = model;

        // Auto-center and normalize bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim;

        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale;
        model.position.z = -center.z * scale;
        model.scale.set(scale, scale, scale);

        // Enhance materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.min(mat.roughness, 0.4);
              mat.metalness = Math.max(mat.metalness, 0.5);
              mat.envMapIntensity = 1.2;
            }
          }
        });

        rootGroup.add(model);
        setIsLoading(false);
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setLoadingProgress(percent);
        }
      },
      (err) => {
        console.error('Error loading 3D GLB model:', err);
        setHasError(true);
        setIsLoading(false);
      }
    );

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        rootGroup.rotation.y += deltaX * 0.01;
        rootGroup.rotation.x += deltaY * 0.01;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = x * 1.2;
        targetRotX = -y * 0.8;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

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
      const elapsed = clock.getElapsedTime();

      // Continuous rotation
      if (!isDragging) {
        rootGroup.rotation.y += autoRotateSpeed;
        rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.04;
        rootGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;
      }

      ring1.rotation.z += 0.006;
      ring2.rotation.x -= 0.005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelUrl, interactive, autoRotateSpeed]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-20 font-mono text-xs">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-white font-bold tracking-wider">[LOADING_3D_MODEL]</span>
          <span className="text-zinc-400 text-[10px] mt-1">{loadingProgress}% COMPLETE</span>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-20 font-mono text-xs text-red-400 p-4 text-center">
          <span>[!] 3D MODEL FAILED TO INITIALIZE</span>
          <span className="text-zinc-500 text-[10px] mt-1">CHECKING CACHED MESH ARCHIVE</span>
        </div>
      )}

      {/* Controls & Badges */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10 select-none">
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className="px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider bg-black/70 backdrop-blur-md border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
          title="Toggle Mesh Render Mode"
        >
          [MESH: {isWireframe ? 'WIREFRAME' : 'SURFACE'}]
        </button>
      </div>

      {/* Technical Spec Markings */}
      <div className="absolute top-3 left-3 font-mono text-[9px] text-zinc-400/70 tracking-widest pointer-events-none select-none">
        + PBR_MESH // TRIPO_3D
      </div>
      <div className="absolute bottom-3 left-3 font-mono text-[9px] text-zinc-400/70 tracking-widest pointer-events-none select-none">
        DRAG TO ROTATE // XYZ
      </div>
    </div>
  );
};
