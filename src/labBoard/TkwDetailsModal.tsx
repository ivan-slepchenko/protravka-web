import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, VStack, Text, Grid, GridItem, Badge, Divider, Box, AspectRatio } from '@chakra-ui/react';
import { TkwMeasurement } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';
import useImageModal from '../hooks/useImageModal';
import { useTranslation } from 'react-i18next';

interface TkwDetailsModalProps {
    onClose: () => void;
    order: Order;
    measurements: TkwMeasurement[];
}

const TkwDetailsModal: React.FC<TkwDetailsModalProps> = ({ onClose, order, measurements }) => {
    const { t } = useTranslation();
    const { ImageModal, ImageWithModal, selectedPhoto, handleClose } = useImageModal();

    const calculateAverageTkw = (tkwValues: (number | null | undefined)[]): number | undefined => {
        const validValues = tkwValues.filter((value) => value !== undefined && value !== null) as number[];
        if (validValues.length === 0) return undefined;
        const total = validValues.reduce((sum, value) => sum + value, 0);
        return total / validValues.length;
    };

    const averageTkw = calculateAverageTkw([order.tkwRep1, order.tkwRep2, order.tkwRep3]);

    return (
        <Modal isOpen={!!order} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" h="full">
                <ModalHeader>{t('tkw_details_modal.tkw_details')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody h="full" overflow='auto'>
                    <VStack spacing={4} align="start" w="full" overflow='auto' mt="auto" mb="auto">
                        <Badge autoCapitalize='none' w="full" colorScheme="gray">
                            <Text fontSize={{ base: "md", md: "lg" }}>
                                {order.crop?.name} / {order.variety?.name}
                            </Text>
                        </Badge>
                        <Grid templateColumns="1fr 1fr" gap={4} w="full" px={1}>
                            <Text fontWeight="bold">{t('tkw_details_modal.lot')}:</Text>
                            <Text>{order.lotNumber}</Text>

                            <Text fontWeight="bold">{t('tkw_details_modal.seeds_to_treat')}:</Text>
                            <Text>{order.seedsToTreatKg} kg.</Text>

                            <Text fontWeight="bold">{t('tkw_details_modal.operator')}:</Text>
                            <Text>{order.operator?.name} {order.operator?.surname}</Text>
                        </Grid>
                        <Grid templateColumns="1fr 1fr" gap={2} w="full">
                            <GridItem px={1}>
                                {order.tkwProbesPhoto ? (
                                    <ImageWithModal src={order.tkwProbesPhoto} fullSize />
                                ) : (
                                    <AspectRatio ratio={4 / 3} width="100%">
                                        <Box
                                            border="1px solid"
                                            borderColor="gray.300"
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            bg="gray.100"
                                            w='full'
                                            h='full'
                                        >
                                            <Text color="gray.500">N/A</Text>
                                        </Box>
                                    </AspectRatio>
                                )}
                            </GridItem>
                            <GridItem>
                                <Grid templateColumns="1fr 1fr" gap={1}>
                                    <Text fontWeight="bold">{t('tkw_details_modal.probe_1')}:</Text>
                                    <Text>{order.tkwRep1 ? `${order.tkwRep1} gr.` : 'N/A'}</Text>
                                    <Text fontWeight="bold">{t('tkw_details_modal.probe_2')}:</Text>
                                    <Text>{order.tkwRep2 ? `${order.tkwRep2} gr.` : 'N/A'}</Text>
                                    <Text fontWeight="bold">{t('tkw_details_modal.probe_3')}:</Text>
                                    <Text>{order.tkwRep3 ? `${order.tkwRep3} gr.` : 'N/A'}</Text>
                                    <Text fontWeight="bold">{t('tkw_details_modal.average')}:</Text>
                                    <Text>{averageTkw !== undefined ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                                </Grid>
                            </GridItem>

                            <GridItem colSpan={2}>
                                <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_modal.creation_date')}:</Text>
                                <Text>{order.creationDate === null ? 'N/A' : new Date(order.creationDate).toLocaleString()}</Text>
                            </GridItem>

                            {order.completionDate && (
                                <GridItem colSpan={2}>
                                    <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_modal.completion_date')}:</Text>
                                    <Text>{new Date(order.completionDate).toLocaleString()}</Text>
                                </GridItem>
                            )}

                            <GridItem colSpan={2}>
                                <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_modal.measurement_date')}:</Text>
                                <Text>{order.tkwMeasurementDate === null ? 'N/A' :  new Date(order.tkwMeasurementDate).toLocaleString()}</Text>
                            </GridItem>
                        </Grid>


                        <GridItem colSpan={2}>
                            <Divider />
                        </GridItem>

                        {measurements.length > 0 && 
                            <>
                                <Text fontWeight="bold">{t('tkw_details_modal.treated_tkw_measurements')}:</Text>
                                {measurements.map((measurement, index) => {
                                    const averageTkw = calculateAverageTkw([measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3]);
                                    return (
                                        <Grid templateColumns="1fr 1fr" gap={2} w="full" key={index} borderWidth={1} p={2}>
                                            <GridItem colSpan={2}>
                                                <Text>#{index + 1}</Text>
                                            </GridItem>
                                            <GridItem>
                                                {measurement.tkwProbesPhoto ? (
                                                    <ImageWithModal src={measurement.tkwProbesPhoto} fullSize />
                                                ) : (
                                                    <AspectRatio ratio={4 / 3} width="100%">
                                                        <Box
                                                            width="full"
                                                            height="full"
                                                            border="1px solid"
                                                            borderColor="gray.300"
                                                            display="flex"
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            bg="gray.100"
                                                        >
                                                            <Text color="gray.500">N/A</Text>
                                                        </Box>
                                                    </AspectRatio>
                                                )}
                                            </GridItem>
                                            <GridItem>
                                                <Grid templateColumns="1fr 1fr" gap={1}>
                                                    <Text fontWeight="bold">{t('tkw_details_modal.probe_1')}:</Text>
                                                    <Text>{measurement.tkwProbe1 ? `${measurement.tkwProbe1} gr.` : 'N/A'}</Text>

                                                    <Text fontWeight="bold">{t('tkw_details_modal.probe_2')}:</Text>
                                                    <Text>{measurement.tkwProbe2 ? `${measurement.tkwProbe2} gr.` : 'N/A'}</Text>

                                                    <Text fontWeight="bold">{t('tkw_details_modal.probe_3')}:</Text>
                                                    <Text>{measurement.tkwProbe3 ? `${measurement.tkwProbe3} gr.` : 'N/A'}</Text>

                                                    <Text fontWeight="bold">{t('tkw_details_modal.average')}:</Text>
                                                    <Text>{averageTkw !== undefined ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                                                </Grid>
                                            </GridItem>
                                            <GridItem colSpan={2}>
                                                <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_modal.creation_date')}:</Text>
                                                <Text>{new Date(measurement.creationDate).toLocaleString()}</Text>
                                            </GridItem>
                                            <GridItem colSpan={2}>
                                                {measurement.probeDate && (
                                                    <>
                                                        <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_modal.measurement_date')}:</Text>
                                                        <Text>{new Date(measurement.probeDate).toLocaleString()}</Text>
                                                    </>
                                                )}
                                            </GridItem>
                                        </Grid>
                                    )
                                })}
                            </>
                        }  
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>{t('tkw_details_modal.close')}</Button>
                </ModalFooter>
            </ModalContent>
            <ImageModal selectedPhoto={selectedPhoto} handleClose={handleClose} />
        </Modal>
    );
};

export default TkwDetailsModal;
