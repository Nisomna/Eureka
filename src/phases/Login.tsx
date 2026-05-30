import React, { useState } from 'react';
import { Phase } from '../types';
import { AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface Props {
  setPhase: (phase: Phase) => void;
  onLoginSuccess: (userId: string) => void;
  isDark: boolean;
}

export function Login({ setPhase, onLoginSuccess, isDark }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      onLoginSuccess(result.user.uid);
    } catch (e: any) {
      console.error("Login failed:", e);
      let message = "Ocurrió un error al intentar iniciar sesión.";
      
      if (e.code === 'auth/popup-blocked') {
        message = "El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes en este sitio.";
      } else if (e.code === 'auth/unauthorized-domain') {
        message = "Este dominio no está autorizado para Firebase Auth. Activa o usa el modo local sin conexión.";
      } else if (e.code === 'auth/network-request-failed' || e.message?.includes('network-request-failed')) {
        message = "Fallo de conexión de red con los servidores de autenticación. Puedes continuar usando el 'Modo local offline' a continuación sin perder tus funcionalidades.";
      } else if (e.message) {
        message = e.message;
      }
      
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('incubapp_guest_user', 'true');
    onLoginSuccess('guest');
    setPhase('home');
  };

  return (
    <div className="flex flex-col min-h-full items-center justify-center space-y-7 max-w-sm mx-auto px-6 py-10">
      {/* Visual Identity */}
      <div className="text-center space-y-4 relative flex flex-col items-center">
        {/* Glow ambiental */}
        <div className="absolute w-48 h-48 rounded-full bg-[#2AAFA8]/20 filter blur-3xl pointer-events-none animate-breath"></div>

        {/* Logo con rings */}
        <div className="relative flex items-center justify-center animate-float mb-1">
          {/* Pulse ring exterior */}
          <div className="absolute w-44 h-44 rounded-full border border-[#2AAFA8]/20 animate-ping" style={{ animationDuration: '3.5s' }}></div>
          {/* Ring decorativo */}
          <div className="absolute w-36 h-36 rounded-full border-2 border-[#2AAFA8]/30 dark:border-[#2AAFA8]/20"></div>
          {/* Círculo del logo — grande, sin padding interno */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#2AAFA8]/60 shadow-2xl shadow-[#2AAFA8]/25 dark:shadow-[#2AAFA8]/40 bg-[#2AAFA8]/5">
            <img src={isDark ? "/logo.svg" : "/logo-light.svg"} alt="Incubapp" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <h2 className="text-5xl font-bold tracking-tight text-[var(--text-primary)] serif-title">
          Incubapp
        </h2>
        <span className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] dark:text-[var(--accent-mint)] font-extrabold">Templo de Incubación Mental</span>
        
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-primary)]/80 max-w-xs mx-auto leading-relaxed font-medium">
          Un espacio sereno diseñado para disolver bloqueos creativos, descansar la mente y estructurar ideas geniales en cuatro simples etapas.
        </p>
      </div>

      <div className="w-full pt-2 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start space-x-3 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className={`w-full py-4 bg-[var(--surface-card)] dark:bg-[var(--surface-card2)]/85 backdrop-blur-md border border-[var(--border-card)] dark:border-[var(--border-default)]/80 hover:bg-[var(--surface-card)] dark:hover:bg-[var(--surface-hover)] hover:border-[var(--accent-teal)] dark:hover:border-teal-700 text-[var(--text-primary)] dark:text-[var(--text-primary)] rounded-2xl font-bold text-base flex items-center justify-center space-x-3 transition-all shadow-sm hover:shadow-md cursor-pointer ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoggingIn ? (
            <div className="w-6 h-6 border-2 border-[var(--accent-teal)] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          )}
          <span>{isLoggingIn ? 'Iniciando sesión...' : 'Comenzar con Google'}</span>
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoggingIn}
          className="w-full py-3.5 bg-transparent hover:bg-[var(--surface-card)]/20 dark:hover:bg-[var(--surface-hover)]/5 border border-dashed border-calm-sage-300 dark:border-[var(--border-default)]/60 text-[var(--text-secondary)] dark:text-[var(--text-primary)]/80 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <span>Continuar sin cuenta (Modo local offline)</span>
        </button>
      </div>

      {/* Aesthetic quote branding */}
      <div className="pt-8 text-center">
        <p className="text-[11px] text-[var(--text-secondary)] dark:text-[var(--text-primary)]/65 font-medium italic">
          "La claridad nace del espacio que le otorgas a tu mente."
        </p>
      </div>
    </div>
  );
}