import React from 'react';
import { Box, VStack, Link, Divider, Button, Icon } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const LeftMenu = () => {
    const location = useLocation();

    const links = [
        { to: "/board", label: "Board" },
        { to: "/new", label: "New Order" },
        { to: "/operators", label: "Operators" },
        { to: "/crops", label: "Crops" },
        { to: "/products", label: "Products" }
    ];

    return (
        <Box width="20%" height="100vh" bg="gray.100" p={4} position="fixed" bgColor={"lightgrey"}>
            <VStack spacing={4} h="full">
                {links.map(link => (
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
                <Divider mt="auto"/>
            </VStack>
        </Box>
    );
};

export default LeftMenu;