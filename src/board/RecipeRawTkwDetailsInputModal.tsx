import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { fetchOrders, updateOrderTKW } from '../store/ordersSlice';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Grid, GridItem, Center, VStack, Divider, HStack, Text, Checkbox, Badge, Box, Image } from '@chakra-ui/react';
import { FaCamera } from 'react-icons/fa';

interface RecipeRawTkwDetailsInputModalProps {
    selectedOrder: Order;
    onClose: () => void;
}

const RecipeRawTkwDetailsInputModal: React.FC<RecipeRawTkwDetailsInputModalProps> = ({ selectedOrder, onClose }) => {
    const dispatch: AppDispatch = useDispatch();
    const [tkwRep1, setTkwRep1] = useState<number | null>(null);
    const [tkwRep2, setTkwRep2] = useState<number | null>(null);
    const [tkwRep3, setTkwRep3] = useState<number | null>(null);
    const [averageTkw, setAverageTkw] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [tkwProbesPhoto, setTkwProbesPhoto] = useState<string | null>(null);
    const [isPhotoState, setIsPhotoState] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (tkwRep1 !== null && tkwRep2 !== null && tkwRep3 !== null) {
            setAverageTkw((tkwRep1 + tkwRep2 + tkwRep3) / 3);
        } else {
            setAverageTkw(null);
        }
    }, [tkwRep1, tkwRep2, tkwRep3]);

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
                setTkwProbesPhoto(photoData);
            }
        }
    };

    const handleRetakeClick = () => {
        setTkwProbesPhoto(null);
        startCamera();
    };

    const handleNext = () => {
        setIsPhotoState(true);
        startCamera();
    };

    const handleSave = () => {
        if (tkwRep1 !== null && tkwRep2 !== null && tkwRep3 !== null && tkwProbesPhoto !== null) {
            dispatch(updateOrderTKW({
                id: selectedOrder.id,
                tkwRep1,
                tkwRep2,
                tkwRep3,
                tkwProbesPhoto: tkwProbesPhoto,
            }));
            dispatch(fetchOrders());
        }
        onClose();
    };

    return (
        <Modal isOpen={!!selectedOrder} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" w="full" h="full">
                <ModalHeader>Recipe Raw TKW Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Center w="full" h="full">
                        {!isPhotoState ? (
                            <Grid templateColumns="3fr 2fr" gap={4} w='full'>
                                <GridItem colSpan={2} mb={8}>
                                    <Badge autoCapitalize='none' w="full" colorScheme="gray">
                                        <Text fontSize="lg">
                                            Counting TKW of UNTREATED seeds
                                        </Text>
                                    </Badge>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text><strong>Lot:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text>{selectedOrder.lotNumber}</Text>
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text><strong>Seeds To Treat:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text>{selectedOrder.seedsToTreatKg} kg.</Text>
                                </GridItem>

                                <GridItem colSpan={2}>
                                    <Divider />
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text><strong>TKW Probe 1:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <HStack>
                                        <Input
                                            placeholder="0"
                                            value={tkwRep1 ?? ''}
                                            onChange={(e) => setTkwRep1(Number(e.target.value))}
                                        />
                                        <Text>gr.</Text>
                                    </HStack>
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text><strong>TKW Probe 2:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <HStack>
                                        <Input
                                            placeholder="0"
                                            value={tkwRep2 ?? ''}
                                            onChange={(e) => setTkwRep2(Number(e.target.value))}
                                        />
                                        <Text>gr.</Text>
                                    </HStack>
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text><strong>TKW Probe 3:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <HStack>
                                        <Input
                                            placeholder="0"
                                            value={tkwRep3 ?? ''}
                                            onChange={(e) => setTkwRep3(Number(e.target.value))}
                                        />
                                        <Text>gr.</Text>
                                    </HStack>
                                </GridItem>

                                <GridItem colSpan={2}>
                                    <Divider />
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text><strong>Average TKW:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text>{averageTkw !== null ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                                </GridItem>
                            </Grid>
                        ) : (
                            <VStack spacing={8} width="100%">
                                <Text mb={1} fontSize="md" fontWeight="bold">
                                    You are obliged to take a photo of UNTREATED seeds of {selectedOrder.crop.name} {selectedOrder.lotNumber}
                                </Text>
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
                                    {tkwProbesPhoto ? (
                                        <Image src={tkwProbesPhoto} alt="Machine display" objectFit="cover" style={{ width: '100%', height: '100%' }} />
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
                                        onClick={tkwProbesPhoto ? handleRetakeClick : takeSnapshot}
                                        leftIcon={tkwProbesPhoto ? undefined : <FaCamera />}
                                    >
                                        {tkwProbesPhoto ? 'Retake the picture' : 'Take Picture'}
                                    </Button>
                                </VStack>
                            </VStack>
                        )}
                    </Center>
                </ModalBody>
                <ModalFooter>
                    <VStack align="start" w="full">
                        {!isPhotoState && (
                            <Checkbox
                                size="md"
                                mb={4}
                                spacing="1rem"
                                isChecked={isConfirmed}
                                onChange={(e) => setIsConfirmed(e.target.checked)}
                            >
                                I hereby confirm that the TKW was counted by me fully compliant with the official demands
                            </Checkbox>
                        )}
                        <HStack w="full" justify="end">
                            <Button variant="ghost" mb="3" onClick={onClose}>Cancel</Button>
                            {!isPhotoState ? (
                                <Button colorScheme="blue" mb="3" onClick={handleNext} isDisabled={!isConfirmed || averageTkw === null}>
                                    Next
                                </Button>
                            ) : (
                                <Button colorScheme="blue" mb="3" onClick={handleSave} isDisabled={!tkwProbesPhoto}>
                                    Save
                                </Button>
                            )}
                        </HStack>
                    </VStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RecipeRawTkwDetailsInputModal;
