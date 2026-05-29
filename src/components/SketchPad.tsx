import React, { useRef, useState, useEffect } from 'react';
import { Palette, Trash2, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  onSave: (dataUrl: string) => void;
  isDark: boolean;
}

const COLORS = [
  { name: 'Mar Esmeralda', value: '#468285' },
  { name: 'Coral Calm', value: '#F7A08E' },
  { name: 'Oliva Profundo', value: '#2D3934' },
  { name: 'Butterscotch', value: '#E4AD53' },
  { name: 'Huevo de Pato', value: '#BCD1CE' },
  { name: 'Blush Dulce', value: '#F2D5CB' },
];

export function SketchPad({ onSave, isDark }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#468285');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isEraser, setIsEraser] = useState(false);

  // Set canvas size dynamically based on parent container size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const parentWidth = rect?.width || 380;
      const parentHeight = 240;

      // Adjust for high resolution displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parentWidth * dpr;
      canvas.height = parentHeight * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Fill cream/light bg or dark bg depending on mode
        ctx.fillStyle = isDark ? '#1A2820' : '#FAF6EE';
        ctx.fillRect(0, 0, parentWidth, parentHeight);
      }
    };

    resizeCanvas();
    
    // Clean history upon resize to prevent offset issues, or save first frame
    const ctx = canvas.getContext('2d');
    if (ctx && canvas) {
      setHistory([canvas.toDataURL()]);
    }

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isDark]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev.slice(-15), canvas.toDataURL()]);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default scrolling on mobile touch
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? (isDark ? '#1A2820' : '#FAF6EE') : selectedColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    if (e.cancelable) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? (isDark ? '#1A2820' : '#FAF6EE') : selectedColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = isDark ? '#1A2820' : '#FAF6EE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const undo = () => {
    if (history.length <= 1) {
      clearCanvas();
      setHistory([]);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const previousStateImg = new Image();
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousSrc = newHistory[newHistory.length - 1];

    previousStateImg.src = previousSrc;
    previousStateImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rect = canvas.getBoundingClientRect();
      ctx.drawImage(previousStateImg, 0, 0, rect.width, rect.height);
      setHistory(newHistory);
    };
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
      // Give visual feedback or clear
      clearCanvas();
    }
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="relative border border-[var(--border-card)] dark:border-[var(--border-default)]/40 rounded-3xl overflow-hidden shadow-inner bg-stone-50 dark:bg-[var(--surface-card)]/90">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block touch-none cursor-crosshair w-full"
          id="sketch-canvas"
        />
        
        {/* Helper layout tags */}
        <div className="absolute bottom-2 left-3 text-[10px] uppercase tracking-wider font-semibold pointer-events-none text-[var(--text-secondary)] dark:text-[var(--text-primary)]/60">
          Lienzo de Incubación
        </div>
      </div>

      {/* Toolbox: Colors, Sizes, Clear */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[var(--surface-card)] dark:bg-[var(--surface-card)]/80 backdrop-blur-md rounded-2xl border border-[var(--border-card)] dark:border-[var(--border-default)]/40 shadow-sm">
        {/* Colors selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {COLORS.map((col) => {
            const isSelected = selectedColor === col.value && !isEraser;
            return (
              <button
                key={col.value}
                onClick={() => {
                  setSelectedColor(col.value);
                  setIsEraser(false);
                }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isSelected ? 'scale-110 ring-2 ring-calm-emeraldsea/50 border-calm-emeraldsea' : 'border-stone-200 dark:border-[var(--border-default)]/40 hover:scale-105'
                }`}
                style={{ backgroundColor: col.value }}
                title={col.name}
              />
            );
          })}
          
          {/* Eraser */}
          <button
            onClick={() => setIsEraser(true)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              isEraser 
                ? 'bg-[var(--surface-card2)]0 text-white border-calm-sage-600' 
                : 'bg-white dark:bg-[var(--surface-card)] text-[var(--text-primary)] dark:text-stone-200 border-stone-200 dark:border-[var(--border-default)]/40 hover:bg-stone-50 dark:hover:bg-[var(--surface-hover)]'
            }`}
          >
            Borrador
          </button>
        </div>

        {/* Brush Size / Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-widest">Grosor:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 accent-calm-sage-500 h-1 bg-stone-200 dark:bg-teal-950/40 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              className="p-2 text-calm-sage-600 dark:text-[var(--text-primary)]/70 hover:text-calm-sage-900 dark:hover:text-white bg-white dark:bg-[var(--surface-card)]/50 hover:bg-stone-50 dark:hover:bg-[var(--surface-hover)] border border-stone-200 dark:border-[var(--border-default)]/40 rounded-xl transition-all cursor-pointer"
              title="Deshacer"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 text-rose-500 hover:text-rose-700 bg-white dark:bg-[var(--surface-card)]/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-stone-200 dark:border-[var(--border-default)]/40 rounded-xl transition-all cursor-pointer"
              title="Borrar todo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleExport}
        className="w-full py-3 bg-calm-sage-800 hover:bg-calm-sage-900 dark:bg-calm-emeraldsea dark:hover:bg-calm-sage-600 active:scale-[0.99] text-white rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center space-x-2 transition-all shadow-md shadow-calm-sage-200/50 dark:shadow-none cursor-pointer"
      >
        <Check size={16} />
        <span>Añadir Boceto Visual a la Lluvia</span>
      </button>
    </div>
  );
}