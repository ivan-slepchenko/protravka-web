import React, { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Tag, TagLabel, TagCloseButton } from '@chakra-ui/react';
import { Crop } from '../store/cropsSlice';

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
    const [isFolded, setIsFolded] = useState(crop.varieties.length === 0);

    useEffect(() => {
        if (crop.varieties.length === 0) {
            setIsFolded(false);
        }
    }, [crop.varieties.length]);

    return (
        <Box key={crop.id} p={4} borderWidth={1} borderRadius="md">
            <HStack justifyContent="space-between">
                <Text as="h3" fontSize="lg">{crop.name}</Text>
                <HStack>
                    <Button size="sm" onClick={() => setIsFolded(!isFolded)}>
                        {isFolded ? 'Show Varieties' : 'Hide Varieties'}
                    </Button>
                    <Button size="sm" colorScheme="red" onClick={onDeleteCrop}>Delete</Button>
                </HStack>
            </HStack>
            {!isFolded && (
                <VStack spacing={2} mt={2} align="stretch">
                    {crop.varieties.length > 0 && (
                        <>
                            <Text fontWeight="bold">Varieties:</Text>
                            <HStack p={2} borderWidth={1} borderRadius="md" w="full" wrap="wrap">
                                {crop.varieties.map((variety) => (
                                    <Tag key={variety.id} size="lg" borderRadius="full" variant="solid" colorScheme="teal" m={1}>
                                        <TagLabel>{variety.name}</TagLabel>
                                        <TagCloseButton onClick={() => onDeleteVariety(variety.id)} />
                                    </Tag>
                                ))}
                            </HStack>
                        </>
                    )}
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
            )}
        </Box>
    );
};

export default CropComponent;