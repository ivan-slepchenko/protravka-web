import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { updateOrderTKW } from '../store/ordersSlice';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Grid, GridItem, Center, VStack, Divider, HStack, Text } from '@chakra-ui/react';

interface OrderDetailsModalProps {
    selectedOrder: Order;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ selectedOrder, onClose }) => {
    const dispatch: AppDispatch = useDispatch();
    const [finalTkw, setFinalTkw] = useState<number | null>(null);
    const [tkwRep1, setTkwRep1] = useState<number | null>(null);
    const [tkwRep2, setTkwRep2] = useState<number | null>(null);
    const [tkwRep3, setTkwRep3] = useState<number | null>(null);
    const [averageTkw, setAverageTkw] = useState<number | null>(null);

    useEffect(() => {
        setFinalTkw(selectedOrder.tkw);
    }, [selectedOrder]);

    useEffect(() => {
        if (tkwRep1 !== null && tkwRep2 !== null && tkwRep3 !== null) {
            setAverageTkw((tkwRep1 + tkwRep2 + tkwRep3) / 3);
        }
    }, [tkwRep1, tkwRep2, tkwRep3]);

    const handleSave = () => {
        if (selectedOrder.status === OrderStatus.ForLabToInitiate && tkwRep1 !== null && tkwRep2 !== null && tkwRep3 !== null) {
            dispatch(updateOrderTKW({
                id: selectedOrder.id,
                tkwRep1,
                tkwRep2,
                tkwRep3,
                tkw: averageTkw ?? 0,
            }));
        } else if (selectedOrder.status === OrderStatus.ForLabToControl && finalTkw !== null) {
            // Dispatch action to update final TKW
        }
        onClose();
    };

    return (
        <Modal isOpen={!!selectedOrder} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" w="full" h="full">
                <ModalHeader>Recipe Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Center w="full" h="full">
                        <Grid templateColumns="3fr 2fr" gap={4} w='full'>
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

                            {selectedOrder.status === OrderStatus.ForLabToControl && (
                                <GridItem colSpan={2} h={10} alignContent={'center'}>
                                    <Input
                                        placeholder="Set Final TKW"
                                        value={finalTkw ?? ''}
                                        onChange={(e) => setFinalTkw(Number(e.target.value))}
                                    />
                                </GridItem>
                            )}
                        </Grid>
                    </Center>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mb="3" onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" mb="3" onClick={handleSave}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default OrderDetailsModal;
