import { AppDispatch, RootState } from "./store/store";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "./contexts/AlertContext";
import { useEffect, useState, useRef } from "react";
import { Role } from "./operators/Operators";
import { fetchOrders } from "./store/ordersSlice";
import { fetchCrops } from "./store/cropsSlice";
import { fetchProducts } from "./store/productsSlice";
import { fetchOperators, updateFirebaseToken } from "./store/operatorsSlice";
import { fetchTkwMeasurements } from "./store/executionSlice";
import { OrderStatus } from "./store/newOrderSlice";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';
import { getMessaging, getToken } from "firebase/messaging";
import { useTranslation } from "react-i18next";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const DataSynchronizer = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const { addAlert } = useAlert();
    const user = useSelector((state: RootState) => state.user);
    const tkwMeasurements = useSelector((state: RootState) => state.execution.tkwMeasurements);
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const isInitialLoadRef = useRef(true);
    const useLab = user.company?.featureFlags.useLab;
    const isAuthenticated = user.email !== null;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showErrorModal, setShowErrorModal] = useState(false);
    const unsubscribeRef = useRef<() => void>();

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    registration.active?.postMessage({
                        firebaseConfig: firebaseConfig
                    });

                    console.log('Service Worker registered with scope:', registration.scope);

                    if (user.roles.includes(Role.OPERATOR) || user.roles.includes(Role.LABORATORY)) {
                        Notification.requestPermission().then((permission) => {
                            if (permission !== 'granted') {
                                onOpen();
                            } else {
                                initializeMessaging();
                            }
                        });
                    }

                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        console.log('New content is available; please refresh.');
                                    } else {
                                        console.log('Content is cached for offline use.');
                                    }
                                }
                            };
                        }
                    };
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, [user.roles]);

    const handlePermissionRequest = () => {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                onClose();
                initializeMessaging();
            }
        });
    };

    const initializeMessaging = async () => {
        const messaging = getMessaging();
        try {
            const token = await getToken(messaging, {vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY});
            if (token) {
                dispatch(updateFirebaseToken(token));

                unsubscribeRef.current = firebase.messaging().onMessage((payload) => {
                    console.log('Message received. ', payload);
                    addAlert(payload);
                });

            } else {
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Failed to get Firebase token:', error);
            setShowErrorModal(true);
        }
    };

    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    // useEffect(() => {
    //     if (!isAuthenticated || !(tkwMeasurements.length > 0 || orders.length > 0)) {
    //         return;
    //     }

    //     const storedMeasurementIds = localStorage.getItem('tkwMeasurementIds');
    //     const storedOperatorOrderIds = localStorage.getItem('operatorOrderIds');
    //     const labOrderIds = localStorage.getItem('labOrderIDs');

    //     let oldMeasurementIds = storedMeasurementIds ? JSON.parse(storedMeasurementIds) : [];
    //     let oldOperatorOrderIds = storedOperatorOrderIds ? JSON.parse(storedOperatorOrderIds) : [];
    //     let oldLabOrderIds = labOrderIds ? JSON.parse(labOrderIds) : [];

    //     if (isInitialLoadRef.current) {
    //         isInitialLoadRef.current = false;
    //     } else {
    //         try {
    //             const newMeasurementIds = tkwMeasurements.map((m) => m.id);
    //             const isNewMeasurementsAdded = newMeasurementIds.some((id) => !oldMeasurementIds.includes(id));

    //             const newOperatorOrderIds = orders.filter(o => o.status === OrderStatus.RecipeCreated).map((o) => o.id);
    //             const newLabOrderIds = orders.filter(o => o.status === OrderStatus.LabAssignmentCreated).map((o) => o.id);

    //             const isNewOperatorOrderAdded = newOperatorOrderIds.some((id) => !oldOperatorOrderIds.includes(id));
    //             const isNewLabOrderAdded = newLabOrderIds.some((id) => !oldLabOrderIds.includes(id));

    //             if (isNewLabOrderAdded || isNewMeasurementsAdded) {
    //                 if (useLab && user.roles.includes(Role.LABORATORY)) {
    //                     addAlert(t('alerts.measurements_check'));
    //                 }
    //             } 
    //             if (isNewOperatorOrderAdded) {
    //                 if (user.roles.includes(Role.OPERATOR)) {
    //                     addAlert(t('alerts.tasks_to_do'));
    //                 }
    //             }

    //             localStorage.setItem('operatorOrderIds', JSON.stringify(newOperatorOrderIds));
    //             localStorage.setItem('labOrderIDs', JSON.stringify(newLabOrderIds));
    //             localStorage.setItem('tkwMeasurementIds', JSON.stringify(newMeasurementIds));

    //         } catch (error) {
    //             console.error('Failed to check new measurements:', error);
    //         }
    //     }

    //     localStorage.setItem('tkwMeasurementIds', JSON.stringify(tkwMeasurements.map((m) => m.id)));
    //     localStorage.setItem('orderIds', JSON.stringify(orders.map((o) => o.id)));
    // }, [tkwMeasurements, orders, user]);

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

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Push Notifications</ModalHeader>
                    <ModalBody>
                        <p>We need your permission to send you push notifications.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handlePermissionRequest}>
                            Grant Permission
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Application Error</ModalHeader>
                    <ModalBody>
                        <p>The application is not working properly. Please contact tech support at support@teravix.tech.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={() => setShowErrorModal(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default DataSynchronizer;