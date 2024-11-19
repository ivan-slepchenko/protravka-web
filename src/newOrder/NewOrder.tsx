import { VStack } from "@chakra-ui/react";
import React from "react";
import SeedTreatmentForm from "./SeedTreatmentForm";

export const NewOrder = () => {
  return (
    <VStack w='full' h='full'>
      <SeedTreatmentForm/>
    </VStack>
  )
}