import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button } from '@chakra-ui/react';
import { TkwMeasurement } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';
import TkwDetailsContent from './TkwDetailsContent';

interface TkwDetailsModalProps {
    onClose: () => void;
    order: Order;
    measurements: TkwMeasurement[];
}

const TkwDetailsModal: React.FC<TkwDetailsModalProps> = ({ onClose, order, measurements }) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={!!order} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent borderRadius="none" h="full" w='full'>
                <ModalHeader>{t('tkw_details_page.tkw_details')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody h="full" overflow='auto' w='full'>
                    <TkwDetailsContent order={order} measurements={measurements} />
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>{t('tkw_details_page.close')}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TkwDetailsModal;
