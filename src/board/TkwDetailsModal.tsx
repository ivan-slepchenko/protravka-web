import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, VStack, Text, Box, Image } from '@chakra-ui/react';
import { TkwMeasurement } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';

interface TkwDetailsModalProps {
    onClose: () => void;
    order: Order;
    measurements: TkwMeasurement[];
}

const TkwDetailsModal: React.FC<TkwDetailsModalProps> = ({ onClose, order, measurements }) => {
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
            <ModalContent>
                <ModalHeader>TKW Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="start">
                        <Text fontWeight="bold">Raw TKW Probes:</Text>
                        <Text>Probe 1: {order.tkwRep1} gr.</Text>
                        <Text>Probe 2: {order.tkwRep2} gr.</Text>
                        <Text>Probe 3: {order.tkwRep3} gr.</Text>
                        <Text>Raw Average TKW: {order.tkw.toFixed(2)} gr.</Text>
                        {order.tkwProbesPhoto && <Image src={order.tkwProbesPhoto} alt="Raw TKW Photo" />}

                        <Text fontWeight="bold">Treated TKW Measurements:</Text>
                        {measurements.map((measurement, index) => (
                            <Box key={index} borderWidth={1} borderRadius="md" p={2} w="full">
                                <Text>Measurement {index + 1}:</Text>
                                <Text>Probe 1: {measurement.tkwProbe1} gr.</Text>
                                <Text>Probe 2: {measurement.tkwProbe2} gr.</Text>
                                <Text>Probe 3: {measurement.tkwProbe3} gr.</Text>
                                <Text>Average TKW: {calculateAverageTkw([measurement])} gr.</Text>
                                {measurement.tkwProbesPhoto && <Image src={measurement.tkwProbesPhoto} alt={`Measurement ${index + 1} Photo`} />}
                            </Box>
                        ))}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TkwDetailsModal;
