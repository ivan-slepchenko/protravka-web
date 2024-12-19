import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, Image, Heading } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { nextPage, incrementProductIndex, setProductConsumptionPhoto, setConsumptionPhoto } from '../store/executionSlice';
import { RootState } from '../store/store';
import { FaCamera } from 'react-icons/fa';
import { OrderExecutionPage } from './OrderExecutionPage';
import { ProductDetail } from '../store/newOrderSlice';
import { Product } from '../store/productsSlice';

const OrderExecution10ConsumptionProoving = () => {
    const dispatch = useDispatch();
    const [photo, setPhotoState] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(orderExecution => orderExecution.orderId === state.execution.currentOrderId));
    const applicationMethod = orderExecution?.applicationMethod;
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentProductIndex);
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === state.execution.currentOrderId));
    const totalProducts = order?.productDetails.length || 0;

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
                if (applicationMethod === 'CDS') {
                    if (order === undefined) {
                        throw new Error(`Receipe not found for the current receipe id ${currentOrderId}`);
                    }
                    if (order.productDetails[currentProductIndex] == undefined) {
                        throw new Error(`Product details not found for the current receipe and product index ${currentOrderId} ${currentProductIndex}`);
                    }

                    const productDetails: ProductDetail = order.productDetails[currentProductIndex];
                    if (productDetails.product !== undefined) {
                        const product: Product = productDetails.product;
                        const productId = product.id;
                        dispatch(setProductConsumptionPhoto({ photo: photoData, productId }));
                    } else {
                        throw new Error(`Product not found for the current receipe and product index ${currentOrderId} ${currentProductIndex}`);
                    }
                } else {
                    dispatch(setConsumptionPhoto(photoData));
                }
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

export default OrderExecution10ConsumptionProoving;