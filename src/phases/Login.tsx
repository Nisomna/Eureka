import React from 'react';
import { Phase } from '../types';
import { Sparkles, LogIn } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface Props {
  setPhase: (phase: Phase) => void;
  onLoginSuccess: (userId: string) => void;
}

export function Login({ setPhase, onLoginSuccess }: Props) {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      onLoginSuccess(result.user.uid);
    } catch (error) {
      console.error("Login failed:", error);
      // Detailed error handling could be here
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-500 mb-6 mx-auto shadow-inner">
          <Sparkles size={48} />
        </div>
        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Incubapp</h2>
        <p className="text-slate-600 max-w-sm mx-auto text-lg">
          Tu compañero personal para superar bloqueos mentales y encontrar nuevas ideas.
        </p>
      </div>

      <div className="w-full max-w-sm pt-8">
        <button
          onClick={handleLogin}
          className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-colors shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          <span>Ingresar con Google</span>
        </button>
      </div>
    </div>
  );
}
