import React from 'react';
import { Order } from '../store/newOrderSlice';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Grid, GridItem, Center, Divider, HStack, Text, Badge, Box, Image, Button } from '@chakra-ui/react';

interface RecipeRawTkwDetailsViewModalProps {
    selectedOrder: Order;
    onClose: () => void;
}

const RecipeRawTkwDetailsViewModal: React.FC<RecipeRawTkwDetailsViewModalProps> = ({ selectedOrder, onClose }) => {
    return (
        <Modal isOpen={!!selectedOrder} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" w="full" h="full">
                <ModalHeader>Recipe Raw TKW Details</ModalHeader>
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

                            <GridItem h={10} alignContent={'center'}>
                                <Text><strong>TKW Probe 1:</strong></Text>
                            </GridItem>
                            <GridItem h={10} alignContent={'center'}>
                                <HStack>
                                    <Text>{selectedOrder.tkwRep1 ?? 'N/A'} gr.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem h={10} alignContent={'center'}>
                                <Text><strong>TKW Probe 2:</strong></Text>
                            </GridItem>
                            <GridItem h={10} alignContent={'center'}>
                                <HStack>
                                    <Text>{selectedOrder.tkwRep2 ?? 'N/A'} gr.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem h={10} alignContent={'center'}>
                                <Text><strong>TKW Probe 3:</strong></Text>
                            </GridItem>
                            <GridItem h={10} alignContent={'center'}>
                                <HStack>
                                    <Text>{selectedOrder.tkwRep3 ?? 'N/A'} gr.</Text>
                                </HStack>
                            </GridItem>

                            <GridItem h={10} alignContent={'center'}>
                                <Text><strong>Average TKW:</strong></Text>
                            </GridItem>
                            <GridItem h={10} alignContent={'center'}>
                                <Text>{selectedOrder.tkw !== null ? `${selectedOrder.tkw.toFixed(2)} gr.` : 'N/A'}</Text>
                            </GridItem>

                            <GridItem colSpan={2} h={10} alignContent={'center'}>
                                <Text><strong>Photo of TKW Probes:</strong></Text>
                            </GridItem>
                            <GridItem colSpan={2} alignContent={'center'}>
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
                                >
                                    {selectedOrder.tkwProbesPhoto ? (
                                        <Image src={selectedOrder.tkwProbesPhoto} alt="Machine display" objectFit="cover" style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <Text>No photo available</Text>
                                    )}
                                </Box>
                            </GridItem>
                        </Grid>
                    </Center>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mb="3" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RecipeRawTkwDetailsViewModal;
