import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Board from './board/Board';
import Operators from './operators/Operators';
import Crops from './crops/Crops';
import Products from './products/Products';
import Execution from './execution/Execution';
import Report from './report/Report';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { NewReceipe as NewReceipeNoLab } from './newReceipe/noLab/NewReceipe';
import { NewReceipe as NewReceipeLab } from './newReceipe/lab/NewReceipe';
import LotReport from './report/LotReport';
import LabBoard from './board/LabBoard';
import { FinalizeRecipe } from './newReceipe/lab/FinalizeRecipe';
import { Role } from './operators/Operators';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

const AppRoutes = ({ useLab }: { useLab?: boolean }) => (
    <Routes>
        <Route path="/" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><Board /></RequireAuth>} />
        <Route path="/new" element={<RequireAuth roles={[Role.MANAGER]}>
            {useLab === undefined ? <div>Loading...</div> : useLab ? <NewReceipeLab /> : <NewReceipeNoLab />}
        </RequireAuth>} />
        <Route path="/finalize/:orderId" element={<RequireAuth roles={[Role.MANAGER]}><FinalizeRecipe /></RequireAuth>} />
        <Route path="/lab" element={<RequireAuth roles={[Role.LABORATORY]}><LabBoard /></RequireAuth>} />
        <Route path="/board" element={<RequireAuth roles={[Role.MANAGER]}><Board /></RequireAuth>} />
        <Route path="/report" element={<RequireAuth roles={[Role.MANAGER]}><Report /></RequireAuth>} />
        <Route path="/operators" element={<RequireAuth roles={[Role.ADMIN]}><Operators /></RequireAuth>} />
        <Route path="/crops" element={<RequireAuth roles={[Role.ADMIN]}><Crops /></RequireAuth>} />
        <Route path="/products" element={<RequireAuth roles={[Role.ADMIN]}><Products /></RequireAuth>} />
        <Route path="/execution" element={<RequireAuth roles={[Role.OPERATOR]}><Execution /></RequireAuth>} />
        <Route path="/lot-report/:orderId" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><LotReport /></RequireAuth>} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/signup" element={<Signup />} />
    </Routes>
);

const LoginRedirect = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (user.email) {
            if (user.roles.includes(Role.OPERATOR)) {
                navigate('/execution');
            } else if (user.roles.includes(Role.MANAGER)) {
                navigate('/board');
            } else if (user.roles.includes(Role.LABORATORY)) {
                navigate('/lab');
            } else {
                navigate('/operators');
            }
        }
    }, [navigate, user]);

    return <Login />;
};

export default AppRoutes;
