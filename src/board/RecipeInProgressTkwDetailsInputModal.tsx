import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { fetchOrderById } from '../store/ordersSlice';
import { fetchOrderExecution, fetchTkwMeasurements, updateTkwMeasurement, TkwMeasurement } from '../store/executionSlice';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Grid, GridItem, Center, VStack, Divider, HStack, Text, Checkbox, Badge, Box, Image, CircularProgress, IconButton } from '@chakra-ui/react';
import { FaCamera, FaCog } from 'react-icons/fa';
import { Order } from '../store/newOrderSlice';
import useCamera from '../hooks/useCamera';

interface RecipeInProgressTkwDetailsInputModalProps {
    selectedMeasurement: TkwMeasurement;
    onClose: () => void;
}

const RecipeInProgressTkwDetailsInputModal: React.FC<RecipeInProgressTkwDetailsInputModalProps> = ({ selectedMeasurement, onClose }) => {
    const dispatch: AppDispatch = useDispatch();
    const [orderExecutionId, setOrderExecutionId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [tkwRep1, setTkwRep1] = useState<number | null>(null);
    const [tkwRep2, setTkwRep2] = useState<number | null>(null);
    const [tkwRep3, setTkwRep3] = useState<number | null>(null);
    const [averageTkw, setAverageTkw] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [tkwProbesPhoto, setTkwProbesPhoto] = useState<string | null>(null);
    const [isPhotoState, setIsPhotoState] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal } = useCamera();

    useEffect(() => {
        const fetchExecution = async () => {
            const orderExecution = await fetchOrderExecution(selectedMeasurement.orderExecution.orderId);
            setOrderExecutionId(orderExecution.id);
        };
        fetchExecution();
    }, [dispatch, selectedMeasurement]);

    useEffect(() => {
        const fetchOrder = async () => {
            const order = await dispatch(fetchOrderById(selectedMeasurement.orderExecution.orderId)).unwrap();
            setSelectedOrder(order);
        };
        fetchOrder();
    }, [dispatch, selectedMeasurement]);

    useEffect(() => {
        if (tkwRep1 !== null && tkwRep2 !== null && tkwRep3 !== null) {
            setAverageTkw((tkwRep1 + tkwRep2 + tkwRep3) / 3);
        } else {
            setAverageTkw(null);
        }
    }, [tkwRep1, tkwRep2, tkwRep3]);

    const handleTakeSnapshot = () => {
        const photoData = takeSnapshot();
        if (photoData) {
            setTkwProbesPhoto(photoData);
            stopCamera();
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
        setIsSaving(true);
        if (orderExecutionId && tkwRep1 !== null && tkwRep2 !== null && tkwRep3 !== null && tkwProbesPhoto !== null) {
            dispatch(updateTkwMeasurement({
                id: selectedMeasurement.id,
                orderExecutionId,
                tkwRep1,
                tkwRep2,
                tkwRep3,
                tkwProbesPhoto: tkwProbesPhoto,
            })).then(() => {
                setIsSaving(false);
                onClose();
            });
            dispatch(fetchTkwMeasurements());
        } else {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={!!selectedMeasurement} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" w="full" h="full">
                <ModalHeader>Recipe In Progress TKW Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Center w="full" h="full">
                        {!isPhotoState ? (
                            <Grid templateColumns={{ base: "1fr", md: "3fr 2fr" }} gap={4} w='full'>
                                <GridItem colSpan={2} mb={8}>
                                    <Badge autoCapitalize='none' w="full" colorScheme="gray">
                                        <Text fontSize={{ base: "md", md: "lg" }}>
                                            Counting TKW of UNTREATED seeds
                                        </Text>
                                    </Badge>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}><strong>Lot:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}>{selectedOrder ? selectedOrder.lotNumber : 'N/A'}</Text>
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}><strong>Seeds To Treat:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}>{selectedOrder ? `${selectedOrder.seedsToTreatKg} kg.` : `N/A`}</Text>
                                </GridItem>

                                <GridItem colSpan={2}>
                                    <Divider />
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}><strong>TKW Probe 1:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <HStack>
                                        <Input
                                            placeholder="0"
                                            value={tkwRep1 ?? ''}
                                            onChange={(e) => setTkwRep1(Number(e.target.value))}
                                            size={{ base: "sm", md: "md" }}
                                        />
                                        <Text fontSize={{ base: "sm", md: "md" }}>gr.</Text>
                                    </HStack>
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}><strong>TKW Probe 2:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <HStack>
                                        <Input
                                            placeholder="0"
                                            value={tkwRep2 ?? ''}
                                            onChange={(e) => setTkwRep2(Number(e.target.value))}
                                            size={{ base: "sm", md: "md" }}
                                        />
                                        <Text fontSize={{ base: "sm", md: "md" }}>gr.</Text>
                                    </HStack>
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}><strong>TKW Probe 3:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <HStack>
                                        <Input
                                            placeholder="0"
                                            value={tkwRep3 ?? ''}
                                            onChange={(e) => setTkwRep3(Number(e.target.value))}
                                            size={{ base: "sm", md: "md" }}
                                        />
                                        <Text fontSize={{ base: "sm", md: "md" }}>gr.</Text>
                                    </HStack>
                                </GridItem>

                                <GridItem colSpan={2}>
                                    <Divider />
                                </GridItem>

                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}><strong>Average TKW:</strong></Text>
                                </GridItem>
                                <GridItem h={10} alignContent={'center'}>
                                    <Text fontSize={{ base: "sm", md: "md" }}>{averageTkw !== null ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                                </GridItem>
                            </Grid>
                        ) : (
                            <VStack spacing={8} width="100%">
                                {selectedOrder && <Text mb={1} fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                    You are obliged to take a photo of UNTREATED seeds of {selectedOrder.crop.name} {selectedOrder.lotNumber}
                                </Text>}
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
                                    position="relative"
                                >
                                    {tkwProbesPhoto ? (
                                        <Image src={tkwProbesPhoto} alt="Machine display" objectFit="cover" style={{ width: '100%', height: '100%' }} />
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
                                        onClick={tkwProbesPhoto ? handleRetakeClick : handleTakeSnapshot}
                                        leftIcon={tkwProbesPhoto ? undefined : <FaCamera />}
                                        disabled={isSaving}
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
                                disabled={isSaving}
                            >
                                I hereby confirm that the TKW was counted by me fully compliant with the official demands
                            </Checkbox>
                        )}
                        <HStack w="full" justify="end">
                            <Button variant="ghost" mb="3" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            {!isPhotoState ? (
                                <Button colorScheme="blue" mb="3" onClick={handleNext} isDisabled={!isConfirmed || averageTkw === null || isSaving}>
                                    Next
                                </Button>
                            ) : (
                                <Button colorScheme="blue" mb="3" onClick={handleSave} isDisabled={!tkwProbesPhoto || isSaving}>
                                    {isSaving ? <CircularProgress isIndeterminate size="24px" color='blue.300' /> : 'Save'}
                                </Button>
                            )}
                        </HStack>
                    </VStack>
                </ModalFooter>
            </ModalContent>
            <SettingsModal />
        </Modal>
    );
};

export default RecipeInProgressTkwDetailsInputModal;
