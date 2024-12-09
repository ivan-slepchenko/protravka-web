import React from "react";
import { Box, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Grid, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchProducts } from "../store/productsSlice";
import { getRateTypeLabel, getRateUnitLabel } from "../newOrder/NewOrder";
import { fetchOrderExecution } from "../store/executionSlice";

interface OrderInfoProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderInfo: React.FC<OrderInfoProps> = ({ isOpen, onClose, orderId }) => {
    const dispatch: AppDispatch = useDispatch();
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === orderId));
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(execution => execution.orderId === orderId));

    React.useEffect(() => {
        if (isOpen) {
            dispatch(fetchProducts());
            dispatch(fetchOrderExecution(orderId));
        }
    }, [isOpen, dispatch, orderId]);

    if (!order) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="1200px">
                <ModalHeader>Your Order</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Tabs>
                        <TabList>
                            <Tab>Recipe</Tab>
                            <Tab>Execution</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Box w="full">
                                    <Grid templateColumns="repeat(2, 1fr)" gap="4" mb="4">
                                        <Box border="1px" borderColor="gray.200" p="4" borderRadius="md">
                                            <Text fontSize="md" fontWeight="bold" mb="2">Order Information</Text>
                                            <Grid templateColumns="repeat(2, 1fr)" gap="1" borderColor="gray.200">
                                                <Box>
                                                    <Text fontSize="xs">Recipe creation date:</Text>
                                                    <Text>{order.recipeDate}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Application date:</Text>
                                                    <Text>{order.applicationDate}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Operator:</Text>
                                                    <Text>{order.operator ? `${order.operator.name} ${order.operator.surname}` : "undefined"}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Crop:</Text>
                                                    <Text>{order.crop.name}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Variety:</Text>
                                                    <Text>{order.variety.name}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Lot Number:</Text>
                                                    <Text>{order.lotNumber}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">TKW (g):</Text>
                                                    <Text>{order.tkw}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Quantity to treat (kg):</Text>
                                                    <Text>{order.quantity}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Packaging:</Text>
                                                    <Text>{order.packaging}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Bag size (K/Seeds):</Text>
                                                    <Text>{order.bagSize}</Text>
                                                </Box>
                                            </Grid>
                                        </Box>
                                        <Box border="1px" borderColor="gray.200" p="4" borderRadius="md">
                                            <Text fontSize="md" fontWeight="bold" mb="2">Recipe Information</Text>
                                            <Grid templateColumns="repeat(2, 1fr)" gap="1" borderColor="gray.200">
                                                <Box>
                                                    <Text fontSize="xs">Total Compounds Density:</Text>
                                                    <Text>{order.orderRecipe.totalCompoundsDensity.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Slurry Total (ml/U/KS):</Text>
                                                    <Text>{order.orderRecipe.slurryTotalMltoU_KS.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Slurry Total (g/U/KS):</Text>
                                                    <Text>{order.orderRecipe.slurryTotalGToU_KS.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Slurry Total (ml/100kg):</Text>
                                                    <Text>{order.orderRecipe.slurryTotalMlTo100Kg.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Slurry Total (g/100kg):</Text>
                                                    <Text>{order.orderRecipe.slurryTotalGTo100Kgs.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Slurry Total (ml Recipe/Mix):</Text>
                                                    <Text>{order.orderRecipe.slurryTotalMlRecipeToMix.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Slurry Total (kg Recipe/Weight):</Text>
                                                    <Text>{order.orderRecipe.slurryTotalKgRecipeToWeight.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Extra Slurry (Pipes/Pump Feeding ml):</Text>
                                                    <Text>{order.orderRecipe.extraSlurryPipesAndPompFeedingMl.toFixed(2)}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs">Number of Seed Units:</Text>
                                                    <Text>{order.orderRecipe.nbSeedsUnits.toFixed(2)}</Text>
                                                </Box>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Details</Text>
                                    <Box maxHeight="300px" overflowY="auto" bg="gray.50" borderRadius="md">
                                        <Table variant="simple" size="sm" w="full">
                                            <Thead bg="orange.100">
                                                <Tr>
                                                    <Th rowSpan={2} width="35%" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Product Name</Th>
                                                    <Th rowSpan={1} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Density</Th>
                                                    <Th rowSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate</Th>
                                                    <Th rowSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate Unit</Th>
                                                    <Th colSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Slurry Total</Th>
                                                    <Th colSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate</Th>
                                                    <Th colSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate</Th>
                                                    <Th colSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Slurry</Th>
                                                </Tr>
                                                <Tr>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">g/ml</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">ml/U/KS</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">g/U/KS</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">ml/U/KS</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">g/U/KS</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">ml/100kg</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">g/100kg</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">liters</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">kg</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {order.productDetails && [...order.productDetails]
                                                    .sort((a, b) => a.index - b.index) // Sort by index
                                                    .map((productDetail, index) => (
                                                        <Tr key={index} borderBottom="1px" borderColor="gray.400">
                                                            <Td width="35%" borderBottom="1px" borderColor="gray.400">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{productDetail.product?.density.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{productDetail.rate.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{`${getRateTypeLabel(productDetail.rateType)}/${getRateUnitLabel(productDetail.rateUnit)}`}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.kgSlurryRecipeToMix.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.literSlurryRecipeToMix.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateMltoU_KS.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateGToU_KS.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateMlTo100Kg.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateGTo100Kg.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.literSlurryRecipeToMix.toFixed(2)}</Td>
                                                            <Td borderBottom="1px" borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.kgSlurryRecipeToMix.toFixed(2)}</Td>
                                                        </Tr>
                                                    ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </Box>
                            </TabPanel>
                            <TabPanel>
                                <Box w="full">
                                    <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Order Execution Photos</Text>
                                    <Box>
                                        <Text fontSize="xs">Packing Photo:</Text>
                                        {orderExecution?.packingPhoto ? <img src={orderExecution.packingPhoto} alt="Packing" /> : 'No Photo'}
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs">Consumption Photo:</Text>
                                        {orderExecution?.consumptionPhoto ? <img src={orderExecution.consumptionPhoto} alt="Consumption" /> : 'No Photo'}
                                    </Box>
                                    <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Execution Details</Text>
                                    <Box maxHeight="300px" overflowY="auto" bg="gray.50" p="2" borderRadius="md">
                                        <Table variant="simple" size="sm" w="full">
                                            <Thead bg="orange.100">
                                                <Tr>
                                                    <Th width="35%" whiteSpace="nowrap" borderBottom="2px" borderColor="gray.400">Product Name</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="2px" borderColor="gray.400">Application Photo</Th>
                                                    <Th whiteSpace="nowrap" borderBottom="2px" borderColor="gray.400">Consumption Photo</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {order.productDetails && [...order.productDetails]
                                                    .sort((a, b) => a.index - b.index) // Sort by index
                                                    .map((productDetail, index) => {
                                                        const productExecution = orderExecution?.productExecutions.find(pe => pe.productId === productDetail.product?.id);
                                                        return (
                                                            <Tr key={index} borderBottom="2px" borderColor="gray.400">
                                                                <Td width="35%" borderBottom="2px" borderColor="gray.400">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
                                                                <Td borderBottom="2px" borderColor="gray.400">{productExecution?.applicationPhoto ? <img src={productExecution.applicationPhoto} alt="Application" /> : 'No Photo'}</Td>
                                                                <Td borderBottom="2px" borderColor="gray.400">{productExecution?.consumptionPhoto ? <img src={productExecution.consumptionPhoto} alt="Consumption" /> : 'No Photo'}</Td>
                                                            </Tr>
                                                        );
                                                    })}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </Box>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default OrderInfo;