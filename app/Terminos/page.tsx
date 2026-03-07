"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function TerminosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-6 md:p-12 font-sans transition-colors duration-500">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
        
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-bold text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver
        </button>

        <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">Términos y Condiciones</h1>
        <p className="text-sm text-slate-500 mb-10 font-medium">Última actualización: 05 de marzo de 2026</p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          
          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">1. Introducción</h2>
            <p>Bienvenido a <strong>WealthSync</strong>, una plataforma digital desarrollada y operada por <strong>InnovaCodeHub</strong> (en adelante, "La Empresa", "Nosotros" o "Nuestro"). Los presentes Términos y Condiciones regulan el acceso y uso de nuestra aplicación web y móvil. Al acceder, registrarse o utilizar WealthSync, usted acepta estar legalmente vinculado por estos términos. Si no está de acuerdo, le rogamos que no utilice la plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">2. Uso Permitido de la Plataforma</h2>
            <p>WealthSync es una herramienta de gestión financiera personal diseñada para permitir al Usuario:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Registrar de manera manual ingresos, gastos y deudas.</li>
              <li>Visualizar estadísticas, gráficos y resúmenes de su comportamiento financiero.</li>
              <li>Establecer metas de ahorro y monitorear su progreso.</li>
              <li>Generar y exportar reportes en formato PDF.</li>
            </ul>
            <p className="mt-2">Queda estrictamente prohibido utilizar la Plataforma para fines ilícitos, fraudulentos, o para introducir código malicioso que altere su funcionamiento.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">3. Descargo de Responsabilidad Financiera (Disclaimer)</h2>
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <p className="font-bold text-amber-800 dark:text-amber-200">InnovaCodeHub y WealthSync NO son instituciones financieras, bancos, casas de bolsa ni asesores financieros regulados.</p>
              <p className="mt-2 text-amber-700 dark:text-amber-300">La Plataforma es exclusivamente una herramienta tecnológica de registro e información. Ningún dato generado debe interpretarse como asesoría de inversión o recomendación financiera. El Usuario es el único responsable de las decisiones económicas que tome basándose en la información visualizada.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">4. Propiedad Intelectual</h2>
            <p>Todos los derechos de propiedad intelectual sobre el código fuente, diseño, logotipos, interfaces, bases de datos y algoritmos de WealthSync son propiedad exclusiva de InnovaCodeHub. Se prohíbe la reproducción o modificación sin el consentimiento previo.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">5. Legislación Aplicable y Jurisdicción</h2>
            <p>Este acuerdo se rige e interpreta de acuerdo con las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten expresamente a la jurisdicción y competencia de los tribunales de la ciudad de Puebla, México.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">6. Contacto</h2>
            <p>Para dudas, quejas o sugerencias, póngase en contacto a través de: <strong>jc.media.mgt@gmail.com</strong></p>
          </section>

        </div>
      </div>
    </div>
  );
}