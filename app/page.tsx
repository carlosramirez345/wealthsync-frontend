"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const LISTA_MESES = [
  { val: -1, nombre: "Historial Completo" },
  { val: 0, nombre: "Enero" }, { val: 1, nombre: "Febrero" }, { val: 2, nombre: "Marzo" },
  { val: 3, nombre: "Abril" }, { val: 4, nombre: "Mayo" }, { val: 5, nombre: "Junio" },
  { val: 6, nombre: "Julio" }, { val: 7, nombre: "Agosto" }, { val: 8, nombre: "Septiembre" },
  { val: 9, nombre: "Octubre" }, { val: 10, nombre: "Noviembre" }, { val: 11, nombre: "Diciembre" }
];

export default function DashboardPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [transacciones, setTransacciones] = useState<any[]>([]); 
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [busqueda, setBusqueda] = useState<string>('');

  const [mostrarModalMeta, setMostrarModalMeta] = useState(false);
  const [metaNombre, setMetaNombre] = useState('Laptop');
  const [metaObjetivo, setMetaObjetivo] = useState(10000);

  const [mostrarModalTarjeta, setMostrarModalTarjeta] = useState(false);
  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    nombre: '', limite: '', corte: '', pago: '', color: 'from-slate-700 to-slate-900'
  });
  
  const [tarjetas, setTarjetas] = useState<any[]>([]);

  useEffect(() => {
    const metaGuardada = localStorage.getItem('wealthsync_metaNombre');
    const objetivoGuardado = localStorage.getItem('wealthsync_metaObjetivo');
    const temaGuardado = localStorage.getItem('wealthsync_theme');
    const tarjetasGuardadas = localStorage.getItem('wealthsync_tarjetas');
    
    if (metaGuardada) setMetaNombre(metaGuardada);
    if (objetivoGuardado) setMetaObjetivo(Number(objetivoGuardado));
    if (temaGuardado === 'dark') setIsDarkMode(true);
    
    if (tarjetasGuardadas) {
      setTarjetas(JSON.parse(tarjetasGuardadas));
    } else {
      setTarjetas([
        { id: 1, nombre: 'Nu Bank', limite: 15000, gastado: 0, corte: '15', pago: '25', color: 'from-purple-600 to-purple-800' },
        { id: 2, nombre: 'BBVA Oro', limite: 30000, gastado: 0, corte: '04', pago: '24', color: 'from-blue-800 to-slate-900' }
      ]);
    }
  }, []);

  const guardarMetaConfigurada = () => {
    localStorage.setItem('wealthsync_metaNombre', metaNombre);
    localStorage.setItem('wealthsync_metaObjetivo', metaObjetivo.toString());
    setMostrarModalMeta(false);
  };

  const toggleModoOscuro = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('wealthsync_theme', !isDarkMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    if (!confirm("¿Seguro que deseas cerrar sesión?")) return;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  const [mesSeleccionado, setMesSeleccionado] = useState<number>(-1);
  const [balance, setBalance] = useState<number>(0);
  const [ingresos, setIngresos] = useState<number>(0);
  const [gastos, setGastos] = useState<number>(0);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [monto, setMonto] = useState<string>('');
  const [tipo, setTipo] = useState<string>('income');
  const [categoria, setCategoria] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<string>('efectivo');

  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter(t => {
      const pasaMes = mesSeleccionado === -1 || new Date(t.transaction_date).getMonth() === mesSeleccionado;
      const descLimpia = t.description.replace(/\[Tarjeta-\d+\]\s*/, ''); 
      const pasaTexto = busqueda === '' || 
        descLimpia.toLowerCase().includes(busqueda.toLowerCase()) || 
        t.category.toLowerCase().includes(busqueda.toLowerCase());
      return pasaMes && pasaTexto;
    });
  }, [transacciones, mesSeleccionado, busqueda]);

  const statsVariacion = useMemo(() => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const mesPasado = mesActual === 0 ? 11 : mesActual - 1;

    const totalActual = transacciones
      .filter(t => new Date(t.transaction_date).getMonth() === mesActual && !t.description.startsWith('[Tarjeta-') && t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalPasado = transacciones
      .filter(t => new Date(t.transaction_date).getMonth() === mesPasado && !t.description.startsWith('[Tarjeta-') && t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    if (totalPasado === 0) return { porc: "0", subio: true };
    const diff = ((totalActual - totalPasado) / Math.abs(totalPasado)) * 100;
    return { porc: Math.abs(diff).toFixed(1), subio: diff >= 0 };
  }, [transacciones]);

  const porcentajeMeta = useMemo(() => {
    return Math.min(Math.max((balance / metaObjetivo) * 100, 0), 100).toFixed(0);
  }, [balance, metaObjetivo]);

  useEffect(() => {
    let tBalance = 0, tIngresos = 0, tGastos = 0;
    let deudaTarjetas: Record<string, number> = {};

    transaccionesFiltradas.forEach((item: any) => {
      const cantidad = Number(item.amount);
      const esTarjeta = item.description.startsWith('[Tarjeta-');

      if (esTarjeta) {
        const match = item.description.match(/\[Tarjeta-(.+?)\]/);
        if (match && match[1]) {
          const cardId = match[1];
          if (!deudaTarjetas[cardId]) deudaTarjetas[cardId] = 0;
          if (item.type === 'expense') deudaTarjetas[cardId] += cantidad;
          else deudaTarjetas[cardId] = Math.max(0, deudaTarjetas[cardId] - cantidad);
        }
      } else {
        if (item.type === 'income') { tBalance += cantidad; tIngresos += cantidad; }
        else { tBalance -= cantidad; tGastos += cantidad; }
      }
    });

    setBalance(tBalance); setIngresos(tIngresos); setGastos(tGastos);

    if (tarjetas.length > 0) {
      setTarjetas(prev => prev.map(t => ({
        ...t,
        gastado: deudaTarjetas[t.id.toString()] || 0
      })));
    }
  }, [transaccionesFiltradas]);

  const cargarDatos = (id: string) => {
    fetch(`https://wealthsync-backend-d0y9.onrender.com/api/v1/transactions/${id}`)      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTransacciones(data); })
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    if (!token || !storedUserId) router.push('/login');
    else { setNombre(userName || 'Usuario'); setUserId(storedUserId); cargarDatos(storedUserId); }
  }, [router]);

  const handleGuardarTarjeta = (e: React.FormEvent) => {
    e.preventDefault();
    const tarjetaCreada = {
      id: Date.now(),
      nombre: nuevaTarjeta.nombre,
      limite: Number(nuevaTarjeta.limite),
      gastado: 0,
      corte: nuevaTarjeta.corte,
      pago: nuevaTarjeta.pago,
      color: nuevaTarjeta.color
    };
    const nuevasTarjetas = [...tarjetas, tarjetaCreada];
    setTarjetas(nuevasTarjetas);
    localStorage.setItem('wealthsync_tarjetas', JSON.stringify(nuevasTarjetas));
    setMostrarModalTarjeta(false);
    setNuevaTarjeta({ nombre: '', limite: '', corte: '', pago: '', color: 'from-slate-700 to-slate-900' });
  };

  const liquidarTarjeta = async (tarjeta: any) => {
    if (tarjeta.gastado <= 0) {
      alert(`¡Felicidades! 🎉 Tu ${tarjeta.nombre} ya está en ceros.`);
      return;
    }
    if (!confirm(`¿Quieres liquidar la deuda de ${formatCurrency(tarjeta.gastado)} de tu ${tarjeta.nombre}? Esto se restará de tu Patrimonio Actual.`)) return;

await fetch('https://wealthsync-backend-d0y9.onrender.com/api/v1/transactions', {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount: tarjeta.gastado, type: 'expense', category: 'Pago de Tarjeta', description: `Pago a ${tarjeta.nombre}` })
    });

    await fetch('https://wealthsync-backend-d0y9.onrender.com/api/v1/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount: tarjeta.gastado, type: 'income', category: 'Pago de Tarjeta', description: `[Tarjeta-${tarjeta.id}] Liquidación de mes` })
    });

    cargarDatos(userId);
  };

  const eliminarTarjeta = (idBorrar: number) => {
    if(!confirm("¿Borrar esta tarjeta de tu catálogo? Sus deudas quedarán en el historial.")) return;
    const filtradas = tarjetas.filter(t => t.id !== idBorrar);
    setTarjetas(filtradas);
    localStorage.setItem('wealthsync_tarjetas', JSON.stringify(filtradas));
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const fechaReporte = new Date().toLocaleDateString();
    const nombreMes = mesSeleccionado === -1 ? 'HISTORIAL COMPLETO' : LISTA_MESES.find(m => m.val === mesSeleccionado)?.nombre.toUpperCase();

    doc.setFontSize(22); doc.setTextColor(59, 130, 246); doc.text('InnovaCodeHub', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.setFont("helvetica", "normal");
    doc.text(`ESTADO DE CUENTA: ${nombreMes}`, 14, 28); doc.text(`FECHA DE EMISIÓN: ${fechaReporte}`, 14, 33);

    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.text(`BALANCE: ${formatCurrency(balance)}`, 14, 48);
    doc.setTextColor(16, 185, 129); doc.text(`INGRESOS: ${formatCurrency(ingresos)}`, 14, 55);
    doc.setTextColor(239, 68, 68); doc.text(`GASTOS: ${formatCurrency(gastos)}`, 14, 62);

    const filas = transaccionesFiltradas.map(t => [
      new Date(t.transaction_date).toLocaleDateString(), 
      t.description.replace(/\[Tarjeta-\d+\]\s*/, ''),
      t.category.toUpperCase(), 
      t.type === 'income' ? `+ ${t.amount}` : `- ${t.amount}`
    ]);
    autoTable(doc, { startY: 72, head: [['FECHA', 'DESCRIPCIÓN', 'CATEGORÍA', 'MONTO']], body: filas, headStyles: { fillColor: [59, 130, 246] }, styles: { fontSize: 9 }, alternateRowStyles: { fillColor: [248, 250, 252] } });
    doc.save(`InnovaCodeHub_Reporte_${nombreMes}.pdf`);
  };

  // 👇 FUNCIÓN CON MODO DEBUG CORREGIDA 👇
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editandoId ? `https://wealthsync-backend-d0y9.onrender.com/api/v1/transactions/${editandoId}` : 'https://wealthsync-backend-d0y9.onrender.com/api/v1/transactions';
            const descFinal = metodoPago === 'efectivo' ? descripcion : `[Tarjeta-${metodoPago}] ${descripcion}`;

      const res = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount: Number(monto), type: tipo, category: categoria, description: descFinal })
      });
      
      if (res.ok) { 
        setMostrarModal(false); setEditandoId(null); setMonto(''); setCategoria(''); setDescripcion(''); setMetodoPago('efectivo');
        cargarDatos(userId); 
      } else {
        const errorData = await res.text();
        alert(`Error del Backend (${res.status}): ${errorData}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de Red: No se pudo conectar con el Backend. ¿Está encendido el servidor?");
    }
  };

  const eliminarMovimiento = async (id: string) => {
    if (!confirm("¿Eliminar registro?")) return;
   await fetch(`https://wealthsync-backend-d0y9.onrender.com/api/v1/transactions/${id}`, { method: 'DELETE' });
       cargarDatos(userId);
  };

  const prepararEdicion = (t: any) => {
    setEditandoId(t.id); setMonto(t.amount.toString()); setTipo(t.type); setCategoria(t.category); 
    const match = t.description.match(/\[Tarjeta-(.+?)\]\s*(.*)/);
    if (match) { setMetodoPago(match[1]); setDescripcion(match[2]); } 
    else { setMetodoPago('efectivo'); setDescripcion(t.description); }
    setMostrarModal(true);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="p-4 md:p-10 min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
        <div className="max-w-5xl mx-auto pb-24">
          
          {/* HEADER RESPONSIVO */}
          <div className="flex flex-col mb-10 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 w-full">
              <img src="/logo.png" alt="InnovaCodeHub" className="w-20 h-20 md:w-16 md:h-16 object-contain hover:scale-105 transition-transform" />
              
              <div className="flex flex-col w-full items-center md:items-start">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-3 md:mb-1">Filtros & Opciones</span>
                <div className="flex gap-2 flex-wrap justify-center md:justify-start w-full">
                  
                  <div className="relative w-full md:w-auto mb-2 md:mb-0">
                    <input 
                      type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 md:py-2 text-slate-600 dark:text-slate-200 font-bold text-sm outline-none shadow-sm focus:border-blue-400 transition-all w-full md:w-64"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 md:top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(Number(e.target.value))} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 md:py-2 text-slate-600 dark:text-slate-200 font-bold text-sm outline-none shadow-sm cursor-pointer hover:border-blue-300 transition-all flex-1 md:flex-none">
                      {LISTA_MESES.map(m => <option key={m.val} value={m.val}>{m.nombre}</option>)}
                    </select>
                    
                    <button onClick={exportarPDF} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 px-4 py-3 md:py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex-1 md:flex-none">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> PDF
                    </button>

                    <button onClick={toggleModoOscuro} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 md:p-2.5 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all text-slate-500 dark:text-yellow-400" title="Alternar Tema">
                      {isDarkMode ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                      )}
                    </button>

                    <button onClick={handleLogout} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 md:p-2.5 rounded-xl shadow-sm hover:scale-110 hover:text-rose-500 dark:hover:text-rose-400 active:scale-95 transition-all text-slate-400 dark:text-slate-500" title="Cerrar Sesión">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BALANCE PROTAGONISTA 🏦 */}
          <div className="mb-10">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100/40 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden group transition-colors">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 dark:bg-slate-700 rounded-full blur-3xl opacity-60"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-4 inline-block shadow-sm">Patrimonio Actual (Efectivo)</span>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white">{formatCurrency(balance)}</h2>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm shadow-sm ${statsVariacion.subio ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                    <svg className={`w-5 h-5 transition-transform ${statsVariacion.subio ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <span>{statsVariacion.subio ? '+' : '-'}{statsVariacion.porc}%</span>
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold tracking-tight uppercase">vs mes pasado</p>
                </div>
              </div>
            </div>
          </div>

          {/* META CONFIGURABLE */}
          <div className="mb-10">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 group transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">Tu Objetivo</span>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                      Meta: {metaNombre}
                    </h3>
                    <button onClick={() => setMostrarModalMeta(true)} className="text-slate-300 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all p-1" title="Configurar meta">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </div>
                <p className="text-3xl md:text-2xl font-black text-blue-600 dark:text-blue-400">{porcentajeMeta}%</p>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg transition-all duration-1000" style={{ width: `${porcentajeMeta}%` }}></div>
              </div>
              <div className="flex justify-between text-xs md:text-sm font-bold">
                <span className="text-slate-800 dark:text-slate-200">{formatCurrency(balance)} / {formatCurrency(metaObjetivo)}</span>
                <span className="text-slate-400 dark:text-slate-500 italic">Faltan {formatCurrency(Math.max(metaObjetivo - balance, 0))}</span>
              </div>
            </div>
          </div>

          {/* 💳 SECCIÓN DE TARJETAS DE CRÉDITO */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Mis Tarjetas
              </h3>
              <button onClick={() => setMostrarModalTarjeta(true)} className="w-full md:w-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all bg-blue-50 dark:bg-blue-900/30 px-4 py-3 md:py-2 rounded-xl text-center">
                + Agregar Tarjeta
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tarjetas.length === 0 && <p className="text-slate-400 italic">No tienes tarjetas registradas.</p>}
              
              {tarjetas.map(tarjeta => {
                const limiteAlcanzado = tarjeta.gastado > tarjeta.limite;
                return (
                  <div key={tarjeta.id} className={`p-6 md:p-8 rounded-[2rem] shadow-xl text-white bg-gradient-to-br ${tarjeta.color} relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ${limiteAlcanzado ? 'border-4 border-rose-500 shadow-rose-500/50' : ''}`}>
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6 md:mb-8">
                        <div>
                          <p className="text-lg font-black tracking-widest opacity-90">{tarjeta.nombre}</p>
                          {limiteAlcanzado && <span className="px-2 py-1 mt-1 inline-block bg-rose-500 rounded text-xs font-bold animate-pulse">LÍMITE EXCEDIDO</span>}
                        </div>
                        <button onClick={() => eliminarTarjeta(tarjeta.id)} className="md:opacity-0 md:group-hover:opacity-100 hover:text-rose-300 transition-all p-1" title="Eliminar Tarjeta">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>

                      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Deuda Actual</p>
                          <p className={`text-3xl md:text-4xl font-black tracking-tighter ${limiteAlcanzado ? 'text-rose-200' : ''}`}>{formatCurrency(tarjeta.gastado)}</p>
                        </div>
                        {tarjeta.gastado > 0 && (
                          <button onClick={() => liquidarTarjeta(tarjeta)} className="text-[10px] uppercase tracking-widest font-black bg-white/20 hover:bg-white/40 active:scale-95 transition-all px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm border border-white/30 text-white w-full md:w-auto">
                            Liquidar Deuda
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Línea: {formatCurrency(tarjeta.limite)}</p>
                          <p className={`text-xs md:text-sm font-bold ${limiteAlcanzado ? 'text-rose-400' : 'text-emerald-300'}`}>Disp: {formatCurrency(Math.max(0, tarjeta.limite - tarjeta.gastado))}</p>
                        </div>
                        <div className="text-right border-l border-white/20 pl-4">
                          <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Corte: Día {tarjeta.corte}</p>
                          <p className="text-xs md:text-sm font-black text-rose-300">Pago: Día {tarjeta.pago}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRÁFICAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 h-80 transition-colors">
              <h3 className="font-bold mb-6 text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest text-center md:text-left">Gastos por Categoría</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={Object.values(transaccionesFiltradas.reduce((acc: any, t: any) => { if (t.type === 'expense') { if (!acc[t.category]) acc[t.category] = { name: t.category, value: 0 }; acc[t.category].value += Number(t.amount); } return acc; }, {}))} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {COLORS.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 h-80 transition-colors">
              <h3 className="font-bold mb-6 text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest text-center md:text-left">Ingresos vs Gastos</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Flujo', ingresos, gastos}]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff' }} />
                  <Bar dataKey="ingresos" fill="#10b981" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="gastos" fill="#ef4444" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 📱 TABLA HISTORIAL RESPONSIVA */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Historial Reciente</h3>
              {busqueda !== '' && (
                <span className="text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">{transaccionesFiltradas.length} resultados</span>
              )}
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[650px]">
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {transaccionesFiltradas.slice(0, 10).map((t: any) => {
                    const esTarjeta = t.description.startsWith('[Tarjeta-');
                    const descLimpia = t.description.replace(/\[Tarjeta-\d+\]\s*/, '');
                    const nombreTarjeta = esTarjeta ? tarjetas.find(tar => tar.id.toString() === t.description.match(/\[Tarjeta-(\d+)\]/)?.[1])?.nombre || 'Tarjeta' : null;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all group">
                        <td className="px-6 py-4 md:px-8 md:py-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                            <p className="font-bold text-slate-700 dark:text-slate-200">{descLimpia}</p>
                            {esTarjeta && <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded uppercase tracking-wider w-max">💳 {nombreTarjeta}</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mt-1">{t.category}</p>
                        </td>
                        <td className="px-6 py-4 md:px-8 md:py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">{new Date(t.transaction_date).toLocaleDateString()}</td>
                        <td className={`px-6 py-4 md:px-8 md:py-6 font-black text-right text-lg ${t.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>{t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}</td>
                        <td className="px-6 py-4 md:px-8 md:py-6 text-center">
                          <div className="flex justify-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                            <button onClick={() => prepararEdicion(t)} className="p-2 md:p-3 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all" title="Editar"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            <button onClick={() => eliminarMovimiento(t.id)} className="p-2 md:p-3 rounded-xl text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all" title="Borrar"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
<div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/50 flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
              © 2026 InnovaCodeHub. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold">
              <Link href="/Terminos" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                Términos y Condiciones
              </Link>
              <span>|</span>
              <Link href="/privacidad" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                Aviso de Privacidad
              </Link>
            </div>
          </div>
          {/* 👆 FIN DEL FOOTER LEGAL 👆 */}

        {/* ➕ BOTÓN FLOTANTE */}
        <button onClick={() => { setEditandoId(null); setMonto(''); setCategoria(''); setDescripcion(''); setMostrarModal(true); }} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.5)] flex items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 z-40">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
        </button>

        {/* MODAL TRANSACCIONES */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-center dark:text-white">{editandoId ? 'Actualizar' : 'Nuevo Registro'}</h3>
              <form onSubmit={handleGuardar} className="space-y-4">
                <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none bg-slate-50 dark:bg-slate-900 dark:text-white font-bold focus:border-blue-500 transition-colors" placeholder="Monto $" />
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none bg-slate-50 dark:bg-slate-900 dark:text-white font-bold focus:border-blue-500 transition-colors">
                  <option value="income">( + ) Ingreso</option>
                  <option value="expense">( - ) Gasto</option>
                </select>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none bg-slate-50 dark:bg-slate-900 dark:text-white font-bold focus:border-blue-500 transition-colors cursor-pointer">
                  <option value="efectivo">💵 Efectivo / Débito (Patrimonio)</option>
                  {tarjetas.map(t => (
                    <option key={t.id} value={t.id}>💳 {t.nombre} (Disp: {formatCurrency(Math.max(0, t.limite - t.gastado))})</option>
                  ))}
                </select>
                <input type="text" required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none bg-slate-50 dark:bg-slate-900 dark:text-white font-bold focus:border-blue-500 transition-colors" placeholder="Categoría (Ej. Comida)" />
                <input type="text" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none bg-slate-50 dark:bg-slate-900 dark:text-white font-bold focus:border-blue-500 transition-colors" placeholder="Descripción" />
                <div className="pt-4 md:pt-6 flex flex-col gap-3">
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all">Guardar Movimiento</button>
                  <button type="button" onClick={() => setMostrarModal(false)} className="w-full bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 py-3 md:py-4 rounded-xl md:rounded-2xl font-black active:scale-95 transition-all hover:bg-slate-100 dark:hover:bg-slate-600">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CONFIGURAR META */}
        {mostrarModalMeta && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-center text-slate-800 dark:text-white">Tu Objetivo</h3>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">¿Qué quieres lograr?</label>
                <input type="text" value={metaNombre} onChange={(e) => setMetaNombre(e.target.value)} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-black text-slate-700 dark:text-white dark:bg-slate-900 focus:border-blue-500 transition-colors" placeholder="Ej. Nueva Laptop" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Monto Objetivo ($)</label>
                <input type="number" value={metaObjetivo} onChange={(e) => setMetaObjetivo(Number(e.target.value))} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-black text-slate-700 dark:text-white dark:bg-slate-900 focus:border-blue-500 transition-colors" /></div>
                <div className="pt-4 md:pt-6 flex flex-col gap-3">
                  <button onClick={guardarMetaConfigurada} className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95">Actualizar Meta</button>
                  <button onClick={() => setMostrarModalMeta(false)} className="w-full bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 py-3 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-600 transition-all active:scale-95">Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA AGREGAR NUEVA TARJETA */}
        {mostrarModalTarjeta && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black mb-6 text-center text-slate-800 dark:text-white">Nueva Tarjeta</h3>
              <form onSubmit={handleGuardarTarjeta} className="space-y-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Banco / Nombre</label>
                <input required type="text" value={nuevaTarjeta.nombre} onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, nombre: e.target.value})} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 dark:text-white dark:bg-slate-900 focus:border-blue-500 transition-colors" placeholder="Ej. Nu, Santander..." /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Línea de Crédito ($)</label>
                <input required type="number" value={nuevaTarjeta.limite} onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, limite: e.target.value})} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 dark:text-white dark:bg-slate-900 focus:border-blue-500 transition-colors" placeholder="Ej. 15000" /></div>
                <div className="flex gap-4">
                  <div className="flex-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Día Corte</label>
                  <input required type="number" min="1" max="31" value={nuevaTarjeta.corte} onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, corte: e.target.value})} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 dark:text-white dark:bg-slate-900 focus:border-blue-500 transition-colors" placeholder="Ej. 15" /></div>
                  <div className="flex-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Día Pago</label>
                  <input required type="number" min="1" max="31" value={nuevaTarjeta.pago} onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, pago: e.target.value})} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 dark:text-white dark:bg-slate-900 focus:border-blue-500 transition-colors" placeholder="Ej. 04" /></div>
                </div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Color</label>
                <select value={nuevaTarjeta.color} onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, color: e.target.value})} className="w-full border-2 border-slate-100 dark:border-slate-700 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 dark:text-white dark:bg-slate-900 focus:border-blue-500 transition-colors cursor-pointer">
                  <option value="from-slate-700 to-slate-900">⚫ Negro Clásico</option><option value="from-blue-600 to-blue-900">🔵 Azul Corporativo</option><option value="from-purple-600 to-purple-800">🟣 Morado Tech</option><option value="from-red-500 to-red-700">🔴 Rojo Fuego</option><option value="from-emerald-500 to-emerald-700">🟢 Verde Esmeralda</option>
                </select></div>
                <div className="pt-4 md:pt-6 flex flex-col gap-3">
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95">Guardar Tarjeta</button>
                  <button type="button" onClick={() => setMostrarModalTarjeta(false)} className="w-full bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 py-3 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-600 transition-all active:scale-95">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}