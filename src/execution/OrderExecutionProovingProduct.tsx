import React, { useState } from 'react';
import { Box, Text, Button, VStack, Image } from '@chakra-ui/react';
import { OrderExecutionPage } from './OrderExecutionPage';

const OrderExecutionProovingProduct = () => {
    const [photo, setPhoto] = useState<string | null>(null);

    const handleTakePhoto = () => {
    // Implement functionality to take a photo
    // For now, we'll simulate taking a photo with a placeholder image
        setPhoto('https://via.placeholder.com/300');
    };

    const handleRetakePhoto = () => {
        setPhoto(null);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" p={4}>
            <VStack spacing={8} width="100%" maxWidth="400px">
                <Text fontSize="xl" fontWeight="bold" textAlign="center">Product name #... out of ...</Text>
                <Box
                    width="100%"
                    height="300px"
                    border="1px solid"
                    borderColor="gray.300"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="md"
                >
                    {photo ? <Image src={photo} alt="Scales display" /> : <Text>Photo of the scales display</Text>}
                </Box>
                <VStack spacing={4} width="100%">
                    <Button
                        width="100%"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="orange.300"
                        onClick={handleRetakePhoto}
                    >
            Retake the picture
                    </Button>
                    <Button
                        width="100%"
                        borderRadius="full"
                        colorScheme="orange"
                        onClick={handleTakePhoto}
                    >
            Swipe &gt;&gt;&gt;
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default OrderExecutionProovingProduct;