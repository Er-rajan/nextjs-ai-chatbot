"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ParticleBackgroundProps = {
  /**
   * Particle count (keep this modest for smooth FPS).
   * Default: 1200
   */
  count?: number;
  /**
   * Spread of particles in world units.
   * Default: 110
   */
  spread?: number;
  /**
   * Particle size in world units.
   * Default: 0.14
   */
  size?: number;
  /**
   * Soft, neutral particle color.
   * Default: "#9ca3af" (light gray)
   */
  color?: string;
  /**
   * Opacity for subtle look.
   * Default: 0.75
   */
  opacity?: number;
  /**
   * Enable subtle mouse parallax (optional).
   * Default: true
   */
  parallax?: boolean;
};

export default function ParticleBackground({
  count = 1200,
  spread = 110,
  size = 0.14,
  color = "#9ca3af",
  opacity = 0.75,
  parallax = true,
}: ParticleBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Core Three.js setup (scene / camera / renderer) ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // --- Particles (BufferGeometry + PointsMaterial) ---
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- Interaction state (kept in refs/locals to avoid re-renders) ---
    const mouse = { x: 0, y: 0 }; // normalized -1..1
    const target = { x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      // Normalize to -1..1 (centered)
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      mouse.x = nx;
      mouse.y = ny;
    };

    if (parallax) window.addEventListener("pointermove", handlePointerMove);

    // --- Responsiveness ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation loop (subtle rotation + optional parallax) ---
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // Subtle, continuous motion (keep it calm + non-distracting)
      points.rotation.y += 0.0006;
      points.rotation.x += 0.00025;

      // Subtle parallax: gently ease toward mouse position
      if (parallax) {
        target.x += (mouse.x - target.x) * 0.03;
        target.y += (mouse.y - target.y) * 0.03;
        points.rotation.y += target.x * 0.00035;
        points.rotation.x += -target.y * 0.00035;
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    // --- Cleanup (IMPORTANT) ---
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      if (parallax) window.removeEventListener("pointermove", handlePointerMove);

      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [count, spread, size, color, opacity, parallax]);

  // Fixed full-screen background. Keep pointer-events off so UI remains clickable.
  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
