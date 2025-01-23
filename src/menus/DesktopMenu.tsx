import { FC } from 'react';
import { Box, VStack, Button, Text, HStack, IconButton, Spacer, Divider } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { Role } from '../operators/Operators';
import useRoleLinks from '../hooks/useRoleLinks';

interface MenuProps {
    user: {
        name: string | null;
        surname: string | null;
        email: string | null;
        roles: Role[];
    };
    handleLogout: () => void;
}

const DesktopMenu: FC<MenuProps> = ({ user, handleLogout }) => {
    const location = useLocation();
    const { managerLinks, adminLinks, operatorLinks, laboratoryLinks } = useRoleLinks(user.roles);

    return (
        <Box width="300px" height="100vh" p={4}>
            <VStack spacing={4} h="full" alignItems={'start'}>
                <VStack spacing={2} pl={4} w="full" alignItems={'start'}>
                    <HStack justifyContent="space-between" w="full">
                        <Text isTruncated fontWeight="bold" fontSize={'lg'}>{user.name} {user.surname}</Text>
                        <IconButton
                            aria-label="Logout"
                            icon={<FiLogOut />}
                            size="md"
                            colorScheme="red"
                            onClick={handleLogout}
                            variant={'ghost'}
                        />
                    </HStack>
                    <Text fontSize={'sm'} isTruncated>{user.email}</Text>
                </VStack>
                <Divider colorScheme='blackAlpha'/>
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
                        leftIcon={link.icon} // Configure icon
                    >
                        {link.label}
                    </Button>
                ))}
                {laboratoryLinks.map(link => (
                    <Button
                        w="full"
                        as={RouterLink}
                        to={link.to}
                        key={link.to}
                        variant="ghost"
                        justifyContent="flex-start"
                        isActive={location.pathname === link.to}
                        color={location.pathname === link.to ? "blue.500" : "black"}
                        leftIcon={link.icon} // Configure icon
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
                        leftIcon={link.icon} // Configure icon
                    >
                        {link.label}
                    </Button>
                ))}
                <Divider colorScheme='blackAlpha'/>
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
                        leftIcon={link.icon} // Configure icon
                    >
                        {link.label}
                    </Button>
                ))}
            </VStack>
        </Box>
    );
};

export default DesktopMenu;