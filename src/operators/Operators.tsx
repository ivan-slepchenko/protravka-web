import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { deleteOperator, fetchOperators, pushOperatorChanges, updateOperator } from '../store/operatorsSlice';
import { useEffect } from 'react';
import { Box, Button, Checkbox, CheckboxGroup, Stack, Text, Grid, GridItem } from '@chakra-ui/react';

export enum Role {
  OPERATOR = 'operator',
  ADMIN = 'admin',
  MANAGER = 'manager',
}
  

const Operators = () => {
  const dispatch: AppDispatch = useDispatch();
  const operators = useSelector((state: RootState) => state.operators.operators);

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

  return (
    <Box p={4}>
      <Grid templateColumns="repeat(5, 1fr)" borderWidth="1px" borderRadius="lg" overflow="hidden">
        <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Name</GridItem>
        <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Email</GridItem>
        <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Phone</GridItem>
        <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Roles</GridItem>
        <GridItem bg="gray.100" p={2} fontWeight="bold">Actions</GridItem>
        {operators && operators.map((operator) => (
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
              <Button onClick={() => dispatch(deleteOperator(operator.id))} size={"xs"}>Delete</Button>
            </GridItem>
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default Operators;