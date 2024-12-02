import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Button, VStack, Image, HStack } from '@chakra-ui/react';
import { FaCamera } from 'react-icons/fa';
import { nextProduct, nextPage, setPhoto, resetPhoto } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { OrderExecutionPage } from './OrderExecutionPage';

const OrderExecution4ProovingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const { currentOrderId, currentProductIndex } = useSelector((state: RootState) => state.execution);
    const [photo, setPhotoState] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));

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

    const handleRetakePhoto = () => {
        setPhotoState(null);
        startCamera();
        dispatch(resetPhoto());
    };

    const handleNextButtonClick = () => {
        if (currentOrderId) {
            if (order) {
                if (currentProductIndex < order.productDetails.length - 1) {
                    dispatch(nextProduct());
                    dispatch(nextPage(OrderExecutionPage.ApplyingProduct));
                } else {
                    dispatch(nextPage());
                }
            }
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" p={4}>
            <VStack spacing={8} width="100%" maxWidth="400px">
                <Text mb={2}>
                    {'Product: '}
                    {order?.productDetails[currentProductIndex].product?.name}
                    {' #'}
                    {currentProductIndex + 1}
                    {'  out of '}
                    {order?.productDetails.length}
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
                >
                    {photo ? (
                        <Image src={photo} alt="Scales display" objectFit="cover" style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                </Box>
                <canvas ref={canvasRef} width="800" height="600" style={{ display: 'none' }} />
                <VStack spacing={4} width="100%">
                    <Button
                        w="100px" 
                        borderRadius="full"
                        border="1px solid"
                        borderColor="orange.300"
                        onClick={photo ? handleRetakePhoto : takeSnapshot}
                        leftIcon={photo ? undefined : <FaCamera />}
                    >
                        {photo ? 'Retake the picture' : ''}
                    </Button>
                    <Button
                        w="100px" 
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

export default OrderExecution4ProovingProduct;