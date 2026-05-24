import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onClose: () => void;
}

const CREDITS = [
  { role: 'CREADOR & DIRECTOR', name: 'El Equipo Incubapp' },
  { role: 'DISEÑO DE EXPERIENCIA', name: 'Creative Calm Nest Studio' },
  { role: 'INTELIGENCIA ARTIFICIAL', name: 'Google Gemini 3.5 Flash' },
  { role: 'MOTOR DE BASE DE DATOS', name: 'Firebase & Firestore' },
  { role: 'AUTENTICACIÓN', name: 'Firebase Auth' },
  { role: 'FRAMEWORK UI', name: 'React 18 + TypeScript' },
  { role: 'ESTILOS', name: 'Tailwind CSS v4' },
  { role: 'ANIMACIONES', name: 'Motion / Framer Motion' },
  { role: 'TIPOGRAFÍA', name: 'Instrument Serif + Plus Jakarta Sans' },
  { role: 'DEPLOY & HOSTING', name: 'Vercel' },
  { role: 'EFECTOS DE SONIDO', name: 'Web Audio API' },
  { role: 'INSPIRACIÓN CIENTÍFICA', name: 'Teoría de Incubación Mental' },
  { role: 'METODOLOGÍA CREATIVA', name: 'Hemisferio Derecho · Modo Difuso' },
  { role: 'AGRADECIMIENTO ESPECIAL', name: 'A quien se atreve a descansar' },
  { role: 'PRODUCIDO EN', name: 'Colombia 🇨🇴' },
];

interface Target {
  id: number;
  creditIndex: number;
  x: number;
  y: number;
  speed: number;
  hit: boolean;
  hitX: number;
  hitY: number;
  size: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  wobbleAmp: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  char: string;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
}

const COLORS = ['#468285', '#BCD1CE', '#7EC8CB', '#FFD580', '#FF8C69', '#C8E6C9'];
const HIT_CHARS = ['✦', '★', '◆', '●', '▲', '♦'];

let globalId = 0;
const nextId = () => ++globalId;

