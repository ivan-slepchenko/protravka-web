import React, { useEffect, useState } from 'react';
import { Box, Button, Input, VStack, HStack } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchCrops, createCrop, createVariety, deleteCrop, deleteVariety } from '../store/cropsSlice';
import CropComponent from './CropComponent';

const Crops: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const crops = useSelector((state: RootState) => state.crops.crops);
    const [newCropName, setNewCropName] = useState('');
    const [newVarietyName, setNewVarietyName] = useState('');
    const [selectedCropId, setSelectedCropId] = useState<string | null>(null);

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

    return (
        <Box p={4}>
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Input
                        placeholder="New Crop Name"
                        value={newCropName}
                        onChange={(e) => setNewCropName(e.target.value)}
                    />
                    <Button onClick={handleAddCrop}>Add Crop</Button>
                </HStack>
                {crops.map((crop) => (
                    <CropComponent
                        key={crop.id}
                        crop={crop}
                        onDeleteCrop={() => dispatch(deleteCrop(crop.id))}
                        onAddVariety={handleAddVariety}
                        onDeleteVariety={(varietyId) => dispatch(deleteVariety({ cropId: crop.id, varietyId }))}
                        setSelectedCropId={setSelectedCropId}
                        newVarietyName={newVarietyName}
                        setNewVarietyName={setNewVarietyName}
                    />
                ))}
            </VStack>
        </Box>
    );
};

export default Crops;