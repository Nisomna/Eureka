import React, { useState } from 'react';
import { Phase } from '../types';
import { Sparkles, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface Props {
  setPhase: (phase: Phase) => void;
  onLoginSuccess: (userId: string) => void;
}

export function Login({ setPhase, onLoginSuccess }: Props) {
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
        message = "El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.";
      } else if (e.code === 'auth/unauthorized-domain') {
        message = "Este dominio no está autorizado para la autenticación de Firebase. Debes añadirlo en la consola de Firebase.";
      } else if (e.message) {
        message = e.message;
      }
      
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-8 max-w-sm mx-auto px-4 mt-12 md:mt-16">
      {/* Visual Identity Ring Container */}
      <div className="text-center space-y-5 relative">
        <div className="absolute inset-0 bg-teal-100/30 rounded-full filter blur-2xl w-32 h-32 mx-auto pointer-events-none"></div>
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-teal-50 to-calm-sage-100 dark:from-teal-950 dark:to-emerald-950 text-teal-600 dark:text-teal-400 mb-2 mx-auto shadow-sm border border-calm-sage-200/50 dark:border-teal-900 animate-float">
          <Sparkles size={44} className="text-teal-600/95 dark:text-teal-400" />
        </div>
        
        <h2 className="text-5xl font-bold tracking-tight text-calm-olive dark:text-white serif-title">
          Incubapp
        </h2>
        <span className="block text-xs uppercase tracking-widest text-calm-sage-600 dark:text-teal-450 font-semibold">Templo de Incubación Mental</span>
        
        <p className="text-sm text-calm-olive/70 dark:text-[#EBECEB]/70 max-w-xs mx-auto leading-relaxed">
          Un espacio sereno diseñado para disolver bloqueos creativos, descansar la mente y estructurar ideas geniales en cuatro simples etapas.
        </p>
      </div>

      <div className="w-full pt-4 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start space-x-3 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className={`w-full py-4 bg-white/70 dark:bg-[#1E2B25]/85 backdrop-blur-md border border-calm-sage-200/80 dark:border-teal-950 hover:bg-white dark:hover:bg-[#25322B] hover:border-teal-300 dark:hover:border-teal-700 text-calm-olive dark:text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-3 transition-all shadow-sm hover:shadow-md cursor-pointer ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoggingIn ? (
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          )}
          <span>{isLoggingIn ? 'Iniciando sesión...' : 'Comenzar con Google'}</span>
        </button>
      </div>

      {/* Aesthetic quote branding */}
      <div className="pt-8 text-center">
        <p className="text-[11px] text-calm-sage-600/60 dark:text-[#EBECEB]/40 font-medium italic">
          "La claridad nace del espacio que le otorgas a tu mente."
        </p>
      </div>
    </div>
  );
}
