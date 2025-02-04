import React, { useState, useEffect } from 'react';
import { Box, Button, VStack, Image, Heading, IconButton } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { nextPage, incrementProductIndex, setProductConsumptionPhoto, setConsumptionPhoto, saveOrderExecution } from '../store/executionSlice';
import { AppDispatch, RootState } from '../store/store';
import { FaCamera, FaCog } from 'react-icons/fa';
import { OrderExecutionPage } from './OrderExecutionPage';
import useCamera from '../hooks/useCamera';

const OrderExecution10ConsumptionProoving = () => {
    const dispatch: AppDispatch = useDispatch();
    const [photo, setPhotoState] = useState<string | null>(null);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const applicationMethod = currentOrderExecution?.applicationMethod;
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentOrderExecution?.currentProductIndex);

    if (currentProductIndex === null || currentProductIndex === undefined || currentOrder === null) {
        return null;
    }

    const totalProducts = currentOrder.productDetails.length || 0;

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
            if (applicationMethod === 'CDS') {
                if (currentOrder.productDetails[currentProductIndex] == undefined) {
                    throw new Error(`Product details not found for the current receipe and product index ${currentOrderExecution?.orderId} ${currentProductIndex}`);
                }

                const productDetails = currentOrder.productDetails[currentProductIndex];
                if (productDetails.product !== undefined) {
                    const productId = productDetails.product.id;
                    dispatch(setProductConsumptionPhoto({ photo: photoData, productId }));
                    dispatch(saveOrderExecution());
                    stopCamera();
                } else {
                    throw new Error(`Product not found for the current receipe and product index ${currentOrderExecution?.orderId} ${currentProductIndex}`);
                }
            } else {
                dispatch(setConsumptionPhoto(photoData));
                dispatch(saveOrderExecution());
                stopCamera();
            }
        }
    };

    const handleRetakeClick = () => {
        setPhotoState(null);
        startCamera();
    };

    const handleNextButtonClick = () => {
        if (applicationMethod === 'Surry') {
            dispatch(nextPage());
        } else {
            if (currentProductIndex < totalProducts - 1) {
                dispatch(incrementProductIndex());
                dispatch(nextPage(OrderExecutionPage.ConsumptionDetails));
            } else {
                dispatch(nextPage());
            }
            dispatch(saveOrderExecution());
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" h="full" p={4}>
            <VStack spacing={8} width="100%" maxWidth="400px">
                <Heading size="md" mb={2}>Make a consumption photo proof.</Heading>
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
                        <Image src={photo} alt="Machine display" objectFit="cover" style={{ width: '100%', height: '100%' }} />
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
                        onClick={photo ? handleRetakeClick : handleTakeSnapshot}
                        leftIcon={photo ? undefined : <FaCamera />}
                    >
                        {photo ? 'Retake the picture' : 'Take Picture'}
                    </Button>
                    <Button
                        w="200px" 
                        borderRadius="full"
                        colorScheme="orange"
                        disabled={!photo}
                        onClick={handleNextButtonClick}
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

export default OrderExecution10ConsumptionProoving;