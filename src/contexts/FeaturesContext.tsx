import React, { createContext, useContext, useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

type Features = {
    lab: boolean | undefined;
};

const FeaturesContext = createContext<{ features: Features }>({
    features: {
        lab: false,
    }
});

let rendering = 0;

export const FeaturesProvider = ({ children }: { children: React.ReactNode }) => {
    const [features, setFeatures] = useState<Features>({ lab: undefined });

    useEffect(() => {
        if (features.lab === undefined) {
            const fetchFeatures = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/api/features`);
                    const data = await response.json();
                    setFeatures(data);
                    console.log('Features:', data);
                } catch (error) {
                    console.error('Failed to fetch features:', error);
                }
            };

            fetchFeatures();
        }
    }, [features.lab]);

    if (features.lab !== undefined) {
        console.log('Rendering features provider children', rendering);
        rendering++;
    }

    return (
        <FeaturesContext.Provider value={{ features }}>
            {features.lab === undefined ? null : children}
        </FeaturesContext.Provider>
    );
};

export const useFeatures = () => useContext(FeaturesContext);
