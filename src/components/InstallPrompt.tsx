import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show our custom UI
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:max-w-sm"
        >
          <div className="bg-[var(--surface-card)] dark:bg-[var(--surface-card2)] border border-[var(--border-card)] dark:border-[var(--border-default)]/40 shadow-2xl rounded-2xl p-4 flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-calm-duckegg/20 dark:bg-[var(--surface-base)] text-calm-emeraldsea dark:text-calm-duckegg rounded-xl flex items-center justify-center">
                <Download size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-sm">Instalar Incubapp</h4>
                <p className="text-calm-sage-600 dark:text-[var(--text-primary)]/60 text-xs text-balance">Accede más rápido desde tu pantalla de inicio.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                className="bg-calm-sage-800 hover:bg-calm-sage-900 dark:bg-calm-emeraldsea dark:hover:bg-calm-sage-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Instalar
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-2 text-calm-sage-600 dark:text-[var(--text-primary)]/50 hover:text-[var(--text-primary)] dark:hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}