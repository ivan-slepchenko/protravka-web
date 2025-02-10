import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, VStack, Text, Grid, GridItem, Badge, Divider } from '@chakra-ui/react';
import { TkwMeasurement } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';
import useImageModal from '../hooks/useImageModal';

interface TkwDetailsModalProps {
    onClose: () => void;
    order: Order;
    measurements: TkwMeasurement[];
}

const TkwDetailsModal: React.FC<TkwDetailsModalProps> = ({ onClose, order, measurements }) => {
    const { ImageModal, ImageWithModal, selectedPhoto, handleClose } = useImageModal();

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
                <ModalBody h="full" overflow='auto'>
                    <VStack spacing={4} align="start" w="full" overflow='auto' mt="auto" mb="auto">
                        <Badge autoCapitalize='none' w="full" colorScheme="gray">
                            <Text fontSize={{ base: "md", md: "lg" }}>
                                {order.crop?.name} / {order.variety?.name}
                            </Text>
                        </Badge>
                        <Grid templateColumns="1fr 1fr" gap={4} w="full" px={1}>
                            <Text fontWeight="bold">Creation Date:</Text>
                            <Text>{new Date(order.creationDate).toLocaleDateString()}</Text>

                            <Text fontWeight="bold">Lot Number:</Text>
                            <Text>{order.lotNumber}</Text>

                            <Text fontWeight="bold">Operator:</Text>
                            <Text>{order.operator?.name} {order.operator?.surname}</Text>

                            <GridItem colSpan={2}>
                                <Divider />
                            </GridItem>

                            <Text fontWeight="bold">Measurement Date:</Text>
                            <Text>{new Date(order.tkwMeasurementDate).toLocaleString()}</Text>
                            
                            {order.completionDate && (
                                <>
                                    <Text fontWeight="bold">Completion Date:</Text>
                                    <Text>{new Date(order.completionDate).toLocaleString()}</Text>
                                </>
                            )}
                        </Grid>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                            <GridItem px={1}>
                                {order.tkwProbesPhoto && <ImageWithModal src={order.tkwProbesPhoto} fullSize />}
                            </GridItem>
                            <GridItem>
                                <Grid templateColumns="1fr 1fr" gap={1}>
                                    <Text fontWeight="bold">Probe 1:</Text>
                                    <Text>{order.tkwRep1} gr.</Text>
                                    <Text fontWeight="bold">Probe 2:</Text>
                                    <Text>{order.tkwRep2} gr.</Text>
                                    <Text fontWeight="bold">Probe 3:</Text>
                                    <Text>{order.tkwRep3} gr.</Text>
                                    <Text fontWeight="bold">Av.:</Text>
                                    <Text>{order.tkw.toFixed(2)} gr.</Text>
                                </Grid>
                            </GridItem>
                        </Grid>

                        <GridItem colSpan={2}>
                            <Divider />
                        </GridItem>


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
                                                <Text>Creation Date: {new Date(measurement.creationDate).toLocaleString()}</Text>
                                                {measurement.probeDate && (
                                                    <Text>Probe Date: {new Date(measurement.probeDate).toLocaleString()}</Text>
                                                )}
                                            </VStack>
                                        </GridItem>
                                    </Grid>
                                ))}
                            </>
                        }  
                    </VStack>
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
