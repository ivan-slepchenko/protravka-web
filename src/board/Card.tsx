import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Badge, Text } from '@chakra-ui/react';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderExecutionStartDate, fetchOrderExecutionFinishDate, fetchLatestTkwMeasurementDate, fetchOrderPreparationStartDate } from '../store/executionSlice';
import { AppDispatch, RootState } from '../store/store';

const Card: React.FC<{ order: Order }> = ({ order }) => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const useLab = user.company?.featureFlags.useLab;
    const [treatmentStartDate, setTreatmentStartDate] = useState<number | null>(null);
    const [preparationStartDate, setPreparationStartDate] = useState<number | null>(null);
    const [treatmentFinishDate, setTreatmentFinishDate] = useState<number | null>(null);
    const [latestTkwDate, setLatestTkwDate] = useState<number | null>(null);

    useEffect(() => {
        if (order.status === OrderStatus.TreatmentInProgress) {
            dispatch(fetchOrderExecutionStartDate(order.id))
                .unwrap()
                .then((data) => setTreatmentStartDate(data.treatmentStartDate))
                .catch((error) => console.error('Failed to fetch treatment start date:', error));
            dispatch(fetchOrderPreparationStartDate(order.id))
                .unwrap()
                .then((data) => setPreparationStartDate(data.preparationStartDate))
                .catch((error) => console.error('Failed to fetch treatment start date:', error));
        } else if (order.status === OrderStatus.LabControl) {
            dispatch(fetchOrderExecutionFinishDate(order.id))
                .unwrap()
                .then((data) => setTreatmentFinishDate(data.treatmentFinishDate))
                .catch((error) => console.error('Failed to fetch treatment finish date:', error));
        } else if (order.status === OrderStatus.ToAcknowledge && useLab) {
            dispatch(fetchLatestTkwMeasurementDate(order.id))
                .unwrap()
                .then((data) => setLatestTkwDate(data.creationDate))
                .catch((error) => console.error('Failed to fetch latest TKW measurement date:', error));
        }
    }, [order.status, order.id, dispatch]);

    const handleRecipeClick = (orderId: string, status: OrderStatus) => {
        if (status === OrderStatus.TkwConfirmed) {
            navigate(`/finalize/${orderId}`);
        } else {
            navigate(`/lot-report/${orderId}`);
        }
    };

    let cardColor = "white";
    let statusLabel = null;
    if (order.status === OrderStatus.Completed) {
        cardColor = "green.50";
        statusLabel = <Badge colorScheme="green" gridColumn="span 3" ml="auto">Success</Badge>;
    } else if (order.status === OrderStatus.Failed) {
        cardColor = "red.50";
        statusLabel = <Badge colorScheme="red" gridColumn="span 3"ml="auto">Failed</Badge>;
    }

    return (
        <Box
            borderColor={'gray.200'}
            borderWidth={1}
            borderStyle={'solid'}
            borderRadius="md"
            p={2}
            w="full"
            cursor="pointer"
            onClick={() => handleRecipeClick(order.id, order.status)}
            bg={cardColor}
            boxShadow="sm"
        >
            <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2} fontSize="sm">
                <Badge gridColumn="span 3" colorScheme="gray">
                    {order.crop?.name}, {order.variety?.name}
                </Badge>
                {statusLabel}
                {order.status !== OrderStatus.LabAssignmentCreated && <Text px={1} gridColumn="span 3">
                    {'for '}{order.operator?.name} {order.operator?.surname}
                </Text>}
                <Text px={1} gridColumn="span 2" color="gray.600">Lot:</Text>
                <Text px={1} isTruncated>{order.lotNumber}</Text>
                <Text px={1} gridColumn="span 2" color="gray.600">To Treat:</Text>
                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                {order.status === OrderStatus.LabAssignmentCreated && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{useLab ? 'Assigned At:' : 'Created At:'}</Text>
                        <Text px={1} isTruncated>{order.creationDate === null ? 'N/A' : new Date(order.creationDate).toLocaleString()}</Text>
                    </Box>
                )}
                {order.status === OrderStatus.RecipeCreated && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Created At:</Text>
                        <Text px={1} isTruncated>{order.finalizationDate === null ? 'N/A' : new Date(order.finalizationDate).toLocaleString()}</Text>
                    </Box>
                )}
                {order.status !== OrderStatus.LabAssignmentCreated && order.status !== OrderStatus.TkwConfirmed && <Box gridColumn="span 3">
                    <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Expected Start At:</Text>
                    <Text px={1} isTruncated >{order.applicationDate === null ? 'N/A' : new Date(order.applicationDate).toLocaleString()}</Text>
                </Box>}
                {order.status === OrderStatus.TkwConfirmed && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Raw TKW Measured At:</Text>
                        <Text px={1} isTruncated>{order.tkwMeasurementDate === null ? 'N/A' : new Date(order.tkwMeasurementDate).toLocaleString()}</Text>
                    </Box>
                )}
                {order.status === OrderStatus.TreatmentInProgress && preparationStartDate && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Preparation Started At:</Text>
                        <Text px={1} isTruncated>{new Date(preparationStartDate).toLocaleString()}</Text>
                    </Box>
                )}
                {order.status === OrderStatus.TreatmentInProgress && treatmentStartDate && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Treatment Started At:</Text>
                        <Text px={1} isTruncated>{new Date(treatmentStartDate).toLocaleString()}</Text>
                    </Box>
                )}
                {order.status === OrderStatus.LabControl && treatmentFinishDate && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Treatment Finished At:</Text>
                        <Text px={1} isTruncated>{new Date(treatmentFinishDate).toLocaleString()}</Text>
                    </Box>
                )}
                {order.status === OrderStatus.ToAcknowledge && latestTkwDate && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Latest TKW Measured At:</Text>
                        <Text px={1} isTruncated>{new Date(latestTkwDate).toLocaleString()}</Text>
                    </Box>
                )}
                {(order.status === OrderStatus.Completed || order.status === OrderStatus.Failed) && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Completed At:</Text>
                        <Text px={1} isTruncated>{order.completionDate === null ? 'N/A' : new Date(order.completionDate).toLocaleString()}</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Card;
