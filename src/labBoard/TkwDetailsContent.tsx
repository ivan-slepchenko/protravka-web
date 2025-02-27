import React, { useRef, useEffect } from 'react';
import { Box, VStack, Text, Grid, GridItem, Badge, Divider, AspectRatio } from '@chakra-ui/react';
import { TkwMeasurement } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';
import useImageModal from '../hooks/useImageModal';
import { useTranslation } from 'react-i18next';

interface TkwDetailsContentProps {
    order: Order;
    measurements: TkwMeasurement[];
    measurementId?: string;
}

const TkwDetailsContent: React.FC<TkwDetailsContentProps> = ({ order, measurements, measurementId }) => {
    const { t } = useTranslation();
    const { ImageModal, ImageWithModal, selectedPhoto, handleClose } = useImageModal();
    const measurementRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (measurementId) {
            const index = measurements.findIndex(measurement => measurement.id === measurementId);
            if (index !== -1) {
                setTimeout(() => {
                    measurementRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
                    measurementRefs.current[index]?.classList.add('highlight');
                    setTimeout(() => {
                        measurementRefs.current[index]?.classList.remove('highlight');
                    }, 2000);
                }, 500);
            }
        }
    }, [measurementId, measurements]);

    const calculateAverageTkwString = (tkwValues: (number | null | undefined)[]): string => {
        const validValues = tkwValues.filter((value) => value !== undefined && value !== null) as number[];
        let value: number | undefined;
        if (validValues.length > 0) {   
            const total = validValues.reduce((sum, value) => sum + value, 0);
            value = total / validValues.length;
        } else {
            return 'N/A';
        }
        return `${value.toFixed(2)} gr.`;
    };

    return (
        <Box w="full" overflow="auto">
            <VStack w="full" spacing={2} align="start">
                
                <Badge autoCapitalize='none' w="full" colorScheme="gray">
                    <Text fontSize={{ base: "md", md: "lg" }}>
                        {order.crop?.name} / {order.variety?.name}
                    </Text>
                </Badge>
                <Box borderWidth={1} p={2} w='30%'>
                    <Grid templateColumns="1fr 1fr" gap={4} w="full" px={1}>
                        <Text fontWeight="bold">{t('tkw_details_page.lot')}:</Text>
                        <Text>{order.lotNumber}</Text>

                        <Text fontWeight="bold">{t('tkw_details_page.seeds_to_treat')}:</Text>
                        <Text>{order.seedsToTreatKg} {t('units.kg')}.</Text>

                        <Text fontWeight="bold">{t('tkw_details_page.operator')}:</Text>
                        <Text>{order.operator?.name} {order.operator?.surname}</Text>
                    </Grid>
                    <GridItem colSpan={2}>
                        <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.assignment_creation_date')}:</Text>
                        <Text>{order.creationDate === null ? 'N/A' : new Date(order.creationDate).toLocaleString()}</Text>
                    </GridItem>
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
                                        <Text color="gray.500">{t('n_a')}</Text>
                                    </Box>
                                </AspectRatio>
                            )}
                        </GridItem>
                        <GridItem>
                            <Grid templateColumns="1fr 1fr" gap={1}>
                                <Text fontWeight="bold">{t('tkw_details_page.probe_1')}:</Text>
                                <Text>{order.tkwRep1 ? `${order.tkwRep1} gr.` : 'N/A'}</Text>
                                <Text fontWeight="bold">{t('tkw_details_page.probe_2')}:</Text>
                                <Text>{order.tkwRep2 ? `${order.tkwRep2} gr.` : 'N/A'}</Text>
                                <Text fontWeight="bold">{t('tkw_details_page.probe_3')}:</Text>
                                <Text>{order.tkwRep3 ? `${order.tkwRep3} gr.` : 'N/A'}</Text>
                                <Text fontWeight="bold">{t('tkw_details_page.average')}:</Text>
                                <Text>{calculateAverageTkwString([order.tkwRep1, order.tkwRep2, order.tkwRep3])}</Text>
                            </Grid>
                        </GridItem>

                        {order.completionDate && (
                            <GridItem colSpan={2}>
                                <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.completion_date')}:</Text>
                                <Text>{new Date(order.completionDate).toLocaleString()}</Text>
                            </GridItem>
                        )}

                        <GridItem colSpan={2}>
                            <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.raw_measurement_date')}:</Text>
                            <Text>{order.tkwMeasurementDate === null ? 'N/A' :  new Date(order.tkwMeasurementDate).toLocaleString()}</Text>
                        </GridItem>
                    </Grid>
                </Box>
                <Divider />

                {measurements.length > 0 && 
                <>
                    <Text fontWeight="bold">{t('tkw_details_page.treated_tkw_measurements')}:</Text>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={2} w="full">
                        {measurements.map((measurement, index) => {
                            return (
                                <GridItem
                                    key={index}
                                    borderWidth={1}
                                    p={2}
                                    bg={measurement.probeDate !== null && measurement.probeDate !== undefined ? "green.50" : "red.50"}
                                    ref={el => measurementRefs.current[index] = el}
                                    className={measurement.id === measurementId ? 'highlight' : ''}
                                >
                                    <Grid templateColumns="1fr 1fr" gap={2} w="full">
                                        <GridItem colSpan={2}>
                                            <Text>#{index + 1}</Text>
                                        </GridItem>
                                        {measurement.probeDate !== null && measurement.probeDate !== undefined ? (
                                            <>
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
                                                                <Text color="gray.500">{t('n_a')}</Text>
                                                            </Box>
                                                        </AspectRatio>
                                                    )}
                                                </GridItem>
                                                <GridItem>
                                                    <Grid templateColumns="1fr 1fr" gap={1}>
                                                        <Text fontWeight="bold">{t('tkw_details_page.probe_1')}:</Text>
                                                        <Text>{measurement.tkwProbe1 ? `${measurement.tkwProbe1} gr.` : 'N/A'}</Text>
                                                        <Text fontWeight="bold">{t('tkw_details_page.probe_2')}:</Text>
                                                        <Text>{measurement.tkwProbe2 ? `${measurement.tkwProbe2} gr.` : 'N/A'}</Text>
                                                        <Text fontWeight="bold">{t('tkw_details_page.probe_3')}:</Text>
                                                        <Text>{measurement.tkwProbe3 ? `${measurement.tkwProbe3} gr.` : 'N/A'}</Text>
                                                        <Text fontWeight="bold">{t('tkw_details_page.average')}:</Text>
                                                        <Text>{calculateAverageTkwString([measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3])}</Text>
                                                    </Grid>
                                                </GridItem>
                                                <GridItem colSpan={2}>
                                                    <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.creation_date')}:</Text>
                                                    <Text>{new Date(measurement.creationDate).toLocaleString()}</Text>
                                                </GridItem>
                                                <GridItem colSpan={2}>
                                                    <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.measurement_date')}:</Text>
                                                    <Text>{new Date(measurement.probeDate).toLocaleString()}</Text>
                                                </GridItem>
                                            </>
                                        ) : (
                                            <GridItem colSpan={2}>
                                                <VStack w='full' h='full' alignItems={'start'}>
                                                    <Text w='full' color="red" fontWeight="bold">NOT EXECUTED</Text>
                                                    <Text w='full' mt='auto' color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.creation_date')}:</Text>       
                                                    <Text>{new Date(measurement.creationDate).toLocaleString()}</Text>
                                                </VStack>
                                            </GridItem>
                                        )}
                                    </Grid>
                                </GridItem>
                            );
                        })}
                    </Grid>
                </>
                }  
            </VStack>
            <ImageModal selectedPhoto={selectedPhoto} handleClose={handleClose} />
        </Box>
    );
};

export default TkwDetailsContent;
