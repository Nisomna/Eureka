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
    <div className="flex flex-col h-full items-center justify-center space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-100 text-teal-600 mb-6 mx-auto shadow-inner">
          <Sparkles size={48} />
        </div>
        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Incubapp</h2>
        <p className="text-slate-600 max-w-sm mx-auto text-lg">
          Tu compañero personal para superar bloqueos mentales y encontrar nuevas ideas.
        </p>
      </div>

      <div className="w-full max-w-sm pt-4 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className={`w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-colors shadow-sm ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoggingIn ? (
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          )}
          <span>{isLoggingIn ? 'Cargando...' : 'Ingresar con Google'}</span>
        </button>
      </div>
    </div>
  );
}
