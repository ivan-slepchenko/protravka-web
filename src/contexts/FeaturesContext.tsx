import React, { createContext, useContext, useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

type Features = {
    lab: boolean | undefined;
};

const FeaturesContext = createContext<{ features: Features; setFeaturesConfig: (features: Features) => void }>({
    features: {
        lab: false,
    },
    setFeaturesConfig: () => {
        return;
    },
});

let rendering = 0;

export const FeaturesProvider = ({ children }: { children: React.ReactNode }) => {
    const [features, setFeatures] = useState<Features>(() => {
        const storedFeatures = localStorage.getItem('features');
        return storedFeatures ? JSON.parse(storedFeatures) : { lab: undefined };
    });

    useEffect(() => {
        if (features.lab === undefined) {
            const fetchFeatures = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/features`);
                    const data = await response.json();
                    setFeatures(data);
                } catch (error) {
                    console.error('Failed to fetch features:', error);
                }
            };

            fetchFeatures();
        }
    }, [features.lab]);

    const setFeaturesConfig = (newFeatures: Features) => {
        setFeatures(newFeatures);
        localStorage.setItem('features', JSON.stringify(newFeatures));
    };

    if (features.lab !== undefined) {
        console.log('Rendering features provider children', rendering);
        rendering++;
    }

    return (
        <FeaturesContext.Provider value={{ features, setFeaturesConfig }}>
            {features.lab === undefined ? null : children}
        </FeaturesContext.Provider>
    );
};

export const useFeatures = () => useContext(FeaturesContext);
