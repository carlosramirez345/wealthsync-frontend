"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('https://wealthsync-backend-d0y9.onrender.com/api/v1/auth/login', {
              method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const datos = await res.json();

      if (res.ok) {
        // 🔥 AQUÍ GUARDAMOS TU ID SECRETO
        localStorage.setItem('token', datos.token);
        localStorage.setItem('userName', datos.user.first_name);
        localStorage.setItem('userId', datos.user.id); 

        // Nos vamos al Dashboard
        router.push('/');
      } else {
        setError(datos.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">WealthSync</h1>
          <p className="text-slate-500">Inicia sesión en tu bóveda</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="••••••••"
            />
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
  ¿No tienes cuenta? <a href="/register" className="text-blue-500 hover:underline">Regístrate aquí</a>
</p>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 mt-2"
          >
            Entrar
          </button>
             <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            Iniciar Sesión
          </button>

          <div className="mt-6 text-center text-[11px] md:text-xs text-slate-500 dark:text-slate-400 px-4">
            Al iniciar sesión o crear una cuenta, aceptas nuestros{' '}
            <Link href="/Terminos" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">
              Términos y Condiciones
            </Link>
            {' '}y nuestro{' '}
            <Link href="/privacidad" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">
              Aviso de Privacidad
            </Link>.
          </div>

        </form>
      </div>
    </div>
  );
}