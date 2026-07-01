import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children, roles = [] }) {
    const { user, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;
    if (!user)   return <Navigate to="/login" />;
    if (roles.length && !roles.includes(user.rol)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}