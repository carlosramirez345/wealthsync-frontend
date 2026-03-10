"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Le explicamos a TypeScript qué forma tiene una "Suscripción"
interface Subscription {
    id: number;
    name: string;
    amount: string | number;
    due_day: number;
}

const SubscriptionsWidget = () => {
    // 2. Le decimos que 'subs' es un arreglo de Suscripciones
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    const [formData, setFormData] = useState({ name: '', amount: '', due_day: '' });

    // ID de prueba (asegúrate de cambiarlo por el real después)
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : 1;
  
  const fetchSubs = async () => {
        try {
            const res = await axios.get(`https://wealthsync-backend.onrender.com/api/v1/subscriptions/${userId}`);
            setSubs(res.data.subscriptions);
            setTotal(res.data.total);
        } catch (err) {
            console.error("Error al cargar datos", err);
        }
    };

    useEffect(() => { fetchSubs(); }, []);

    // 3. Le decimos que 'e' es un Evento de Formulario de React
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        try {
            await axios.post('https://wealthsync-backend.onrender.com/api/v1/subscriptions', {
                user_id: userId,
                name: formData.name,
                amount: parseFloat(formData.amount),
                due_day: parseInt(formData.due_day)
            });
            setIsModalOpen(false);
            setFormData({ name: '', amount: '', due_day: '' });
            fetchSubs(); 
        } catch (err) {
            alert("Error al guardar tu suscripción.");
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #eaeaea', height: '100%' }}>
            {/* Cabecera del recuadro */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Suscripciones y Gastos Fijos</h3>
                <button onClick={() => setIsModalOpen(true)} style={{ color: '#007AFF', backgroundColor: 'transparent', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                    + Agregar
                </button>
            </div>

            {/* Total destacado */}
            <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Total al mes</p>
                <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#111' }}>${total.toLocaleString('es-MX')}</p>
            </div>

            {/* Lista pequeña */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subs.length === 0 ? (
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>No hay gastos fijos registrados.</p>
                ) : (
                    subs.map(sub => (
                        <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <div>
                                <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{sub.name}</p>
                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Día {sub.due_day}</p>
                            </div>
                            <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>${parseFloat(sub.amount.toString()).toFixed(2)}</p>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL (FORMULARIO FLOTANTE) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '24px', color: '#000' }}>Nuevo gasto fijo</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Ej. Netflix, Gimnasio..." required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '14px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box' }} />
                            <input type="number" placeholder="Monto (Ej. 199.00)" required step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '14px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box' }} />
                            <input type="number" placeholder="Día de cobro (1 al 31)" required min="1" max="31" value={formData.due_day} onChange={(e) => setFormData({...formData, due_day: e.target.value})} style={{ width: '100%', padding: '14px', marginBottom: '25px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', backgroundColor: '#f2f2f7', color: '#000', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionsWidget;