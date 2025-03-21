import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, IconButton } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { nextPage, resetCurrentProductIndex, resetPackingPhoto, saveOrderExecution, setPhotoForPacking } from '../store/executionSlice';
import { FaCamera, FaCog } from 'react-icons/fa';
import { AppDispatch } from '../store/store';
import useCamera from '../hooks/useCamera';
import useImageModal from '../hooks/useImageModal';
import { useTranslation } from 'react-i18next';

const OrderExecution8PackingProoving = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const [photo, setPhotoState] = useState<Blob | null>(null);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();
    const { ImageWithoutModal } = useImageModal();

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
            dispatch(setPhotoForPacking(photoData));
            dispatch(saveOrderExecution());
            stopCamera();
        }
    };

    const handleRetakeClick = () => {
        setPhotoState(null);
        startCamera();
        dispatch(resetPackingPhoto());
        dispatch(saveOrderExecution());
    };

    const handleNextButtonClick = () => {
        dispatch(resetCurrentProductIndex());
        dispatch(nextPage());//we increase page, then save order execution, to sync page with backend.
        dispatch(saveOrderExecution());
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" w="full" h="full" overflow={'auto'}>
            <VStack spacing={8} width="100%"  h="full" p={4} >
                <Text mb={1} fontSize="md" fontWeight="bold">{t('order_execution.obliged_to_make_photo_display')}</Text>
                <Box
                    width="100%"
                    maxWidth="400px"
                    height="300px"
                    flexShrink={0}
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
                <VStack spacing={4} width="100%">
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
                        onClick={handleNextButtonClick}
                        disabled={!photo}
                    >
                        {t('order_execution.next')}
                    </Button>
                </VStack>
            </VStack>
            <SettingsModal />
            <WarningModal />
        </Box>
    );
};

export default OrderExecution8PackingProoving;