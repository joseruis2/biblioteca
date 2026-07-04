import { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { getPrestamos, createPrestamo, devolverPrestamo } from '../../api/prestamosApi';
import { getLibros } from '../../api/librosApi';
import { getUsuarios } from '../../api/usuariosApi';

const formInicial = {
    user_id: '', libro_id: '',
    fecha_devolucion: '', observaciones: '',
};

const ESTADO_STYLE = {
    ACTIVO:    { bg:'#eff6ff', color:'#2563eb' },
    DEVUELTO:  { bg:'#f0fdf4', color:'#16a34a' },
    VENCIDO:   { bg:'#fef2f2', color:'#dc2626' },
};

export default function PrestamosAdmin() {
    const [prestamos,  setPrestamos]  = useState([]);
    const [libros,     setLibros]     = useState([]);
    const [usuarios,   setUsuarios]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [busqueda,   setBusqueda]   = useState('');
    const [filtroEst,  setFiltroEst]  = useState('');
    const [modal,      setModal]      = useState(false);
    const [form,       setForm]       = useState(formInicial);
    const [saving,     setSaving]     = useState(false);
    const [errores,    setErrores]    = useState({});

    useEffect(() => { cargarTodo(); }, []);

    const cargarTodo = async () => {
        setLoading(true);
        const [pRes, lRes, uRes] = await Promise.all([
            getPrestamos(), getLibros(), getUsuarios()
        ]);
        setPrestamos(pRes.data.data ?? pRes.data);
        setLibros(lRes.data.data    ?? lRes.data);
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
            await createPrestamo({
                ...form,
                user_id:  parseInt(form.user_id),
                libro_id: parseInt(form.libro_id),
            });
            await cargarTodo();
            cerrar();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrores(err.response.data.errors ?? {});
            } else {
                alert(err.response?.data?.message ?? 'Error al registrar préstamo');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDevolver = async (id) => {
        if (!confirm('¿Confirmar devolución?')) return;
        try {
            await devolverPrestamo(id);
            cargarTodo();
        } catch (err) {
            alert(err.response?.data?.message ?? 'Error al devolver');
        }
    };

    // Fecha mínima = mañana
    const fechaMin = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const filtrados = prestamos.filter(p => {
        const matchBusq = (p.socio ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (p.libro ?? '').toLowerCase().includes(busqueda.toLowerCase());
        const matchEst  = !filtroEst || p.estado === filtroEst;
        return matchBusq && matchEst;
    });

    return (
        <AdminLayout title="Préstamos">
            <style>{`
                .pre-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem}
                .pre-stat{background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #f1f5f9}
                .pre-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.3rem}
                .pre-stat-value{font-size:1.5rem;font-weight:800;color:#0f172a}
                .pre-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
                .pre-filters{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;flex:1}
                .pre-search{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;max-width:280px;flex:1}
                .pre-search input{border:none;outline:none;font-size:.875rem;background:transparent;width:100%;color:#0f172a}
                .filter-btn{padding:.35rem .85rem;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;font-size:.78rem;font-weight:600;cursor:pointer;color:#64748b;transition:all .15s;white-space:nowrap}
                .filter-btn.active{background:#6366f1;color:#fff;border-color:#6366f1}
                .btn-add{display:flex;align-items:center;gap:.5rem;background:#6366f1;color:#fff;border:none;border-radius:10px;padding:.6rem 1.1rem;font-size:.875rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s}
                .btn-add:hover{background:#4f46e5}
                .pre-table-wrap{background:#fff;border-radius:14px;border:1px solid #f1f5f9;overflow:hidden}
                .pre-table{width:100%;border-collapse:collapse}
                .pre-table th{background:#f8fafc;padding:.75rem 1rem;text-align:left;font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #f1f5f9}
                .pre-table td{padding:.85rem 1rem;font-size:.875rem;color:#0f172a;border-bottom:1px solid #f8fafc;vertical-align:middle}
                .pre-table tr:last-child td{border-bottom:none}
                .pre-table tr:hover td{background:#fafafa}
                .badge-estado{display:inline-block;padding:.2rem .7rem;border-radius:6px;font-size:.72rem;font-weight:700}
                .badge-multa{background:#fef3c7;color:#d97706;padding:.2rem .6rem;border-radius:6px;font-size:.72rem;font-weight:600}
                .pre-actions{display:flex;gap:.4rem}
                .btn-icon{height:30px;padding:0 .65rem;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;color:#374151;transition:all .15s;white-space:nowrap}
                .btn-icon:hover{background:#f1f5f9}
                .btn-devolver{color:#16a34a} .btn-devolver:hover{background:#f0fdf4;border-color:#bbf7d0}
                .pre-empty{text-align:center;padding:3rem;color:#94a3b8}

                /* Modal */
                .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
                .modal-box{background:#fff;border-radius:18px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
                .modal-head{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9;position:sticky;top:0;background:#fff;z-index:1;border-radius:18px 18px 0 0}
                .modal-title{font-size:1rem;font-weight:700;color:#0f172a}
                .modal-close{background:none;border:none;font-size:1.3rem;cursor:pointer;color:#94a3b8;padding:0}
                .modal-close:hover{color:#0f172a}
                .modal-body{padding:1.5rem}
                .modal-footer{padding:1rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem;position:sticky;bottom:0;background:#fff;border-radius:0 0 18px 18px}
                .mfield{margin-bottom:1.1rem}
                .mfield label{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.4rem}
                .mfield input,.mfield select,.mfield textarea{width:100%;padding:.6rem .85rem;border-radius:8px;border:1.5px solid #e2e8f0;font-size:.875rem;color:#0f172a;background:#f8fafc;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
                .mfield input:focus,.mfield select:focus,.mfield textarea:focus{border-color:#6366f1}
                .mfield.error input,.mfield.error select{border-color:#f87171}
                .merror{font-size:.75rem;color:#dc2626;margin-top:.3rem}
                .section-divider{font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6366f1;border-bottom:1px solid #e2e8f0;padding-bottom:.4rem;margin:1.25rem 0 1rem}
                .btn-cancel{background:#f1f5f9;color:#374151;border:none;border-radius:8px;padding:.65rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-cancel:hover{background:#e2e8f0}
                .btn-save{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:.65rem 1.5rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-save:hover:not(:disabled){background:#4f46e5}
                .btn-save:disabled{opacity:.7;cursor:not-allowed}
            `}</style>

            {/* Stats */}
            <div className="pre-stats">
                <div className="pre-stat">
                    <div className="pre-stat-label">Total préstamos</div>
                    <div className="pre-stat-value">{prestamos.length}</div>
                </div>
                <div className="pre-stat">
                    <div className="pre-stat-label">Activos</div>
                    <div className="pre-stat-value" style={{ color:'#2563eb' }}>
                        {prestamos.filter(p => p.estado === 'ACTIVO').length}
                    </div>
                </div>
                <div className="pre-stat">
                    <div className="pre-stat-label">Vencidos</div>
                    <div className="pre-stat-value" style={{ color:'#dc2626' }}>
                        {prestamos.filter(p => p.estado === 'VENCIDO').length}
                    </div>
                </div>
                <div className="pre-stat">
                    <div className="pre-stat-label">Devueltos</div>
                    <div className="pre-stat-value" style={{ color:'#16a34a' }}>
                        {prestamos.filter(p => p.estado === 'DEVUELTO').length}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="pre-header">
                <div className="pre-filters">
                    <div className="pre-search">
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
                    {['', 'ACTIVO', 'DEVUELTO', 'VENCIDO'].map(est => (
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
                    ＋ Nuevo préstamo
                </button>
            </div>

            {/* Tabla */}
            <div className="pre-table-wrap">
                {loading ? (
                    <div className="pre-empty">⏳ Cargando préstamos...</div>
                ) : filtrados.length === 0 ? (
                    <div className="pre-empty">
                        <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>📋</div>
                        <div style={{ fontWeight:600 }}>
                            {busqueda || filtroEst ? 'Sin resultados' : 'No hay préstamos registrados'}
                        </div>
                    </div>
                ) : (
                    <table className="pre-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Libro</th>
                                <th>Socio</th>
                                <th>Préstamo</th>
                                <th>Devolución</th>
                                <th>Estado</th>
                                <th>Multa</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((p, i) => {
                                const estStyle = ESTADO_STYLE[p.estado] ?? { bg:'#f1f5f9', color:'#374151' };
                                const vencido  = p.estado === 'ACTIVO' &&
                                    new Date(p.fecha_devolucion) < new Date();
                                return (
                                    <tr key={p.id}>
                                        <td style={{ color:'#94a3b8', fontWeight:600 }}>{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight:600 }}>{p.libro}</div>
                                        </td>
                                        <td style={{ color:'#64748b' }}>{p.socio}</td>
                                        <td style={{ color:'#64748b', fontSize:'.82rem' }}>
                                            {p.fecha_prestamo}
                                        </td>
                                        <td style={{ fontSize:'.82rem' }}>
                                            <span style={{ color: vencido ? '#dc2626' : '#64748b', fontWeight: vencido ? 700 : 400 }}>
                                                {vencido && '⚠ '}{p.fecha_devolucion}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge-estado"
                                                style={{ background: estStyle.bg, color: estStyle.color }}>
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td>
                                            {p.multa ? (
                                                <span className="badge-multa">
                                                    S/ {p.multa.monto} — {p.multa.estado}
                                                </span>
                                            ) : (
                                                <span style={{ color:'#cbd5e1', fontSize:'.78rem' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="pre-actions">
                                                {p.estado === 'ACTIVO' && (
                                                    <button
                                                        className="btn-icon btn-devolver"
                                                        onClick={() => handleDevolver(p.id)}
                                                    >
                                                        ✓ Devolver
                                                    </button>
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

            {filtrados.length > 0 && (
                <div style={{ fontSize:'.78rem', color:'#94a3b8', marginTop:'.75rem', textAlign:'right' }}>
                    Mostrando {filtrados.length} de {prestamos.length} préstamo(s)
                </div>
            )}

            {/* ══ MODAL ══ */}
            {modal && (
                <div className="modal-bg" onClick={e => e.target === e.currentTarget && cerrar()}>
                    <div className="modal-box">
                        <div className="modal-head">
                            <span className="modal-title">🔄 Nuevo préstamo</span>
                            <button className="modal-close" onClick={cerrar}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">

                                <div className="section-divider">Datos del préstamo</div>

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
                                        {libros.filter(l => l.stock_disponible > 0).map(l => (
                                            <option key={l.id} value={l.id}>
                                                {l.titulo} (Stock: {l.stock_disponible})
                                            </option>
                                        ))}
                                    </select>
                                    {errores.libro_id && <div className="merror">{errores.libro_id[0]}</div>}
                                </div>

                                <div className={`mfield ${errores.fecha_devolucion ? 'error' : ''}`}>
                                    <label>Fecha de devolución *</label>
                                    <input
                                        name="fecha_devolucion"
                                        type="date"
                                        min={fechaMin()}
                                        value={form.fecha_devolucion}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errores.fecha_devolucion && <div className="merror">{errores.fecha_devolucion[0]}</div>}
                                </div>

                                <div className="mfield">
                                    <label>Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        rows={3}
                                        placeholder="Observaciones opcionales..."
                                        value={form.observaciones}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={cerrar}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? '⏳ Guardando...' : '✓ Registrar préstamo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}