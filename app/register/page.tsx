'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://wealthsync-backend-d0y9.onrender.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      if (res.ok) {
        alert('¡Cuenta creada con éxito! Ahora inicia sesión.');
        router.push('/login');
      } else {
        alert('Error al registrar. Revisa los datos.');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un problema con la conexión.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Crear Cuenta WealthSync</h2>
        <input 
          type="text" placeholder="Tu nombre completo" 
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setNombre(e.target.value)} required 
        />
        <input 
          type="email" placeholder="Correo electrónico" 
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="Contraseña" 
          className="w-full p-3 mb-6 border rounded"
          onChange={(e) => setPassword(e.target.value)} required 
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">
          Registrarme
        </button>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <a href="/login" className="text-blue-500 underline">Inicia sesión aquí</a>
        </p>
      </form>
    </div>
  );
}