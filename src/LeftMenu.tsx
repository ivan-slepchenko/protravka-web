import React from 'react';
import { Box, VStack, Divider, Button, Text, HStack, IconButton, Spacer } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { logoutUser } from './store/userSlice';
import { FiLogOut } from 'react-icons/fi';
import { Role } from './operators/Operators';

const LeftMenu = () => {
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const roleToLinks = {
    [Role.MANAGER]: [
      { to: "/board", label: "Board" },
      { to: "/new", label: "New Order" },
    ],
    [Role.ADMIN]: [
      { to: "/operators", label: "Operators" },
      { to: "/crops", label: "Crops" },
      { to: "/products", label: "Products" },
    ],
    [Role.OPERATOR]: [
      { to: "/execution", label: "Execution" },
    ],
  };

  const userRoles = user.roles || [];
  const managerLinks = userRoles.includes(Role.MANAGER) ? roleToLinks[Role.MANAGER] : [];
  const adminLinks = userRoles.includes(Role.ADMIN) ? roleToLinks[Role.ADMIN] : [];
  const operatorLinks = userRoles.includes(Role.OPERATOR) ? roleToLinks[Role.OPERATOR] : [];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Box width="20%" height="100vh" bg="gray.100" p={4} position="fixed" bgColor={"lightgrey"}>
      <VStack spacing={4} h="full">
        <Box w="full" mb={4} p={4} bg="white" borderRadius="md" boxShadow="md">
          <HStack justifyContent="space-between">
            <Text fontWeight="bold">{user.name} {user.surname}</Text>
            <IconButton
              aria-label="Logout"
              icon={<FiLogOut />}
              size="sm"
              colorScheme="red"
              onClick={handleLogout}
            />
          </HStack>
          <Text>{user.email}</Text>
        </Box>
        {managerLinks.map(link => (
          <Button
            w="full"
            as={RouterLink}
            to={link.to}
            key={link.to}
            variant="ghost"
            justifyContent="flex-start"
            isActive={location.pathname === link.to}
            color={location.pathname === link.to ? "blue.500" : "black"}
          >
            {link.label}
          </Button>
        ))}
        <Spacer />
        {operatorLinks.map(link => (
          <Button
            w="full"
            as={RouterLink}
            to={link.to}
            key={link.to}
            variant="ghost"
            justifyContent="flex-start"
            isActive={location.pathname === link.to}
            color={location.pathname === link.to ? "blue.500" : "black"}
          >
            {link.label}
          </Button>
        ))}
        <Divider />
        {adminLinks.map(link => (
          <Button
            w="full"
            as={RouterLink}
            to={link.to}
            key={link.to}
            variant="ghost"
            justifyContent="flex-start"
            isActive={location.pathname === link.to}
            color={location.pathname === link.to ? "blue.500" : "black"}
          >
            {link.label}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default LeftMenu;