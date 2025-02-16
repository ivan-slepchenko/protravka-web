import React, { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Tag, TagLabel, TagCloseButton } from '@chakra-ui/react';
import { Crop } from '../store/cropsSlice';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [isFolded, setIsFolded] = useState(true);

    return (
        <Box key={crop.id} p={4} borderWidth={1} borderRadius="md">
            <HStack justifyContent="space-between">
                <Text as="h3" fontSize="lg">{crop.name}</Text>
                <HStack>
                    <Button size="sm" onClick={() => setIsFolded(!isFolded)}>
                        {isFolded ? t('crop.show_varieties') : t('crop.hide_varieties')}
                    </Button>
                    <Button size="sm" colorScheme="red" onClick={onDeleteCrop}>{t('crop.delete')}</Button>
                </HStack>
            </HStack>
            {!isFolded && (
                <VStack spacing={2} mt={2} align="stretch">
                    {crop.varieties.length > 0 && (
                        <>
                            <Text fontWeight="bold">{t('crop.varieties')}:</Text>
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
                            placeholder={t('crop.new_variety_name')}
                            value={newVarietyName}
                            onChange={(e) => setNewVarietyName(e.target.value)}
                            onFocus={() => setSelectedCropId(crop.id)}
                        />
                        <Button onClick={onAddVariety}>{t('crop.add_variety')}</Button>
                    </HStack>
                </VStack>
            )}
        </Box>
    );
};

export default CropComponent;