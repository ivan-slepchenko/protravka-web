import React from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { Crop } from '../store/cropsSlice';
import { CloseIcon } from '@chakra-ui/icons';

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
        <Text as="h3" fontSize="lg">{crop.name}</Text>
        <Button size="sm" colorScheme="red" onClick={onDeleteCrop}>Delete</Button>
      </HStack>
      <VStack spacing={2} mt={2} align="stretch">
        <Text fontWeight="bold">Variants:</Text>
        <HStack p={2} borderWidth={1} borderRadius="md" w="full">
          {crop.varieties.map((variety) => (
            <HStack key={variety.id} justifyContent="space-between">
              <Text>{variety.name}</Text>
              <Button size="sm" colorScheme="red" onClick={() => onDeleteVariety(variety.id)}>
                <CloseIcon />
              </Button>
            </HStack>
          ))}
        </HStack>
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