import React, { useState } from 'react';
import { Box, Flex, Heading, Image, Text, Button, useBreakpointValue, HStack, Circle } from '@chakra-ui/react';
import andoid_1 from './images/android/1.jpeg';
import andoid_2 from './images/android/2.jpeg';
import andoid_3 from './images/android/3.jpeg';
import andoid_4 from './images/android/4.jpeg';
import ios_1 from './images/ios/1.jpeg';
import ios_2 from './images/ios/2.jpeg';
import ios_3 from './images/ios/3.jpeg';
import ios_4 from './images/ios/4.jpeg';

export const PwaInstallGuide = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const androidPhotos = [andoid_1, andoid_2, andoid_3, andoid_4];
    const iosPhotos = [ios_1, ios_2, ios_3, ios_4];

    const photos = isAndroid ? androidPhotos : isIOS ? iosPhotos : [];
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    };

    return (
        <Flex
            direction="column"
            height="100vh"
            p={{ base: 4, md: 10 }}
        >
            {/* Header */}
            <Box flexShrink={0} textAlign="center" mb={4}>
                <Heading fontSize={{ base: '2xl', md: '3xl' }} mb={2}>
                    How to Install Teravix App
                </Heading>
                <Text fontSize={{ base: 'md', md: 'lg' }}>
                    Install this app on your device for a better experience and easy access.
                </Text>
            </Box>

            {/* Image Section */}
            <Box flex="1" display="flex" alignItems="center" justifyContent="center" position={'relative'} overflow={'hidden'}>
                {photos.length > 0 && (
                    <Image
                        src={photos[currentIndex]}
                        alt={`Step ${currentIndex + 1}`}
                        borderRadius="lg"
                        boxShadow="lg"
                        objectFit="contain"
                        maxWidth="100%"
                        maxHeight="100%"
                    />
                )}
            </Box>

            {/* Footer */}
            <HStack flexShrink={0} justify="center" mt={4} spacing={2}>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePrev}
                    _hover={{ bg: 'teal.600' }}
                    p={0}
                >
                    ◀
                </Button>
                <HStack spacing={1}>
                    {photos.map((_, index) => (
                        <Circle
                            key={index}
                            size="8px"
                            bg={index === currentIndex ? 'teal.500' : 'gray.300'}
                        />
                    ))}
                </HStack>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNext}
                    _hover={{ bg: 'teal.600' }}
                    p={0}
                >
                    ▶
                </Button>
            </HStack>
        </Flex>
    );
};
