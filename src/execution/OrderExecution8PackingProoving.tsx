import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, IconButton } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { nextPage, resetCurrentProductIndex, resetPackingPhoto, saveOrderExecution, setPhotoForPacking } from '../store/executionSlice';
import { FaCamera, FaCog } from 'react-icons/fa';
import { AppDispatch } from '../store/store';
import useCamera from '../hooks/useCamera';
import useImageModal from '../hooks/useImageModal';

const OrderExecution8PackingProoving = () => {
    const dispatch: AppDispatch = useDispatch();
    const [photo, setPhotoState] = useState<Blob | null>(null);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();
    const { ImageWithModal, ImageModal, selectedPhoto, handleClose } = useImageModal();

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
        dispatch(nextPage());
        dispatch(saveOrderExecution());
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" w="full" h="full" overflow={'auto'}>
            <VStack spacing={8} width="100%"  h="full" p={4} >
                <Text mb={1} fontSize="md" fontWeight="bold">You are obliged to make a photo of the display showing the amount of the treated seeds.</Text>
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
        </Box>
    );
};

export default OrderExecution8PackingProoving;