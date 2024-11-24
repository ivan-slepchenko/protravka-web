import React from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { Crop, Variety } from './store/cropsSlice';

interface CropComponentProps {
  crop: Crop;
  onDeleteCrop: () => void;
  onAddVariety: () => void;
  onDeleteVariety: (varietyId: string) => void;
  setSelectedCropId: (cropId: string | null) => void;
  newVarietyName: string;
  setNewVarietyName: (name: string) => void;
}

const CropComponent: React.FC<CropComponentProps> = ({
  crop,
  onDeleteCrop,
  onAddVariety,
  onDeleteVariety,
  setSelectedCropId,
  newVarietyName,
  setNewVarietyName,
}) => {
  return (
    <Box key={crop.id} p={4} borderWidth={1} borderRadius="md">
      <HStack justifyContent="space-between">
        <Text fontSize="lg">{crop.name}</Text>
        <Button size="sm" colorScheme="red" onClick={onDeleteCrop}>Delete</Button>
      </HStack>
      <VStack spacing={2} mt={2} align="stretch">
        {crop.varieties.map((variety) => (
          <HStack key={variety.id} justifyContent="space-between">
            <Text>{variety.name}</Text>
            <Button size="sm" colorScheme="red" onClick={() => onDeleteVariety(variety.id)}>Delete</Button>
          </HStack>
        ))}
        <HStack>
          <Input
            placeholder="New Variety Name"
            value={newVarietyName}
            onChange={(e) => setNewVarietyName(e.target.value)}
            onFocus={() => setSelectedCropId(crop.id)}
          />
          <Button onClick={onAddVariety}>Add Variety</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default CropComponent;