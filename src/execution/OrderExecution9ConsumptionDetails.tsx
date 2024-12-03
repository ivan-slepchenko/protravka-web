import React, { useEffect } from 'react';
import { Button, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Input, VStack, HStack } from "@chakra-ui/react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setAppliedQuantity, nextPage, resetCurrentProductIndex } from '../store/executionSlice';

export default function OrderExecution9ConsumptionDetails() {
    const dispatch: AppDispatch = useDispatch();
    const applicationMethod = useSelector((state: RootState) => state.execution.applicationMethod);
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentProductIndex);
    const currentProductId = order?.productDetails[currentProductIndex].product?.id;

    useEffect(() => {
        dispatch(resetCurrentProductIndex())
    }, [dispatch]);

    if (currentProductId === undefined) {
        return null;
    }
    
    const handleQuantityChange = (productId: string, quantity: number) => {
        if (currentOrderId) {
            dispatch(setAppliedQuantity({ orderId: currentOrderId, productId, quantity }));
        }
    };

    const handleMakePhotoClick = () => {
        dispatch(nextPage());
    };

    const renderTableHeaders = () => {
        if (applicationMethod === 'Surry') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>Target consumption, kg</Th>
                        <Th>Actual consumption, kg</Th>
                    </Tr>
                </Thead>
            );
        } else if (applicationMethod === 'CDS') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>Target consumption, kg</Th>
                        <Th>Machine Setting, kg</Th>
                    </Tr>
                </Thead>
            );
        }
    };

    const renderTableBody = () => (
        <Tbody>
            <Tr>
                <Td>xxx</Td>
                <Td>
                    <Input
                        placeholder="Enter value"
                        onChange={(e) => handleQuantityChange(currentProductId, parseFloat(e.target.value))}
                    />
                </Td>
            </Tr>
        </Tbody>
    );

    const renderContent = () => (
        <>
            <Heading size="md" mb={4}>
                {applicationMethod === 'Surry'
                    ? 'Total Surry consumption per XXX kg'
                    : <span>
                        {'Product: '}
                        {order?.productDetails[currentProductIndex].product?.name}
                        {' #'}
                        {currentProductIndex + 1}
                        {'  out of '}
                        {order?.productDetails.length}
                        {' Per XXX kg seeds'}
                    </span>
                }
            </Heading>
            <Table variant="simple" mb={4}>
                {renderTableHeaders()}
                {renderTableBody()}
            </Table>
            <Text mb={4}  mt='auto'>
                You are obliged to make a photo of scales display on the next page!
            </Text>
        </>
    );

    return (
        <VStack p={4} w="full" h="full">
            {renderContent()}
            <HStack justifyContent={"center"}>
                <Button
                    colorScheme="orange"
                    w="200px"
                    borderRadius="full"
                    _hover={{ backgroundColor: 'orange.200' }}
                    onClick={handleMakePhotoClick}
                >
                    Make Photo
                </Button>
            </HStack>
        </VStack>
    );
}
