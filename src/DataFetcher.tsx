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

const DataFetcher = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const {addAlert} = useAlert();
    const user = useSelector((state: RootState) => state.user);
    const tkwMeasurements = useSelector((state: RootState) => state.execution.tkwMeasurements);
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const oldOrdersRef = useRef(orders);
    const oldMeasurementsRef = useRef(tkwMeasurements);
    const isInitialLoadRef = useRef(true);
    const useLab = user.company?.featureFlags.useLab;
    const isAuthenticated = user.email !== null;

    useEffect(() => {
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
        } else if (oldMeasurementsRef.current !== null && Array.isArray(oldMeasurementsRef.current)) {
            try {
                const oldIds = oldMeasurementsRef.current.map((m) => m.id);
                const newIds = tkwMeasurements.map((m) => m.id);
                const isNewMeasurementsAdded = newIds.some((id) => !oldIds.includes(id));
            

                const oldOrderIds = oldOrdersRef.current.map((o) => o.id);
                const newOrderIds = orders.map((o) => o.id);
                const isNewOrderAdded = newOrderIds.some((id) => !oldOrderIds.includes(id));
                if (isNewOrderAdded || isNewMeasurementsAdded) {
                    if (useLab && user.roles.includes(Role.LABORATORY)) {
                        addAlert(t('index.measurements_check'));
                    }
                } 
                if (isNewOrderAdded) {
                    if (user.roles.includes(Role.OPERATOR)) {
                        addAlert(t('index.tasks_to_do'));
                    }
                }
            } catch (error) {
                console.error('Failed to check new measurements:', error);
            }
        }

        oldMeasurementsRef.current = tkwMeasurements;
        oldOrdersRef.current = orders;
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

export default DataFetcher;