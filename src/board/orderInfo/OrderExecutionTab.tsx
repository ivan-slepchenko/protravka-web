import React, { useState } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Image, Modal, ModalOverlay, ModalContent, ModalBody, HStack } from "@chakra-ui/react";
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

    return (
        <Box w="full">
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Order Execution Photos</Text>
            <HStack spacing="4">

                <Box>
                    <Text fontSize="lg">Packing Photo:</Text>
                    {orderExecution?.packingPhoto ? (
                        <>
                            <Text fontSize="xs" fontWeight="bold">Expected quantity: {orderExecution.packedQuantity} Units</Text>
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
                        </>
                    ) : 'No Photo'}
                </Box>
                
                {orderExecution?.consumptionPhoto ? (
                    <Box>
                        <Text fontSize="lg">Consumption Photo:</Text>
                        <Text fontSize="xs" fontWeight="bold">Consumption Info: {order?.orderRecipe?.slurryTotalKgRecipeToWeight}</Text>
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
                    </Box>
                ) : 'No Photo'}
                
            </HStack>
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Execution Details</Text>
            <Box overflowY="auto" bg="gray.50" borderRadius="md">
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th borderLeft="1px" width="20%" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Product Name</Th>
                            <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Expected Application</Th>
                            <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Application Photo</Th>
                            <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Expected Consumption</Th>
                            <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Consumption Photo</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {order.productDetails && [...order.productDetails]
                            .sort((a, b) => a.index - b.index) // Sort by index
                            .map((productDetail, index) => {
                                const productExecution = orderExecution?.productExecutions.find(pe => pe.productId === productDetail.product?.id);
                                const productRecipe = order.orderRecipe.productRecipes.find(pr => pr.productDetail.product?.id === productDetail.product?.id);
                                return (
                                    <Tr key={index} borderBottom="1px" borderColor="gray.400">
                                        <Td width="20%" borderBottom="1px" borderColor="gray.400">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
                                        <Td borderBottom="1px" borderColor="gray.400">
                                            <Text fontSize="xs" fontWeight="bold">{productRecipe?.rateGTo100Kg.toFixed(2)} g</Text>
                                        </Td>
                                        <Td borderBottom="1px" borderColor="gray.400">
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
                                        <Td borderBottom="1px" borderColor="gray.400">
                                            <Text fontSize="xs" fontWeight="bold">{productRecipe?.kgSlurryRecipeToMix.toFixed(2)} kg</Text>
                                        </Td>
                                        <Td borderBottom="1px" borderColor="gray.400">
                                            {productExecution?.consumptionPhoto ? (
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
                                    </Tr>
                                );
                            })}
                    </Tbody>
                </Table>
            </Box>
            <Modal isOpen={!!selectedPhoto} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent width="800px" height="600px" maxWidth="unset">
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