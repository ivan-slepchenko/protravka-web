import { useState, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { Order } from '../store/newOrderSlice';
import { fetchOrders, updateOrderTKW } from '../store/ordersSlice';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Grid, GridItem, VStack, Divider, HStack, Text, Checkbox, Badge, Box, Image, CircularProgress, IconButton } from '@chakra-ui/react';
import { FaCamera, FaCog } from 'react-icons/fa';
import useCamera from '../hooks/useCamera';

interface RecipeRawTkwDetailsInputModalProps {
    selectedOrder: Order;
    onClose: () => void;
}

const RecipeRawTkwDetailsInputModal: FC<RecipeRawTkwDetailsInputModalProps> = ({ selectedOrder, onClose }) => {
    const dispatch: AppDispatch = useDispatch();
    const [tkwRep1, setTkwRep1] = useState<number | null>(null);
    const [tkwRep2, setTkwRep2] = useState<number | null>(null);
    const [tkwRep3, setTkwRep3] = useState<number | null>(null);
    const [averageTkw, setAverageTkw] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [tkwProbesPhoto, setTkwProbesPhoto] = useState<string | null>(null);
    const [isPhotoState, setIsPhotoState] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { videoRef, canvasRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();

    useEffect(() => {
        setAverageTkw(((tkwRep1 ?? 0) + (tkwRep2 ?? 0) + (tkwRep3 ?? 0)) / 3);
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
        if (tkwRep1 !== null && tkwRep2 !== null && tkwRep3 !== null && tkwProbesPhoto !== null) {
            dispatch(updateOrderTKW({
                id: selectedOrder.id,
                tkwRep1,
                tkwRep2,
                tkwRep3,
                tkwProbesPhoto,
            })).then(() => {
                dispatch(fetchOrders());
                setIsSaving(false);
                onClose();
            });
        } else {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        setIsPhotoState(false);
        stopCamera();
    };

    return (
        <Modal isOpen={!!selectedOrder} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" w="full" h="full">
                <ModalHeader>
                    {selectedOrder.crop?.name}, {selectedOrder.variety?.name}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody h="full" overflow='auto'>
                    {!isPhotoState ? (
                        <Grid templateColumns="3fr 2fr" gap={4} w='full'>
                            <GridItem colSpan={2}>
                                <Badge autoCapitalize='none' w="full" colorScheme="gray">
                                    <Text fontSize={{ base: "xs", md: "sm" }}>
                                        Counting TKW of UNTREATED seeds
                                    </Text>
                                </Badge>
                            </GridItem>
                            
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>Lot:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{selectedOrder.lotNumber}</Text>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>Seeds To Treat:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{selectedOrder.seedsToTreatKg} kg.</Text>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>Assignment Created At:</strong></Text>
                            </GridItem>
                             
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{new Date(selectedOrder.creationDate).toLocaleString()}</Text>
                            </GridItem>

                            <GridItem colSpan={2}>
                                <Divider />
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>TKW Probe 1:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <HStack>
                                    <Input
                                        placeholder="0"
                                        value={tkwRep1 ?? ''}
                                        onChange={(e) => setTkwRep1(e.target.value === '' ? null : Number(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value))}
                                        size={{ base: "sm", md: "md" }}
                                        type="number"
                                        step="0.01"
                                    />
                                    <Text fontSize={{ base: "sm", md: "md" }}>gr.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>TKW Probe 2:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <HStack>
                                    <Input
                                        placeholder="0"
                                        value={tkwRep2 ?? ''}
                                        onChange={(e) => setTkwRep2(e.target.value === '' ? null : Number(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value))}
                                        size={{ base: "sm", md: "md" }}
                                        type="number"
                                        step="0.01"
                                    />
                                    <Text fontSize={{ base: "sm", md: "md" }}>gr.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>TKW Probe 3:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <HStack>
                                    <Input
                                        placeholder="0"
                                        value={tkwRep3 ?? ''}
                                        onChange={(e) => setTkwRep3(e.target.value === '' ? null : Number(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value))}
                                        size={{ base: "sm", md: "md" }}
                                        type="number"
                                        step="0.01"
                                    />
                                    <Text fontSize={{ base: "sm", md: "md" }}>gr.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem colSpan={2}>
                                <Divider />
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>Average TKW:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{averageTkw !== null ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                            </GridItem>
                        </Grid>
                    ) : (
                        <VStack spacing={8} width="100%">
                            <Text mb={1} fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
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
                            <Button variant="ghost" mb="3" onClick={handleBack} disabled={isSaving}>Back</Button>
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
            <WarningModal />
        </Modal>
    );
};

export default RecipeRawTkwDetailsInputModal;
