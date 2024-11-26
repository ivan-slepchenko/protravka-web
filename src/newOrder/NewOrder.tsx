import React from 'react';
import { Center } from "@chakra-ui/react";
import SeedTreatmentForm from "./SeedTreatmentForm";

export const NewOrder = () => {
  return (
        <Center w='full' h='full' fontSize={'xs'}>
          <SeedTreatmentForm />
        </Center>
  );
};