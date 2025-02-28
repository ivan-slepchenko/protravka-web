import React, { useEffect, useState } from 'react';
import { Box, Button, Input, VStack, HStack } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchCrops, createCrop, createVariety, deleteCrop, deleteVariety } from '../store/cropsSlice';
import CropComponent from './CropComponent';
import { useDisclosure } from '@chakra-ui/react';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const Crops: React.FC = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const crops = useSelector((state: RootState) => state.crops.crops);
    const [newCropName, setNewCropName] = useState('');
    const [newVarietyName, setNewVarietyName] = useState('');
    const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState<{ type: 'crop' | 'variety', id: string | null }>({ type: 'crop', id: null });
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        dispatch(fetchCrops());
    }, [dispatch]);

    const handleAddCrop = () => {
        if (newCropName.trim()) {
            dispatch(createCrop({ id: '', name: newCropName, varieties: [] }));
            setNewCropName('');
        }
    };

    const handleAddVariety = () => {
        if (selectedCropId && newVarietyName.trim()) {
            dispatch(createVariety({ cropId: selectedCropId, variety: { id: '', name: newVarietyName } }));
            setNewVarietyName('');
        }
    };

    const handleDeleteCrop = (cropId: string) => {
        setSelectedItem({ type: 'crop', id: cropId });
        onOpen();
    };

    const handleDeleteVariety = (cropId: string, varietyId: string) => {
        setSelectedCropId(cropId);
        setSelectedItem({ type: 'variety', id: varietyId });
        onOpen();
    };

    const confirmDelete = () => {
        if (selectedItem.id) {
            if (selectedItem.type === 'crop') {
                dispatch(deleteCrop(selectedItem.id));
            } else {
                if (selectedCropId) {
                    dispatch(deleteVariety({ cropId: selectedCropId, varietyId: selectedItem.id }));    
                } else {
                    console.error('No crop selected');
                }
            }
            setSelectedItem({ type: 'crop', id: null });
            onClose();
        }
    };

    return (
        <Box p={4}>
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Input
                        placeholder={t('crop.new_crop_name')}
                        value={newCropName}
                        onChange={(e) => setNewCropName(e.target.value)}
                    />
                    <Button onClick={handleAddCrop}>{t('crop.add_crop')}</Button>
                </HStack>
                {crops
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((crop) => (
                        <CropComponent
                            key={crop.id}
                            crop={crop}
                            onDeleteCrop={() => handleDeleteCrop(crop.id)}
                            onAddVariety={handleAddVariety}
                            onDeleteVariety={(varietyId) => handleDeleteVariety(crop.id, varietyId)}
                            setSelectedCropId={setSelectedCropId}
                            newVarietyName={newVarietyName}
                            setNewVarietyName={setNewVarietyName}
                        />
                    ))}
            </VStack>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {selectedItem.type === 'crop' ? t('crop.delete_crop') : t('crop.delete_variety')}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {t('crop.confirm_delete', { type: t(`crop.${selectedItem.type}`) })}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                {t('crop.cancel')}
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                {t('crop.delete')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default Crops;