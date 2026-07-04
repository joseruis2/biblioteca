import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/shared/AdminLayout';
import { getDashboard } from '../../api/dashboardApi';

const ESTADO_STYLE = {
    ACTIVO:   { bg:'#eff6ff', color:'#2563eb' },
    DEVUELTO: { bg:'#f0fdf4', color:'#16a34a' },
    VENCIDO:  { bg:'#fef2f2', color:'#dc2626' },
};

export default function Dashboard() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getDashboard()
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <AdminLayout title="Dashboard">
            <div style={{ textAlign:'center', padding:'3rem', color:'#94a3b8' }}>
                ⏳ Cargando dashboard...
            </div>
        </AdminLayout>
    );

    const { stats, prestamos_recientes, libros_mas_prestados, reservas_recientes } = data;

    const tarjetas = [
        { label:'Libros',             valor: stats.total_libros,        icon:'📚', color:'#6366f1', bg:'#eef2ff',  link:'/admin/libros'    },
        { label:'Socios',             valor: stats.total_socios,        icon:'👥', color:'#0891b2', bg:'#e0f2fe',  link:'/admin/usuarios'  },
        { label:'Préstamos activos',  valor: stats.prestamos_activos,   icon:'🔄', color:'#2563eb', bg:'#eff6ff',  link:'/admin/prestamos' },
        { label:'Préstamos vencidos', valor: stats.prestamos_vencidos,  icon:'⚠️', color:'#dc2626', bg:'#fef2f2',  link:'/admin/prestamos' },
        { label:'Reservas pendientes',valor: stats.reservas_pendientes, icon:'📅', color:'#d97706', bg:'#fef3c7',  link:'/admin/reservas'  },
        { label:'Multas pendientes',  valor: stats.multas_pendientes,   icon:'💰', color:'#7c3aed', bg:'#ede9fe',  link:'/admin/multas'    },
    ];

    const diasRestantes = (fecha) => {
        const diff = Math.ceil(
            (new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return diff;
    };

    return (
        <AdminLayout title="Dashboard">
            <style>{`
                .dash-bienvenida{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:1.5rem 2rem;color:#fff;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
                .dash-bienvenida h2{font-size:1.25rem;font-weight:800;margin:0 0 .3rem}
                .dash-bienvenida p{font-size:.875rem;opacity:.85;margin:0}
                .dash-bienvenida-badge{background:rgba(255,255,255,.15);padding:.5rem 1rem;border-radius:10px;font-size:.85rem;font-weight:600}
                .dash-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.85rem;margin-bottom:1.5rem}
                .dash-stat{background:#fff;border-radius:14px;padding:1.1rem 1.25rem;border:1px solid #f1f5f9;cursor:pointer;transition:box-shadow .15s,transform .15s}
                .dash-stat:hover{box-shadow:0 4px 20px rgba(0,0,0,.08);transform:translateY(-2px)}
                .dash-stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem}
                .dash-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem}
                .dash-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.25rem}
                .dash-stat-value{font-size:1.75rem;font-weight:800;color:#0f172a;line-height:1}
                .dash-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
                .dash-card{background:#fff;border-radius:14px;border:1px solid #f1f5f9;overflow:hidden}
                .dash-card-head{padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between}
                .dash-card-title{font-size:.875rem;font-weight:700;color:#0f172a}
                .dash-card-link{font-size:.75rem;color:#6366f1;font-weight:600;cursor:pointer;background:none;border:none;padding:0}
                .dash-card-link:hover{text-decoration:underline}
                .dash-card-body{padding:.5rem 0}
                .dash-row{display:flex;align-items:center;justify-content:space-between;padding:.65rem 1.25rem;border-bottom:1px solid #f8fafc}
                .dash-row:last-child{border-bottom:none}
                .dash-row:hover{background:#fafafa}
                .dash-row-left{flex:1;min-width:0}
                .dash-row-title{font-size:.82rem;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .dash-row-sub{font-size:.75rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .badge-estado{display:inline-block;padding:.15rem .55rem;border-radius:5px;font-size:.7rem;font-weight:700}
                .badge-dias-ok{background:#f0fdf4;color:#16a34a;padding:.15rem .55rem;border-radius:5px;font-size:.7rem;font-weight:600}
                .badge-dias-warn{background:#fef3c7;color:#d97706;padding:.15rem .55rem;border-radius:5px;font-size:.7rem;font-weight:600}
                .badge-dias-out{background:#fef2f2;color:#dc2626;padding:.15rem .55rem;border-radius:5px;font-size:.7rem;font-weight:600}
                .dash-empty{padding:2rem;text-align:center;color:#94a3b8;font-size:.82rem}
                .dash-bar-wrap{padding:.75rem 1.25rem;border-bottom:1px solid #f8fafc}
                .dash-bar-wrap:last-child{border-bottom:none}
                .dash-bar-top{display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.4rem}
                .dash-bar-titulo{font-weight:600;color:#0f172a;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-right:.5rem}
                .dash-bar-num{font-weight:700;color:#6366f1}
                .dash-bar{height:6px;background:#f1f5f9;border-radius:4px;overflow:hidden}
                .dash-bar-fill{height:100%;background:#6366f1;border-radius:4px;transition:width .4s}
                .dash-multa{background:#fef3c7;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem}
                .dash-multa-label{font-size:.82rem;font-weight:600;color:#92400e}
                .dash-multa-valor{font-size:1.25rem;font-weight:800;color:#d97706}
                @media(max-width:768px){.dash-grid{grid-template-columns:1fr}}
            `}</style>

            {/* Bienvenida */}
            <div className="dash-bienvenida">
                <div>
                    <h2>📚 Panel de control</h2>
                    <p>Resumen general del sistema de biblioteca</p>
                </div>
                <div className="dash-bienvenida-badge">
                    {new Date().toLocaleDateString('es-PE', {
                        weekday:'long', day:'numeric', month:'long', year:'numeric'
                    })}
                </div>
            </div>

            {/* Alerta multas */}
            {stats.multas_monto > 0 && (
                <div className="dash-multa">
                    <div>
                        <div className="dash-multa-label">💰 Multas pendientes de cobro</div>
                        <div style={{ fontSize:'.75rem', color:'#92400e', marginTop:'.2rem' }}>
                            {stats.multas_pendientes} multa(s) sin pagar
                        </div>
                    </div>
                    <div className="dash-multa-valor">
                        S/ {parseFloat(stats.multas_monto).toFixed(2)}
                    </div>
                </div>
            )}

            {/* Stats cards */}
            <div className="dash-stats">
                {tarjetas.map((t, i) => (
                    <div key={i} className="dash-stat" onClick={() => navigate(t.link)}>
                        <div className="dash-stat-top">
                            <div className="dash-stat-icon" style={{ background: t.bg }}>
                                {t.icon}
                            </div>
                        </div>
                        <div className="dash-stat-label">{t.label}</div>
                        <div className="dash-stat-value" style={{ color: t.color }}>{t.valor}</div>
                    </div>
                ))}
            </div>

            {/* Grid inferior */}
            <div className="dash-grid">

                {/* Préstamos recientes */}
                <div className="dash-card">
                    <div className="dash-card-head">
                        <span className="dash-card-title">🔄 Préstamos recientes</span>
                        <button className="dash-card-link" onClick={() => navigate('/admin/prestamos')}>
                            Ver todos →
                        </button>
                    </div>
                    <div className="dash-card-body">
                        {prestamos_recientes.length === 0 ? (
                            <div className="dash-empty">Sin préstamos</div>
                        ) : prestamos_recientes.map(p => {
                            const estStyle = ESTADO_STYLE[p.estado] ?? { bg:'#f1f5f9', color:'#374151' };
                            return (
                                <div key={p.id} className="dash-row">
                                    <div className="dash-row-left">
                                        <div className="dash-row-title">{p.libro}</div>
                                        <div className="dash-row-sub">👤 {p.socio}</div>
                                    </div>
                                    <span className="badge-estado"
                                        style={{ background: estStyle.bg, color: estStyle.color }}>
                                        {p.estado}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reservas pendientes */}
                <div className="dash-card">
                    <div className="dash-card-head">
                        <span className="dash-card-title">📅 Reservas pendientes</span>
                        <button className="dash-card-link" onClick={() => navigate('/admin/reservas')}>
                            Ver todas →
                        </button>
                    </div>
                    <div className="dash-card-body">
                        {reservas_recientes.length === 0 ? (
                            <div className="dash-empty">Sin reservas pendientes</div>
                        ) : reservas_recientes.map(r => {
                            const dias = diasRestantes(r.fecha_expira);
                            return (
                                <div key={r.id} className="dash-row">
                                    <div className="dash-row-left">
                                        <div className="dash-row-title">{r.libro}</div>
                                        <div className="dash-row-sub">👤 {r.socio}</div>
                                    </div>
                                    <span className={
                                        dias > 1 ? 'badge-dias-ok' :
                                        dias === 1 ? 'badge-dias-warn' :
                                        'badge-dias-out'
                                    }>
                                        {dias > 0 ? `${dias}d` : 'Hoy'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Libros más prestados */}
            <div className="dash-card">
                <div className="dash-card-head">
                    <span className="dash-card-title">📊 Libros más prestados</span>
                    <button className="dash-card-link" onClick={() => navigate('/admin/libros')}>
                        Ver catálogo →
                    </button>
                </div>
                <div className="dash-card-body">
                    {libros_mas_prestados.length === 0 ? (
                        <div className="dash-empty">Sin datos aún</div>
                    ) : (() => {
                        const max = libros_mas_prestados[0]?.total ?? 1;
                        return libros_mas_prestados.map((l, i) => (
                            <div key={i} className="dash-bar-wrap">
                                <div className="dash-bar-top">
                                    <span className="dash-bar-titulo">{l.titulo}</span>
                                    <span className="dash-bar-num">{l.total} préstamo(s)</span>
                                </div>
                                <div className="dash-bar">
                                    <div className="dash-bar-fill"
                                        style={{ width: `${(l.total / max) * 100}%` }} />
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

        </AdminLayout>
    );
}