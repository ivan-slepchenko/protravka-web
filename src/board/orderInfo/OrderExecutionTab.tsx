import React, { useState } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Image, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Button } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { changeOrderStatus } from "../../store/ordersSlice";
import { Order, OrderStatus } from "../../store/newOrderSlice";
import { OrderExecution } from "../../store/executionSlice";
import { AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";

const OrderExecutionTab: React.FC<{ order: Order, orderExecution: OrderExecution }> = ({ order, orderExecution }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null | undefined>(null);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const applicationMethod = orderExecution?.applicationMethod;

    const handlePhotoClick = (photoUrl: string | null | undefined) => {
        setSelectedPhoto(photoUrl);
    };

    const handleClose = () => {
        setSelectedPhoto(null);
    };

    const handleAcknowledge = () => {
        if (order.id) {
            dispatch(changeOrderStatus({ id: order.id, status: OrderStatus.Acknowledge }));
            navigate('/board');
        }
    };

    return (
        <Box w="full">
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Order Execution Photos:</Text>
            <Box overflowY="auto" bg="gray.50" borderRadius="md" w={applicationMethod !== 'Surry' ? "50%" : "full"}>
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Packing Photo</Th>
                            <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Expected Quantity</Th>
                            {applicationMethod === 'Surry' && (
                                <>
                                    <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Consumption Photo</Th>
                                    <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Consumption Info</Th>
                                </>
                            )}
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr borderBottom="1px" borderColor="gray.400">
                            <Td borderBottom="1px" borderColor="gray.400">
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
                            <Td borderBottom="1px" borderColor="gray.400">
                                <Text fontSize="xs" fontWeight="bold">{orderExecution?.packedQuantity} units</Text>
                            </Td>
                            {applicationMethod === 'Surry' && (
                                <>
                                    <Td borderBottom="1px" borderColor="gray.400">
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
                                    <Td borderBottom="1px" borderColor="gray.400">
                                        <Text fontSize="xs" fontWeight="bold">{order?.orderRecipe?.slurryTotalKgRecipeToMix.toFixed(2)} kg</Text>
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
                            <Th whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Product Name</Th>
                            <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Expected Application</Th>
                            <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Application Photo</Th>
                            {applicationMethod !== 'Surry' && (
                                <>
                                    <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Expected Consumption</Th>
                                    <Th borderLeft="1px" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Consumption Photo</Th>
                                </>
                            )}
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
                                        <Td borderBottom="1px" borderColor="gray.400">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
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
                                        {applicationMethod !== 'Surry' && (
                                            <>
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
            <Box mt="4" textAlign="right">
                <Button colorScheme="blue" onClick={handleAcknowledge}>Acknowledge And Close</Button>
            </Box>
        </Box>
    );
};

export default OrderExecutionTab;