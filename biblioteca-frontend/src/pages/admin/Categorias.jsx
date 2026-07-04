import { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import {
    getCategorias, createCategoria,
    updateCategoria, deleteCategoria
} from '../../api/categoriasApi';

const formInicial = { nombre: '', descripcion: '' };

export default function CategoriasAdmin() {
    const [categorias, setCategorias] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [busqueda,   setBusqueda]   = useState('');
    const [modal,      setModal]      = useState(false);
    const [editando,   setEditando]   = useState(null);
    const [form,       setForm]       = useState(formInicial);
    const [saving,     setSaving]     = useState(false);
    const [errores,    setErrores]    = useState({});

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        const res = await getCategorias();
        setCategorias(res.data);
        setLoading(false);
    };

    const abrirCrear = () => {
        setEditando(null);
        setForm(formInicial);
        setErrores({});
        setModal(true);
    };

    const abrirEditar = (cat) => {
        setEditando(cat);
        setForm({ nombre: cat.nombre, descripcion: cat.descripcion ?? '' });
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
                await updateCategoria(editando.id, form);
            } else {
                await createCategoria(form);
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
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
            await deleteCategoria(id);
            cargar();
        } catch {
            alert('No se puede eliminar: tiene libros asociados.');
        }
    };

    const filtradas = categorias.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <AdminLayout title="Categorías">
            <style>{`
                .cat-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
                .cat-search{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;flex:1;max-width:340px}
                .cat-search input{border:none;outline:none;font-size:.875rem;background:transparent;width:100%;color:#0f172a}
                .btn-add{display:flex;align-items:center;gap:.5rem;background:#6366f1;color:#fff;border:none;border-radius:10px;padding:.6rem 1.1rem;font-size:.875rem;font-weight:600;cursor:pointer;transition:background .15s}
                .btn-add:hover{background:#4f46e5}
                .cat-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem}
                .cat-stat{background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #f1f5f9}
                .cat-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.3rem}
                .cat-stat-value{font-size:1.5rem;font-weight:800;color:#0f172a}
                .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
                .cat-card{background:#fff;border-radius:14px;border:1px solid #f1f5f9;padding:1.25rem;display:flex;flex-direction:column;gap:.75rem;transition:box-shadow .15s}
                .cat-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.07)}
                .cat-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem}
                .cat-icon{width:40px;height:40px;background:#eef2ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
                .cat-nombre{font-size:.95rem;font-weight:700;color:#0f172a;margin:0}
                .cat-desc{font-size:.8rem;color:#64748b;line-height:1.5;margin:0;flex:1}
                .cat-actions{display:flex;gap:.4rem;margin-top:.25rem}
                .btn-icon{height:30px;padding:0 .65rem;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;color:#374151;transition:all .15s}
                .btn-icon:hover{background:#f1f5f9}
                .btn-icon-danger:hover{background:#fef2f2;border-color:#fecaca;color:#dc2626}
                .cat-empty{text-align:center;padding:3rem;color:#94a3b8;background:#fff;border-radius:14px;border:1px solid #f1f5f9}

                /* Modal */
                .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
                .modal-box{background:#fff;border-radius:18px;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
                .modal-head{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9}
                .modal-title{font-size:1rem;font-weight:700;color:#0f172a}
                .modal-close{background:none;border:none;font-size:1.3rem;cursor:pointer;color:#94a3b8;padding:0}
                .modal-close:hover{color:#0f172a}
                .modal-body{padding:1.5rem}
                .modal-footer{padding:1rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem}
                .mfield{margin-bottom:1.1rem}
                .mfield label{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.4rem}
                .mfield input,.mfield textarea{width:100%;padding:.6rem .85rem;border-radius:8px;border:1.5px solid #e2e8f0;font-size:.875rem;color:#0f172a;background:#f8fafc;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
                .mfield input:focus,.mfield textarea:focus{border-color:#6366f1}
                .mfield.error input,.mfield.error textarea{border-color:#f87171}
                .merror{font-size:.75rem;color:#dc2626;margin-top:.3rem}
                .btn-cancel{background:#f1f5f9;color:#374151;border:none;border-radius:8px;padding:.65rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-cancel:hover{background:#e2e8f0}
                .btn-save{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:.65rem 1.5rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-save:hover:not(:disabled){background:#4f46e5}
                .btn-save:disabled{opacity:.7;cursor:not-allowed}
            `}</style>

            {/* Stats */}
            <div className="cat-stats">
                <div className="cat-stat">
                    <div className="cat-stat-label">Total categorías</div>
                    <div className="cat-stat-value">{categorias.length}</div>
                </div>
                <div className="cat-stat">
                    <div className="cat-stat-label">Con descripción</div>
                    <div className="cat-stat-value">
                        {categorias.filter(c => c.descripcion).length}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="cat-header">
                <div className="cat-search">
                    <span>🔍</span>
                    <input
                        placeholder="Buscar categoría..."
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
                    ＋ Nueva categoría
                </button>
            </div>

            {/* Grid de cards */}
            {loading ? (
                <div className="cat-empty">⏳ Cargando categorías...</div>
            ) : filtradas.length === 0 ? (
                <div className="cat-empty">
                    <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>🏷️</div>
                    <div style={{ fontWeight:600 }}>
                        {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay categorías registradas'}
                    </div>
                    <div style={{ fontSize:'.85rem', marginTop:'.35rem' }}>
                        {!busqueda && 'Agrega la primera categoría con el botón de arriba'}
                    </div>
                </div>
            ) : (
                <div className="cat-grid">
                    {filtradas.map(cat => (
                        <div key={cat.id} className="cat-card">
                            <div className="cat-card-head">
                                <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                    <div className="cat-icon">🏷️</div>
                                    <h3 className="cat-nombre">{cat.nombre}</h3>
                                </div>
                                <span style={{
                                    background:'#f0fdf4', color:'#16a34a',
                                    fontSize:'.7rem', fontWeight:700,
                                    padding:'.15rem .5rem', borderRadius:'6px',
                                    whiteSpace:'nowrap',
                                }}>
                                    #{cat.id}
                                </span>
                            </div>

                            <p className="cat-desc">
                                {cat.descripcion || <em style={{ color:'#cbd5e1' }}>Sin descripción</em>}
                            </p>

                            <div className="cat-actions">
                                <button className="btn-icon" onClick={() => abrirEditar(cat)}>
                                    ✏️ Editar
                                </button>
                                <button className="btn-icon btn-icon-danger"
                                    onClick={() => handleEliminar(cat.id)}>
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filtradas.length > 0 && (
                <div style={{ fontSize:'.78rem', color:'#94a3b8', marginTop:'.75rem', textAlign:'right' }}>
                    {filtradas.length} categoría(s)
                </div>
            )}

            {/* ══ MODAL ══ */}
            {modal && (
                <div className="modal-bg" onClick={e => e.target === e.currentTarget && cerrar()}>
                    <div className="modal-box">
                        <div className="modal-head">
                            <span className="modal-title">
                                {editando ? '✏️ Editar categoría' : '🏷️ Nueva categoría'}
                            </span>
                            <button className="modal-close" onClick={cerrar}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className={`mfield ${errores.nombre ? 'error' : ''}`}>
                                    <label>Nombre *</label>
                                    <input
                                        name="nombre"
                                        placeholder="Ej: Ciencia Ficción"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        autoFocus
                                        required
                                    />
                                    {errores.nombre && <div className="merror">{errores.nombre[0]}</div>}
                                </div>

                                <div className="mfield">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        rows={3}
                                        placeholder="Breve descripción de la categoría..."
                                        value={form.descripcion}
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