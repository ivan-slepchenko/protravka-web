import React from 'react';
import { Box, VStack, Divider, Button, Text, HStack, IconButton, Spacer, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { logoutUser } from './store/userSlice';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import { Role } from './operators/Operators';

interface MenuProps {
  user: {
    name: string | null;
    surname: string | null;
    email: string | null;
    roles: Role[];
  };
  managerLinks: { to: string; label: string }[];
  adminLinks: { to: string; label: string }[];
  operatorLinks: { to: string; label: string }[];
  handleLogout: () => void;
}

const MobileMenu: React.FC<MenuProps> = ({ user, managerLinks, adminLinks, operatorLinks, handleLogout }) => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <VStack display={{ base: 'flex', md: 'none' }} p={4} bg="gray.100" justifyContent="space-between" alignItems="center">
        <IconButton
          aria-label="Menu"
          icon={<FiMenu />}
          size="lg"
          onClick={onOpen}
        />
        <HStack spacing={4}>
          <Text fontWeight="bold">{user.name} {user.surname}</Text>
        </HStack>
      </VStack>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
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
                  onClick={onClose}
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
                  onClick={onClose}
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
                  onClick={onClose}
                >
                  {link.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const DesktopMenu: React.FC<MenuProps> = ({ user, managerLinks, adminLinks, operatorLinks, handleLogout }) => {
  const location = useLocation();

  return (
    <Box display={{ base: 'none', md: 'block' }} width="20%" height="100vh" bg="gray.100" p={4} position="fixed" bgColor={"lightgrey"}>
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

const LeftMenu = () => {
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
    <>
      <MobileMenu user={user} managerLinks={managerLinks} adminLinks={adminLinks} operatorLinks={operatorLinks} handleLogout={handleLogout} />
      <DesktopMenu user={user} managerLinks={managerLinks} adminLinks={adminLinks} operatorLinks={operatorLinks} handleLogout={handleLogout} />
    </>
  );
};

export default LeftMenu;