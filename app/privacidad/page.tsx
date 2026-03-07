"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacidadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-6 md:p-12 font-sans transition-colors duration-500">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
        
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-bold text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver
        </button>

        <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">Aviso de Privacidad Integral</h1>
        <p className="text-sm text-slate-500 mb-10 font-medium">Última actualización: 05 de marzo de 2026</p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          
          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">1. Identidad del Responsable</h2>
            <p><strong>InnovaCodeHub</strong>, creador de la plataforma <strong>WealthSync</strong>, asume la responsabilidad del tratamiento y protección de sus datos personales, en estricto cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">2. Datos Personales Recopilados</h2>
            <p>Para llevar a cabo las finalidades descritas, recabaremos:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Datos de Identificación:</strong> Nombre, seudónimo y correo electrónico.</li>
              <li><strong>Datos Financieros (Ingresados manualmente):</strong> Registros de ingresos, gastos, saldos en efectivo y límites de tarjetas.</li>
            </ul>
            <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-r-xl">
              <p className="font-bold text-emerald-800 dark:text-emerald-200">Aclaración de Seguridad:</p>
              <p className="text-emerald-700 dark:text-emerald-300">WealthSync NO solicita, no vincula automáticamente con cuentas bancarias, ni almacena números de tarjetas de crédito reales, fechas de vencimiento o códigos CVV.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">3. Finalidad del Tratamiento de Datos</h2>
            <p>Sus datos personales serán utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Creación, autenticación y gestión de su Cuenta.</li>
              <li>Almacenamiento seguro en la nube de su historial de movimientos.</li>
              <li>Procesamiento algorítmico para la generación de gráficas y reportes PDF.</li>
            </ul>
            <p className="mt-2 font-bold text-rose-500">InnovaCodeHub se compromete a NO vender, intercambiar ni compartir sus datos personales a terceros con fines publicitarios.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">4. Derechos ARCO</h2>
            <p>Usted tiene derecho a conocer qué datos personales tenemos (Acceso), solicitar la corrección de su información (Rectificación), que eliminemos su información de nuestras bases de datos (Cancelación), así como oponerse al uso de sus datos para fines específicos (Oposición).</p>
            <p className="mt-2">Para ejercer sus derechos ARCO, envíe una solicitud a: <strong>jc.media.mgt@gmail.com</strong> incluyendo su nombre completo y una descripción clara de la petición.</p>
          </section>

        </div>
      </div>
    </div>
  );
}