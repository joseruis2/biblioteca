import { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { getUsuarios, createUsuario, updateUsuario, toggleEstado } from '../../api/usuariosApi';

const ROL_COLORS = {
    ADMIN:          { bg:'#fef3c7', color:'#d97706' },
    BIBLIOTECARIO:  { bg:'#ede9fe', color:'#7c3aed' },
    SOCIO:          { bg:'#f0fdf4', color:'#16a34a' },
};

const formInicial = {
    nombre:'', email:'', password:'',
    password_confirmation:'', rol_id:'3',
    numero_socio:'', telefono:'',
};

export default function UsuariosAdmin() {
    const [usuarios,  setUsuarios]  = useState([]);
    const [roles,     setRoles]     = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [busqueda,  setBusqueda]  = useState('');
    const [filtroRol, setFiltroRol] = useState('');
    const [modal,     setModal]     = useState(false);
    const [editando,  setEditando]  = useState(null);
    const [form,      setForm]      = useState(formInicial);
    const [saving,    setSaving]    = useState(false);
    const [errores,   setErrores]   = useState({});

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        const res = await getUsuarios();
        setUsuarios(res.data.data ?? res.data);
        setLoading(false);
    };

    const abrirCrear = () => {
        setEditando(null);
        setForm(formInicial);
        setErrores({});
        setModal(true);
    };

    const abrirEditar = (u) => {
        setEditando(u);
        setForm({
            nombre:                u.nombre,
            email:                 u.email,
            password:              '',
            password_confirmation: '',
            rol_id:                String(u.rol_id ?? '3'),
            numero_socio:          u.numero_socio ?? '',
            telefono:              u.telefono ?? '',
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
            const payload = { ...form, rol_id: parseInt(form.rol_id) };
            if (editando) {
                await updateUsuario(editando.id, payload);
            } else {
                await createUsuario(payload);
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

    const handleToggle = async (id) => {
        await toggleEstado(id);
        cargar();
    };

    const inicial = (nombre) =>
        nombre?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() ?? '?';

    const colores = ['#6366f1','#7c3aed','#0891b2','#059669','#d97706'];
    const colorPor = (id) => colores[id % colores.length];

    const filtrados = usuarios.filter(u => {
        const matchBusq = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          u.email.toLowerCase().includes(busqueda.toLowerCase());
        const matchRol  = !filtroRol || u.rol === filtroRol;
        return matchBusq && matchRol;
    });

    const rolesUnicos = [...new Set(usuarios.map(u => u.rol).filter(Boolean))];

    return (
        <AdminLayout title="Usuarios">
            <style>{`
                .usr-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem}
                .usr-stat{background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #f1f5f9}
                .usr-stat-label{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.3rem}
                .usr-stat-value{font-size:1.5rem;font-weight:800;color:#0f172a}
                .usr-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
                .usr-search{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;flex:1;max-width:300px}
                .usr-search input{border:none;outline:none;font-size:.875rem;background:transparent;width:100%;color:#0f172a}
                .usr-filters{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
                .filter-btn{padding:.35rem .85rem;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;font-size:.78rem;font-weight:600;cursor:pointer;color:#64748b;transition:all .15s}
                .filter-btn.active{background:#6366f1;color:#fff;border-color:#6366f1}
                .btn-add{display:flex;align-items:center;gap:.5rem;background:#6366f1;color:#fff;border:none;border-radius:10px;padding:.6rem 1.1rem;font-size:.875rem;font-weight:600;cursor:pointer;transition:background .15s}
                .btn-add:hover{background:#4f46e5}
                .usr-table-wrap{background:#fff;border-radius:14px;border:1px solid #f1f5f9;overflow:hidden}
                .usr-table{width:100%;border-collapse:collapse}
                .usr-table th{background:#f8fafc;padding:.75rem 1rem;text-align:left;font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #f1f5f9}
                .usr-table td{padding:.85rem 1rem;font-size:.875rem;color:#0f172a;border-bottom:1px solid #f8fafc;vertical-align:middle}
                .usr-table tr:last-child td{border-bottom:none}
                .usr-table tr:hover td{background:#fafafa}
                .usr-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;color:#fff;flex-shrink:0}
                .badge-rol{display:inline-block;padding:.2rem .65rem;border-radius:6px;font-size:.72rem;font-weight:700}
                .badge-on{background:#f0fdf4;color:#16a34a;padding:.2rem .65rem;border-radius:6px;font-size:.72rem;font-weight:600}
                .badge-off{background:#fef2f2;color:#dc2626;padding:.2rem .65rem;border-radius:6px;font-size:.72rem;font-weight:600}
                .usr-actions{display:flex;gap:.4rem}
                .btn-icon{height:30px;padding:0 .65rem;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;color:#374151;transition:all .15s}
                .btn-icon:hover{background:#f1f5f9}
                .btn-toggle-on{color:#dc2626} .btn-toggle-on:hover{background:#fef2f2;border-color:#fecaca}
                .btn-toggle-off{color:#16a34a} .btn-toggle-off:hover{background:#f0fdf4;border-color:#bbf7d0}
                .usr-empty{text-align:center;padding:3rem;color:#94a3b8}

                /* Modal */
                .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
                .modal-box{background:#fff;border-radius:18px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
                .modal-head{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9;position:sticky;top:0;background:#fff;z-index:1;border-radius:18px 18px 0 0}
                .modal-title{font-size:1rem;font-weight:700;color:#0f172a}
                .modal-close{background:none;border:none;font-size:1.3rem;cursor:pointer;color:#94a3b8;padding:0}
                .modal-close:hover{color:#0f172a}
                .modal-body{padding:1.5rem}
                .modal-footer{padding:1rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem;position:sticky;bottom:0;background:#fff;border-radius:0 0 18px 18px}
                .mfield{margin-bottom:1rem}
                .mfield label{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.4rem}
                .mfield input,.mfield select{width:100%;padding:.6rem .85rem;border-radius:8px;border:1.5px solid #e2e8f0;font-size:.875rem;color:#0f172a;background:#f8fafc;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
                .mfield input:focus,.mfield select:focus{border-color:#6366f1}
                .mfield.error input,.mfield.error select{border-color:#f87171}
                .merror{font-size:.75rem;color:#dc2626;margin-top:.3rem}
                .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
                .section-divider{font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6366f1;border-bottom:1px solid #e2e8f0;padding-bottom:.4rem;margin:1.25rem 0 1rem}
                .btn-cancel{background:#f1f5f9;color:#374151;border:none;border-radius:8px;padding:.65rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-cancel:hover{background:#e2e8f0}
                .btn-save{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:.65rem 1.5rem;font-size:.875rem;font-weight:600;cursor:pointer}
                .btn-save:hover:not(:disabled){background:#4f46e5}
                .btn-save:disabled{opacity:.7;cursor:not-allowed}
                @media(max-width:500px){.form-row{grid-template-columns:1fr}}
            `}</style>

            {/* Stats */}
            <div className="usr-stats">
                <div className="usr-stat">
                    <div className="usr-stat-label">Total usuarios</div>
                    <div className="usr-stat-value">{usuarios.length}</div>
                </div>
                <div className="usr-stat">
                    <div className="usr-stat-label">Activos</div>
                    <div className="usr-stat-value" style={{ color:'#16a34a' }}>
                        {usuarios.filter(u => u.estado).length}
                    </div>
                </div>
                <div className="usr-stat">
                    <div className="usr-stat-label">Socios</div>
                    <div className="usr-stat-value" style={{ color:'#6366f1' }}>
                        {usuarios.filter(u => u.rol === 'SOCIO').length}
                    </div>
                </div>
                <div className="usr-stat">
                    <div className="usr-stat-label">Admins</div>
                    <div className="usr-stat-value" style={{ color:'#d97706' }}>
                        {usuarios.filter(u => u.rol === 'ADMIN').length}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="usr-header">
                <div className="usr-filters">
                    <div className="usr-search">
                        <span>🔍</span>
                        <input
                            placeholder="Buscar por nombre o email..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button onClick={() => setBusqueda('')}
                                style={{ background:'none',border:'none',cursor:'pointer',color:'#94a3b8' }}>✕</button>
                        )}
                    </div>
                    <button
                        className={`filter-btn ${filtroRol === '' ? 'active' : ''}`}
                        onClick={() => setFiltroRol('')}
                    >Todos</button>
                    {rolesUnicos.map(rol => (
                        <button
                            key={rol}
                            className={`filter-btn ${filtroRol === rol ? 'active' : ''}`}
                            onClick={() => setFiltroRol(filtroRol === rol ? '' : rol)}
                        >{rol}</button>
                    ))}
                </div>
                <button className="btn-add" onClick={abrirCrear}>
                    ＋ Nuevo usuario
                </button>
            </div>

            {/* Tabla */}
            <div className="usr-table-wrap">
                {loading ? (
                    <div className="usr-empty">⏳ Cargando usuarios...</div>
                ) : filtrados.length === 0 ? (
                    <div className="usr-empty">
                        <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>👥</div>
                        <div style={{ fontWeight:600 }}>Sin resultados</div>
                    </div>
                ) : (
                    <table className="usr-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Contacto</th>
                                <th>N° Socio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((u, i) => {
                                const rolStyle = ROL_COLORS[u.rol] ?? { bg:'#f1f5f9', color:'#374151' };
                                return (
                                    <tr key={u.id}>
                                        <td style={{ color:'#94a3b8', fontWeight:600 }}>{i + 1}</td>
                                        <td>
                                            <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                                <div className="usr-avatar" style={{ background: colorPor(u.id) }}>
                                                    {inicial(u.nombre)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight:600 }}>{u.nombre}</div>
                                                    <div style={{ fontSize:'.78rem', color:'#64748b' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-rol" style={{ background: rolStyle.bg, color: rolStyle.color }}>
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td style={{ color:'#64748b', fontSize:'.82rem' }}>
                                            {u.telefono ?? '—'}
                                        </td>
                                        <td style={{ color:'#64748b', fontSize:'.82rem' }}>
                                            {u.numero_socio ?? '—'}
                                        </td>
                                        <td>
                                            <span className={u.estado ? 'badge-on' : 'badge-off'}>
                                                {u.estado ? '● Activo' : '● Inactivo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="usr-actions">
                                                <button className="btn-icon"
                                                    onClick={() => abrirEditar(u)}
                                                    title="Editar">
                                                    ✏️
                                                </button>
                                                <button
                                                    className={`btn-icon ${u.estado ? 'btn-toggle-on' : 'btn-toggle-off'}`}
                                                    onClick={() => handleToggle(u.id)}
                                                    title={u.estado ? 'Desactivar' : 'Activar'}
                                                >
                                                    {u.estado ? '🔴 Desactivar' : '🟢 Activar'}
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
                    Mostrando {filtrados.length} de {usuarios.length} usuario(s)
                </div>
            )}

            {/* ══ MODAL ══ */}
            {modal && (
                <div className="modal-bg" onClick={e => e.target === e.currentTarget && cerrar()}>
                    <div className="modal-box">
                        <div className="modal-head">
                            <span className="modal-title">
                                {editando ? '✏️ Editar usuario' : '👤 Nuevo usuario'}
                            </span>
                            <button className="modal-close" onClick={cerrar}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">

                                <div className="section-divider">Datos personales</div>

                                <div className="mfield">
                                    <label>Nombre completo *</label>
                                    <input
                                        name="nombre"
                                        placeholder="Ej: Juan Pérez"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        autoFocus
                                        required
                                    />
                                    {errores.nombre && <div className="merror">{errores.nombre[0]}</div>}
                                </div>

                                <div className="form-row">
                                    <div className="mfield">
                                        <label>Email *</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="email@ejemplo.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errores.email && <div className="merror">{errores.email[0]}</div>}
                                    </div>
                                    <div className="mfield">
                                        <label>Teléfono</label>
                                        <input
                                            name="telefono"
                                            placeholder="999999999"
                                            value={form.telefono}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="mfield">
                                        <label>Rol *</label>
                                        <select name="rol_id" value={form.rol_id} onChange={handleChange} required>
                                            <option value="1">ADMIN</option>
                                            <option value="2">BIBLIOTECARIO</option>
                                            <option value="3">SOCIO</option>
                                        </select>
                                        {errores.rol_id && <div className="merror">{errores.rol_id[0]}</div>}
                                    </div>
                                    <div className="mfield">
                                        <label>N° Socio</label>
                                        <input
                                            name="numero_socio"
                                            placeholder="SOC-001"
                                            value={form.numero_socio}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="section-divider">
                                    {editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                                </div>

                                <div className="form-row">
                                    <div className="mfield">
                                        <label>Contraseña {!editando && '*'}</label>
                                        <input
                                            name="password"
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={form.password}
                                            onChange={handleChange}
                                            required={!editando}
                                        />
                                        {errores.password && <div className="merror">{errores.password[0]}</div>}
                                    </div>
                                    <div className="mfield">
                                        <label>Confirmar contraseña {!editando && '*'}</label>
                                        <input
                                            name="password_confirmation"
                                            type="password"
                                            placeholder="Repetir contraseña"
                                            value={form.password_confirmation}
                                            onChange={handleChange}
                                            required={!editando}
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={cerrar}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? '⏳ Guardando...' : editando ? '✓ Actualizar' : '✓ Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}