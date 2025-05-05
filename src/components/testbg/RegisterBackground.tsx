import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const RegisterBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create wave geometry
    const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const material = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const waves = new THREE.Mesh(geometry, material);
    waves.rotation.x = -Math.PI / 2;
    scene.add(waves);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point lights
    const pointLight1 = new THREE.PointLight(0x2563eb, 2);
    pointLight1.position.set(25, 30, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 2);
    pointLight2.position.set(-25, 30, 0);
    scene.add(pointLight2);

    // Camera position
    camera.position.set(0, 40, 60);
    camera.lookAt(0, 0, 0);

    // Animation variables
    let frame = 0;
    const vertices = geometry.attributes.position;
    const originalY = new Float32Array(vertices.array.length);
    for (let i = 0; i < vertices.count; i++) {
      originalY[i] = vertices.getY(i);
    }

    // Mouse movement effect
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.03;

      // Update vertices
      for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const z = vertices.getZ(i);
        const distance = Math.sqrt(x * x + z * z);
        
        // Create wave effect
        const wave1 = Math.sin(distance * 0.3 + frame) * 2;
        const wave2 = Math.cos(distance * 0.2 - frame * 0.5) * 1.5;
        const wave3 = Math.sin(x * 0.2 + frame) * Math.cos(z * 0.2 + frame) * 1;
        
        vertices.setY(i, originalY[i] + wave1 + wave2 + wave3);
      }
      vertices.needsUpdate = true;

      // Rotate based on mouse position
      waves.rotation.z = mouseX * 0.2;
      waves.rotation.y = mouseY * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
};

export default RegisterBackground;