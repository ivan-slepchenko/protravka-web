import React, { useState } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Image, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody } from "@chakra-ui/react";

import { Order } from "../../store/newOrderSlice";
import { OrderExecution } from "../../store/executionSlice";

const OrderExecutionTab: React.FC<{ order: Order, orderExecution: OrderExecution }> = ({ order, orderExecution }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null | undefined>(null);
    
    const handlePhotoClick = (photoUrl: string | null | undefined) => {
        setSelectedPhoto(photoUrl);
    };

    const handleClose = () => {
        setSelectedPhoto(null);
    };


    const applicationMethod = orderExecution?.applicationMethod;

    return (
        <Box w="full">
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Receipe Execution Photos:</Text>
            <Box overflowY="auto" bg="gray.50" borderRadius="md" w={applicationMethod !== 'Surry' ? "50%" : "full"}>
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th whiteSpace="nowrap">Expected Seeds To Pack</Th>
                            <Th whiteSpace="nowrap">Packing Photo</Th>                      
                            {applicationMethod === 'Surry' && (
                                <>
                                    <Th whiteSpace="nowrap">Consumption Info</Th>
                                    <Th whiteSpace="nowrap">Consumption Photo</Th>
                                </>
                            )}
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>
                                <Text fontSize="xs" fontWeight="bold">{orderExecution.packedseedsToTreatKg} kg</Text>
                            </Td>
                            <Td>
                                {orderExecution?.packingPhoto ? (
                                    <Image
                                        src={orderExecution.packingPhoto}
                                        alt="Packing"
                                        width="150px"
                                        height="100px"
                                        objectFit="cover"
                                        onClick={() => handlePhotoClick(orderExecution.packingPhoto)}
                                        cursor="pointer"
                                        title="Expected Packing Photo"
                                    />
                                ) : 'No Photo'}
                            </Td>
                            {applicationMethod === 'Surry' && (
                                <>
                                    <Td>
                                        <Text fontSize="xs" fontWeight="bold">{orderExecution?.slurryConsumptionPerLotKg} kg</Text>
                                    </Td>
                                    <Td>
                                        {orderExecution?.consumptionPhoto ? (
                                            <Image
                                                src={orderExecution.consumptionPhoto}
                                                alt="Consumption"
                                                width="150px"
                                                height="100px"
                                                objectFit="cover"
                                                onClick={() => handlePhotoClick(orderExecution.consumptionPhoto)}
                                                cursor="pointer"
                                                title="Expected Consumption Photo"
                                            />
                                        ) : 'No Photo'}
                                    </Td>
                                </>
                            )}
                        </Tr>
                    </Tbody>
                </Table>
            </Box>
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Execution Details</Text>
            <Box overflowY="auto" bg="gray.50" borderRadius="md">
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th whiteSpace="nowrap">Product Name</Th>
                            <Th whiteSpace="nowrap">Expected Application</Th>
                            <Th whiteSpace="nowrap">Application Photo</Th>
                            {applicationMethod !== 'Surry' && (
                                <>
                                    <Th whiteSpace="nowrap">Expected Consumption</Th>
                                    <Th whiteSpace="nowrap">Consumption Photo</Th>
                                </>
                            )}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {order.productDetails && [...order.productDetails]
                            .sort((a, b) => a.index - b.index) // Sort by index
                            .map((productDetail, index) => {
                                const productExecution = orderExecution?.productExecutions.find(pe => pe.productId === productDetail.product?.id);
                                return (
                                    <Tr key={index}>
                                        <Td>{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
                                        <Td>
                                            <Text>{productExecution?.appliedRateKg !== undefined ? productExecution?.appliedRateKg.toFixed(2) : 0} kg</Text>
                                        </Td>
                                        <Td>
                                            {productExecution?.applicationPhoto ? (
                                                <Image
                                                    src={productExecution.applicationPhoto}
                                                    alt="Application"
                                                    width="150px"
                                                    height="100px"
                                                    objectFit="cover"
                                                    onClick={() => handlePhotoClick(productExecution.applicationPhoto)}
                                                    cursor="pointer"
                                                    title="Expected Application Photo"
                                                />
                                            ) : 'No Photo'}
                                        </Td>
                                        {applicationMethod !== 'Surry' && productExecution && productExecution.productConsumptionPerLotKg !== undefined && (
                                            <>
                                                <Td>
                                                    <Text>{productExecution.productConsumptionPerLotKg.toFixed(2)} kg</Text>
                                                </Td>
                                                <Td>
                                                    {productExecution.consumptionPhoto ? (
                                                        <Image
                                                            src={productExecution.consumptionPhoto}
                                                            alt="Consumption"
                                                            width="150px"
                                                            height="100px"
                                                            objectFit="cover"
                                                            onClick={() => handlePhotoClick(productExecution.consumptionPhoto)}
                                                            cursor="pointer"
                                                            title="Expected Consumption Photo"
                                                        />
                                                    ) : 'No Photo'}
                                                </Td>
                                            </>
                                        )}
                                    </Tr>
                                );
                            })}
                    </Tbody>
                </Table>
            </Box>
            <Modal isOpen={!!selectedPhoto} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent width="800px" height="600px" maxWidth="unset" p="6">
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedPhoto && (
                            <Image
                                src={selectedPhoto}
                                alt="Full Size"
                                width="full"
                                height="full"
                                objectFit="cover"
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default OrderExecutionTab;