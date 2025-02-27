import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "./store/store";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "./contexts/AlertContext";
import { useEffect, useRef } from "react";
import { Role } from "./operators/Operators";
import { fetchOrders } from "./store/ordersSlice";
import { fetchCrops } from "./store/cropsSlice";
import { fetchProducts } from "./store/productsSlice";
import { fetchOperators } from "./store/operatorsSlice";
import { fetchTkwMeasurements } from "./store/executionSlice";
import { OrderStatus } from "./store/newOrderSlice";

const DataSynchronizer = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const {addAlert} = useAlert();
    const user = useSelector((state: RootState) => state.user);
    const tkwMeasurements = useSelector((state: RootState) => state.execution.tkwMeasurements);
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const isInitialLoadRef = useRef(true);
    const useLab = user.company?.featureFlags.useLab;
    const isAuthenticated = user.email !== null;

    useEffect(() => {
        const storedMeasurementIds = localStorage.getItem('tkwMeasurementIds');
        const storedOperatorOrderIds = localStorage.getItem('operatorOrderIds');
        const labOrderIds = localStorage.getItem('labOrderIDs');

        let oldMeasurementIds = storedMeasurementIds ? JSON.parse(storedMeasurementIds) : [];
        let oldOperatorOrderIds = storedOperatorOrderIds ? JSON.parse(storedOperatorOrderIds) : [];
        let oldLabOrderIds = labOrderIds ? JSON.parse(labOrderIds) : [];


        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
        } else {
            try {
                const newMeasurementIds = tkwMeasurements.map((m) => m.id);
                const isNewMeasurementsAdded = newMeasurementIds.some((id) => !oldMeasurementIds.includes(id));

                const newOperatorOrderIds = orders.filter(o => o.status === OrderStatus.RecipeCreated).map((o) => o.id);
                const newLabOrderIds = orders.filter(o => o.status === OrderStatus.LabAssignmentCreated).map((o) => o.id);

                const isNewOperatorOrderAdded = newOperatorOrderIds.some((id) => !oldOperatorOrderIds.includes(id));
                const isNewLabOrderAdded = newLabOrderIds.some((id) => !oldLabOrderIds.includes(id));

                if (isNewLabOrderAdded || isNewMeasurementsAdded) {
                    if (useLab && user.roles.includes(Role.LABORATORY)) {
                        addAlert(t('alerts.measurements_check'));
                    }
                } 
                if (isNewOperatorOrderAdded) {
                    if (user.roles.includes(Role.OPERATOR)) {
                        addAlert(t('alerts.tasks_to_do'));
                    }
                }
            } catch (error) {
                console.error('Failed to check new measurements:', error);
            }
        }

        localStorage.setItem('tkwMeasurementIds', JSON.stringify(tkwMeasurements.map((m) => m.id)));
        localStorage.setItem('orderIds', JSON.stringify(orders.map((o) => o.id)));
    }, [tkwMeasurements, orders]);

    useEffect(() => {
        if (isAuthenticated) {
            if (!user.name || !user.email || !user.roles) {
                throw new Error('User name or email is not set, invalid user data');
            }

            dispatch(fetchOrders());
            setInterval(() => {
                dispatch(fetchOrders());
            }, 10000);

            if (user.roles.includes(Role.ADMIN) || user.roles.includes(Role.MANAGER)) {
                dispatch(fetchCrops());
                dispatch(fetchProducts());
                dispatch(fetchOperators());
            }

            if (useLab && user.roles.includes(Role.LABORATORY)) {
                dispatch(fetchTkwMeasurements());
                setInterval(() => {
                    dispatch(fetchTkwMeasurements());
                }, 10000);
            }
        }
    }, [dispatch, user, useLab, isAuthenticated]);

    return <></>
}

export default DataSynchronizer;