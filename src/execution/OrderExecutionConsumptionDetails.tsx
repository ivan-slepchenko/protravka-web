import React from 'react';
import { Box, Button, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, useBreakpointValue } from "@chakra-ui/react";
import { OrderExecutionPage } from './OrderExecutionPage';

export default function OrderExecutionConsumptionDetails() {
    const isStacked = useBreakpointValue({ base: true, md: false });

    return (
        <Flex
            direction={isStacked ? "column" : "row"}
            gap={6}
            padding={4}
            justifyContent="center"
            alignItems={isStacked ? "center" : "stretch"}
        >
            {/* Card for "Slurry" */}
            <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="sm"
                p={4}
                w={isStacked ? "90%" : "45%"}
            >
                <Heading size="md" mb={4}>
          Total slurry consumption per XXX kg
                </Heading>
                <Table variant="simple" mb={4}>
                    <Thead bg="orange.300">
                        <Tr>
                            <Th>Target consumption, kg</Th>
                            <Th>Actual consumption, kg</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>xxx</Td>
                            <Td>xxx</Td>
                        </Tr>
                    </Tbody>
                </Table>
                <Text mb={4}>
          You are obliged to make a photo of scales display on the next page!
                </Text>
                <Button
                    colorScheme="orange"
                    variant="outline"
                    w="full"
                    borderRadius="md"
                >
          Make Photo
                </Button>
            </Box>

            {/* Card for "CDS" */}
            <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="sm"
                p={4}
                w={isStacked ? "90%" : "45%"}
            >
                <Heading size="md" mb={4}>
          Product name #... out of ... Per XXX kg seeds
                </Heading>
                <Table variant="simple" mb={4}>
                    <Thead bg="orange.300">
                        <Tr>
                            <Th>Target consumption, kg</Th>
                            <Th>Actual consumption, kg</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>xxx</Td>
                            <Td>xxx</Td>
                        </Tr>
                    </Tbody>
                </Table>
                <Text mb={4}>
          You are obliged to make a photo of scales display on the next page!
                </Text>
                <Button
                    colorScheme="orange"
                    variant="outline"
                    w="full"
                    borderRadius="md"
                >
          Make Photo
                </Button>
            </Box>
        </Flex>
    );
}
