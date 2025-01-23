import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { OrderStatus } from '../store/newOrderSlice';
import { Box, Flex, Heading, Text, VStack, Badge } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '../contexts/FeaturesContext';

const Board: React.FC = () => {
    const navigate = useNavigate();
    const features = useFeatures();
    const columns = features.features.lab
        ? [OrderStatus.ForLabToInitiate, OrderStatus.ByLabInitiated, OrderStatus.ReadyToStart, OrderStatus.InProgress, OrderStatus.ForLabToControl, OrderStatus.ToAcknowledge, 'Done']
        : [OrderStatus.ReadyToStart, OrderStatus.InProgress, OrderStatus.ToAcknowledge, 'Done'];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);

    const handleRecipeClick = (orderId: string, status: OrderStatus) => {
        if (status === OrderStatus.ByLabInitiated) {
            navigate(`/finalize/${orderId}`);
        } else {
            navigate(`/lot-report/${orderId}`);
        }
    };

    return (
        <Flex w="full" justifyContent={'center'} h="100vh">
            <Flex p={5} gap={3} w="full" >
                {columns.map((column) => {
                    const bgColor = "gray.50";
                    return (
                        <Box key={column} w="full" border="gray.100" borderRadius="md" p={2} bg={bgColor}>
                            <Heading size="sm" m={1} mb={2}>{column}</Heading>
                            <VStack spacing={3} w="full">
                                {orders.filter(order => column === 'Done' ? [OrderStatus.Completed, OrderStatus.Failed].includes(order.status) : order.status === column).map((order, index) => {
                                    let cardColor = "white";
                                    let statusLabel = null;
                                    if (order.status === OrderStatus.Completed) {
                                        cardColor = "green.50";
                                        statusLabel = <Badge colorScheme="green" ml="auto">Success</Badge>;
                                    } else if (order.status === OrderStatus.Failed) {
                                        cardColor = "red.50";
                                        statusLabel = <Badge colorScheme="red" ml="auto">Failed</Badge>;
                                    }
                                    return (
                                        <Box
                                            key={index}
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
                                            <Box display="grid" gridTemplateColumns="1fr 3fr" gap={2} fontSize="sm">
                                                <Badge gridColumn="span 3" colorScheme="gray">
                                                    {order.crop?.name}, {order.variety?.name}
                                                </Badge>
                                                {statusLabel}
                                                <Text px={1} gridColumn="span 3" color="gray.600">
                                                    Lot: {order.lotNumber}
                                                </Text>
                                                <Text px={1} gridColumn="span 3">
                                                    {'for '}{order.operator?.name} {order.operator?.surname}
                                                </Text>
                                                <Text px={1} gridColumn="span 2">Seeds To Treat:</Text>
                                                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                                                <Text px={1} gridColumn="span 2">Application:</Text>
                                                <Text px={1} isTruncated>{order.applicationDate}</Text>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </Box>
                    );
                })}
            </Flex>
        </Flex>
    );
};

export default Board;