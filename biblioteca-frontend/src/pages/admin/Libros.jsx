import { useEffect, useState } from 'react';
import { getLibros, createLibro, deleteLibro } from '../../api/librosApi';
import { getCategorias } from '../../api/categoriasApi';
import { getAutores } from '../../api/autoresApi';
import AdminLayout from '../../components/shared/AdminLayout';

const formInicial = {
    titulo: '', isbn: '', editorial: '',
    anio_publicacion: '', descripcion: '',
    portada_url: '', stock_total: 1,
    categoria_id: '', autores: [],
};

export default function LibrosAdmin() {
    const [libros,      setLibros]      = useState([]);
    const [categorias,  setCategorias]  = useState([]);
    const [autores,     setAutores]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [busqueda,    setBusqueda]    = useState('');
    const [modal,       setModal]       = useState(false);
    const [form,        setForm]        = useState(formInicial);
    const [saving,      setSaving]      = useState(false);
    const [errores,     setErrores]     = useState({});

    useEffect(() => {
        cargarTodo();
    }, []);

    const cargarTodo = async () => {
        setLoading(true);
        const [libRes, catRes, autRes] = await Promise.all([
            getLibros(), getCategorias(), getAutores()
        ]);
        setLibros(libRes.data.data ?? libRes.data);
        setCategorias(catRes.data);
        setAutores(autRes.data);
        setLoading(false);
    };

    const abrirModal = () => {
        setForm(formInicial);
        setErrores({});
        setModal(true);
    };

    const cerrarModal = () => {
        setModal(false);
        setErrores({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrores(er => ({ ...er, [name]: null }));
    };

    const toggleAutor = (id) => {
        setForm(f => ({
            ...f,
            autores: f.autores.includes(id)
                ? f.autores.filter(a => a !== id)
                : [...f.autores, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrores({});
        try {
            await createLibro({
                ...form,
                stock_total: parseInt(form.stock_total),
                anio_publicacion: form.anio_publicacion || null,
            });
            await cargarTodo();
            cerrarModal();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrores(err.response.data.errors ?? {});
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!confirm('¿Desactivar este libro?')) return;
        await deleteLibro(id);
        cargarTodo();
    };

    const filtrados = libros.filter(l =>
        l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (l.categoria ?? '').toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <AdminLayout title="Libros">
            <style>{`
                .lib-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
                .lib-search{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;flex:1;max-width:340px}
                .lib-search input{border:none;outline:none;font-size:.875rem;background:transparent;width:100%;color:#0f172a}
                .lib-btn-add{display:flex;align-items:center;gap:.5rem;background:#6366f1;color:#fff;border:none;border-radius:10px;padding:.6rem 1.1rem;font-size:.875rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s}
                .lib-btn-add:hover{background:#4f46e5}
                .lib-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem}
                .lib-stat{background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #f1f5f9}
                .lib-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.3rem}
                .lib-stat-value{font-size:1.5rem;font-weight:800;color:#0f172a}
                .lib-table-wrap{background:#fff;border-radius:14px;border:1px solid #f1f5f9;overflow:hidden}
                .lib-table{width:100%;border-collapse:collapse}
                .lib-table th{background:#f8fafc;padding:.75rem 1rem;text-align:left;font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #f1f5f9}
                .lib-table td{padding:.85rem 1rem;font-size:.875rem;color:#0f172a;border-bottom:1px solid #f8fafc;vertical-align:middle}
                .lib-table tr:last-child td{border-bottom:none}
                .lib-table tr:hover td{background:#fafafa}
                .badge-cat{display:inline-block;background:#eef2ff;color:#4f46e5;padding:.2rem .65rem;border-radius:6px;font-size:.72rem;font-weight:600}
                .badge-stock-ok{background:#f0fdf4;color:#16a34a;padding:.2rem .65rem;border-radius:6px;font-size:.75rem;font-weight:600}
                .badge-stock-low{background:#fef3c7;color:#d97706;padding:.2rem .65rem;border-radius:6px;font-size:.75rem;font-weight:600}
                .badge-stock-out{background:#fef2f2;color:#dc2626;padding:.2rem .65rem;border-radius:6px;font-size:.75rem;font-weight:600}
                .lib-actions{display:flex;gap:.4rem}
                .btn-icon{width:32px;height:32px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;transition:all .15s}
                .btn-icon:hover{background:#f1f5f9}
                .btn-icon-danger:hover{background:#fef2f2;border-color:#fecaca}
                .lib-empty{text-align:center;padding:3rem;color:#94a3b8}
                .lib-autores{font-size:.78rem;color:#64748b;margin-top:.2rem}

                /* ── Modal ── */
                .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
                .modal-box{background:#fff;border-radius:18px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
                .modal-head{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9;position:sticky;top:0;background:#fff;z-index:1;border-radius:18px 18px 0 0}
                .modal-title{font-size:1rem;font-weight:700;color:#0f172a}
                .modal-close{background:none;border:none;font-size:1.3rem;cursor:pointer;color:#94a3b8;line-height:1;padding:0}
                .modal-close:hover{color:#0f172a}
                .modal-body{padding:1.5rem}
                .modal-footer{padding:1rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem;position:sticky;bottom:0;background:#fff;border-radius:0 0 18px 18px}
                .mfield{margin-bottom:1.1rem}
                .mfield label{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.4rem}
                .mfield input,.mfield select,.mfield textarea{width:100%;padding:.6rem .85rem;border-radius:8px;border:1.5px solid #e2e8f0;font-size:.875rem;color:#0f172a;background:#f8fafc;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
                .mfield input:focus,.mfield select:focus,.mfield textarea:focus{border-color:#6366f1}
                .mfield.error input,.mfield.error select{border-color:#f87171}
                .merror{font-size:.75rem;color:#dc2626;margin-top:.3rem}
                .autores-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.5rem;margin-top:.4rem}
                .autor-chip{display:flex;align-items:center;gap:.5rem;padding:.45rem .75rem;border-radius:8px;border:1.5px solid #e2e8f0;cursor:pointer;font-size:.8rem;transition:all .15s;background:#fff}
                .autor-chip.selected{border-color:#6366f1;background:#eef2ff;color:#4f46e5;font-weight:600}
                .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
                .btn-cancel{background:#f1f5f9;color:#374151;border:none;border-radius:8px;padding:.65rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-cancel:hover{background:#e2e8f0}
                .btn-save{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:.65rem 1.5rem;font-size:.875rem;font-weight:600;cursor:pointer;transition:background .15s}
                .btn-save:hover:not(:disabled){background:#4f46e5}
                .btn-save:disabled{opacity:.7;cursor:not-allowed}
                @media(max-width:500px){.form-row{grid-template-columns:1fr}}
            `}</style>

            {/* Stats */}
            <div className="lib-stats">
                <div className="lib-stat">
                    <div className="lib-stat-label">Total libros</div>
                    <div className="lib-stat-value">{libros.length}</div>
                </div>
                <div className="lib-stat">
                    <div className="lib-stat-label">Disponibles</div>
                    <div className="lib-stat-value" style={{ color:'#16a34a' }}>
                        {libros.filter(l => l.stock_disponible > 0).length}
                    </div>
                </div>
                <div className="lib-stat">
                    <div className="lib-stat-label">Sin stock</div>
                    <div className="lib-stat-value" style={{ color:'#dc2626' }}>
                        {libros.filter(l => l.stock_disponible === 0).length}
                    </div>
                </div>
                <div className="lib-stat">
                    <div className="lib-stat-label">Categorías</div>
                    <div className="lib-stat-value">
                        {[...new Set(libros.map(l => l.categoria).filter(Boolean))].length}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="lib-header">
                <div className="lib-search">
                    <span>🔍</span>
                    <input
                        placeholder="Buscar por título o categoría..."
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
                <button className="lib-btn-add" onClick={abrirModal}>
                    ＋ Nuevo libro
                </button>
            </div>

            {/* Tabla */}
            <div className="lib-table-wrap">
                {loading ? (
                    <div className="lib-empty">⏳ Cargando libros...</div>
                ) : filtrados.length === 0 ? (
                    <div className="lib-empty">
                        <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>📭</div>
                        <div style={{ fontWeight:600 }}>
                            {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay libros registrados'}
                        </div>
                    </div>
                ) : (
                    <table className="lib-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Libro</th>
                                <th>Categoría</th>
                                <th>Editorial</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((libro, i) => {
                                const ok  = libro.stock_disponible > 2;
                                const low = libro.stock_disponible > 0 && libro.stock_disponible <= 2;
                                return (
                                    <tr key={libro.id}>
                                        <td style={{ color:'#94a3b8', fontWeight:600 }}>{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight:600 }}>{libro.titulo}</div>
                                            {libro.autores?.length > 0 && (
                                                <div className="lib-autores">
                                                    ✍️ {Array.isArray(libro.autores) ? libro.autores.join(', ') : libro.autores}
                                                </div>
                                            )}
                                        </td>
                                        <td><span className="badge-cat">{libro.categoria ?? '—'}</span></td>
                                        <td style={{ color:'#64748b' }}>{libro.editorial ?? '—'}</td>
                                        <td>
                                            <span className={ok ? 'badge-stock-ok' : low ? 'badge-stock-low' : 'badge-stock-out'}>
                                                {ok  ? `✓ ${libro.stock_disponible}/${libro.stock_total}` :
                                                 low ? `⚠ ${libro.stock_disponible}/${libro.stock_total}` :
                                                       'Sin stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="lib-actions">
                                                <button className="btn-icon" title="Editar">✏️</button>
                                                <button className="btn-icon btn-icon-danger"
                                                    title="Desactivar"
                                                    onClick={() => handleEliminar(libro.id)}>
                                                    🗑️
                                                </button>
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
                    Mostrando {filtrados.length} de {libros.length} libro(s)
                </div>
            )}

            {/* ══ MODAL CREAR ══ */}
            {modal && (
                <div className="modal-bg" onClick={e => e.target === e.currentTarget && cerrarModal()}>
                    <div className="modal-box">

                        <div className="modal-head">
                            <span className="modal-title">📚 Nuevo libro</span>
                            <button className="modal-close" onClick={cerrarModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">

                                {/* Título */}
                                <div className={`mfield ${errores.titulo ? 'error' : ''}`}>
                                    <label>Título *</label>
                                    <input
                                        name="titulo"
                                        placeholder="Ej: Cien años de soledad"
                                        value={form.titulo}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errores.titulo && <div className="merror">{errores.titulo[0]}</div>}
                                </div>

                                {/* Categoría */}
                                <div className={`mfield ${errores.categoria_id ? 'error' : ''}`}>
                                    <label>Categoría *</label>
                                    <select name="categoria_id" value={form.categoria_id} onChange={handleChange} required>
                                        <option value="">Seleccionar categoría...</option>
                                        {categorias.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                    {errores.categoria_id && <div className="merror">{errores.categoria_id[0]}</div>}
                                </div>

                                {/* ISBN + Editorial */}
                                <div className="form-row">
                                    <div className="mfield">
                                        <label>ISBN</label>
                                        <input
                                            name="isbn"
                                            placeholder="978-..."
                                            value={form.isbn}
                                            onChange={handleChange}
                                        />
                                        {errores.isbn && <div className="merror">{errores.isbn[0]}</div>}
                                    </div>
                                    <div className="mfield">
                                        <label>Editorial</label>
                                        <input
                                            name="editorial"
                                            placeholder="Ej: Sudamericana"
                                            value={form.editorial}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Año + Stock */}
                                <div className="form-row">
                                    <div className="mfield">
                                        <label>Año de publicación</label>
                                        <input
                                            name="anio_publicacion"
                                            type="number"
                                            placeholder="Ej: 1967"
                                            min="1000" max="2099"
                                            value={form.anio_publicacion}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className={`mfield ${errores.stock_total ? 'error' : ''}`}>
                                        <label>Stock total *</label>
                                        <input
                                            name="stock_total"
                                            type="number"
                                            min="1"
                                            value={form.stock_total}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errores.stock_total && <div className="merror">{errores.stock_total[0]}</div>}
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="mfield">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        rows={3}
                                        placeholder="Breve descripción del libro..."
                                        value={form.descripcion}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Autores */}
                                <div className="mfield">
                                    <label>Autores * {form.autores.length > 0 && `(${form.autores.length} seleccionado${form.autores.length > 1 ? 's' : ''})`}</label>
                                    {autores.length === 0 ? (
                                        <p style={{ fontSize:'.8rem', color:'#94a3b8' }}>
                                            No hay autores registrados. Agrega autores primero.
                                        </p>
                                    ) : (
                                        <div className="autores-grid">
                                            {autores.map(a => (
                                                <div
                                                    key={a.id}
                                                    className={`autor-chip ${form.autores.includes(a.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleAutor(a.id)}
                                                >
                                                    <span>{form.autores.includes(a.id) ? '✓' : '+'}</span>
                                                    <span>{a.nombre}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errores.autores && <div className="merror">{errores.autores[0]}</div>}
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? '⏳ Guardando...' : '✓ Guardar libro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}