export function Credits({ onClose }: Props) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [totalHit, setTotalHit] = useState(0);
  const [done, setDone] = useState(false);
  const [allSpawned, setAllSpawned] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const spawnIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const comboRef = useRef(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const playHitSound = useCallback((isCombo: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isCombo ? 880 : 660;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, []);

  // Spawn targets
  useEffect(() => {
    const spawnNext = () => {
      const idx = spawnIndexRef.current;
      if (idx >= CREDITS.length) {
        setAllSpawned(true);
        return;
      }
      spawnIndexRef.current += 1;

      const newTarget: Target = {
        id: nextId(),
        creditIndex: idx,
        x: 15 + Math.random() * 70,
        y: -12,
        speed: 0.016 + Math.random() * 0.01,
        hit: false,
        hitX: 0,
        hitY: 0,
        size: 0.85 + Math.random() * 0.25,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.6 + Math.random() * 0.6,
        wobbleAmp: 2 + Math.random() * 4,
      };

      setTargets(prev => [...prev, newTarget]);
      spawnTimerRef.current = setTimeout(spawnNext, 1300 + Math.random() * 700);
    };

    spawnTimerRef.current = setTimeout(spawnNext, 800);
    return () => { if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current); };
  }, []);

  // Animation loop
  useEffect(() => {
    let time = 0;
    const animate = (ts: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = Math.min(ts - lastTimeRef.current, 50);
      lastTimeRef.current = ts;
      time += dt;

      setTargets(prev =>
        prev
          .map(t => {
            if (t.hit) return t;
            const newY = t.y + t.speed * dt;
            const wx = Math.sin((time / 1000) * t.wobbleSpeed + t.wobbleOffset) * t.wobbleAmp * (dt / 16);
            return { ...t, y: newY, x: Math.max(10, Math.min(90, t.x + wx * 0.1)) };
          })
          .filter(t => t.hit || t.y < 118)
      );

      setParticles(prev =>
        prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.18, life: p.life - 1 }))
          .filter(p => p.life > 0)
      );

      setFloatingTexts(prev =>
        prev.map(ft => ({ ...ft, y: ft.y - 1.3, life: ft.life - 1 })).filter(ft => ft.life > 0)
      );

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Check if done
  useEffect(() => {
    if (!allSpawned) return;
    const allGone = targets.every(t => t.hit || t.y >= 115);
    if (allGone && targets.length > 0) {
      const t = setTimeout(() => setDone(true), 1200);
      return () => clearTimeout(t);
    }
  }, [allSpawned, targets]);

  const handleHit = useCallback(
    (target: Target, e: React.MouseEvent | React.TouchEvent) => {
      if (target.hit) return;
      e.stopPropagation();
      setShowHint(false);

      const rect = containerRef.current?.getBoundingClientRect();
      let clientX = 0, clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('changedTouches' in e && (e as any).changedTouches.length > 0) {
        clientX = (e as any).changedTouches[0].clientX;
        clientY = (e as any).changedTouches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const hitX = rect ? ((clientX - rect.left) / rect.width) * 100 : target.x;
      const hitY = rect ? ((clientY - rect.top) / rect.height) * 100 : target.y;

      comboRef.current += 1;
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => { comboRef.current = 0; setCombo(0); }, 1600);

      const c = comboRef.current;
      setCombo(c);
      const pts = c >= 3 ? c * 150 : 100;
      setScore(s => s + pts);
      setTotalHit(n => n + 1);
      playHitSound(c >= 3);

      setTargets(prev => prev.map(t => t.id === target.id ? { ...t, hit: true, hitX, hitY } : t));

      const newParticles: Particle[] = Array.from({ length: 16 }, () => ({
        id: nextId(),
        x: hitX,
        y: hitY,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -Math.random() * 4.5 - 0.5,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 3 + Math.random() * 6,
        char: HIT_CHARS[Math.floor(Math.random() * HIT_CHARS.length)],
      }));
      setParticles(prev => [...prev, ...newParticles]);

      const label =
        c >= 5 ? `COMBO x${c}! 🔥` :
        c >= 3 ? `x${c} COMBO!` :
        `+${pts}`;
      setFloatingTexts(prev => [...prev, { id: nextId(), x: hitX, y: hitY - 5, text: label, life: 42 }]);
    },
    [playHitSound]
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #0d1f2b 0%, #040a08 100%)', cursor: 'crosshair' }}
    >
      {/* Stars */}
      {Array.from({ length: 55 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() > 0.85 ? 2 : 1,
            height: Math.random() > 0.85 ? 2 : 1,
            top: `${(i * 1.82) % 100}%`,
            left: `${(i * 6.18) % 100}%`,
            opacity: 0.1 + (i % 5) * 0.07,
          }}
        />
      ))}

      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
          zIndex: 1,
        }}
      />

      {/* HUD */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 pb-2 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(4,10,8,0.92), transparent)' }}
      >
        <div>
          <p className="text-[8px] uppercase tracking-[0.35em] text-[#468285]/60 font-bold">Score</p>
          <p
            className="text-2xl font-black text-white tabular-nums"
            style={{ fontFamily: 'monospace', textShadow: '0 0 20px rgba(70,130,133,0.9)' }}
          >
            {String(score).padStart(6, '0')}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[8px] uppercase tracking-[0.5em] text-[#468285]/50 font-bold">Credits</p>
          <p className="text-lg font-black text-white leading-none" style={{ fontFamily: '"Instrument Serif", serif', textShadow: '0 0 20px rgba(70,130,133,0.5)' }}>
            Incubapp
          </p>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <button
            onClick={onClose}
            className="text-[10px] uppercase tracking-widest text-white/35 hover:text-white/70 transition-colors cursor-pointer px-2 py-1"
          >
            ✕ salir
          </button>
          <p className="text-[8px] text-[#468285]/60 font-bold tabular-nums">{totalHit}/{CREDITS.length}</p>
        </div>
      </div>

      {/* Combo banner */}
      <AnimatePresence>
        {combo >= 3 && (
          <motion.div
            key={`combo-${combo}`}
            initial={{ scale: 1.6, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 flex justify-center z-20 pointer-events-none"
          >
            <div
              className="px-5 py-1 rounded-full text-xs font-black uppercase tracking-wider"
              style={{
                background: combo >= 5 ? 'rgba(255,140,105,0.2)' : 'rgba(70,130,133,0.2)',
                border: `1px solid ${combo >= 5 ? 'rgba(255,140,105,0.7)' : 'rgba(70,130,133,0.7)'}`,
                color: combo >= 5 ? '#FF8C69' : '#7EC8CB',
                textShadow: `0 0 16px ${combo >= 5 ? 'rgba(255,140,105,0.9)' : 'rgba(126,200,203,0.9)'}`,
                boxShadow: `0 0 20px ${combo >= 5 ? 'rgba(255,140,105,0.2)' : 'rgba(70,130,133,0.2)'}`,
              }}
            >
              {combo >= 5 ? `🔥 COMBO x${combo} 🔥` : `⚡ COMBO x${combo}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Falling targets */}
      {targets.map(target => {
        const credit = CREDITS[target.creditIndex];
        if (target.hit) {
          return (
            <motion.div
              key={`hit-${target.id}`}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 2.2, y: -25 }}
              transition={{ duration: 0.35 }}
              className="absolute pointer-events-none z-10"
              style={{
                left: `${target.hitX}%`,
                top: `${target.hitY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-3xl text-[#7EC8CB]" style={{ textShadow: '0 0 20px rgba(126,200,203,0.9)' }}>✦</span>
            </motion.div>
          );
        }
        return (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: target.size }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute z-10"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              transform: `translate(-50%, -50%) scale(${target.size})`,
              cursor: 'pointer',
            }}
            onClick={e => handleHit(target, e)}
            onTouchStart={e => { e.preventDefault(); handleHit(target, e); }}
          >
            <div
              className="relative px-3 py-2 rounded-xl text-center"
              style={{
                background: 'rgba(10,25,35,0.88)',
                border: '1px solid rgba(70,130,133,0.55)',
                boxShadow: '0 0 14px rgba(70,130,133,0.28), inset 0 1px 0 rgba(188,209,206,0.08)',
                backdropFilter: 'blur(6px)',
                minWidth: '130px',
                maxWidth: '190px',
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{ boxShadow: ['0 0 8px rgba(70,130,133,0.15)', '0 0 22px rgba(70,130,133,0.45)', '0 0 8px rgba(70,130,133,0.15)'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <p className="text-[7px] uppercase tracking-[0.3em] font-black mb-0.5" style={{ color: '#468285' }}>
                {credit.role}
              </p>
              <p className="text-sm font-black text-white leading-snug" style={{ fontFamily: '"Instrument Serif", serif' }}>
                {credit.name}
              </p>
              {/* Ping dot */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#468285] opacity-50" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#7EC8CB]" />
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute font-black"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              color: p.color,
              fontSize: p.size,
              opacity: p.life / p.maxLife,
              transform: 'translate(-50%, -50%)',
              textShadow: `0 0 8px ${p.color}`,
            }}
          >
            {p.char}
          </div>
        ))}
      </div>

      {/* Floating texts */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {floatingTexts.map(ft => (
          <div
            key={ft.id}
            className="absolute text-xs font-black uppercase tracking-wider whitespace-nowrap"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.text.includes('COMBO') ? '#FF8C69' : '#FFD580',
              opacity: Math.min(ft.life / 18, 1),
              transform: 'translate(-50%, -50%)',
              textShadow: '0 0 12px rgba(255,213,128,0.9)',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-10 text-[10px] uppercase tracking-[0.4em] animate-pulse"
            style={{ color: 'rgba(70,130,133,0.55)' }}
          >
            ¡Toca los créditos!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Done screen */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30"
            style={{ background: 'rgba(4,10,8,0.87)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.45, delay: 0.08 }}
              className="text-center px-8"
            >
              <div className="flex justify-center gap-3 mb-5 text-3xl">
                {['🧠', '🌙', '💡'].map((e, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>

              <h2
                className="text-4xl font-black text-white mb-1"
                style={{ fontFamily: '"Instrument Serif", serif', textShadow: '0 0 30px rgba(70,130,133,0.6)' }}
              >
                {totalHit === CREDITS.length ? '¡Perfecto! 🎉' : totalHit >= Math.ceil(CREDITS.length * 0.6) ? '¡Buen trabajo!' : '¡Siguiente vez!'}
              </h2>

              <div className="flex items-center justify-center gap-8 my-5">
                <div className="text-center">
                  <p className="text-[8px] uppercase tracking-widest text-[#468285]/60 font-bold">Score</p>
                  <p className="text-3xl font-black text-white tabular-nums" style={{ fontFamily: 'monospace', textShadow: '0 0 20px rgba(70,130,133,0.8)' }}>
                    {String(score).padStart(6, '0')}
                  </p>
                </div>
                <div className="w-px h-10 bg-[#468285]/25" />
                <div className="text-center">
                  <p className="text-[8px] uppercase tracking-widest text-[#468285]/60 font-bold">Hits</p>
                  <p className="text-3xl font-black text-white tabular-nums" style={{ fontFamily: 'monospace' }}>
                    {totalHit}/{CREDITS.length}
                  </p>
                </div>
              </div>

              <p className="text-[#BCD1CE]/55 text-sm max-w-xs mx-auto mb-5 leading-relaxed">
                Tu mente es el instrumento más poderoso que tienes. Cuídala. Descansa. Crea.
              </p>

              <p className="text-[#468285]/35 text-[8px] uppercase tracking-widest mb-6">© 2025 Incubapp · Creative Calm Nest</p>

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                className="px-8 py-3 font-black rounded-xl text-sm uppercase tracking-wider cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #468285, #3A6D70)',
                  color: 'white',
                  boxShadow: '0 4px 24px rgba(70,130,133,0.45)',
                }}
              >
                Volver a Incubapp
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
