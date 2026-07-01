import { useEffect, useState } from 'react';
import { getLibros } from '../../api/librosApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LibrosAdmin() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [libros, setLibros]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLibros()
            .then(res => setLibros(res.data.data))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={styles.wrapper}>
            <header style={styles.header}>
                <span style={styles.brand}>📚 Biblioteca Admin</span>
                <div style={styles.headerRight}>
                    <span style={styles.userName}>{user?.nombre}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                <h2 style={styles.pageTitle}>Libros</h2>

                {loading ? (
                    <p>Cargando libros...</p>
                ) : (
                    <div style={styles.grid}>
                        {libros.map(libro => (
                            <div key={libro.id} style={styles.card}>
                                <div style={styles.cardTitle}>{libro.titulo}</div>
                                <div style={styles.cardSub}>{libro.categoria}</div>
                                <div style={styles.cardAutores}>
                                    {libro.autores?.join(', ')}
                                </div>
                                <div style={styles.cardFooter}>
                                    <span style={styles.stock}>
                                        Stock: {libro.stock_disponible}/{libro.stock_total}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {libros.length === 0 && (
                            <p style={{ color: '#64748b' }}>No hay libros registrados.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    wrapper:    { minHeight: '100vh', background: '#f1f5f9' },
    header:     { background: '#fff', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,.07)' },
    brand:      { fontWeight: 800, fontSize: '1.1rem' },
    headerRight:{ display: 'flex', alignItems: 'center', gap: '1rem' },
    userName:   { fontSize: '.875rem', color: '#64748b' },
    logoutBtn:  { padding: '.4rem .9rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '.825rem', fontWeight: 600 },
    main:       { padding: '1.75rem' },
    pageTitle:  { fontWeight: 800, fontSize: '1.3rem', marginBottom: '1.25rem' },
    grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '1rem' },
    card:       { background: '#fff', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 6px rgba(0,0,0,.07)', display: 'flex', flexDirection: 'column', gap: '.4rem' },
    cardTitle:  { fontWeight: 700, fontSize: '.95rem', color: '#0f172a' },
    cardSub:    { fontSize: '.78rem', color: '#6366f1', fontWeight: 600 },
    cardAutores:{ fontSize: '.75rem', color: '#64748b' },
    cardFooter: { marginTop: '.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    stock:      { fontSize: '.78rem', background: '#f0fdf4', color: '#16a34a', padding: '.2rem .6rem', borderRadius: '6px', fontWeight: 600 },
};