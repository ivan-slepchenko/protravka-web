import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, VStack, Text, Box, Grid, GridItem, Center, Heading, Badge } from '@chakra-ui/react';
import { TkwMeasurement } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';
import useImageModal from '../hooks/useImageModal';

interface TkwDetailsModalProps {
    onClose: () => void;
    order: Order;
    measurements: TkwMeasurement[];
}

const TkwDetailsModal: React.FC<TkwDetailsModalProps> = ({ onClose, order, measurements }) => {
    const { ImageModal, ImageWithModal, selectedPhoto, handlePhotoClick, handleClose } = useImageModal();

    const calculateAverageTkw = (measurements: TkwMeasurement[]) => {
        if (measurements.length === 0) return 'N/A';
        const totalTkw = measurements.reduce((sum, measurement) => {
            const tkwValues = [measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3].filter((probe) => probe !== undefined) as number[];
            const tkwAllValues = tkwValues.reduce((a, b) => a + b, 0);
            return sum + tkwAllValues / tkwValues.length;
        }, 0);
        return totalTkw.toFixed(2);
    };

    return (
        <Modal isOpen={!!order} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent h="full">
                <ModalHeader fontSize={{ base: "sm", md: "lg" }}>TKW Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody h="full">
                    <Center w="full" h="full">
                        <VStack spacing={4} align="start" w="full">
                            <Badge autoCapitalize='none' w="full" colorScheme="gray">
                                <Text fontSize={{ base: "md", md: "lg" }}>
                                    Raw Average TKW: {order.tkw.toFixed(2)} gr.
                                </Text>
                            </Badge>
                            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                                <GridItem px={1}>
                                    {order.tkwProbesPhoto && <ImageWithModal src={order.tkwProbesPhoto} fullSize />}
                                </GridItem>
                                <GridItem px={1}>
                                    <VStack spacing={4} alignItems={'start'}>
                                        <Text>Probe 1: {order.tkwRep1} gr.</Text>
                                        <Text>Probe 2: {order.tkwRep2} gr.</Text>
                                        <Text>Probe 3: {order.tkwRep3} gr.</Text>
                                    </VStack>
                                </GridItem>
                            </Grid>

                            {measurements.length > 0 && 
                                <>
                                    <Text fontWeight="bold">Treated TKW Measurements:</Text>
                                    {measurements.map((measurement, index) => (
                                        <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full" key={index} borderWidth={1} borderRadius="md" p={2}>
                                            <GridItem>
                                                {measurement.tkwProbesPhoto && <ImageWithModal src={measurement.tkwProbesPhoto} fullSize />}
                                            </GridItem>
                                            <GridItem>
                                                <VStack spacing={4} justify="space-around">
                                                    <Text>Measurement {index + 1}:</Text>
                                                    <Text>Probe 1: {measurement.tkwProbe1} gr.</Text>
                                                    <Text>Probe 2: {measurement.tkwProbe2} gr.</Text>
                                                    <Text>Probe 3: {measurement.tkwProbe3} gr.</Text>
                                                    <Text>Average TKW: {calculateAverageTkw([measurement])} gr.</Text>
                                                </VStack>
                                            </GridItem>
                                        </Grid>
                                    ))}
                                </>
                            }  
                        </VStack>
                    </Center>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
            <ImageModal selectedPhoto={selectedPhoto} handleClose={handleClose} />
        </Modal>
    );
};

export default TkwDetailsModal;
