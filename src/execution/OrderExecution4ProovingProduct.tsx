import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, IconButton, AspectRatio } from '@chakra-ui/react';
import { FaCamera, FaCog } from 'react-icons/fa';
import { incrementProductIndex, nextPage, resetPhotoForProvingProductApplication, saveOrderExecution, setPhotoForProvingProductApplication } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { OrderExecutionPage } from './OrderExecutionPage';
import useCamera from '../hooks/useCamera';
import useImageModal from '../hooks/useImageModal';
import { useTranslation } from 'react-i18next';

const OrderExecution4ProovingProduct = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const currentProductIndex = currentOrderExecution?.currentProductIndex;
    const [photo, setPhotoState] = useState<Blob | null>(null);
    const { videoPlaceholderRef: videoRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();
    const { ImageWithoutModal } = useImageModal();

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
                throw new Error(t('order_execution.product_details_not_found', { id: currentOrder.id, index: currentProductIndex }));
            }

            const productDetails = currentOrder.productDetails[currentProductIndex];
            if (productDetails.product !== undefined) {
                const productId = productDetails.product.id;
                dispatch(setPhotoForProvingProductApplication({ photo: photoData, productId }));
                dispatch(saveOrderExecution());
                stopCamera();
            } else {
                throw new Error(t('order_execution.product_not_found', { id: currentOrder.id, index: currentProductIndex }));
            }
        }
    };

    const handleRetakePhoto = () => {
        const productDetails = currentOrder.productDetails[currentProductIndex];
        if (productDetails === undefined) {
            throw new Error(t('order_execution.product_details_not_found', { id: currentOrder.id, index: currentProductIndex }));
        }

        const product = productDetails.product;
        if (product === undefined) {
            throw new Error(t('order_execution.product_not_found', { id: currentOrder.id, index: currentProductIndex }));
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
        //we increase page, then save order execution, to sync page with backend.
        dispatch(saveOrderExecution());
    };

    return (
        <VStack justifyContent="center" h='full' position='relative'>
            <VStack spacing={6} width="100%" maxWidth="400px" h='full'>
                <VStack gap={0}>
                    <Text>
                        {t('order_execution.product')} {currentProductIndex + 1} {t('order_execution.out_of')} {currentOrder.productDetails.length}
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
                            <ImageWithoutModal src={photo} fullSize />
                        ) : (
                            <>
                                <Box ref={videoRef} style={{ width: '100%', height: '100%' }} />
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
                <VStack spacing={4} width="100%" mt='auto'>
                    <Button
                        w="200px" 
                        borderRadius="full"
                        border="1px solid"
                        borderColor="orange.300"
                        onClick={photo ? handleRetakePhoto : handleTakeSnapshot}
                        leftIcon={photo ? undefined : <FaCamera />}
                    >
                        {photo ? t('order_execution.retake_picture') : t('order_execution.take_picture')}
                    </Button>
                    <Button
                        w="200px" 
                        borderRadius="full"
                        colorScheme="orange"
                        onClick={handleNextButtonClick}
                        disabled={!photo}
                    >
                        {t('order_execution.next')}
                    </Button>
                </VStack>
            </VStack>
            <SettingsModal />
            <WarningModal />
        </VStack>
    );
};

export default OrderExecution4ProovingProduct;