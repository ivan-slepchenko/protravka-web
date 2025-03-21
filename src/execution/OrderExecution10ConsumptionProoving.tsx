import { useState, useEffect } from 'react';
import { Box, Button, VStack, Text, IconButton, AspectRatio } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { nextPage, incrementProductIndex, setProductConsumptionPhoto, setConsumptionPhoto, saveOrderExecution } from '../store/executionSlice';
import { AppDispatch, RootState } from '../store/store';
import { FaCamera, FaCog } from 'react-icons/fa';
import { OrderExecutionPage } from './OrderExecutionPage';
import useCamera from '../hooks/useCamera';
import useImageModal from '../hooks/useImageModal';
import { useTranslation } from 'react-i18next';

const OrderExecution10ConsumptionProoving = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const [photo, setPhotoState] = useState<Blob | null>(null);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();
    const { ImageWithoutModal } = useImageModal();
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

    const handleTakeSnapshot = async () => {
        const photoData = await takeSnapshot();
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
            //we increase page, then save order execution, to sync page with backend.
            dispatch(saveOrderExecution());
        }
    };

    return (
        <VStack justifyContent="center" h='full' position='relative'>
            <VStack spacing={6} width="100%" maxWidth="400px" h="full">
                <Text fontSize="xl" fontWeight="bold">
                    {t('order_execution.make_consumption_photo_proof')}
                </Text>
                <AspectRatio
                    ratio={4 / 3} 
                    width="100%"
                >
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
                            <ImageWithoutModal src={photo} fullSize />
                        ) : (
                            <>
                                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted={true} />
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
                        onClick={photo ? handleRetakeClick : handleTakeSnapshot}
                        leftIcon={photo ? undefined : <FaCamera />}
                    >
                        {photo ? t('order_execution.retake_picture') : t('order_execution.take_picture')}
                    </Button>
                    <Button
                        w="200px" 
                        borderRadius="full"
                        colorScheme="orange"
                        disabled={!photo}
                        onClick={handleNextButtonClick}
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

export default OrderExecution10ConsumptionProoving;