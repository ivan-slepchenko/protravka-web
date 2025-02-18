import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Role } from '../operators/Operators';

const RequireAuth = ({ children, roles }: { children: JSX.Element, roles?: Role[] }) => {
    const location = useLocation();
    const user = useSelector((state: RootState) => state.user);

    if (!user.email) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.some(role => user.roles.includes(role))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RequireAuth;
