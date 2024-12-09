import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { deleteOperator, fetchOperators, pushOperatorChanges, updateOperator } from '../store/operatorsSlice';
import { useEffect } from 'react';
import { Box, Button, Checkbox, CheckboxGroup, Stack, Text, Grid, GridItem } from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';

export enum Role {
  OPERATOR = 'operator',
  ADMIN = 'admin',
  MANAGER = 'manager',
}
  

const Operators = () => {
    const dispatch: AppDispatch = useDispatch();
    const operators = useSelector((state: RootState) => state.operators.operators);
    const currentUserEmail = useSelector((state: RootState) => state.user.email);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        dispatch(fetchOperators());
    }, [dispatch]);

    const handleRoleChange = (operatorId: string, roles: Role[]) => {
        const operator = operators.find(op => op.id === operatorId);
        if (operator) {
            dispatch(updateOperator({ ...operator, roles }));
            dispatch(pushOperatorChanges({ ...operator, roles }));
        }
    };

    const handleDeleteOperator = (operatorId: string) => {
        setSelectedOperatorId(operatorId);
        onOpen();
    };

    const confirmDeleteOperator = () => {
        if (selectedOperatorId) {
            dispatch(deleteOperator(selectedOperatorId));
            setSelectedOperatorId(null);
            onClose();
        }
    };

    return (
        <Box p={4}>
            <Grid templateColumns="repeat(5, 1fr)" borderWidth="1px" borderRadius="lg" overflow="hidden">
                <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Name</GridItem>
                <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Email</GridItem>
                <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Phone</GridItem>
                <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Roles</GridItem>
                <GridItem bg="gray.100" p={2} fontWeight="bold">Actions</GridItem>
                {operators && operators
                    .filter(operator => operator.email !== currentUserEmail)
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((operator) => (
                        <React.Fragment key={operator.id}>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200">
                                <Text>{operator.name} {operator.surname}</Text>
                            </GridItem>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200">
                                <Text>{operator.email}</Text>
                            </GridItem>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200">
                                <Text>{operator.phone}</Text>
                            </GridItem>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200">
                                <CheckboxGroup
                                    value={operator.roles}
                                    onChange={(values) => handleRoleChange(operator.id, values as Role[])}
                                >
                                    <Stack direction="row">
                                        {Object.values(Role).map(role => (
                                            <Checkbox key={role} value={role}>
                                                {role}
                                            </Checkbox>
                                        ))}
                                    </Stack>
                                </CheckboxGroup>
                            </GridItem>
                            <GridItem p={2} borderBottom="1px solid" borderColor="gray.200">
                                <Button onClick={() => handleDeleteOperator(operator.id)} size={"xs"}>Delete</Button>
                            </GridItem>
                        </React.Fragment>
                    ))}
            </Grid>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Operator
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete this operator? This action cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={confirmDeleteOperator} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default Operators;