import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Button, VStack, Image } from '@chakra-ui/react';
import { FaCamera } from 'react-icons/fa';
import { incrementProductIndex, nextPage, resetPhotoForProvingProductApplication, saveOrderExecution, setPhotoForProvingProductApplication } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { OrderExecutionPage } from './OrderExecutionPage';

const OrderExecution4ProovingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const currentProductIndex = currentOrderExecution?.currentProductIndex;
    const [photo, setPhotoState] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    if (currentOrder === null || currentProductIndex === undefined || currentProductIndex === null) {
        return null;
    }

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
                if (currentOrder.productDetails[currentProductIndex] === undefined) {
                    throw new Error(`Product details not found for the current receipe and product index ${currentOrder.id} ${currentProductIndex}`);
                }

                const productDetails = currentOrder.productDetails[currentProductIndex];
                if (productDetails.product !== undefined) {
                    const productId = productDetails.product.id;
                    dispatch(setPhotoForProvingProductApplication({ photo: photoData, productId }));
                    dispatch(saveOrderExecution());
                } else {
                    throw new Error(`Product not found for the current receipe and product index ${currentOrder.id} ${currentProductIndex}`);
                }
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
                        w="200px" 
                        borderRadius="full"
                        border="1px solid"
                        borderColor="orange.300"
                        onClick={photo ? handleRetakePhoto : takeSnapshot}
                        leftIcon={photo ? undefined : <FaCamera />}
                    >
                        {photo ? 'Retake the picture' : ''}
                    </Button>
                    <Button
                        w="200px" 
                        borderRadius="full"
                        colorScheme="orange"
                        onClick={handleNextButtonClick}
                        disabled={!photo} // Disable button if no photo
                    >
                        Next
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default OrderExecution4ProovingProduct;