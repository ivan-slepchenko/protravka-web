import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, VStack, Text, Grid, GridItem, Badge, Divider, AspectRatio } from '@chakra-ui/react';
import { TkwMeasurement, fetchTkwMeasurementsByExecutionId, fetchOrderExecution } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';
import useImageModal from '../hooks/useImageModal';
import { useTranslation } from 'react-i18next';
import { fetchOrderById } from '../store/ordersSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';

const TkwDetailsPage: React.FC = () => {
    const { t } = useTranslation();
    const { orderExecutionId, measurementId } = useParams<{ orderExecutionId: string, measurementId?: string }>();
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const [order, setOrder] = useState<Order | null>(null);
    const [measurements, setMeasurements] = useState<TkwMeasurement[]>([]);
    const { ImageModal, ImageWithModal, selectedPhoto, handleClose } = useImageModal();
    const measurementRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (orderExecutionId) {
            fetchOrderExecution(orderExecutionId).then((orderExecution) => {
                dispatch(fetchOrderById(orderExecution.orderId)).then((action) => {
                    if (fetchOrderById.fulfilled.match(action)) {
                        setOrder(action.payload);
                    }
                });
                fetchTkwMeasurementsByExecutionId(orderExecutionId).then((data: TkwMeasurement[]) => {
                    setMeasurements(data);
                    if (measurementId) {
                        const index = data.findIndex(measurement => measurement.id === measurementId);
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
                }).catch(error => console.error('Failed to fetch TKW measurements:', error));
            }).catch(error => console.error('Failed to fetch order execution:', error));
        }
    }, [orderExecutionId, measurementId, dispatch]);

    const calculateAverageTkw = (tkwValues: (number | null | undefined)[]): number | undefined => {
        const validValues = tkwValues.filter((value) => value !== undefined && value !== null) as number[];
        if (validValues.length === 0) return undefined;
        const total = validValues.reduce((sum, value) => sum + value, 0);
        return total / validValues.length;
    };

    const averageTkw = calculateAverageTkw([order?.tkwRep1, order?.tkwRep2, order?.tkwRep3]);

    return (
        <Box p={4}>
            <Button onClick={() => navigate(-1)}>{t('tkw_details_page.back')}</Button>
            <VStack spacing={4} align="start" w="full" overflow='auto' mt="auto" mb="auto">
                <Badge autoCapitalize='none' w="full" colorScheme="gray">
                    <Text fontSize={{ base: "md", md: "lg" }}>
                        {order?.crop?.name} / {order?.variety?.name}
                    </Text>
                </Badge>
                <Grid templateColumns="1fr 1fr" gap={4} w="full" px={1}>
                    <Text fontWeight="bold">{t('tkw_details_page.lot')}:</Text>
                    <Text>{order?.lotNumber}</Text>

                    <Text fontWeight="bold">{t('tkw_details_page.seeds_to_treat')}:</Text>
                    <Text>{order?.seedsToTreatKg} {t('units.kg')}.</Text>

                    <Text fontWeight="bold">{t('tkw_details_page.operator')}:</Text>
                    <Text>{order?.operator?.name} {order?.operator?.surname}</Text>
                </Grid>
                <Grid templateColumns="1fr 1fr" gap={2} w="full">
                    <GridItem px={1}>
                        {order?.tkwProbesPhoto ? (
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
                            <Text>{order?.tkwRep1 ? `${order.tkwRep1} gr.` : 'N/A'}</Text>
                            <Text fontWeight="bold">{t('tkw_details_page.probe_2')}:</Text>
                            <Text>{order?.tkwRep2 ? `${order.tkwRep2} gr.` : 'N/A'}</Text>
                            <Text fontWeight="bold">{t('tkw_details_page.probe_3')}:</Text>
                            <Text>{order?.tkwRep3 ? `${order.tkwRep3} gr.` : 'N/A'}</Text>
                            <Text fontWeight="bold">{t('tkw_details_page.average')}:</Text>
                            <Text>{averageTkw !== undefined ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                        </Grid>
                    </GridItem>

                    <GridItem colSpan={2}>
                        <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.creation_date')}:</Text>
                        <Text>{order === null || order.creationDate === null ? 'N/A' : new Date(order.creationDate).toLocaleString()}</Text>
                    </GridItem>

                    {order?.completionDate && (
                        <GridItem colSpan={2}>
                            <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.completion_date')}:</Text>
                            <Text>{new Date(order.completionDate).toLocaleString()}</Text>
                        </GridItem>
                    )}

                    <GridItem colSpan={2}>
                        <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.measurement_date')}:</Text>
                        <Text>{order === null || order.tkwMeasurementDate === null ? 'N/A' :  new Date(order.tkwMeasurementDate).toLocaleString()}</Text>
                    </GridItem>
                </Grid>

                <GridItem colSpan={2}>
                    <Divider />
                </GridItem>

                {measurements.length > 0 && 
                    <>
                        <Text fontWeight="bold">{t('tkw_details_page.treated_tkw_measurements')}:</Text>
                        {measurements.map((measurement, index) => {
                            const averageTkw = calculateAverageTkw([measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3]);
                            return (
                                <Grid
                                    templateColumns="1fr 1fr"
                                    gap={2}
                                    w="full"
                                    key={index}
                                    borderWidth={1}
                                    p={2}
                                    ref={el => measurementRefs.current[index] = el}
                                    className={measurement.id === measurementId ? 'highlight' : ''}
                                >
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
                                            <Text>{averageTkw !== undefined ? `${averageTkw.toFixed(2)} gr.` : 'N/A'}</Text>
                                        </Grid>
                                    </GridItem>
                                    <GridItem colSpan={2}>
                                        <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.creation_date')}:</Text>
                                        <Text>{new Date(measurement.creationDate).toLocaleString()}</Text>
                                    </GridItem>
                                    <GridItem colSpan={2}>
                                        {measurement.probeDate && (
                                            <>
                                                <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_details_page.measurement_date')}:</Text>
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
            <ImageModal selectedPhoto={selectedPhoto} handleClose={handleClose} />
        </Box>
    );
};

export default TkwDetailsPage;
