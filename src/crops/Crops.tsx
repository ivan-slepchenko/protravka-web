import React, { useEffect, useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchCrops, createCrop, createVariety, deleteCrop } from '../store/cropsSlice';

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

  const handleDeleteCrop = (cropId: string) => {
    dispatch(deleteCrop(cropId));
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
          <Box key={crop.id} p={4} borderWidth={1} borderRadius="md">
            <HStack justifyContent="space-between">
              <Text fontSize="lg">{crop.name}</Text>
              <Button size="sm" colorScheme="red" onClick={() => handleDeleteCrop(crop.id)}>Delete</Button>
            </HStack>
            <VStack spacing={2} mt={2} align="stretch">
              {crop.varieties && crop.varieties.map((variety) => (
                <>{variety && <Text key={variety.id}>{variety.name}</Text>}</>
              ))}
              <HStack>
                <Input
                  placeholder="New Variety Name"
                  value={newVarietyName}
                  onChange={(e) => setNewVarietyName(e.target.value)}
                  onFocus={() => setSelectedCropId(crop.id)}
                />
                <Button onClick={handleAddVariety}>Add Variety</Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Crops;