import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack, Image } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { nextPage, resetPhoto, setPhoto } from '../store/executionSlice';
import { OrderExecutionPage } from './OrderExecutionPage';
import { RootState } from '../store/store';

const OrderExecutionPhotoConfirmation = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const dispatch = useDispatch();
    const photo = useSelector((state: RootState) => state.execution.photo);
    const [photoState, setPhotoState] = useState<string | null>(photo);
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
                dispatch(setPhoto(photoData));
            }
        }
    };

    const handleRetakeClick = () => {
        setPhotoState(null);
        startCamera();
        dispatch(resetPhoto());
    };

    const handleNextClick = () => {
        dispatch(nextPage());
    };

    return (
        <VStack p={4} w="full" h="full">
            <Text fontSize="2xl" fontWeight="bold">How many seeds did you pack out of?</Text>
            <Box
                mt={4}
                p={8}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                textAlign="center"
            >
                {photoState ? (
                    <Image src={photoState} alt="Machine display" />
                ) : (
                    <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
            </Box>
            <canvas ref={canvasRef} width="800" height="600" style={{ display: 'none' }} />
            <HStack justifyContent={"center"} mt='auto'>
                <Button
                    colorScheme="orange"
                    borderRadius="full"
                    w="200px" 
                    size={isMobile ? "sm" : "md"}
                    mr={4}
                    onClick={photoState ? handleRetakeClick : takeSnapshot}
                >
                    {photoState ? 'Retake the picture' : 'Take Picture'}
                </Button>
                <Button
                    w="200px" 
                    colorScheme="orange"
                    borderRadius="full"
                    _hover={{ bg: "orange.600" }}
                    size={isMobile ? "md" : "lg"}
                    onClick={handleNextClick}
                >
                    Next
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecutionPhotoConfirmation;