"use client"; // <--- ¡Esta línea es obligatoria en Next.js para usar interactividad!

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Subscriptions = () => {
    const [subs, setSubs] = useState([]);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        due_day: ''
    });

    // Simulando que sacamos el ID de tu sesión
    const userId = 1; // Aquí luego pondremos el real de tu login

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

    const handleSubmit = async (e) => {
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
            console.error("Error al guardar", err);
            alert("Hubo un error al guardar tu suscripción.");
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            
            {/* RESUMEN DE GASTOS */}
            <div style={{ textAlign: 'center', marginBottom: '30px', padding: '30px', backgroundColor: '#000', color: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '14px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Gastos fijos este mes</p>
                <h1 style={{ fontSize: '48px', margin: '10px 0', fontWeight: '600' }}>${total.toLocaleString('es-MX')}</h1>
            </div>

            {/* BOTÓN AGREGAR */}
            <button 
                onClick={() => setIsModalOpen(true)}
                style={{ width: '100%', padding: '16px', backgroundColor: '#f2f2f7', color: '#000', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '30px' }}
            >
                + Agregar nueva suscripción
            </button>

            {/* LISTA DE PAGOS */}
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Próximos cobros</h3>
            {subs.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>No hay gastos registrados aún.</p>
            ) : (
                subs.map(sub => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', marginBottom: '12px', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: '600', margin: '0 0 4px 0', fontSize: '16px' }}>{sub.name}</p>
                            <p style={{ fontSize: '13px', color: '#8e8e93', margin: 0 }}>Día {sub.due_day} del mes</p>
                        </div>
                        <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>${parseFloat(sub.amount).toFixed(2)}</p>
                    </div>
                ))
            )}

            {/* MODAL (FORMULARIO FLOTANTE) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '24px', color: '#000' }}>Nuevo gasto</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Ej. Netflix, Gimnasio..." 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                style={{ width: '100%', padding: '14px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box', color: '#000' }}
                            />
                            <input 
                                type="number" 
                                placeholder="Monto (Ej. 199.00)" 
                                required
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                style={{ width: '100%', padding: '14px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box', color: '#000' }}
                            />
                            <input 
                                type="number" 
                                placeholder="Día de cobro (1 al 31)" 
                                required
                                min="1" max="31"
                                value={formData.due_day}
                                onChange={(e) => setFormData({...formData, due_day: e.target.value})}
                                style={{ width: '100%', padding: '14px', marginBottom: '25px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box', color: '#000' }}
                            />
                            
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

export default Subscriptions;