import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createOperator, deleteOperator, fetchOperators } from '../store/operatorsSlice';
import { useState, useEffect } from 'react';
import { Box, Button, Input, HStack, VStack } from '@chakra-ui/react';

const Operators = () => {
    const dispatch: AppDispatch = useDispatch();
  const operators = useSelector((state: RootState) => state.operators.operators);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');

  useEffect(() => {
    dispatch(fetchOperators());
  }, [dispatch]);

  const handleAddOperator = () => {
    dispatch(createOperator({ id: '', name, surname }));
    setName('');
    setSurname('');
  };

  return (
    <Box p={4}>
      <HStack spacing={4} mb={4}>
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
        <Button onClick={handleAddOperator} flexShrink={0}>Add Operator</Button>
      </HStack>
      <VStack spacing={4}>
        {operators && operators.map((operator) => (
          <Box key={operator.id} p={4} borderWidth="1px" borderRadius="lg" w="full">
            <HStack justifyContent="space-between">
              <Box>
                {operator.name} {operator.surname}
              </Box>
              <Button onClick={() => dispatch(deleteOperator(operator.id))}>Delete</Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Operators;