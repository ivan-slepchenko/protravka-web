
import React from "react";
import { Box, HStack, RadioGroup, Stack, Radio, Text, Input } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { updatePackaging, updateBagSize } from "../store/newOrderSlice";

const PackagingOptions: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.newOrder);

  const handlePackagingChange = (value: string) => {
    dispatch(updatePackaging(value));
  };

  const handleBagSizeChange = (value: number) => {
    dispatch(updateBagSize(value));
  };

  return (
    <Box mb="2">
      <Text fontSize="xs" mb="1">How do you want to pack it?</Text>
      <HStack>
        <RadioGroup
          width="300px"
          name="packaging"
          value={formData.packaging}
          onChange={(e) => handlePackagingChange(e)}
        >
          <Stack direction="row" spacing="1">
            <Radio value="inSeeds" size="xs">in s/units</Radio>
            <Radio value="inKg" size="xs">in kg</Radio>
          </Stack>
        </RadioGroup>
        <Text flexShrink={0} fontSize="xs">Bag size (K/Seeds):</Text>
        <Input
          name="bagSize"
          value={formData.bagSize}
          onChange={(e) => handleBagSizeChange(parseFloat(e.target.value))}
          placeholder="80"
          size="xs"
        />
      </HStack>
    </Box>
  );
};

export default PackagingOptions;