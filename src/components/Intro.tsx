import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundIntro } from '../utils/sounds';

interface Props {
  onDone: () => void;
}

const LINES = [
  { text: 'Tu mente ya trabaja...', delay: 0.6 },
  { text: 'incluso cuando descansas.', delay: 1.4 },
];

export function Intro({ onDone }: Props) {
  const [step, setStep] = useState(0); // 0=orb, 1=text, 2=logo, 3=fade

  useEffect(() => {
    soundIntro();
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2600);
    const t3 = setTimeout(() => setStep(3), 3800);
    const t4 = setTimeout(() => onDone(), 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {step < 3 ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0E1712] overflow-hidden"
        >
          {/* Ambient background orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.18, scale: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#468285] filter blur-[120px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.12, scale: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#BCD1CE] filter blur-[100px]"
            />
          </div>

          {/* Central orb */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: step >= 0 ? 1 : 0, opacity: step >= 0 ? 1 : 0 }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative flex items-center justify-center mb-10"
          >
            {/* Outer ring */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-40 h-40 rounded-full border border-[#468285]/40"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute w-56 h-56 rounded-full border border-[#BCD1CE]/20"
            />
            {/* Core */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#468285] to-[#244547] shadow-2xl shadow-[#468285]/50 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute w-full h-full rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 70%, rgba(188,209,206,0.3) 100%)',
                }}
              />
              <span className="text-4xl select-none">✦</span>
            </div>
          </motion.div>

          {/* Text lines */}
          <div className="text-center space-y-2 px-8">
            {step >= 1 && LINES.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.5, ease: 'easeOut' }}
                className={`text-lg font-light tracking-wide ${i === 0 ? 'text-[#BCD1CE]' : 'text-[#468285] font-semibold italic'}`}
                style={{ fontFamily: '"Instrument Serif", serif' }}
              >
                {line.text}
              </motion.p>
            ))}
          </div>

          {/* Logo */}
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute bottom-16 text-center"
            >
              <p
                className="text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: '"Instrument Serif", serif' }}
              >
                Incubapp
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#468285]/70 mt-1 font-medium">
                Creative Calm Nest
              </p>
            </motion.div>
          )}

          {/* Skip */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.5 }}
            onClick={onDone}
            className="absolute bottom-5 right-5 text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-widest cursor-pointer"
          >
            Saltar
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
