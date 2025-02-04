import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, Image, IconButton } from '@chakra-ui/react';
import { FaCamera, FaCog } from 'react-icons/fa';
import { incrementProductIndex, nextPage, resetPhotoForProvingProductApplication, saveOrderExecution, setPhotoForProvingProductApplication } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { OrderExecutionPage } from './OrderExecutionPage';
import useCamera from '../hooks/useCamera';

const OrderExecution4ProovingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const currentProductIndex = currentOrderExecution?.currentProductIndex;
    const [photo, setPhotoState] = useState<string | null>(null);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();

    if (currentOrder === null || currentProductIndex === undefined || currentProductIndex === null) {
        return null;
    }

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const handleTakeSnapshot = () => {
        const photoData = takeSnapshot();
        if (photoData) {
            setPhotoState(photoData);
            if (currentOrder.productDetails[currentProductIndex] === undefined) {
                throw new Error(`Product details not found for the current receipe and product index ${currentOrder.id} ${currentProductIndex}`);
            }

            const productDetails = currentOrder.productDetails[currentProductIndex];
            if (productDetails.product !== undefined) {
                const productId = productDetails.product.id;
                dispatch(setPhotoForProvingProductApplication({ photo: photoData, productId }));
                dispatch(saveOrderExecution());
                stopCamera();
            } else {
                throw new Error(`Product not found for the current receipe and product index ${currentOrder.id} ${currentProductIndex}`);
            }
        }
    };

    const handleRetakePhoto = () => {
        const productDetails = currentOrder.productDetails[currentProductIndex];
        if (productDetails === undefined) {
            throw new Error(`Product details not found for the current order and product index ${currentOrder.id} ${currentProductIndex}`);
        }

        const product = productDetails.product;
        if (product === undefined) {
            throw new Error(`Product not found for the current order and product index ${currentOrder.id} ${currentProductIndex}`);
        }

        dispatch(resetPhotoForProvingProductApplication({ productId: product.id }));
        dispatch(saveOrderExecution());

        setPhotoState(null);
        startCamera();
    };

    const handleNextButtonClick = () => {
        if (currentProductIndex < currentOrder.productDetails.length - 1) {
            dispatch(incrementProductIndex());
            dispatch(nextPage(OrderExecutionPage.ApplyingProduct));
        } else {
            dispatch(nextPage());
        }
        dispatch(saveOrderExecution());
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" p={4}>
            <VStack spacing={8} width="100%" maxWidth="400px">
                <Text mb={2}>
                    {'Product # '}
                    {currentProductIndex + 1}
                    {' of '}
                    {currentOrder.productDetails.length}
                    {': '}
                    {currentOrder.productDetails[currentProductIndex].product?.name}
                </Text>
                <Box
                    width="100%"
                    height="300px"
                    border="1px solid"
                    borderColor="gray.300"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="md"
                    overflow="hidden"
                    style={{ aspectRatio: '4 / 3' }}
                    position="relative"
                >
                    {photo ? (
                        <Image src={photo} alt="Scales display" objectFit="cover" style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <>
                            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <IconButton
                                icon={<FaCog />}
                                isRound
                                aria-label="Settings"
                                position="absolute"
                                bottom="10px"
                                right="10px"
                                size='sm'
                                onClick={handleSettingsClick}
                            />
                        </>
                    )}
                </Box>
                <canvas ref={canvasRef} width="800" height="600" style={{ display: 'none' }} />
                <VStack spacing={4} width="100%">
                    <Button
                        w="200px" 
                        borderRadius="full"
                        border="1px solid"
                        borderColor="orange.300"
                        onClick={photo ? handleRetakePhoto : handleTakeSnapshot}
                        leftIcon={photo ? undefined : <FaCamera />}
                    >
                        {photo ? 'Retake the picture' : 'Take Picture'}
                    </Button>
                    <Button
                        w="200px" 
                        borderRadius="full"
                        colorScheme="orange"
                        onClick={handleNextButtonClick}
                        disabled={!photo}
                    >
                        Next
                    </Button>
                </VStack>
            </VStack>
            <SettingsModal />
            <WarningModal />
        </Box>
    );
};

export default OrderExecution4ProovingProduct;