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
  autoRotateSpeed = 0.007,
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
    camera.position.set(0, 0, 3.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Center Group
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, 0, 0);
    scene.add(rootGroup);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc4b5fd, 2.0); // Subtle cyber violet
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa855f7, 3.0, 12);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0x38bdf8, 1.8, 10);
    bottomGlow.position.set(0, -3, 2);
    scene.add(bottomGlow);

    // Orbiting Geometric Rings (centered at 0,0,0)
    const ringGeo = new THREE.TorusGeometry(1.65, 0.012, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
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

        // Compute exact bounding box and center precisely
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.2 / maxDim;

        // Position exactly centered at (0, 0, 0)
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        model.scale.set(scale, scale, scale);

        // Enhance PBR materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.min(mat.roughness, 0.35);
              mat.metalness = Math.max(mat.metalness, 0.5);
              mat.envMapIntensity = 1.3;
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
        targetRotY = x * 1.0;
        targetRotX = -y * 0.6;
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

      // Continuous subtle rotation
      if (!isDragging) {
        rootGroup.rotation.y += autoRotateSpeed;
        rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.04;
        rootGroup.position.y = Math.sin(elapsed * 1.5) * 0.05;
      }

      ring1.rotation.z += 0.005;
      ring2.rotation.x -= 0.004;

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
          <div className="w-7 h-7 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-zinc-300 font-mono text-[11px]">{loadingProgress}%</span>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-20 font-mono text-xs text-zinc-400 p-4 text-center">
          <span>MODEL UNAVAILABLE</span>
        </div>
      )}

      {/* Minimal Wireframe Control */}
      <div className="absolute bottom-2.5 right-2.5 z-10 select-none">
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider bg-black/60 backdrop-blur-md border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white transition-colors"
        >
          {isWireframe ? 'SURFACE' : 'WIREFRAME'}
        </button>
      </div>
    </div>
  );
};
