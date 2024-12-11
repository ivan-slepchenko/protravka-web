
import React from 'react';
import { Box, VStack, Button, Text, HStack, IconButton, Spacer, Divider } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { Role } from '../operators/Operators';

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

const DesktopMenu: React.FC<MenuProps> = ({ user, managerLinks, adminLinks, operatorLinks, handleLogout }) => {
    const location = useLocation();

    return (
        <Box width="20%" height="100vh" bg="gray.100" p={4} bgColor={"lightgrey"}>
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

export default DesktopMenu;