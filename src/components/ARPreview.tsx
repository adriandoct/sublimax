import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RotateCw, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';
import * as THREE from 'three';

interface ARPreviewProps {
  productoNombre: string;
  tipo3d: string;
  canvasTextureSrc: string; // The base64 or canvas texture representation
  baseColor: string;
  onClose: () => void;
}

const BACKDROPS = [
  { id: 'desk', name: 'Escritorio de Oficina', url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=600&auto=format&fit=crop' },
  { id: 'tshirt_model', name: 'Maniquí / Persona', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { id: 'cushion_sofa', name: 'Sofá de Estancia', url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop' }
];

export const ARPreview: React.FC<ARPreviewProps> = ({ productoNombre, tipo3d, canvasTextureSrc, baseColor, onClose }) => {
  const [activeBackdrop, setActiveBackdrop] = useState('desk');
  const [webcamActive, setWebcamActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvas3dRef = useRef<HTMLDivElement>(null);

  // Mesh scale/pos states controlled in AR viewport
  const [meshScale, setMeshScale] = useState(1);
  const [meshRotY, setMeshRotY] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // WebGL Render refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Group | null>(null);

  // Handle Webcam start
  const startWebcam = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
      }
    } catch (err) {
      console.warn("Webcam access denied or unavailable:", err);
      setCameraError(true);
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
    }
  };

  useEffect(() => {
    // Start with webcam by default
    startWebcam();
    return () => stopWebcam();
  }, []);

  // Three.js Render overlay
  useEffect(() => {
    if (!canvas3dRef.current) return;

    // 1. Scene setup (fully transparent background)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(320, 320);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    canvas3dRef.current.innerHTML = '';
    canvas3dRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    // Group/Mesh
    const group = new THREE.Group();
    scene.add(group);
    meshRef.current = group;

    // Texture
    const loader = new THREE.TextureLoader();
    let texture: THREE.Texture;
    if (canvasTextureSrc) {
      texture = loader.load(canvasTextureSrc);
    } else {
      // blank texture
      const canvas = document.createElement('canvas');
      canvas.width = 16; canvas.height = 16;
      texture = new THREE.CanvasTexture(canvas);
    }

    const canvasMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.15,
      metalness: tipo3d === 'termo' ? 0.6 : 0.05,
      side: THREE.DoubleSide
    });

    // Create 3D geometry matches designer
    if (tipo3d === 'taza') {
      const cy = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 32, 1, true);
      const body = new THREE.Mesh(cy, canvasMaterial);
      group.add(body);

      const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.04, 32), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      bottom.position.y = -0.8;
      group.add(bottom);

      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      handle.position.set(-0.8, 0, 0);
      handle.rotation.z = Math.PI * 0.4;
      group.add(handle);
    } else if (tipo3d === 'playera') {
      const plane = new THREE.BoxGeometry(1.4, 1.8, 0.15);
      const materials = [
        new THREE.MeshStandardMaterial({ color: baseColor }),
        new THREE.MeshStandardMaterial({ color: baseColor }),
        new THREE.MeshStandardMaterial({ color: baseColor }),
        new THREE.MeshStandardMaterial({ color: baseColor }),
        canvasMaterial,
        new THREE.MeshStandardMaterial({ color: baseColor }),
      ];
      const shirt = new THREE.Mesh(plane, materials);
      group.add(shirt);
    } else if (tipo3d === 'termo') {
      const cy = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 32);
      const thermo = new THREE.Mesh(cy, canvasMaterial);
      group.add(thermo);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.2, 32), new THREE.MeshStandardMaterial({ color: 0x333333 }));
      lid.position.y = 1.2;
      group.add(lid);
    } else {
      // standard plane
      const plane = new THREE.BoxGeometry(1.8, 1.3, 0.03);
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x111111 }),
        new THREE.MeshStandardMaterial({ color: 0x111111 }),
        new THREE.MeshStandardMaterial({ color: 0x111111 }),
        new THREE.MeshStandardMaterial({ color: 0x111111 }),
        canvasMaterial,
        new THREE.MeshStandardMaterial({ color: 0x111111 }),
      ];
      group.add(new THREE.Mesh(plane, materials));
    }

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (group) {
        group.rotation.y = meshRotY;
        group.scale.set(meshScale, meshScale, meshScale);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
    };
  }, [tipo3d, canvasTextureSrc, meshScale, meshRotY, baseColor]);

  // Handle drag positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const backdrop = BACKDROPS.find(b => b.id === activeBackdrop);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-indigo-500/20 relative flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950/60 z-10">
          <div>
            <h2 className="text-sm font-bold text-white">Simulador Realidad Aumentada</h2>
            <span className="text-[10px] text-indigo-400 font-semibold">{productoNombre}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-900 rounded-full transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div 
          className="relative w-full aspect-square bg-slate-900 overflow-hidden cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background Layer 1: Live Webcam */}
          {webcamActive && (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
            />
          )}

          {/* Background Layer 2: Image Presets (Fallback or selected) */}
          {!webcamActive && backdrop && (
            <img 
              src={backdrop.url} 
              alt={backdrop.name} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          )}

          {/* Overlay Layer 3: Interactive Three.js Mesh */}
          <div 
            ref={canvas3dRef}
            className="absolute z-10 pointer-events-none"
            style={{ 
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
              top: 'calc(50% - 160px)',
              left: 'calc(50% - 160px)'
            }}
          />

          {/* Instructions overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-[10px] text-slate-300 z-10 pointer-events-none">
            Arrastra el objeto para posicionarlo.
          </div>
        </div>

        {/* Controls Panel */}
        <div className="p-5 bg-slate-950 border-t border-slate-900 flex flex-col gap-4">
          
          {/* Backdrop Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Fondo del Entorno</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  stopWebcam();
                  startWebcam();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                  webcamActive 
                    ? 'bg-emerald-600 border-emerald-400 text-white' 
                    : 'bg-slate-900 border-slate-850 text-slate-400'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Cámara Real
              </button>
              
              {!webcamActive && (
                <select
                  value={activeBackdrop}
                  onChange={(e) => setActiveBackdrop(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                >
                  {BACKDROPS.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Scale & Rotate Controls */}
          <div className="flex justify-between items-center border-t border-slate-900 pt-4">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Ajustar Objeto</span>
            <div className="flex gap-3">
              <div className="flex gap-1 border border-slate-900 p-0.5 rounded-lg">
                <button 
                  onClick={() => setMeshScale(prev => Math.max(0.4, prev - 0.1))} 
                  className="p-1.5 hover:bg-slate-900 rounded text-slate-400"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setMeshScale(prev => Math.min(2.5, prev + 0.1))} 
                  className="p-1.5 hover:bg-slate-900 rounded text-slate-400"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={() => setMeshRotY(prev => prev + Math.PI / 4)} 
                className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-400 flex items-center gap-1 text-xs"
              >
                <RotateCw className="w-4 h-4" /> Girar
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
