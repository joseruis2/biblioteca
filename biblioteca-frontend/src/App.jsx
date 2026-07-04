import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/shared/PrivateRoute';
import Login from './pages/auth/Login';
import LibrosAdmin from './pages/admin/Libros';
import CategoriasAdmin from './pages/admin/Categorias';
import AutoresAdmin from './pages/admin/Autores';
import UsuariosAdmin from './pages/admin/Usuarios';
import PrestamosAdmin from './pages/admin/Prestamos';
import ReservasAdmin from './pages/admin/Reservas';
import Dashboard from './pages/admin/Dashboard';
import MultasAdmin from './pages/admin/Multas';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/categorias" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <CategoriasAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/login" element={<Login />} />

                    <Route path="/admin/libros" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <LibrosAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/admin/autores" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <AutoresAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/admin/usuarios" element={
                        <PrivateRoute roles={['ADMIN']}>
                            <UsuariosAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/admin/prestamos" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <PrestamosAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/admin/reservas" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <ReservasAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/admin/dashboard" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <Dashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/admin/multas" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <MultasAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;