import React from 'react';
import { Box, VStack, Button, Text, HStack, IconButton, Spacer, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, Divider } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import { Role } from '../operators/Operators';
import useRoleLinks from '../hooks/useRoleLinks';
import { useTranslation } from 'react-i18next';

interface MenuProps {
    user: {
        name: string | null;
        surname: string | null;
        email: string | null;
        roles: Role[];
        company: {
            featureFlags: { useLab: boolean };
        } | null;
    };
    handleLogout: () => void;
}

const MobileMenu: React.FC<MenuProps> = ({ user, handleLogout }) => {
    const location = useLocation();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { t } = useTranslation();
    const { managerLinks, adminLinks, operatorLinks, laboratoryLinks } = useRoleLinks(user.roles);
    const useLab = user.company?.featureFlags.useLab;

    return (
        <>
            <HStack display={{ base: 'flex', md: 'none' }} w="full" py={2} pl={2} pr={4} justifyContent="space-between" alignItems="center" flexShrink={0}>
                <IconButton
                    aria-label="Menu"
                    icon={<FiMenu />}
                    size="md"
                    onClick={onOpen}
                />
                <Text fontWeight="bold">{user.name} {user.surname}</Text>
            </HStack>
            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>{t('mobile_menu.menu')}</DrawerHeader>
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
                            {useLab && laboratoryLinks.map(link => (
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
                            <Button
                                w="full"
                                as={RouterLink}
                                to="/info"
                                variant="ghost"
                                justifyContent="flex-start"
                                isActive={location.pathname === "/info"}
                                color={location.pathname === "/info" ? "blue.500" : "black"}
                                onClick={onClose}
                            >
                                {t('mobile_menu.info')}
                            </Button>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default MobileMenu;