import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Box, Alert, AlertIcon } from "@chakra-ui/react";

const AlertContext = createContext<{ addAlert: (message: string) => void }>({
    addAlert: () => {
        return;
    }
});

const Alerts = React.memo(({ alerts }: { alerts: string[] }) => (
    <Box position="fixed" top="4" right="4" zIndex="1000">
        {alerts.map((alert, index) => (
            <Alert key={index} status="success" variant="subtle" mb={4}>
                <AlertIcon />
                <span dangerouslySetInnerHTML={{ __html: alert }} />
            </Alert>
        ))}
    </Box>
));

Alerts.displayName = 'Alerts';

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    console.log('Rendering alert provider');
    const [alerts, setAlerts] = useState<string[]>([]);

    const addAlert = useCallback((message: string) => {
        setAlerts((prevAlerts) => [...prevAlerts, message]);
        setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.slice(1));
        }, 10000);
    }, []);

    // Memoize children to prevent unnecessary re-renders
    const memoizedChildren = useMemo(() => {
        console.log('Rendering alert provider children');
        return children;
    }, [children]);

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {memoizedChildren}
            <Alerts alerts={alerts} />
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);
