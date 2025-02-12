import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, IconButton, AspectRatio } from '@chakra-ui/react';
import { FaCamera, FaCog } from 'react-icons/fa';
import { incrementProductIndex, nextPage, resetPhotoForProvingProductApplication, saveOrderExecution, setPhotoForProvingProductApplication } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { OrderExecutionPage } from './OrderExecutionPage';
import useCamera from '../hooks/useCamera';
import useImageModal from '../hooks/useImageModal';

const OrderExecution4ProovingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const currentProductIndex = currentOrderExecution?.currentProductIndex;
    const [photo, setPhotoState] = useState<Blob | null>(null);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();
    const { ImageWithModal, ImageModal, selectedPhoto, handleClose } = useImageModal();

    if (currentOrder === null || currentProductIndex === undefined || currentProductIndex === null) {
        return null;
    }

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const handleTakeSnapshot = async () => {
        const photoData = await takeSnapshot();
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
        <VStack justifyContent="center" h='full' position='relative'>
            <VStack spacing={6} width="100%" maxWidth="400px" h='full'>
                <VStack gap={0}>
                    <Text>
                        {'Product '}
                        {currentProductIndex + 1}
                        {' out of '}
                        {currentOrder.productDetails.length}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">{currentOrder.productDetails[currentProductIndex].product?.name}</Text>
                </VStack>
                <AspectRatio
                    ratio={4 / 3} 
                    width="100%"
                >
                    <Box
                        width="100%"
                        height="100%"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        overflow="hidden"
                        style={{ aspectRatio: '4 / 3' }}
                        position="relative"
                    >
                        {photo ? (
                            <ImageWithModal src={photo} fullSize />
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
                </AspectRatio>
                <canvas ref={canvasRef} width="800" height="600" style={{ display: 'none' }} />
                <VStack spacing={4} width="100%" mt='auto'>
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
            <ImageModal selectedPhoto={selectedPhoto} handleClose={handleClose} />
        </VStack>
    );
};

export default OrderExecution4ProovingProduct;