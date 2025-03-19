import React from 'react';
import { Box, VStack, Text, Link, Image, SimpleGrid } from '@chakra-ui/react';
import android1 from '../../images/android-pwa-guide-1.png';

const PwaInstallGuide = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    return (
        <Box p={4}>
            <VStack spacing={4} align="start">
                <Text fontSize="xl" fontWeight="bold">How to Install and Open This App as a PWA</Text>
                <Text>1. Open this website in your browser.</Text>
                <Text>2. Look for the "Add to Home Screen" option in your browser's menu.</Text>
                <Text>3. Follow the prompts to install the app on your device.</Text>
                <Text>4. Once installed, open the app from your home screen for the best experience.</Text>
                <SimpleGrid columns={2} spacing={4}>
                    {isAndroid && (
                        <Image src="/images/android-pwa-guide-1.png" alt="Android PWA Guide Step 1" />
                    )}
                    {isAndroid && (
                        <Image src="/images/android-pwa-guide-2.png" alt="Android PWA Guide Step 2" />
                    )}
                    {isIOS && (
                        <Image src="/images/ios-pwa-guide-1.png" alt="iOS PWA Guide Step 1" />
                    )}
                    {isIOS && (
                        <Image src="/images/ios-pwa-guide-2.png" alt="iOS PWA Guide Step 2" />
                    )}
                </SimpleGrid>
                <Text>If you need more help, visit <Link href="https://en.wikipedia.org/wiki/Progressive_web_application" isExternal color="blue.500">this guide on PWAs</Link>.</Text>
            </VStack>
        </Box>
    );
};

export default PwaInstallGuide;