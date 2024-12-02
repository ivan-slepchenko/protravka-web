import React from 'react';
import { Center } from "@chakra-ui/react";
import SeedTreatmentForm from "./SeedTreatmentForm";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Role } from '../operators/Operators';

export const NewOrder = () => {
    const operators = useSelector((state: RootState) => state.operators.operators);
    const operatorRole = Role.OPERATOR;
    const filteredOperators = operators.filter(operator => operator.roles.includes(operatorRole));

    return (
        <Center w='full' h='full' fontSize={'xs'}>
            <SeedTreatmentForm operators={filteredOperators} />
        </Center>
    );
};