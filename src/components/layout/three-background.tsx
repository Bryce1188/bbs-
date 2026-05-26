"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  // Keep track of theme-dependent colors
  const themeRef = useRef(resolvedTheme);
  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Detect mobile to optimize particle counts
    const isMobile = width < 768;
    const particleCount = isMobile ? 35 : 75;
    const connectionDistance = isMobile ? 85 : 125;

    // Three.js Core Setup
    const scene = new THREE.Scene();
    
    // We use a PerspectiveCamera
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 300;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) {
      console.warn("WebGL not supported by this browser/device:", e);
      return;
    }

    // Particle Texture Generator (Smooth Circle)
    const createParticleTexture = () => {
      const pCanvas = document.createElement("canvas");
      pCanvas.width = 32;
      pCanvas.height = 32;
      const ctx = pCanvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(pCanvas);
    };

    const particleTexture = createParticleTexture();

    // Setup positions and velocities
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];
    const sizes = new Float32Array(particleCount);

    const xRange = isMobile ? 250 : 500;
    const yRange = isMobile ? 200 : 350;
    const zRange = 200;

    for (let i = 0; i < particleCount; i++) {
      // Random initial positions
      positions[i * 3] = (Math.random() - 0.5) * xRange;
      positions[i * 3 + 1] = (Math.random() - 0.5) * yRange;
      positions[i * 3 + 2] = (Math.random() - 0.5) * zRange;

      // Random velocities
      velocities.push({
        x: (Math.random() - 0.5) * 0.45,
        y: (Math.random() - 0.5) * 0.45,
        z: (Math.random() - 0.5) * 0.2,
      });

      // Variable particle sizes
      sizes[i] = Math.random() * 8 + 4;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Colors mapping to Slate/Indigo shades based on theme
    const getColors = (theme: string | undefined) => {
      const isDark = theme === "dark";
      return {
        // Particle base color: Indigo-300 in dark mode, Slate-600 in light mode
        particleColor: new THREE.Color(isDark ? "#818cf8" : "#475569"),
        // Line base color: Cyan-400 in dark mode, Slate-400 in light mode
        lineColor: new THREE.Color(isDark ? "#22d3ee" : "#94a3b8"),
      };
    };

    const colors = getColors(themeRef.current);

    const particleMaterial = new THREE.PointsMaterial({
      color: colors.particleColor,
      size: 6,
      transparent: true,
      opacity: 0.85,
      map: particleTexture,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Connection Lines Setup
    const maxConnections = (particleCount * (particleCount - 1)) / 2;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      linewidth: 1, // WebGL ignored in most browsers, but good practice
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Mouse Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Handle Window Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const tempColor = new THREE.Color();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Update theme colors dynamically
      const currentColors = getColors(themeRef.current);
      if (!particleMaterial.color.equals(currentColors.particleColor)) {
        particleMaterial.color.copy(currentColors.particleColor);
      }

      const posAttribute = particleGeometry.getAttribute("position") as THREE.BufferAttribute;
      const localPositions = posAttribute.array as Float32Array;

      // Calculate mouse 3D vector for interaction
      // Project mouse coordinates relative to camera distance
      const mouseVec = new THREE.Vector3(
        mouse.x * (width / 4),
        mouse.y * (height / 4),
        0
      );

      // 1. Update Particle positions
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        let px = localPositions[i3];
        let py = localPositions[i3 + 1];
        let pz = localPositions[i3 + 2];

        // Move particle
        px += velocities[i].x;
        py += velocities[i].y;
        pz += velocities[i].z;

        // Bounce check on boundaries
        const xLimit = xRange / 2;
        const yLimit = yRange / 2;

        if (Math.abs(px) > xLimit) {
          velocities[i].x *= -1;
          px = Math.sign(px) * xLimit;
        }
        if (Math.abs(py) > yLimit) {
          velocities[i].y *= -1;
          py = Math.sign(py) * yLimit;
        }
        if (Math.abs(pz) > 100) {
          velocities[i].z *= -1;
          pz = Math.sign(pz) * 100;
        }

        // Mouse gravity/repulsion effect
        const dx = px - mouseVec.x;
        const dy = py - mouseVec.y;
        const dz = pz - mouseVec.z;
        const distToMouse = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const mouseEffectRadius = isMobile ? 80 : 150;

        if (distToMouse < mouseEffectRadius) {
          // Push particles away gently from the mouse
          const force = (1.0 - distToMouse / mouseEffectRadius) * 0.4;
          px += (dx / distToMouse) * force;
          py += (dy / distToMouse) * force;
        }

        localPositions[i3] = px;
        localPositions[i3 + 1] = py;
        localPositions[i3 + 2] = pz;
      }
      posAttribute.needsUpdate = true;

      // 2. Compute Connection Lines
      let lineIndex = 0;
      const linePosAttribute = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
      const linePositionsArray = linePosAttribute.array as Float32Array;
      const lineColorsAttribute = lineGeometry.getAttribute("color") as THREE.BufferAttribute;
      const lineColorsArray = lineColorsAttribute.array as Float32Array;

      const baseLineColor = currentColors.lineColor;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x1 = localPositions[i3];
        const y1 = localPositions[i3 + 1];
        const z1 = localPositions[i3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          const j3 = j * 3;
          const x2 = localPositions[j3];
          const y2 = localPositions[j3 + 1];
          const z2 = localPositions[j3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            // Opacity decreases as distance increases
            const alpha = 1.0 - dist / connectionDistance;
            // Faint lines: max opacity is low so background is not busy
            const lineOpacity = alpha * (themeRef.current === "dark" ? 0.22 : 0.15);

            // Vertex 1
            const idx1 = lineIndex * 6;
            linePositionsArray[idx1] = x1;
            linePositionsArray[idx1 + 1] = y1;
            linePositionsArray[idx1 + 2] = z1;

            // Vertex 2
            linePositionsArray[idx1 + 3] = x2;
            linePositionsArray[idx1 + 4] = y2;
            linePositionsArray[idx1 + 5] = z2;

            // Color with alpha built-in for fading line segments
            // LineBasicMaterial uses vertexColors, so we write interpolated RGB
            // To simulate transparency per vertex, we can blend with the background color or use RGB intensity
            // Since standard canvas background is transparent, we scale the color intensity
            // which creates a fading effect against dark/light backgrounds!
            tempColor.copy(baseLineColor).multiplyScalar(lineOpacity);

            lineColorsArray[idx1] = tempColor.r;
            lineColorsArray[idx1 + 1] = tempColor.g;
            lineColorsArray[idx1 + 2] = tempColor.b;

            lineColorsArray[idx1 + 3] = tempColor.r;
            lineColorsArray[idx1 + 4] = tempColor.g;
            lineColorsArray[idx1 + 5] = tempColor.b;

            lineIndex++;
          }
        }
      }

      // Fill remaining line vertices with 0 to hide them
      const totalLinePositions = linePositionsArray.length;
      for (let k = lineIndex * 6; k < totalLinePositions; k++) {
        linePositionsArray[k] = 0;
        lineColorsArray[k] = 0;
      }

      linePosAttribute.needsUpdate = true;
      lineColorsAttribute.needsUpdate = true;

      // Rotate the entire scene slowly for passive movement
      particles.rotation.y += 0.0006;
      lineSegments.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      particleTexture.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-20 h-full w-full overflow-hidden select-none pointer-events-none">
      <canvas ref={canvasRef} className="block h-full w-full opacity-0 animate-fade-in blur-[1px]" style={{ animationDelay: "200ms", animationFillMode: "forwards", animationDuration: "1s" }} />
    </div>
  );
}
