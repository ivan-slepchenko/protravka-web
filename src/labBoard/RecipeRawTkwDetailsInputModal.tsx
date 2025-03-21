import { useState, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { Order } from '../store/newOrderSlice';
import { fetchOrders, updateOrderTKW } from '../store/ordersSlice';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Grid,
    GridItem,
    VStack,
    Divider,
    HStack,
    Text,
    Checkbox,
    Badge,
    Box,
    CircularProgress,
    IconButton,
    NumberInput,
    NumberInputField,
} from '@chakra-ui/react';
import { FaCamera, FaCog } from 'react-icons/fa';
import useCamera from '../hooks/useCamera';
import useImageModal from '../hooks/useImageModal';
import { useTranslation } from 'react-i18next';

interface RecipeRawTkwDetailsInputModalProps {
    selectedOrder: Order;
    onClose: () => void;
}

const RecipeRawTkwDetailsInputModal: FC<RecipeRawTkwDetailsInputModalProps> = ({ selectedOrder, onClose }) => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const [tkwRep1, setTkwRep1] = useState<number | null>(null);
    const [tkwRep2, setTkwRep2] = useState<number | null>(null);
    const [tkwRep3, setTkwRep3] = useState<number | null>(null);
    const [averageTkw, setAverageTkw] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [tkwProbesPhoto, setTkwProbesPhoto] = useState<Blob | null>(null);
    const [isPhotoState, setIsPhotoState] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { videoPlaceholderRef, startCamera, stopCamera, takeSnapshot, handleSettingsClick, SettingsModal, WarningModal } = useCamera();
    const { ImageWithoutModal } = useImageModal();

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        setAverageTkw(((tkwRep1 ?? 0) + (tkwRep2 ?? 0) + (tkwRep3 ?? 0)) / 3);
    }, [tkwRep1, tkwRep2, tkwRep3]);

    const handleTakeSnapshot = () => {
        takeSnapshot().then((photoData) => {
            if (photoData) {
                setTkwProbesPhoto(photoData);
            }
        });
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
        if (isPhotoState) {
            setIsPhotoState(false);
            stopCamera();
        } else {
            onClose();
        }
    };

    return (
        <Modal isOpen={!!selectedOrder} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" h="full">
                <ModalHeader>
                    {t('recipe_raw_tkw_details_input_modal.count_tkw_untreated')}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody h="full" overflow='auto'>
                    {!isPhotoState ? (
                        <Grid templateColumns="3fr 2fr" gap={4} w='full'>
                            <GridItem colSpan={2}>
                                <Badge autoCapitalize='none' w="full" colorScheme="gray">
                                    <Text fontSize={{ base: "md", md: "lg" }}>
                                        {selectedOrder.crop?.name}, {selectedOrder.variety?.name}
                                    </Text>
                                </Badge>
                            </GridItem>
                            
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>{t('recipe_raw_tkw_details_input_modal.lot')}:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{selectedOrder.lotNumber}</Text>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>{t('recipe_raw_tkw_details_input_modal.seeds_to_treat')}:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{selectedOrder.seedsToTreatKg} {t('units.kg')}.</Text>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>{t('recipe_raw_tkw_details_input_modal.assignment_created_at')}:</strong></Text>
                            </GridItem>
                             
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{selectedOrder.creationDate === null ? 'N/A' : new Date(selectedOrder.creationDate).toLocaleString()}</Text>
                            </GridItem>

                            <GridItem colSpan={2}>
                                <Divider />
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>{t('recipe_raw_tkw_details_input_modal.tkw_probe_1')}:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <HStack>
                                    <NumberInput
                                        w="full"
                                        onChange={(_, valueAsNumber) => setTkwRep1(isNaN(valueAsNumber) ? null : valueAsNumber)}
                                        size={{ base: "sm", md: "md" }}
                                    >
                                        <NumberInputField placeholder='0'/>
                                    </NumberInput>
                                    <Text fontSize={{ base: "sm", md: "md" }}>{t('units.gr')}.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>{t('recipe_raw_tkw_details_input_modal.tkw_probe_2')}:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <HStack>
                                    <NumberInput
                                        w="full"
                                        onChange={(_, valueAsNumber) => setTkwRep2(isNaN(valueAsNumber) ? null : valueAsNumber)}
                                        size={{ base: "sm", md: "md" }}
                                    >
                                        <NumberInputField placeholder='0'/>
                                    </NumberInput>
                                    <Text fontSize={{ base: "sm", md: "md" }}>{t('units.gr')}.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>{t('recipe_raw_tkw_details_input_modal.tkw_probe_3')}:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <HStack>
                                    <NumberInput
                                        w="full"
                                        onChange={(_, valueAsNumber) => setTkwRep3(isNaN(valueAsNumber) ? null : valueAsNumber)}
                                        size={{ base: "sm", md: "md" }}
                                    >
                                        <NumberInputField placeholder='0'/>
                                    </NumberInput>
                                    <Text fontSize={{ base: "sm", md: "md" }}>{t('units.gr')}.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem colSpan={2}>
                                <Divider />
                            </GridItem>

                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}><strong>{t('recipe_raw_tkw_details_input_modal.average_tkw')}:</strong></Text>
                            </GridItem>
                            <GridItem px={1} h={10} alignContent={'center'}>
                                <Text fontSize={{ base: "sm", md: "md" }}>{averageTkw !== null ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                            </GridItem>
                        </Grid>
                    ) : (
                        <VStack spacing={8} width="100%">
                            <Text mb={1} fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                {t('recipe_raw_tkw_details_input_modal.take_photo_untreated')} {selectedOrder.crop.name} {selectedOrder.lotNumber}
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
                                <Box
                                    ref={videoPlaceholderRef}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: tkwProbesPhoto ? 'none' : 'block',
                                    }}
                                />
                                <IconButton
                                    icon={<FaCog />}
                                    isRound
                                    aria-label="Settings"
                                    position="absolute"
                                    bottom="10px"
                                    right="10px"
                                    size="sm"
                                    onClick={handleSettingsClick}
                                    style={{ display: tkwProbesPhoto ? 'none' : 'inline-flex' }}
                                />
                                <Box
                                    style={{
                                        display: tkwProbesPhoto ? 'block' : 'none',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                >
                                    {tkwProbesPhoto && <ImageWithoutModal src={tkwProbesPhoto} fullSize />}
                                </Box>
                            </Box>
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
                                    {tkwProbesPhoto ? t('recipe_raw_tkw_details_input_modal.retake_picture') : t('recipe_raw_tkw_details_input_modal.take_picture')}
                                </Button>
                            </VStack>
                            <HStack spacing={4}>
                                <Button colorScheme="green" onClick={() => {
                                    startCamera();
                                }}>
                                    Start Camera
                                </Button>
                                <Button colorScheme="red" onClick={stopCamera}>
                                    Stop Camera
                                </Button>
                            </HStack>
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
                                {t('recipe_raw_tkw_details_input_modal.confirm_tkw_compliance')}
                            </Checkbox>
                        )}
                        <HStack w="full" justify="end">
                            <Button variant="ghost" mb="3" onClick={handleBack} disabled={isSaving}>{t('recipe_raw_tkw_details_input_modal.back')}</Button>
                            {!isPhotoState ? (
                                <Button colorScheme="blue" mb="3" onClick={handleNext} isDisabled={!isConfirmed || averageTkw === null || isSaving}>
                                    {t('recipe_raw_tkw_details_input_modal.next')}
                                </Button>
                            ) : (
                                <Button colorScheme="blue" mb="3" onClick={handleSave} isDisabled={!tkwProbesPhoto || isSaving}>
                                    {isSaving ? <CircularProgress isIndeterminate size="24px" color='blue.300' /> : t('recipe_raw_tkw_details_input_modal.save')}
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
