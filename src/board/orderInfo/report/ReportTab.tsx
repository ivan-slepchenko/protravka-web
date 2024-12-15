import React from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Box,
    Text,
    Badge,
} from '@chakra-ui/react';
import { OrderStatus } from '../../../store/newOrderSlice';

const ReportTab:React.FC = () => {
    // Example data structure; replace or update with your values
    const data = [
        {
            crop: 'Sunflower',
            variety: 'Arena',
            lot: '123',
            treatmentDate: 'some date',
            operator: 'Mustafa',
            lotSizeSU: 'digits',
            lotSizeKg: 'digits',
            status: OrderStatus.InProgress,
        },
    // Add more rows as needed
    ];

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
        case OrderStatus.InProgress:
            return <Badge colorScheme="yellow">In Progress</Badge>;
        case OrderStatus.ToAcknowledge:
            return <Badge colorScheme="red">To Aknowledge</Badge>;
        case OrderStatus.Completed:
            return <Badge colorScheme="green">Completed</Badge>;
        case OrderStatus.Failed:
            return <Badge colorScheme="green">Failed</Badge>;
        default:
            return <Badge colorScheme="gray">Unknown</Badge>;
        }
    };

    return (
        <Box maxW="100%" overflowX="auto" p={5}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
        Seed Processing Report
            </Text>
            <Table variant="striped" colorScheme="teal">
                <Thead>
                    <Tr>
                        <Th>#</Th>
                        <Th>Crop</Th>
                        <Th>Variety</Th>
                        <Th>Lot</Th>
                        <Th>Treatment Date</Th>
                        <Th>Operator</Th>
                        <Th>Lot Size (s.u.)</Th>
                        <Th>Lot Size (kg)</Th>
                        <Th>Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((row, index) => (
                        <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <Td>{row.crop}</Td>
                            <Td>{row.variety}</Td>
                            <Td>{row.lot}</Td>
                            <Td>{row.treatmentDate}</Td>
                            <Td>{row.operator}</Td>
                            <Td>{row.lotSizeSU}</Td>
                            <Td>{row.lotSizeKg}</Td>
                            <Td>{getStatusBadge(row.status)}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default ReportTab;
