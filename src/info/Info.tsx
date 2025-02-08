import React, { useEffect, useState } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

const Info: React.FC = () => {
    const [version, setVersion] = useState<string>('');

    useEffect(() => {
        const getAppVersion = async () => {
            const packageJson = await import('../../package.json');
            setVersion(packageJson.default.version);
        };

        getAppVersion();
    }, []);

    return (
        <VStack align="start" p={4} h="full">
            <Box>
                <Text fontSize="lg" fontWeight="bold">App Version</Text>
                <Text>{version}</Text>
            </Box>
        </VStack>
    );
};

export default Info;
