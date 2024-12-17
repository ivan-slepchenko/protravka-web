import React from "react";
import { Box, Table, Thead, Tbody, Tfoot, Tr, Th, Td, Text, VStack } from "@chakra-ui/react";
import { Order } from "../../store/newOrderSlice";
import { getRateTypeLabel, getRateUnitLabel } from "../../newOrder/NewOrder";

const ProductDetails: React.FC<{ order: Order }> = ({ order }) => (
    <VStack alignItems="start" w="full">
        <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Details</Text>
        <Box overflowY="auto" borderRadius="md" w="full">
            <Table variant="simple" bg="gray.50" size="sm" w="full">
                <Thead bg="orange.100">
                    <Tr>
                        <Th rowSpan={2} whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Product Name</Th>
                        <Th rowSpan={1} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Density</Th>
                        <Th rowSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate</Th>
                        <Th rowSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate Unit</Th>
                        <Th colSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Slurry Total <span style={{color: 'orangered'}}>*</span></Th>
                        <Th colSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate</Th>
                        <Th colSpan={2} whiteSpace="nowrap" borderLeft="1px" borderBottom="1px" borderColor="gray.400">Rate</Th>
                    </Tr>
                    <Tr>
                        <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">g/ml</Th>
                        <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">l</Th>
                        <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">kg</Th>
                        <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">ml/U/KS</Th>
                        <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">g/U/KS</Th>
                        <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">ml/100kg</Th>
                        <Th whiteSpace="nowrap" borderBottom="1px" borderLeft="1px" borderColor="gray.400">g/100kg</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {order.productDetails && [...order.productDetails]
                        .sort((a, b) => a.index - b.index) // Sort by index
                        .map((productDetail, index) => (
                            <Tr key={index} borderBottom="1px" borderColor="gray.400">
                                <Td borderColor="gray.400">{productDetail.product ? productDetail.product.name : '--'}</Td>
                                <Td borderColor="gray.400">{productDetail.product?.density.toFixed(2)}</Td>
                                <Td borderColor="gray.400">{productDetail.rate.toFixed(2)}</Td>
                                <Td borderColor="gray.400">{`${getRateTypeLabel(productDetail.rateType)}/${getRateUnitLabel(productDetail.rateUnit)}`}</Td>
                                <Td borderColor="gray.400">{(order.orderRecipe.productRecipes[index]?.mlSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                                <Td borderColor="gray.400">{(order.orderRecipe.productRecipes[index]?.grSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                                <Td borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateMltoU_KS.toFixed(2)}</Td>
                                <Td borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateGrToU_KS.toFixed(2)}</Td>
                                <Td borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateMlTo100Kg.toFixed(2)}</Td>
                                <Td borderColor="gray.400">{order.orderRecipe.productRecipes[index]?.rateGrTo100Kg.toFixed(2)}</Td>
                            </Tr>
                        ))}
                </Tbody>
                <Tfoot>
                    <Tr>
                        <Th>Total</Th>
                        <Th>{order.orderRecipe.totalCompoundsDensity.toFixed(2)}</Th>
                        <Th>---</Th>
                        <Th>---</Th>
                        <Th>{(order.orderRecipe.slurryTotalMlRecipeToMix / 1000).toFixed(2)}</Th>
                        <Th>{(order.orderRecipe.slurryTotalGrRecipeToMix / 1000).toFixed(2)}</Th>
                        <Th>{order.orderRecipe.slurryTotalMltoU_KS.toFixed(2)}</Th>
                        <Th>{order.orderRecipe.slurryTotalGToU_KS.toFixed(2)}</Th>
                        <Th>{order.orderRecipe.slurryTotalMlTo100Kg.toFixed(2)}</Th>
                        <Th>{order.orderRecipe.slurryTotalGTo100Kgs.toFixed(2)}</Th>
                    </Tr>
                </Tfoot>
            </Table>
        </Box>
        <Text><span style={{color: 'orangered'}}>*</span> including extra slurry if any</Text>
    </VStack>
);

export default ProductDetails;