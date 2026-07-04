import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout as logoutApi } from '../../api/authApi';

const menu = [
    {
        section: 'Principal',
        items: [
            { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        ]
    },
    {
        section: 'Catálogo',
        items: [
            { to: '/admin/libros',      icon: '📚', label: 'Libros' },
            { to: '/admin/autores',     icon: '✍️',  label: 'Autores' },
            { to: '/admin/categorias',  icon: '🏷️',  label: 'Categorías' },
        ]
    },
    {
        section: 'Circulación',
        items: [
            { to: '/admin/prestamos',  icon: '🔄', label: 'Préstamos' },
            { to: '/admin/reservas',   icon: '📅', label: 'Reservas' },
            { to: '/admin/multas',     icon: '💰', label: 'Multas' },
        ]
    },
    {
        section: 'Administración',
        items: [
            { to: '/admin/usuarios', icon: '👥', label: 'Usuarios' },
        ]
    },
];

export default function AdminLayout({ children, title }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logoutApi();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const inicial = user?.nombre?.[0]?.toUpperCase() ?? 'A';

    return (
        <>
            <style>{`
                .adm-wrap { display:flex; min-height:100vh; font-family:'Segoe UI',sans-serif; background:#f1f5f9; }

                /* ── Sidebar ── */
                .adm-sidebar {
                    width: 240px;
                    background: #1e1b4b;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0; left: 0;
                    height: 100vh;
                    z-index: 100;
                    transition: transform .25s ease;
                }
                .adm-sidebar.closed { transform: translateX(-100%); }
                .adm-brand {
                    height: 60px;
                    display: flex;
                    align-items: center;
                    gap: .75rem;
                    padding: 0 1.25rem;
                    border-bottom: 1px solid #312e81;
                    flex-shrink: 0;
                }
                .adm-brand-icon {
                    width: 34px; height: 34px;
                    background: #6366f1;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.1rem;
                }
                .adm-brand-name { color:#fff; font-weight:700; font-size:.95rem; }
                .adm-nav { flex:1; overflow-y:auto; padding:.75rem 0; }
                .adm-section {
                    font-size:.65rem; font-weight:700;
                    letter-spacing:.08em; text-transform:uppercase;
                    color:#6366f1; padding:.75rem 1.25rem .3rem;
                }
                .adm-nav a {
                    display:flex; align-items:center; gap:.7rem;
                    padding:.5rem 1.25rem;
                    color:#a5b4fc; text-decoration:none;
                    font-size:.85rem;
                    border-radius:0;
                    transition: background .15s, color .15s;
                }
                .adm-nav a:hover { background:#312e81; color:#fff; }
                .adm-nav a.active { background:#6366f1; color:#fff; }
                .adm-nav-icon { font-size:1rem; width:20px; text-align:center; }
                .adm-footer {
                    padding:.85rem 1.25rem;
                    border-top:1px solid #312e81;
                    display:flex; align-items:center; gap:.65rem;
                    flex-shrink:0;
                }
                .adm-avatar {
                    width:32px; height:32px; border-radius:50%;
                    background:#6366f1;
                    display:flex; align-items:center; justify-content:center;
                    font-size:.8rem; font-weight:700; color:#fff;
                    flex-shrink:0;
                }
                .adm-user-name { color:#e0e7ff; font-size:.8rem; font-weight:600; }
                .adm-user-rol  { color:#6366f1; font-size:.7rem; }
                .adm-logout {
                    margin-left:auto;
                    background:none; border:none; cursor:pointer;
                    color:#a5b4fc; font-size:1.1rem; padding:0;
                    transition: color .15s;
                }
                .adm-logout:hover { color:#f87171; }

                /* ── Main ── */
                .adm-main { margin-left:240px; flex:1; display:flex; flex-direction:column; min-height:100vh; }

                /* ── Topbar ── */
                .adm-topbar {
                    height:60px; background:#fff;
                    border-bottom:1px solid #e2e8f0;
                    display:flex; align-items:center;
                    padding:0 1.5rem; gap:1rem;
                    position:sticky; top:0; z-index:50;
                }
                .adm-topbar-title { font-weight:700; font-size:1rem; color:#0f172a; flex:1; }
                .adm-toggle {
                    display:none; background:none; border:1px solid #e2e8f0;
                    border-radius:6px; padding:.3rem .5rem; cursor:pointer;
                    font-size:1.1rem;
                }

                /* ── Content ── */
                .adm-content { padding:1.75rem; flex:1; }

                /* ── Overlay ── */
                .adm-overlay {
                    display:none; position:fixed; inset:0;
                    background:rgba(0,0,0,.4); z-index:99;
                }

                /* ── Responsive ── */
                @media(max-width:768px){
                    .adm-sidebar { transform:translateX(-100%); }
                    .adm-sidebar.open { transform:translateX(0); }
                    .adm-main { margin-left:0; }
                    .adm-toggle { display:flex; align-items:center; }
                    .adm-overlay.show { display:block; }
                }
            `}</style>

            <div className="adm-wrap">

                {/* Overlay mobile */}
                <div
                    className={`adm-overlay ${sidebarOpen ? 'show' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* ══ SIDEBAR ══ */}
                <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="adm-brand">
                        <div className="adm-brand-icon">📚</div>
                        <span className="adm-brand-name">Biblioteca</span>
                    </div>

                    <nav className="adm-nav">
                        {menu.map(group => (
                            <div key={group.section}>
                                <div className="adm-section">{group.section}</div>
                                {group.items.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="adm-nav-icon">{item.icon}</span>
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </nav>

                    <div className="adm-footer">
                        <div className="adm-avatar">{inicial}</div>
                        <div>
                            <div className="adm-user-name">{user?.nombre}</div>
                            <div className="adm-user-rol">{user?.rol}</div>
                        </div>
                        <button className="adm-logout" onClick={handleLogout} title="Cerrar sesión">
                            🚪
                        </button>
                    </div>
                </aside>

                {/* ══ MAIN ══ */}
                <div className="adm-main">
                    <header className="adm-topbar">
                        <button
                            className="adm-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>
                        <span className="adm-topbar-title">{title}</span>
                        <span style={{
                            background:'#f0fdf4', color:'#16a34a',
                            border:'1px solid #bbf7d0',
                            padding:'.25rem .75rem', borderRadius:'20px',
                            fontSize:'.75rem', fontWeight:600,
                        }}>
                            ● En línea
                        </span>
                        <span style={{ fontSize:'.8rem', color:'#94a3b8' }}>
                            {new Date().toLocaleDateString('es-PE', { weekday:'short', day:'numeric', month:'short' })}
                        </span>
                    </header>

                    <main className="adm-content">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}