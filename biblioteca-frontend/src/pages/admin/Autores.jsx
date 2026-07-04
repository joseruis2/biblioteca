import { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { getAutores, createAutor, updateAutor, deleteAutor } from '../../api/autoresApi';

const formInicial = { nombre: '', nacionalidad: '', biografia: '' };

export default function AutoresAdmin() {
    const [autores,   setAutores]  = useState([]);
    const [loading,   setLoading]  = useState(true);
    const [busqueda,  setBusqueda] = useState('');
    const [modal,     setModal]    = useState(false);
    const [editando,  setEditando] = useState(null);
    const [form,      setForm]     = useState(formInicial);
    const [saving,    setSaving]   = useState(false);
    const [errores,   setErrores]  = useState({});

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        const res = await getAutores();
        setAutores(res.data);
        setLoading(false);
    };

    const abrirCrear = () => {
        setEditando(null);
        setForm(formInicial);
        setErrores({});
        setModal(true);
    };

    const abrirEditar = (autor) => {
        setEditando(autor);
        setForm({
            nombre:       autor.nombre,
            nacionalidad: autor.nacionalidad ?? '',
            biografia:    autor.biografia    ?? '',
        });
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
            if (editando) {
                await updateAutor(editando.id, form);
            } else {
                await createAutor(form);
            }
            await cargar();
            cerrar();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrores(err.response.data.errors ?? {});
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este autor?')) return;
        try {
            await deleteAutor(id);
            cargar();
        } catch {
            alert('No se puede eliminar: tiene libros asociados.');
        }
    };

    const inicial = (nombre) => nombre?.split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase() ?? '?';

    const colores = ['#6366f1','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];
    const colorPor = (id) => colores[id % colores.length];

    const filtrados = autores.filter(a =>
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.nacionalidad ?? '').toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <AdminLayout title="Autores">
            <style>{`
                .aut-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
                .aut-search{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;flex:1;max-width:340px}
                .aut-search input{border:none;outline:none;font-size:.875rem;background:transparent;width:100%;color:#0f172a}
                .btn-add{display:flex;align-items:center;gap:.5rem;background:#6366f1;color:#fff;border:none;border-radius:10px;padding:.6rem 1.1rem;font-size:.875rem;font-weight:600;cursor:pointer;transition:background .15s}
                .btn-add:hover{background:#4f46e5}
                .aut-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem}
                .aut-stat{background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #f1f5f9}
                .aut-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.3rem}
                .aut-stat-value{font-size:1.5rem;font-weight:800;color:#0f172a}
                .aut-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
                .aut-card{background:#fff;border-radius:14px;border:1px solid #f1f5f9;padding:1.25rem;display:flex;flex-direction:column;gap:.75rem;transition:box-shadow .15s}
                .aut-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.07)}
                .aut-avatar{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;color:#fff;flex-shrink:0}
                .aut-nombre{font-size:.95rem;font-weight:700;color:#0f172a;margin:0}
                .aut-nac{font-size:.78rem;color:#6366f1;font-weight:600;margin:0}
                .aut-bio{font-size:.8rem;color:#64748b;line-height:1.55;margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
                .aut-actions{display:flex;gap:.4rem;margin-top:.25rem}
                .btn-icon{height:30px;padding:0 .65rem;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;color:#374151;transition:all .15s}
                .btn-icon:hover{background:#f1f5f9}
                .btn-icon-danger:hover{background:#fef2f2;border-color:#fecaca;color:#dc2626}
                .aut-empty{text-align:center;padding:3rem;color:#94a3b8;background:#fff;border-radius:14px;border:1px solid #f1f5f9}

                /* Modal */
                .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
                .modal-box{background:#fff;border-radius:18px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
                .modal-head{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9;position:sticky;top:0;background:#fff;z-index:1;border-radius:18px 18px 0 0}
                .modal-title{font-size:1rem;font-weight:700;color:#0f172a}
                .modal-close{background:none;border:none;font-size:1.3rem;cursor:pointer;color:#94a3b8;padding:0}
                .modal-close:hover{color:#0f172a}
                .modal-body{padding:1.5rem}
                .modal-footer{padding:1rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem;position:sticky;bottom:0;background:#fff;border-radius:0 0 18px 18px}
                .mfield{margin-bottom:1.1rem}
                .mfield label{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.4rem}
                .mfield input,.mfield textarea{width:100%;padding:.6rem .85rem;border-radius:8px;border:1.5px solid #e2e8f0;font-size:.875rem;color:#0f172a;background:#f8fafc;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
                .mfield input:focus,.mfield textarea:focus{border-color:#6366f1}
                .mfield.error input{border-color:#f87171}
                .merror{font-size:.75rem;color:#dc2626;margin-top:.3rem}
                .btn-cancel{background:#f1f5f9;color:#374151;border:none;border-radius:8px;padding:.65rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-cancel:hover{background:#e2e8f0}
                .btn-save{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:.65rem 1.5rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-save:hover:not(:disabled){background:#4f46e5}
                .btn-save:disabled{opacity:.7;cursor:not-allowed}
            `}</style>

            {/* Stats */}
            <div className="aut-stats">
                <div className="aut-stat">
                    <div className="aut-stat-label">Total autores</div>
                    <div className="aut-stat-value">{autores.length}</div>
                </div>
                <div className="aut-stat">
                    <div className="aut-stat-label">Con nacionalidad</div>
                    <div className="aut-stat-value">
                        {autores.filter(a => a.nacionalidad).length}
                    </div>
                </div>
                <div className="aut-stat">
                    <div className="aut-stat-label">Con biografía</div>
                    <div className="aut-stat-value">
                        {autores.filter(a => a.biografia).length}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="aut-header">
                <div className="aut-search">
                    <span>🔍</span>
                    <input
                        placeholder="Buscar por nombre o nacionalidad..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                        <button onClick={() => setBusqueda('')}
                            style={{ background:'none',border:'none',cursor:'pointer',color:'#94a3b8' }}>
                            ✕
                        </button>
                    )}
                </div>
                <button className="btn-add" onClick={abrirCrear}>
                    ＋ Nuevo autor
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="aut-empty">⏳ Cargando autores...</div>
            ) : filtrados.length === 0 ? (
                <div className="aut-empty">
                    <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>✍️</div>
                    <div style={{ fontWeight:600 }}>
                        {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay autores registrados'}
                    </div>
                    <div style={{ fontSize:'.85rem', marginTop:'.35rem' }}>
                        {!busqueda && 'Agrega el primer autor con el botón de arriba'}
                    </div>
                </div>
            ) : (
                <div className="aut-grid">
                    {filtrados.map(autor => (
                        <div key={autor.id} className="aut-card">
                            <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
                                <div
                                    className="aut-avatar"
                                    style={{ background: colorPor(autor.id) }}
                                >
                                    {inicial(autor.nombre)}
                                </div>
                                <div>
                                    <p className="aut-nombre">{autor.nombre}</p>
                                    {autor.nacionalidad && (
                                        <p className="aut-nac">🌍 {autor.nacionalidad}</p>
                                    )}
                                </div>
                            </div>

                            {autor.biografia ? (
                                <p className="aut-bio">{autor.biografia}</p>
                            ) : (
                                <p style={{ fontSize:'.8rem', color:'#cbd5e1', fontStyle:'italic' }}>
                                    Sin biografía registrada
                                </p>
                            )}

                            <div className="aut-actions">
                                <button className="btn-icon" onClick={() => abrirEditar(autor)}>
                                    ✏️ Editar
                                </button>
                                <button className="btn-icon btn-icon-danger"
                                    onClick={() => handleEliminar(autor.id)}>
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filtrados.length > 0 && (
                <div style={{ fontSize:'.78rem', color:'#94a3b8', marginTop:'.75rem', textAlign:'right' }}>
                    {filtrados.length} autor(es)
                </div>
            )}

            {/* ══ MODAL ══ */}
            {modal && (
                <div className="modal-bg" onClick={e => e.target === e.currentTarget && cerrar()}>
                    <div className="modal-box">
                        <div className="modal-head">
                            <span className="modal-title">
                                {editando ? '✏️ Editar autor' : '✍️ Nuevo autor'}
                            </span>
                            <button className="modal-close" onClick={cerrar}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className={`mfield ${errores.nombre ? 'error' : ''}`}>
                                    <label>Nombre completo *</label>
                                    <input
                                        name="nombre"
                                        placeholder="Ej: Gabriel García Márquez"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        autoFocus
                                        required
                                    />
                                    {errores.nombre && <div className="merror">{errores.nombre[0]}</div>}
                                </div>

                                <div className="mfield">
                                    <label>Nacionalidad</label>
                                    <input
                                        name="nacionalidad"
                                        placeholder="Ej: Colombiana"
                                        value={form.nacionalidad}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mfield">
                                    <label>Biografía</label>
                                    <textarea
                                        name="biografia"
                                        rows={4}
                                        placeholder="Breve reseña biográfica del autor..."
                                        value={form.biografia}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={cerrar}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? '⏳ Guardando...' : editando ? '✓ Actualizar' : '✓ Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}