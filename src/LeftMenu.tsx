import { Box, VStack, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const LeftMenu = () => {
  return (
    <Box width="20%" height="100vh" bg="gray.100" p={4} position="fixed">
      <VStack spacing={4} align="stretch">
        <Link as={RouterLink} to="/board">Board</Link>
        <Link as={RouterLink} to="/new">New Order</Link>
        <Link as={RouterLink} to="/operators">Operators</Link>
        <Link as={RouterLink} to="/crops">Crops</Link>
      </VStack>
    </Box>
  );
};

export default LeftMenu;