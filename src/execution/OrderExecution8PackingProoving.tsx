import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Button, VStack, Image } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { nextPage, resetCurrentProductIndex, resetPhoto, setPhotoForPacking } from '../store/executionSlice';
import { FaCamera } from 'react-icons/fa';

const OrderExecution8PackingProoving = () => {
    const dispatch = useDispatch();
    const [photo, setPhotoState] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        startCamera();
    }, []);

    const startCamera = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                    };
                }
            });
        }
    };

    const takeSnapshot = () => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const photoData = canvasRef.current.toDataURL('image/png');
                setPhotoState(photoData);
                dispatch(setPhotoForPacking(photoData));
            }
        }
    };

    const handleRetakeClick = () => {
        setPhotoState(null);
        startCamera();
        dispatch(resetPhoto());
    };

    const handleNextButtonClick = () => {
        dispatch(resetCurrentProductIndex())
        dispatch(nextPage());
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" w="full" h="full" p={4}>
            <VStack spacing={8} width="100%">
                <Text mb={1} fontSize="md" fontWeight="bold">You are obliged to make a photo of the display showing the amount of the treated seeds.</Text>
                <Box
                    width="100%"
                    maxWidth="400px"
                    height="300px"
                    border="1px solid"
                    borderColor="gray.300"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="md"
                    overflow="hidden"
                    style={{ aspectRatio: '4 / 3' }}
                >
                    {photo ? (
                        <Image src={photo} alt="Machine display" objectFit="cover" style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                </Box>
                <canvas ref={canvasRef} width="800" height="600" style={{ display: 'none' }} />
                <VStack spacing={4} width="100%">
                    <Button
                        w="200px" 
                        borderRadius="full"
                        border="1px solid"
                        borderColor="orange.300"
                        onClick={photo ? handleRetakeClick : takeSnapshot}
                        leftIcon={photo ? undefined : <FaCamera />}
                    >
                        {photo ? 'Retake the picture' : ''}
                    </Button>
                    <Button
                        w="200px" 
                        borderRadius="full"
                        colorScheme="orange"
                        onClick={handleNextButtonClick}
                    >
                        Next
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default OrderExecution8PackingProoving;