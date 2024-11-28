import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { deleteOperator, fetchOperators, updateOperator } from '../store/operatorsSlice';
import { useEffect } from 'react';
import { Box, Button, Checkbox, CheckboxGroup, HStack, Stack, VStack } from '@chakra-ui/react';

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
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4}>
        {operators && operators.map((operator) => (
          <Box key={operator.id} p={4} borderWidth="1px" borderRadius="lg" w="full">
            <HStack justifyContent="space-between">
              <Box>
                {operator.name} {operator.surname}
              </Box>
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
              <Button onClick={() => dispatch(deleteOperator(operator.id))}>Delete</Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Operators;