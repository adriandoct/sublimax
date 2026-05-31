import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Upload, Type, Smile, Palette, ShoppingCart, RefreshCw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { Database, CartItem, Producto } from '../services/database';

interface ThreeDesignerProps {
  producto: Producto;
  onAddToCart: (cartItem: CartItem) => void;
  currentUser: any;
}

const FONTS = [
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Pacifico', value: 'Pacifico, cursive' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Bungee', value: 'Bungee, sans-serif' },
  { name: 'Outfit', value: 'Outfit, sans-serif' },
];

const STICKERS = [
  '⭐', '❤️', '🔥', '💀', '🎓', '💍', '🎂', '☕', '🚀', '🐱', '🎮', '💡', '🏆', '⚽', '🍕', '🎨'
];

export const ThreeDesigner: React.FC<ThreeDesignerProps> = ({ producto, onAddToCart, currentUser }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Design state
  const [baseColor, setBaseColor] = useState('#ffffff');
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFont, setTextFont] = useState('Montserrat, sans-serif');
  const [textSize, setTextSize] = useState(30);
  const [textY, setTextY] = useState(256); // Canvas Y coordinate (0-512)
  const [textX, setTextX] = useState(256); // Canvas X coordinate (0-512)
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imgScale, setImgScale] = useState(1);
  const [imgX, setImgX] = useState(256);
  const [imgY, setImgY] = useState(180);

  const [activeStickers, setActiveStickers] = useState<Array<{ id: number; symbol: string; x: number; y: number; scale: number }>>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<number | null>(null);

  // View state
  const [isRotating, setIsRotating] = useState(true);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState(3);

  // Price state
  const basePrice = producto.precio_base;
  const personalizationCost = (customText ? 15 : 0) + (uploadedImage ? 30 : 0) + (activeStickers.length * 10);
  const totalPrice = basePrice + personalizationCost;

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Calculate estimated delivery
  useEffect(() => {
    // Simulate active production queue
    const queueSize = Math.floor(Math.random() * 8) + 2;
    setDeliveryDays(queueSize > 6 ? 4 : 2);
  }, [producto]);

  // Texture Draw routine
  const drawTexture = () => {
    const canvas = textureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Draw grid helper (subtle, if we want sublimation boundaries)
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }

    // Draw uploaded image
    if (uploadedImage) {
      const img = new Image();
      img.src = uploadedImage;
      img.onload = () => {
        const iw = img.width;
        const ih = img.height;
        const aspect = iw / ih;
        const width = 150 * imgScale;
        const height = (150 / aspect) * imgScale;
        
        ctx.save();
        ctx.drawImage(img, imgX - width / 2, imgY - height / 2, width, height);
        ctx.restore();
        
        // Redraw overlay components to maintain layer ordering
        drawDecorations(ctx);
        if (textureRef.current) textureRef.current.needsUpdate = true;
      };
    } else {
      drawDecorations(ctx);
      if (textureRef.current) textureRef.current.needsUpdate = true;
    }
  };

  const drawDecorations = (ctx: CanvasRenderingContext2D) => {
    // Draw stickers
    activeStickers.forEach(sticker => {
      ctx.save();
      ctx.font = `${30 * sticker.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.symbol, sticker.x, sticker.y);
      
      // If selected in designer UI, draw a subtle ring around it
      if (sticker.id === selectedStickerId) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sticker.x, sticker.y, 25 * sticker.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw custom text
    if (customText) {
      ctx.save();
      ctx.font = `bold ${textSize}px ${textFont}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text shadow for premium visibility
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(customText, textX, textY);
      ctx.restore();
    }
  };

  // Re-draw texture whenever options change
  useEffect(() => {
    drawTexture();
  }, [baseColor, customText, textColor, textFont, textSize, textX, textY, uploadedImage, imgScale, imgX, imgY, activeStickers, selectedStickerId]);

  // ThreeJS Scene Setup
  useEffect(() => {
    if (!mountRef.current || !textureCanvasRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Clear old canvases
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.4); // Subtle indigo tint
    dirLight2.position.set(-5, 3, -5);
    scene.add(dirLight2);

    // 5. Texture mapping
    const texture = new THREE.CanvasTexture(textureCanvasRef.current);
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;

    // 6. Group to rotate
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // 7. Product Geometry generator
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    const canvasMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.15,
      metalness: producto.tipo_3d === 'termo' ? 0.6 : 0.05,
      side: THREE.DoubleSide
    });

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.2,
      metalness: 0.8
    });

    if (producto.tipo_3d === 'taza') {
      // Create main mug cylinder
      geometry = new THREE.CylinderGeometry(1.2, 1.2, 2.4, 32, 1, true);
      const mugBody = new THREE.Mesh(geometry, canvasMaterial);
      mugBody.position.y = 0;
      group.add(mugBody);

      // Mug interior & bottom (simple cylinders)
      const intGeo = new THREE.CylinderGeometry(1.15, 1.15, 2.35, 32);
      const intMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
      const mugInterior = new THREE.Mesh(intGeo, intMat);
      mugInterior.position.y = 0.02;
      group.add(mugInterior);

      const bottomGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
      const bottom = new THREE.Mesh(bottomGeo, intMat);
      bottom.position.y = -1.2;
      group.add(bottom);

      // Torus handle
      const handleGeo = new THREE.TorusGeometry(0.7, 0.15, 16, 32, Math.PI * 1.2);
      const handle = new THREE.Mesh(handleGeo, intMat);
      handle.position.set(-1.2, 0, 0);
      handle.rotation.z = Math.PI * 0.4;
      group.add(handle);

    } else if (producto.tipo_3d === 'playera') {
      // Folded t-shirt model represented beautifully as a chamfered/subdivided block
      geometry = new THREE.BoxGeometry(2.4, 3.0, 0.2);
      // Map texture onto the front face specifically, other faces use matching color
      const materials = [
        new THREE.MeshStandardMaterial({ color: baseColor }), // Right
        new THREE.MeshStandardMaterial({ color: baseColor }), // Left
        new THREE.MeshStandardMaterial({ color: baseColor }), // Top
        new THREE.MeshStandardMaterial({ color: baseColor }), // Bottom
        canvasMaterial,                                       // Front (contains sublimation)
        new THREE.MeshStandardMaterial({ color: baseColor }), // Back
      ];
      const shirt = new THREE.Mesh(geometry, materials);
      group.add(shirt);

    } else if (producto.tipo_3d === 'termo') {
      // Cylinder tall
      geometry = new THREE.CylinderGeometry(0.9, 0.9, 3.2, 32);
      const thermo = new THREE.Mesh(geometry, canvasMaterial);
      group.add(thermo);

      // Lid on top
      const lidGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.3, 32);
      const lid = new THREE.Mesh(lidGeo, bodyMaterial);
      lid.position.y = 1.75;
      group.add(lid);

    } else if (producto.tipo_3d === 'gorra') {
      // Cap hemisphere dome
      geometry = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const capDome = new THREE.Mesh(geometry, canvasMaterial);
      capDome.rotation.x = -Math.PI / 2;
      capDome.position.y = 0.2;
      group.add(capDome);

      // Visor
      const visorGeo = new THREE.BoxGeometry(1.6, 0.05, 0.9);
      const visor = new THREE.Mesh(visorGeo, bodyMaterial);
      visor.position.set(0, -0.1, 0.95);
      visor.rotation.x = 0.08;
      group.add(visor);

    } else if (producto.tipo_3d === 'cushion') {
      // Cushion - slightly fat box
      geometry = new THREE.BoxGeometry(2.4, 2.4, 0.5);
      const materials = [
        new THREE.MeshStandardMaterial({ color: baseColor }), // Right
        new THREE.MeshStandardMaterial({ color: baseColor }), // Left
        new THREE.MeshStandardMaterial({ color: baseColor }), // Top
        new THREE.MeshStandardMaterial({ color: baseColor }), // Bottom
        canvasMaterial,                                       // Front
        new THREE.MeshStandardMaterial({ color: baseColor }), // Back
      ];
      const cushion = new THREE.Mesh(geometry, materials);
      group.add(cushion);

    } else {
      // Puzzle or Mousepad (mostly flat planes with thin box depth)
      geometry = new THREE.BoxGeometry(3.2, 2.2, 0.04);
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x222222 }), // Right
        new THREE.MeshStandardMaterial({ color: 0x222222 }), // Left
        new THREE.MeshStandardMaterial({ color: 0x222222 }), // Top
        new THREE.MeshStandardMaterial({ color: 0x222222 }), // Bottom
        canvasMaterial,                                       // Front
        new THREE.MeshStandardMaterial({ color: 0x111111 }), // Back
      ];
      const plate = new THREE.Mesh(geometry, materials);
      group.add(plate);
    }

    // 8. Drag to rotate controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      setIsRotating(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !group) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      group.rotation.y += deltaMove.x * 0.007;
      group.rotation.x += deltaMove.y * 0.007;

      // Clamp rotation x
      group.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, group.rotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events for mobile support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setIsRotating(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !group || e.touches.length !== 1) return;
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };
      group.rotation.y += deltaMove.x * 0.008;
      group.rotation.x += deltaMove.y * 0.008;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    dom.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    // 9. Animation render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isRotating && group) {
        group.rotation.y += 0.005;
        // Float effect
        group.position.y = Math.sin(Date.now() * 0.0015) * 0.08;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      renderer.dispose();
    };
  }, [producto, isRotating]);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          setImgScale(1);
          setImgX(256);
          setImgY(180);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Sticker
  const addSticker = (symbol: string) => {
    const newSticker = {
      id: Date.now(),
      symbol,
      x: 256,
      y: 256,
      scale: 1
    };
    setActiveStickers([...activeStickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Move Selected item
  const updateItemPosition = (dir: 'up' | 'down' | 'left' | 'right' | 'shrink' | 'grow', target: 'img' | 'sticker' | 'text') => {
    if (target === 'text') {
      if (dir === 'up') setTextY(prev => Math.max(10, prev - 15));
      if (dir === 'down') setTextY(prev => Math.min(500, prev + 15));
      if (dir === 'left') setTextX(prev => Math.max(10, prev - 15));
      if (dir === 'right') setTextX(prev => Math.min(500, prev + 15));
      if (dir === 'shrink') setTextSize(prev => Math.max(12, prev - 3));
      if (dir === 'grow') setTextSize(prev => Math.min(80, prev + 3));
    } else if (target === 'img') {
      if (dir === 'up') setImgY(prev => Math.max(10, prev - 15));
      if (dir === 'down') setImgY(prev => Math.min(500, prev + 15));
      if (dir === 'left') setImgX(prev => Math.max(10, prev - 15));
      if (dir === 'right') setImgX(prev => Math.min(500, prev + 15));
      if (dir === 'shrink') setImgScale(prev => Math.max(0.2, prev - 0.1));
      if (dir === 'grow') setImgScale(prev => Math.min(2.5, prev + 0.1));
    } else if (target === 'sticker' && selectedStickerId !== null) {
      setActiveStickers(activeStickers.map(st => {
        if (st.id === selectedStickerId) {
          let { x, y, scale } = st;
          if (dir === 'up') y = Math.max(10, y - 15);
          if (dir === 'down') y = Math.min(500, y + 15);
          if (dir === 'left') x = Math.max(10, x - 15);
          if (dir === 'right') x = Math.min(500, x + 15);
          if (dir === 'shrink') scale = Math.max(0.3, scale - 0.15);
          if (dir === 'grow') scale = Math.min(3, scale + 0.15);
          return { ...st, x, y, scale };
        }
        return st;
      }));
    }
  };

  const handleAddToCart = () => {
    const item: CartItem = {
      id: `cart-${Date.now()}`,
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      producto_imagen: producto.imagen_url,
      tipo_3d: producto.tipo_3d,
      precio_unitario: totalPrice,
      cantidad: 1,
      color: baseColor,
      diseño_personalizado: {
        image: uploadedImage || undefined,
        text: customText || undefined,
        textColor: textColor,
        textFontSize: textSize,
        textFontFamily: textFont,
        stickers: activeStickers.map(s => ({ id: s.id.toString(), url: s.symbol, x: s.x, y: s.y, scale: s.scale }))
      }
    };
    onAddToCart(item);
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 3000);
  };

  const clearPersonalization = () => {
    setCustomText('');
    setUploadedImage(null);
    setActiveStickers([]);
    setSelectedStickerId(null);
    setBaseColor('#ffffff');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 3D Canvas Preview panel */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="relative glass-panel rounded-3xl w-full max-w-[500px] h-[480px] overflow-hidden flex flex-col items-center justify-center p-6 border-indigo-500/20">
          
          {/* Subtle light effects inside viewport */}
          <div className="mesh-glow w-64 h-64 bg-indigo-500 top-10 left-10"></div>
          <div className="mesh-glow w-64 h-64 bg-pink-500 bottom-10 right-10"></div>

          {/* Canvas Mount */}
          <div ref={mountRef} className="three-canvas-container cursor-grab active:cursor-grabbing z-10"></div>

          {/* Hidden design layer canvas used to feed Three.js texture */}
          <canvas ref={textureCanvasRef} width={512} height={512} className="hidden" />

          {/* Controls overlay */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="text-xs bg-indigo-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/30 text-indigo-200">
              Vista 360° Interactiva
            </span>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <button 
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-full border transition ${
                isRotating ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-300'
              }`}
              title="Giro automático"
            >
              <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4 z-10">
            <p className="text-xs text-slate-400">Arrastra para girar en cualquier ángulo</p>
          </div>
        </div>

        {/* Dynamic delivery indicator */}
        <div className="mt-4 glass-panel rounded-2xl w-full max-w-[500px] p-4 flex justify-between items-center text-sm border-slate-800">
          <div>
            <span className="text-slate-400 block text-xs">Tiempo Estimado de Producción</span>
            <span className="text-emerald-400 font-semibold">{deliveryDays} Días Hábiles</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-xs">Envío Garantizado</span>
            <span className="text-slate-200">Por FedEx / DHL / Estafeta</span>
          </div>
        </div>
      </div>

      {/* Editor Controls Side Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-panel rounded-3xl p-6 border-slate-800">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white mb-1">{producto.nombre}</h1>
            <p className="text-slate-400 text-xs">{producto.material}</p>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-col gap-5 mt-6">
            
            {/* 1. Base color (if applicable) */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-indigo-400" /> Color Base del Producto
              </label>
              <div className="flex gap-3 items-center">
                {['#ffffff', '#f8fafc', '#f1f5f9', '#cbd5e1', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => setBaseColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      baseColor === color ? 'border-indigo-500 scale-110 shadow-lg' : 'border-slate-800 hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 2. Text tool */}
            <div className="border-t border-slate-800/80 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-indigo-400" /> Añadir Texto Personalizado
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Escribe tu texto aquí..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-3"
              />

              {customText && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  {/* Font picker */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Tipografía</span>
                    <select
                      value={textFont}
                      onChange={(e) => setTextFont(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300"
                    >
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                    </select>
                  </div>

                  {/* Text Color */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Color</span>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1 h-8 cursor-pointer"
                    />
                  </div>

                  {/* Positioning controls for text */}
                  <div className="col-span-2 flex flex-col gap-1.5 mt-1 border-t border-slate-900 pt-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Posición & Tamaño Texto</span>
                    <div className="flex gap-2 justify-between">
                      <div className="flex gap-1">
                        <button onClick={() => updateItemPosition('left', 'text')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">←</button>
                        <button onClick={() => updateItemPosition('down', 'text')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">↓</button>
                        <button onClick={() => updateItemPosition('up', 'text')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">↑</button>
                        <button onClick={() => updateItemPosition('right', 'text')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">→</button>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => updateItemPosition('shrink', 'text')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300"><ZoomOut className="w-3 h-3 inline"/></button>
                        <button onClick={() => updateItemPosition('grow', 'text')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300"><ZoomIn className="w-3 h-3 inline"/></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Image uploader */}
            <div className="border-t border-slate-800/80 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-indigo-400" /> Subir Imagen o Logotipo
              </label>
              
              <div className="flex items-center gap-3">
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/40 py-4 px-3 rounded-xl cursor-pointer transition text-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Examinar Archivos</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG de alta resolución</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                
                {uploadedImage && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center p-1">
                    <img src={uploadedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={() => setUploadedImage(null)} 
                      className="absolute top-1 right-1 bg-red-600/90 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {uploadedImage && (
                <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Controles de Imagen</span>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <button onClick={() => updateItemPosition('left', 'img')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">←</button>
                      <button onClick={() => updateItemPosition('down', 'img')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">↓</button>
                      <button onClick={() => updateItemPosition('up', 'img')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">↑</button>
                      <button onClick={() => updateItemPosition('right', 'img')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300">→</button>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => updateItemPosition('shrink', 'img')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300"><ZoomOut className="w-3 h-3 inline"/></button>
                      <button onClick={() => updateItemPosition('grow', 'img')} className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-xs rounded border border-slate-800 text-slate-300"><ZoomIn className="w-3 h-3 inline"/></button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Stickers picker */}
            <div className="border-t border-slate-800/80 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <Smile className="w-4 h-4 text-indigo-400" /> Insertar Stickers Creativos
              </label>
              
              <div className="grid grid-cols-8 gap-2 p-2 bg-slate-950/40 border border-slate-800 rounded-xl max-h-32 overflow-y-auto">
                {STICKERS.map((st, i) => (
                  <button
                    key={i}
                    onClick={() => addSticker(st)}
                    className="text-xl p-1 bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                  >
                    {st}
                  </button>
                ))}
              </div>

              {activeStickers.length > 0 && (
                <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Stickers Activos ({activeStickers.length})</span>
                    <button 
                      onClick={() => { setActiveStickers([]); setSelectedStickerId(null); }} 
                      className="text-[9px] text-red-400 hover:text-red-300 underline"
                    >
                      Quitar Todos
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activeStickers.map(st => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStickerId(st.id)}
                        className={`px-2 py-0.5 rounded text-xs border transition ${
                          selectedStickerId === st.id 
                            ? 'bg-indigo-900/60 border-indigo-500 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {st.symbol}
                      </button>
                    ))}
                  </div>

                  {selectedStickerId !== null && (
                    <div className="border-t border-slate-900 pt-2 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-semibold">Editar Sticker Seleccionado</span>
                      <div className="flex gap-3">
                        <div className="flex gap-0.5">
                          <button onClick={() => updateItemPosition('left', 'sticker')} className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 text-[10px] rounded border border-slate-800">←</button>
                          <button onClick={() => updateItemPosition('down', 'sticker')} className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 text-[10px] rounded border border-slate-800">↓</button>
                          <button onClick={() => updateItemPosition('up', 'sticker')} className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 text-[10px] rounded border border-slate-800">↑</button>
                          <button onClick={() => updateItemPosition('right', 'sticker')} className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 text-[10px] rounded border border-slate-800">→</button>
                        </div>
                        <div className="flex gap-0.5">
                          <button onClick={() => updateItemPosition('shrink', 'sticker')} className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 text-[10px] rounded border border-slate-800">-</button>
                          <button onClick={() => updateItemPosition('grow', 'sticker')} className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 text-[10px] rounded border border-slate-800">+</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Pricing & Add to Cart */}
          <div className="mt-8 border-t border-slate-850 pt-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-xs block">Precio Total Estimado</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">${totalPrice.toFixed(2)}</span>
                  <span className="text-xs text-slate-500">MXN</span>
                </div>
              </div>
              <button 
                onClick={clearPersonalization}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1"
              >
                Limpiar diseño
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-4.5 rounded-2xl font-bold transition duration-300 text-white ${
                addedToCartSuccess 
                  ? 'bg-emerald-600 shadow-lg shadow-emerald-950/40' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/40 btn-glow-primary'
              }`}
            >
              {addedToCartSuccess ? (
                <>
                  <Check className="w-5 h-5" /> Agregado al Carrito
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
