import { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { getReservas, createReserva, cancelarReserva, completarReserva, expirarReserva } from '../../api/reservasApi';
import { getLibros } from '../../api/librosApi';
import { getUsuarios } from '../../api/usuariosApi';

const formInicial = { libro_id: '', user_id: '' };

const ESTADO_STYLE = {
    PENDIENTE:  { bg:'#eff6ff', color:'#2563eb' },
    COMPLETADA: { bg:'#f0fdf4', color:'#16a34a' },
    CANCELADA:  { bg:'#f1f5f9', color:'#64748b' },
    EXPIRADA:   { bg:'#fef2f2', color:'#dc2626' },
};

export default function ReservasAdmin() {
    const [reservas,  setReservas]  = useState([]);
    const [libros,    setLibros]    = useState([]);
    const [usuarios,  setUsuarios]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [busqueda,  setBusqueda]  = useState('');
    const [filtroEst, setFiltroEst] = useState('');
    const [modal,     setModal]     = useState(false);
    const [form,      setForm]      = useState(formInicial);
    const [saving,    setSaving]    = useState(false);
    const [errores,   setErrores]   = useState({});

    useEffect(() => { cargarTodo(); }, []);

    const cargarTodo = async () => {
        setLoading(true);
        const [rRes, lRes, uRes] = await Promise.all([
            getReservas(), getLibros(), getUsuarios()
        ]);
        setReservas(rRes.data.data ?? rRes.data);
        setLibros(lRes.data.data   ?? lRes.data);
        setUsuarios((uRes.data.data ?? uRes.data).filter(u => u.rol === 'SOCIO'));
        setLoading(false);
    };

    const abrirModal = () => {
        setForm(formInicial);
        setErrores({});
        setModal(true);
    };

    const cerrar = () => { setModal(false); setErrores({}); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrores(er => ({ ...er, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrores({});
        try {
            await createReserva({
                libro_id: parseInt(form.libro_id),
                user_id:  parseInt(form.user_id),
            });
            await cargarTodo();
            cerrar();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrores(err.response.data.errors ?? {});
            } else {
                alert(err.response?.data?.message ?? 'Error al crear reserva');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAccion = async (accion, id) => {
        const msgs = {
            completar: '¿Marcar como completada?',
            cancelar:  '¿Cancelar esta reserva?',
            expirar:   '¿Marcar como expirada?',
        };
        if (!confirm(msgs[accion])) return;
        try {
            if (accion === 'completar') await completarReserva(id);
            if (accion === 'cancelar')  await cancelarReserva(id);
            if (accion === 'expirar')   await expirarReserva(id);
            cargarTodo();
        } catch (err) {
            alert(err.response?.data?.message ?? 'Error');
        }
    };

    const diasRestantes = (fechaExpira) => {
        const diff = Math.ceil(
            (new Date(fechaExpira) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return diff;
    };

    const filtrados = reservas.filter(r => {
        const socio = r.user?.nombre ?? r.socio ?? '';
        const libro = r.libro?.titulo ?? r.libro ?? '';
        const matchBusq = socio.toLowerCase().includes(busqueda.toLowerCase()) ||
                          libro.toLowerCase().includes(busqueda.toLowerCase());
        const matchEst  = !filtroEst || r.estado === filtroEst;
        return matchBusq && matchEst;
    });

    return (
        <AdminLayout title="Reservas">
            <style>{`
                .res-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem}
                .res-stat{background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #f1f5f9}
                .res-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.3rem}
                .res-stat-value{font-size:1.5rem;font-weight:800;color:#0f172a}
                .res-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
                .res-filters{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;flex:1}
                .res-search{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;max-width:280px;flex:1}
                .res-search input{border:none;outline:none;font-size:.875rem;background:transparent;width:100%;color:#0f172a}
                .filter-btn{padding:.35rem .85rem;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;font-size:.78rem;font-weight:600;cursor:pointer;color:#64748b;transition:all .15s;white-space:nowrap}
                .filter-btn.active{background:#6366f1;color:#fff;border-color:#6366f1}
                .btn-add{display:flex;align-items:center;gap:.5rem;background:#6366f1;color:#fff;border:none;border-radius:10px;padding:.6rem 1.1rem;font-size:.875rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s}
                .btn-add:hover{background:#4f46e5}
                .res-table-wrap{background:#fff;border-radius:14px;border:1px solid #f1f5f9;overflow:hidden}
                .res-table{width:100%;border-collapse:collapse}
                .res-table th{background:#f8fafc;padding:.75rem 1rem;text-align:left;font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #f1f5f9}
                .res-table td{padding:.85rem 1rem;font-size:.875rem;color:#0f172a;border-bottom:1px solid #f8fafc;vertical-align:middle}
                .res-table tr:last-child td{border-bottom:none}
                .res-table tr:hover td{background:#fafafa}
                .badge-estado{display:inline-block;padding:.2rem .7rem;border-radius:6px;font-size:.72rem;font-weight:700}
                .badge-dias-ok{background:#f0fdf4;color:#16a34a;padding:.2rem .6rem;border-radius:6px;font-size:.72rem;font-weight:600}
                .badge-dias-warn{background:#fef3c7;color:#d97706;padding:.2rem .6rem;border-radius:6px;font-size:.72rem;font-weight:600}
                .badge-dias-out{background:#fef2f2;color:#dc2626;padding:.2rem .6rem;border-radius:6px;font-size:.72rem;font-weight:600}
                .res-actions{display:flex;gap:.4rem;flex-wrap:wrap}
                .btn-icon{height:30px;padding:0 .65rem;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;color:#374151;transition:all .15s;white-space:nowrap}
                .btn-icon:hover{background:#f1f5f9}
                .btn-completar{color:#16a34a} .btn-completar:hover{background:#f0fdf4;border-color:#bbf7d0}
                .btn-cancelar{color:#dc2626}  .btn-cancelar:hover{background:#fef2f2;border-color:#fecaca}
                .btn-expirar{color:#d97706}   .btn-expirar:hover{background:#fef3c7;border-color:#fde68a}
                .res-empty{text-align:center;padding:3rem;color:#94a3b8}

                /* Modal */
                .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
                .modal-box{background:#fff;border-radius:18px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
                .modal-head{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9}
                .modal-title{font-size:1rem;font-weight:700;color:#0f172a}
                .modal-close{background:none;border:none;font-size:1.3rem;cursor:pointer;color:#94a3b8;padding:0}
                .modal-close:hover{color:#0f172a}
                .modal-body{padding:1.5rem}
                .modal-footer{padding:1rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem}
                .mfield{margin-bottom:1.1rem}
                .mfield label{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.4rem}
                .mfield select{width:100%;padding:.6rem .85rem;border-radius:8px;border:1.5px solid #e2e8f0;font-size:.875rem;color:#0f172a;background:#f8fafc;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
                .mfield select:focus{border-color:#6366f1}
                .mfield.error select{border-color:#f87171}
                .merror{font-size:.75rem;color:#dc2626;margin-top:.3rem}
                .info-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.75rem 1rem;font-size:.8rem;color:#1d4ed8;margin-bottom:1rem;line-height:1.5}
                .btn-cancel{background:#f1f5f9;color:#374151;border:none;border-radius:8px;padding:.65rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-cancel:hover{background:#e2e8f0}
                .btn-save{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:.65rem 1.5rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-save:hover:not(:disabled){background:#4f46e5}
                .btn-save:disabled{opacity:.7;cursor:not-allowed}
            `}</style>

            {/* Stats */}
            <div className="res-stats">
                <div className="res-stat">
                    <div className="res-stat-label">Total reservas</div>
                    <div className="res-stat-value">{reservas.length}</div>
                </div>
                <div className="res-stat">
                    <div className="res-stat-label">Pendientes</div>
                    <div className="res-stat-value" style={{ color:'#2563eb' }}>
                        {reservas.filter(r => r.estado === 'PENDIENTE').length}
                    </div>
                </div>
                <div className="res-stat">
                    <div className="res-stat-label">Completadas</div>
                    <div className="res-stat-value" style={{ color:'#16a34a' }}>
                        {reservas.filter(r => r.estado === 'COMPLETADA').length}
                    </div>
                </div>
                <div className="res-stat">
                    <div className="res-stat-label">Expiradas</div>
                    <div className="res-stat-value" style={{ color:'#dc2626' }}>
                        {reservas.filter(r => r.estado === 'EXPIRADA').length}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="res-header">
                <div className="res-filters">
                    <div className="res-search">
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
                    {['', 'PENDIENTE', 'COMPLETADA', 'CANCELADA', 'EXPIRADA'].map(est => (
                        <button
                            key={est}
                            className={`filter-btn ${filtroEst === est ? 'active' : ''}`}
                            onClick={() => setFiltroEst(est)}
                        >
                            {est === '' ? 'Todos' : est}
                        </button>
                    ))}
                </div>
                <button className="btn-add" onClick={abrirModal}>
                    ＋ Nueva reserva
                </button>
            </div>

            {/* Tabla */}
            <div className="res-table-wrap">
                {loading ? (
                    <div className="res-empty">⏳ Cargando reservas...</div>
                ) : filtrados.length === 0 ? (
                    <div className="res-empty">
                        <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>📅</div>
                        <div style={{ fontWeight:600 }}>
                            {busqueda || filtroEst ? 'Sin resultados' : 'No hay reservas registradas'}
                        </div>
                    </div>
                ) : (
                    <table className="res-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Libro</th>
                                <th>Socio</th>
                                <th>Reservado</th>
                                <th>Expira</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((r, i) => {
                                const estStyle = ESTADO_STYLE[r.estado] ?? { bg:'#f1f5f9', color:'#374151' };
                                const dias     = diasRestantes(r.fecha_expira);
                                const socio    = r.user?.nombre  ?? r.socio ?? '—';
                                const libro    = r.libro?.titulo ?? r.libro ?? '—';
                                return (
                                    <tr key={r.id}>
                                        <td style={{ color:'#94a3b8', fontWeight:600 }}>{i + 1}</td>
                                        <td style={{ fontWeight:600 }}>{libro}</td>
                                        <td style={{ color:'#64748b' }}>{socio}</td>
                                        <td style={{ color:'#64748b', fontSize:'.82rem' }}>
                                            {r.fecha_reserva}
                                        </td>
                                        <td>
                                            {r.estado === 'PENDIENTE' ? (
                                                <span className={
                                                    dias > 1 ? 'badge-dias-ok' :
                                                    dias === 1 ? 'badge-dias-warn' :
                                                    'badge-dias-out'
                                                }>
                                                    {dias > 0 ? `${dias}d` : 'Hoy expira'}
                                                </span>
                                            ) : (
                                                <span style={{ color:'#94a3b8', fontSize:'.82rem' }}>
                                                    {r.fecha_expira}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge-estado"
                                                style={{ background: estStyle.bg, color: estStyle.color }}>
                                                {r.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="res-actions">
                                                {r.estado === 'PENDIENTE' && (<>
                                                    <button className="btn-icon btn-completar"
                                                        onClick={() => handleAccion('completar', r.id)}>
                                                        ✓ Completar
                                                    </button>
                                                    <button className="btn-icon btn-cancelar"
                                                        onClick={() => handleAccion('cancelar', r.id)}>
                                                        ✕ Cancelar
                                                    </button>
                                                    {dias <= 0 && (
                                                        <button className="btn-icon btn-expirar"
                                                            onClick={() => handleAccion('expirar', r.id)}>
                                                            ⏰ Expirar
                                                        </button>
                                                    )}
                                                </>)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {filtrados.length > 0 && (
                <div style={{ fontSize:'.78rem', color:'#94a3b8', marginTop:'.75rem', textAlign:'right' }}>
                    Mostrando {filtrados.length} de {reservas.length} reserva(s)
                </div>
            )}

            {/* ══ MODAL ══ */}
            {modal && (
                <div className="modal-bg" onClick={e => e.target === e.currentTarget && cerrar()}>
                    <div className="modal-box">
                        <div className="modal-head">
                            <span className="modal-title">📅 Nueva reserva</span>
                            <button className="modal-close" onClick={cerrar}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="info-box">
                                    ℹ️ La reserva expira automáticamente en <strong>3 días</strong> si el socio no recoge el libro.
                                </div>

                                <div className={`mfield ${errores.user_id ? 'error' : ''}`}>
                                    <label>Socio *</label>
                                    <select name="user_id" value={form.user_id} onChange={handleChange} required>
                                        <option value="">Seleccionar socio...</option>
                                        {usuarios.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.nombre} {u.numero_socio ? `— ${u.numero_socio}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errores.user_id && <div className="merror">{errores.user_id[0]}</div>}
                                </div>

                                <div className={`mfield ${errores.libro_id ? 'error' : ''}`}>
                                    <label>Libro *</label>
                                    <select name="libro_id" value={form.libro_id} onChange={handleChange} required>
                                        <option value="">Seleccionar libro...</option>
                                        {libros.map(l => (
                                            <option key={l.id} value={l.id}>
                                                {l.titulo} — Stock: {l.stock_disponible}
                                            </option>
                                        ))}
                                    </select>
                                    {errores.libro_id && <div className="merror">{errores.libro_id[0]}</div>}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={cerrar}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? '⏳ Guardando...' : '✓ Crear reserva'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}