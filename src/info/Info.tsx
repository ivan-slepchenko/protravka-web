import React, { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';

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
        <Box p={4}>
            <Text fontSize="lg" fontWeight="bold">App Version</Text>
            <Text>{version}</Text>
        </Box>
    );
};

export default Info;
