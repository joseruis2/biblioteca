import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/shared/PrivateRoute';
import Login from './pages/auth/Login';

// Admin pages (las crearemos después)
import LibrosAdmin from './pages/admin/Libros';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Admin / Bibliotecario */}
                    <Route path="/admin/libros" element={
                        <PrivateRoute roles={['ADMIN', 'BIBLIOTECARIO']}>
                            <LibrosAdmin />
                        </PrivateRoute>
                    } />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;