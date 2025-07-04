'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Plane } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader material for the mottled background
const NoiseShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#f9f9f9') },
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    
    // Noise functions from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      // Smooth interpolation
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
    }
    
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.5; // Higher frequency for finer grain
      
      // More octaves for more detail
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st * frequency);
        st *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    void main() {
      vec2 st = vUv * 10.0; // Scale for finer texture
      float n = fbm(st);
      
      // Create the mottled paper effect with lower opacity (0.2)
      vec3 color = uColor;
      vec3 noiseColor = vec3(n) * 0.2; // 0.2 opacity for subtle effect
      
      gl_FragColor = vec4(mix(color, vec3(0.0), noiseColor), 1.0);
    }
  `
};

function MottledBackground() {
  const materialRef = useRef();
  const { size } = useThree();
  
  // Calculate the scale to cover the entire viewport
  const scale = useMemo(() => {
    const aspectRatio = size.width / size.height;
    return aspectRatio > 1 
      ? [aspectRatio * 2, 2, 1] 
      : [2, 2 / aspectRatio, 1];
  }, [size]);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });
  
  return (
    <Plane args={[1, 1]} scale={scale} position={[0, 0, -50]}>
      <shaderMaterial 
        ref={materialRef}
        args={[NoiseShaderMaterial]}
        transparent={true}
        depthWrite={false}
      />
    </Plane>
  );
}

function ParticleCloud() {
  const meshRef = useRef();
  const materialRef = useRef();
  const count = 45000;
  const radiusRef = useRef(25);
  const { size, camera, gl } = useThree();
  
  // Add state to track animation state and make particles initially invisible
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  
  // Add state to track iOS detection
  const [isIOS] = useState(/iPhone|iPad|iPod/.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  ));
  
  // Ensure the cloud is centered in the camera's view
  useEffect(() => {
    if (camera && meshRef.current) {
      // Reset any position offsets to ensure centering
      meshRef.current.position.set(0, 0, 0);
    }
  }, [camera]);
  
  useEffect(() => {
    const handleResize = () => {
      // Calculate base dimensions
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Progressive width scaling with interpolation
      let widthDivisor;
      if (width <= 1200) {
        widthDivisor = 30; // Base size for smaller screens
      } else if (width <= 2000) {
        // Interpolate between 30 and 45 for medium screens
        widthDivisor = 30 + (width - 1200) * (15 / 800);
      } else {
        widthDivisor = 45; // Maximum size for very large screens
      }
      
      // Calculate radius based on both width and height
      const widthBasedRadius = width / widthDivisor;
      const heightBasedRadius = height / 45; // Keep conservative height scaling
      
      // Use the smaller of the two to ensure the cloud stays contained
      const newRadius = Math.min(widthBasedRadius, heightBasedRadius);
      
      if (newRadius !== radiusRef.current) {
        radiusRef.current = newRadius;
        updateParticlePositions();
      }
      
      // Ensure camera is looking at center
      if (camera) {
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [size, camera]);

  const updateParticlePositions = () => {
    if (!meshRef.current) {
      return;
    }
    const positions = meshRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = Math.random() * radiusRef.current;
      
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  };
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i += 3) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = Math.random() * 25;
    
    positions[i] = r * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = r * Math.cos(phi);
    
    // Use more vibrant colors to stand out against white
    colors[i] = Math.random() * 0.7 + 0.3;     // Red channel
    colors[i + 1] = Math.random() * 0.7 + 0.3; // Green channel
    colors[i + 2] = Math.random() * 0.7 + 0.3; // Blue channel
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.0 }, // Start completely invisible
        uScale: { value: 0.0 },   // Start with zero scale
        uRadius: { value: 20 }
      },
              vertexShader: `
        uniform float uTime;
        uniform float uScale;
        uniform float uRadius;
        varying vec3 vColor;
        varying float vElevation;

        void main() {
          vColor = color;
          vec3 scaledPosition = position * (uScale * (uRadius / 25.0));
          vec4 mvPosition = modelViewMatrix * vec4(scaledPosition, 0.75);
          float elevation = sin(mvPosition.x * 2.0 + uTime) * 0.5;
          mvPosition.y += elevation;
          vElevation = elevation;
          
          // Restore original particle size calculation with pixel ratio fix
          float pointSize = 0.4 * (1000.0 / max(abs(mvPosition.z), 1.0));
          
          gl_PointSize = pointSize;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vElevation;

        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          if (distanceToCenter > 0.5) {
            discard;
          }
          vec3 color = vColor * (1.25 + vElevation * 0.1);
          gl_FragColor = vec4(color, uOpacity);
        }
      `,
      vertexColors: true,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    materialRef.current = mat;
    return mat;
  }, []);

  // Remove the pixel ratio update effect since we're back to simpler approach

  // Delay the start of the animation to prevent the flash
  useEffect(() => {
    // Small delay to ensure everything is initialized
    const delayTimer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, 50);  // 50ms delay should be enough
    
    return () => clearTimeout(delayTimer);
  }, []);

  // Start the fade-in animation only after delay
  useEffect(() => {
    if (!isAnimationStarted) return;
    
    const duration = 500;
    const startTime = Date.now();
    let frameId;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (materialRef.current) {
        materialRef.current.uniforms.uOpacity.value = progress;
        materialRef.current.uniforms.uScale.value = progress;
        materialRef.current.uniforms.uRadius.value = radiusRef.current;
      }
      
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
      }
    };
    
    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isAnimationStarted]);

  // Listen for particle fade event from modal links
  useEffect(() => {
    const handleParticleFade = (event) => {
      const { duration } = event.detail;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (materialRef.current) {
          materialRef.current.uniforms.uScale.value = 1 - progress;
          materialRef.current.uniforms.uOpacity.value = 1 - progress;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
        }
      };
      requestAnimationFrame(animate);
    };

    window.addEventListener('particleFadeOut', handleParticleFade);
    return () => {
      window.removeEventListener('particleFadeOut', handleParticleFade);
    };
  }, []);

  // Handle non-modal link clicks
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
      
      if (link) {
        const hasExcludedClass = link.classList.contains('nav-container') || 
                                link.closest('.nav-container') !== null;
        const isTypefaceLink = link.href && link.href.includes('/Typefaces');
        const isParticleCloudLink = link.href && link.href.includes('/Particle_Cloud');
        const isModalLink = link.closest('.modal-content') !== null;
        
        // Fix: Declare isParticlesLink variable
        const isParticlesLink = link.href && link.href.includes('/particles');

        // Only handle clicks that aren't from the modal or nav container
        if ((!hasExcludedClass || isTypefaceLink) && !isParticlesLink && 
            !isParticleCloudLink && !isModalLink) {
          const duration = 250;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (materialRef.current) {
              materialRef.current.uniforms.uScale.value = 1 - progress;
              materialRef.current.uniforms.uOpacity.value = 1 - progress;
            }
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
            }
          };
          requestAnimationFrame(animate);
        }
      }
    };
  
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uRadius.value = radiusRef.current;
    }
    
    if (meshRef.current) {
      const time = state.clock.elapsedTime * 0.8;
      meshRef.current.rotation.x = time * 0.4;
      meshRef.current.rotation.y = time * 0.6;

      // Keep it centered at origin - critical for iOS
      meshRef.current.position.set(0, 0, 0);
      
      // For iOS: apply more aggressive centering
      if (isIOS) {
        // Force world matrix update
        meshRef.current.updateMatrixWorld();
        
        // Ensure mesh is centered in camera view
        if (camera) {
          // Calculate center in world space
          const worldPosition = new THREE.Vector3();
          worldPosition.setFromMatrixPosition(meshRef.current.matrixWorld);
          
          // If mesh has drifted from center, recenter it
          if (worldPosition.length() > 0.001) {
            meshRef.current.position.set(0, 0, 0);
            meshRef.current.updateMatrixWorld();
          }
        }
      }

      const colors = meshRef.current.geometry.attributes.color.array;
      for (let i = 0; i < count * 3; i += 3) {
        // Make the colors more vibrant with higher saturation
        colors[i] = Math.sin(time + i) * 0.5 + 0.5;     // Red
        colors[i + 1] = Math.sin(time + i + 2) * 0.5 + 0.5; // Green
        colors[i + 2] = Math.sin(time + i + 4) * 0.5 + 0.5; // Blue
      }
      meshRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} position={[0, 0, 0]} />
  );
}

function ResponsiveCamera() {
  const { size } = useThree();
  const cameraRef = useRef();
  // Calculate distance based on viewport dimensions
  const cameraDistance = Math.max(100, Math.min(size.width, size.height) / 10);
  
  // Handle iOS-specific sizing issues
  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    // Function to position camera and update
    const updateCamera = () => {
      if (cameraRef.current) {
        // Place camera directly in front of center point
        cameraRef.current.position.set(0, 0, cameraDistance);
        
        // Ensure camera is looking directly at center point
        cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
        
        // Update projection matrix to apply changes
        cameraRef.current.updateProjectionMatrix();
        
        // For iOS, we may need additional adjustment
        if (isIOS) {
          // Force projection matrix update again
          cameraRef.current.updateMatrixWorld();
          cameraRef.current.updateProjectionMatrix();
        }
      }
    };
    
    // Initial update
    updateCamera();
    
    // For iOS, apply updates on a delay as well
    if (isIOS) {
      const timers = [
        setTimeout(updateCamera, 100),
        setTimeout(updateCamera, 300),
        setTimeout(updateCamera, 500)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [size, cameraDistance]);
  
  // Continuous camera management
  useFrame(() => {
    if (cameraRef.current) {
      // Ensure camera position is maintained
      cameraRef.current.position.set(0, 0, cameraDistance);
      
      // Continuously ensure camera is looking at center
      cameraRef.current.lookAt(0, 0, 0);
    }
  });
  
  return (
    <PerspectiveCamera 
      ref={cameraRef}
      makeDefault 
      position={[0, 0, cameraDistance]} 
      fov={50}
      // Explicitly set aspect ratio from size
      aspect={size.width / size.height}
      // Set manual frustum for more control
      near={0.1}
      far={1000}
    />
  );
}

export default function Component() {
  const containerRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  
  // Function to update viewport height - fixes iOS issues
  const updateViewportHeight = useCallback(() => {
    // Get real viewport height - critical for iOS
    const vh = window.innerHeight;
    setViewportHeight(vh);
    
    // Update CSS variable for viewport height - useful for iOS
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    
    // Force canvas to recenter
    if (containerRef.current) {
      const canvases = containerRef.current.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        // Apply vertical centering directly to canvas
        canvas.style.height = `${vh}px`;
      });
    }
  }, []);
  
  useEffect(() => {
    // Initial setup
    updateViewportHeight();
    
    // Add event listeners for various scenarios that may change viewport dimensions
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    // iOS Safari specific - handle when keyboard appears/disappears or user scrolls
    window.addEventListener('scroll', updateViewportHeight);
    
    // Additional iOS viewport fix
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // For iOS: handle visibility changes (like when app switches)
      document.addEventListener('visibilitychange', updateViewportHeight);
      
      // Force update on page load and after small delay (iOS sometimes needs this)
      setTimeout(updateViewportHeight, 100);
      setTimeout(updateViewportHeight, 500);
    }
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
      window.removeEventListener('scroll', updateViewportHeight);
      document.removeEventListener('visibilitychange', updateViewportHeight);
    };
  }, [updateViewportHeight]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        // Use calculated height for iOS compatibility
        height: viewportHeight ? `${viewportHeight}px` : '100vh',
        background: 'none',
        zIndex: 10,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Prevent iOS bouncing/scrolling
        touchAction: 'none'
      }}
    >
      <Canvas
        camera={{
          fov: 50,
          position: [0, 0, 100],
          near: 0.1,
          far: 1000
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          left: '0',
          top: '0',
          // Additional styles for iOS
          transformOrigin: 'center center',
          transform: 'translate3d(0,0,0)'
        }}
        gl={{ 
          antialias: true,
          alpha: true, 
          powerPreference: 'high-performance'
        }}
        // Canvas resize observer helps with dimension changes
        resize={{ scroll: false, debounce: { scroll: 50, resize: 50 } }}
        // Use a more conservative DPR approach
        dpr={[1, 2]}
      >
        <ResponsiveCamera />
        <MottledBackground />
        <ambientLight intensity={0.5} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
}