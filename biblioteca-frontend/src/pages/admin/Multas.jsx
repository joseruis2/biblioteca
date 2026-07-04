import { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { getMultas, pagarMulta } from '../../api/multasApi';

const ESTADO_STYLE = {
    PENDIENTE: { bg:'#fef3c7', color:'#d97706' },
    PAGADA:    { bg:'#f0fdf4', color:'#16a34a' },
};

export default function MultasAdmin() {
    const [multas,    setMultas]    = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [busqueda,  setBusqueda]  = useState('');
    const [filtroEst, setFiltroEst] = useState('');
    const [pagando,   setPagando]   = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        const res = await getMultas();
        setMultas(res.data.data ?? res.data);
        setLoading(false);
    };

    const handlePagar = async (id) => {
        if (!confirm('¿Confirmar pago de esta multa?')) return;
        setPagando(id);
        try {
            await pagarMulta(id);
            cargar();
        } catch (err) {
            alert(err.response?.data?.message ?? 'Error al pagar');
        } finally {
            setPagando(null);
        }
    };

    const totalPendiente = multas
        .filter(m => m.estado === 'PENDIENTE')
        .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const totalCobrado = multas
        .filter(m => m.estado === 'PAGADA')
        .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const filtradas = multas.filter(m => {
        const socio = m.user?.nombre ?? '';
        const libro = m.prestamo?.libro?.titulo ?? '';
        const matchBusq = socio.toLowerCase().includes(busqueda.toLowerCase()) ||
                          libro.toLowerCase().includes(busqueda.toLowerCase());
        const matchEst  = !filtroEst || m.estado === filtroEst;
        return matchBusq && matchEst;
    });

    return (
        <AdminLayout title="Multas">
            <style>{`
                .mul-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.75rem;margin-bottom:1.5rem}
                .mul-stat{background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #f1f5f9}
                .mul-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.3rem}
                .mul-stat-value{font-size:1.5rem;font-weight:800;color:#0f172a}
                .mul-alerta{background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:.5rem}
                .mul-alerta-left{display:flex;align-items:center;gap:.75rem}
                .mul-alerta-icon{font-size:1.5rem}
                .mul-alerta-texto{font-size:.85rem;font-weight:600;color:#92400e}
                .mul-alerta-sub{font-size:.75rem;color:#a16207;margin-top:.15rem}
                .mul-alerta-monto{font-size:1.35rem;font-weight:800;color:#d97706}
                .mul-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
                .mul-filters{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;flex:1}
                .mul-search{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;max-width:280px;flex:1}
                .mul-search input{border:none;outline:none;font-size:.875rem;background:transparent;width:100%;color:#0f172a}
                .filter-btn{padding:.35rem .85rem;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;font-size:.78rem;font-weight:600;cursor:pointer;color:#64748b;transition:all .15s;white-space:nowrap}
                .filter-btn.active{background:#6366f1;color:#fff;border-color:#6366f1}
                .mul-table-wrap{background:#fff;border-radius:14px;border:1px solid #f1f5f9;overflow:hidden}
                .mul-table{width:100%;border-collapse:collapse}
                .mul-table th{background:#f8fafc;padding:.75rem 1rem;text-align:left;font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #f1f5f9}
                .mul-table td{padding:.85rem 1rem;font-size:.875rem;color:#0f172a;border-bottom:1px solid #f8fafc;vertical-align:middle}
                .mul-table tr:last-child td{border-bottom:none}
                .mul-table tr:hover td{background:#fafafa}
                .badge-estado{display:inline-block;padding:.2rem .7rem;border-radius:6px;font-size:.72rem;font-weight:700}
                .mul-monto-pendiente{font-size:.95rem;font-weight:800;color:#d97706}
                .mul-monto-pagado{font-size:.95rem;font-weight:700;color:#16a34a}
                .mul-actions{display:flex;gap:.4rem}
                .btn-pagar{height:30px;padding:0 .85rem;border-radius:7px;border:1px solid #fde68a;background:#fef3c7;cursor:pointer;display:flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;color:#d97706;transition:all .15s}
                .btn-pagar:hover:not(:disabled){background:#fde68a;border-color:#f59e0b}
                .btn-pagar:disabled{opacity:.6;cursor:not-allowed}
                .mul-empty{text-align:center;padding:3rem;color:#94a3b8}
                .dias-badge{display:inline-block;padding:.15rem .5rem;border-radius:5px;font-size:.72rem;font-weight:600;background:#fef2f2;color:#dc2626}
            `}</style>

            {/* Stats */}
            <div className="mul-stats">
                <div className="mul-stat">
                    <div className="mul-stat-label">Total multas</div>
                    <div className="mul-stat-value">{multas.length}</div>
                </div>
                <div className="mul-stat">
                    <div className="mul-stat-label">Pendientes</div>
                    <div className="mul-stat-value" style={{ color:'#d97706' }}>
                        {multas.filter(m => m.estado === 'PENDIENTE').length}
                    </div>
                </div>
                <div className="mul-stat">
                    <div className="mul-stat-label">Pagadas</div>
                    <div className="mul-stat-value" style={{ color:'#16a34a' }}>
                        {multas.filter(m => m.estado === 'PAGADA').length}
                    </div>
                </div>
                <div className="mul-stat">
                    <div className="mul-stat-label">Total cobrado</div>
                    <div className="mul-stat-value" style={{ color:'#16a34a' }}>
                        S/ {totalCobrado.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Alerta monto pendiente */}
            {totalPendiente > 0 && (
                <div className="mul-alerta">
                    <div className="mul-alerta-left">
                        <span className="mul-alerta-icon">⚠️</span>
                        <div>
                            <div className="mul-alerta-texto">Multas pendientes de cobro</div>
                            <div className="mul-alerta-sub">
                                {multas.filter(m => m.estado === 'PENDIENTE').length} multa(s) sin pagar
                            </div>
                        </div>
                    </div>
                    <div className="mul-alerta-monto">S/ {totalPendiente.toFixed(2)}</div>
                </div>
            )}

            {/* Header + filtros */}
            <div className="mul-header">
                <div className="mul-filters">
                    <div className="mul-search">
                        <span>🔍</span>
                        <input
                            placeholder="Buscar por socio o libro..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button onClick={() => setBusqueda('')}
                                style={{ background:'none',border:'none',cursor:'pointer',color:'#94a3b8' }}>✕</button>
                        )}
                    </div>
                    {['', 'PENDIENTE', 'PAGADA'].map(est => (
                        <button
                            key={est}
                            className={`filter-btn ${filtroEst === est ? 'active' : ''}`}
                            onClick={() => setFiltroEst(est)}
                        >
                            {est === '' ? 'Todas' : est}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla */}
            <div className="mul-table-wrap">
                {loading ? (
                    <div className="mul-empty">⏳ Cargando multas...</div>
                ) : filtradas.length === 0 ? (
                    <div className="mul-empty">
                        <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>💰</div>
                        <div style={{ fontWeight:600 }}>
                            {busqueda || filtroEst ? 'Sin resultados' : 'No hay multas registradas'}
                        </div>
                        <div style={{ fontSize:'.85rem', marginTop:'.35rem', color:'#cbd5e1' }}>
                            {!busqueda && !filtroEst && 'Las multas se generan automáticamente al devolver un libro con retraso'}
                        </div>
                    </div>
                ) : (
                    <table className="mul-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Socio</th>
                                <th>Libro</th>
                                <th>Días retraso</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Fecha pago</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((m, i) => {
                                const estStyle = ESTADO_STYLE[m.estado] ?? { bg:'#f1f5f9', color:'#374151' };
                                return (
                                    <tr key={m.id}>
                                        <td style={{ color:'#94a3b8', fontWeight:600 }}>{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight:600 }}>
                                                {m.user?.nombre ?? '—'}
                                            </div>
                                            {m.user?.numero_socio && (
                                                <div style={{ fontSize:'.75rem', color:'#94a3b8' }}>
                                                    {m.user.numero_socio}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ color:'#64748b', fontSize:'.85rem' }}>
                                            {m.prestamo?.libro?.titulo ?? '—'}
                                        </td>
                                        <td>
                                            <span className="dias-badge">
                                                {m.dias_retraso} día(s)
                                            </span>
                                        </td>
                                        <td>
                                            <span className={
                                                m.estado === 'PENDIENTE'
                                                    ? 'mul-monto-pendiente'
                                                    : 'mul-monto-pagado'
                                            }>
                                                S/ {parseFloat(m.monto).toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge-estado"
                                                style={{ background: estStyle.bg, color: estStyle.color }}>
                                                {m.estado}
                                            </span>
                                        </td>
                                        <td style={{ color:'#64748b', fontSize:'.82rem' }}>
                                            {m.fecha_pago ?? '—'}
                                        </td>
                                        <td>
                                            <div className="mul-actions">
                                                {m.estado === 'PENDIENTE' && (
                                                    <button
                                                        className="btn-pagar"
                                                        onClick={() => handlePagar(m.id)}
                                                        disabled={pagando === m.id}
                                                    >
                                                        {pagando === m.id ? '⏳' : '💳'} Cobrar
                                                    </button>
                                                )}
                                                {m.estado === 'PAGADA' && (
                                                    <span style={{ fontSize:'.78rem', color:'#16a34a', fontWeight:600 }}>
                                                        ✓ Pagado
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {filtradas.length > 0 && (
                <div style={{ fontSize:'.78rem', color:'#94a3b8', marginTop:'.75rem', textAlign:'right' }}>
                    Mostrando {filtradas.length} de {multas.length} multa(s)
                </div>
            )}
        </AdminLayout>
    );
}