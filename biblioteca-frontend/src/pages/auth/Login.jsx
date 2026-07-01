import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate  = useNavigate();
    const [form, setForm]         = useState({ email: '', password: '' });
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginApi(form);
            login(res.data.token, res.data.user);
            const rol = res.data.user.rol;
            if (rol === 'ADMIN' || rol === 'BIBLIOTECARIO') navigate('/admin/libros');
            else navigate('/socio/libros');
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── Responsive styles ── */}
            <style>{`
                .login-page {
                    display: flex;
                    min-height: 100vh;
                    font-family: 'Segoe UI', sans-serif;
                }
                .login-left {
                    flex: 1;
                    background: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2.5rem;
                }
                .login-right {
                    flex: 1;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .login-input {
                    width: 100%;
                    padding: .65rem .85rem .65rem 2.3rem;
                    border-radius: 8px;
                    border: 1.5px solid #e2e8f0;
                    font-size: .875rem;
                    background: #f8fafc;
                    color: #0f172a;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color .2s;
                }
                .login-input:focus { border-color: #4f46e5; }
                .login-btn {
                    width: 100%;
                    padding: .75rem;
                    background: #4f46e5;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background .2s, opacity .2s;
                }
                .login-btn:hover:not(:disabled) { background: #4338ca; }
                .login-btn:disabled { opacity: .7; cursor: not-allowed; }
                .eye-btn {
                    position: absolute;
                    right: 10px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0;
                    line-height: 1;
                    color: #94a3b8;
                }
                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: .75rem;
                    background: rgba(255,255,255,.12);
                    padding: .7rem 1rem;
                    border-radius: 10px;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .login-page { flex-direction: column; }
                    .login-left { padding: 2.5rem 1.5rem; }
                    .login-right { padding: 1.5rem; }
                    .login-left-inner { max-width: 100%; }
                }
            `}</style>

            <div className="login-page">

                {/* ══ IZQUIERDA ══ */}
                <div className="login-left">
                    <div className="login-left-inner" style={{ maxWidth: '440px', width: '100%', color: '#fff' }}>

                        <div style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>📚</div>

                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 .75rem', lineHeight: 1.2 }}>
                            Sistema de biblioteca
                        </h1>

                        <p style={{ fontSize: '.95rem', opacity: .82, lineHeight: 1.65, margin: '0 0 2rem' }}>
                            Gestiona préstamos, reservas y el catálogo de libros desde un solo lugar.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                            {[
                                ['📖', 'Catálogo de libros'],
                                ['🔄', 'Control de préstamos'],
                                ['📅', 'Sistema de reservas'],
                                ['💰', 'Gestión de multas'],
                            ].map(([icon, text], i) => (
                                <div key={i} className="feature-item">
                                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                                    <span style={{ fontSize: '.9rem', fontWeight: 500 }}>{text}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,.1)',
                            borderRadius: '12px',
                            fontSize: '.8rem',
                            opacity: .85,
                            lineHeight: 1.6,
                        }}>
                            💡 <strong>¿Sabías?</strong> Puedes gestionar hasta 3 préstamos activos por socio y recibir alertas automáticas de vencimiento.
                        </div>
                    </div>
                </div>

                {/* ══ DERECHA ══ */}
                <div className="login-right">
                    <div style={{
                        background: '#fff',
                        borderRadius: '18px',
                        padding: '2.5rem',
                        width: '100%',
                        maxWidth: '420px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 24px rgba(0,0,0,.07)',
                    }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '56px', height: '56px',
                                background: '#eef2ff',
                                borderRadius: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto .85rem',
                                fontSize: '1.6rem',
                            }}>
                                📚
                            </div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 .3rem' }}>
                                Bienvenido
                            </h2>
                            <p style={{ fontSize: '.875rem', color: '#64748b', margin: 0 }}>
                                Inicia sesión en tu cuenta
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                padding: '.75rem 1rem',
                                borderRadius: '8px',
                                fontSize: '.85rem',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '.5rem',
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>
                                    Correo electrónico
                                </label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ position: 'absolute', left: '10px', fontSize: '.95rem', pointerEvents: 'none' }}>✉️</span>
                                    <input
                                        className="login-input"
                                        type="email"
                                        placeholder="admin@biblioteca.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>
                                    Contraseña
                                </label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ position: 'absolute', left: '10px', fontSize: '.95rem', pointerEvents: 'none' }}>🔒</span>
                                    <input
                                        className="login-input"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() => setShowPass(!showPass)}
                                        tabIndex={-1}
                                    >
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-btn"
                                disabled={loading}
                                style={{ marginTop: '.25rem' }}
                            >
                                {loading ? '⏳ Ingresando...' : 'Ingresar →'}
                            </button>
                        </form>

                        {/* Footer */}
                        <div style={{
                            marginTop: '1.75rem',
                            paddingTop: '1.25rem',
                            borderTop: '1px solid #f1f5f9',
                            textAlign: 'center',
                            fontSize: '.75rem',
                            color: '#94a3b8',
                        }}>
                            © 2026 Sistema Biblioteca
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}