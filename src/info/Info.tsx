import React, { useEffect, useState } from 'react';
import { Box, Text, Switch, VStack } from '@chakra-ui/react';
import { useFeatures } from '../contexts/FeaturesContext';

const Info: React.FC = () => {
    const [version, setVersion] = useState<string>('');
    const { features, setFeaturesConfig } = useFeatures();

    useEffect(() => {
        const getAppVersion = async () => {
            const packageJson = await import('../../package.json');
            setVersion(packageJson.default.version);
        };

        getAppVersion();
    }, []);

    const handleToggleLabFeature = () => {
        setFeaturesConfig({ lab: !features.lab });
    };

    return (
        <VStack align="start" p={4} h="full">
            <Box>
                <Text fontSize="lg" fontWeight="bold">App Version</Text>
                <Text>{version}</Text>
            </Box>
            <Box>
                <Text fontSize="lg" fontWeight="bold">Lab Feature</Text>
                <Switch isChecked={features.lab} onChange={handleToggleLabFeature} />
            </Box>
        </VStack>
    );
};

export default Info;
