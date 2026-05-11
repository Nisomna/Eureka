import React, { useEffect } from 'react';
import { AlarmClock, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { ActiveToast } from '../lib/notificationTypes';
import { playAlarm } from '../lib/notificationUtils';

function NotifToast({ toast, onDismiss }: { toast: ActiveToast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    if (toast.sound) playAlarm(toast.soundRepeat ?? 3);
  }, [toast.id, toast.sound, toast.soundRepeat]);

  return (
    <motion.div
      className="relative overflow-hidden flex items-start gap-3 p-4 bg-slate-800 border border-teal-500/30 rounded-2xl shadow-2xl backdrop-blur-xl w-full pointer-events-auto"
      initial={{ opacity: 0, y: -72, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -48, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
    >
      <div className="absolute inset-0 border-2 border-teal-500/20 rounded-2xl animate-pulse pointer-events-none" />
      
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-teal-500/10 text-teal-400">
        <Bell className="animate-bounce" size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm truncate">{toast.title}</div>
        {toast.message && <div className="text-slate-400 text-xs mt-0.5 line-clamp-2">{toast.message}</div>}
      </div>
      
      <button 
        className="p-1 text-slate-500 hover:text-white transition-colors"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function NotifOverlay({ toasts, onDismiss }: { toasts: ActiveToast[]; onDismiss: (id: string) => void }) {
  if (typeof document === 'undefined') return null;
  
  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 w-[min(420px,92vw)] pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map(t => (
          <NotifToast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
