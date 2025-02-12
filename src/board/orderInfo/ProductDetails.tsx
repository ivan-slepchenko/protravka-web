import React from "react";
import { Box, Table, Thead, Tbody, Tfoot, Tr, Th, Td, Text, VStack } from "@chakra-ui/react";
import { Order } from "../../store/newOrderSlice";
import { getRateTypeLabel, getRateUnitLabel } from "../../newReceipe/noLab/NewReceipe";

const ProductDetails: React.FC<{ order: Order }> = ({ order }) => {

    if (order.extraSlurry === null) {
        return <Text>Extra Slurry is not defined</Text>;
    }

    const extraSlurryPercentage = order.extraSlurry > 0 ? `Including Extra Slurry ${order.extraSlurry}%` : '';

    return (
        <VStack alignItems="start" w="full">
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Details</Text>
            <Box overflowY="auto" borderRadius="md" w="full">
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th rowSpan={2} whiteSpace="nowrap">Product Name</Th>
                            <Th rowSpan={1} whiteSpace="nowrap">Density</Th>
                            <Th rowSpan={2} whiteSpace="nowrap">Rate</Th>
                            <Th rowSpan={2} whiteSpace="nowrap">Rate Unit</Th>
                            <Th colSpan={2} whiteSpace="nowrap">Slurry Total {order.extraSlurry > 0 && <span style={{color: 'orangered'}}>*</span>}</Th>
                            <Th colSpan={2} whiteSpace="nowrap">Rate</Th>
                            <Th colSpan={2} whiteSpace="nowrap">Rate</Th>
                        </Tr>
                        <Tr>
                            <Th whiteSpace="nowrap">g/ml</Th>
                            <Th whiteSpace="nowrap">l</Th>
                            <Th whiteSpace="nowrap">kg</Th>
                            <Th whiteSpace="nowrap">ml/U/KS</Th>
                            <Th whiteSpace="nowrap">g/U/KS</Th>
                            <Th whiteSpace="nowrap">ml/100kg</Th>
                            <Th whiteSpace="nowrap">g/100kg</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {order.productDetails && [...order.productDetails]
                            .sort((a, b) => a.index - b.index) // Sort by index
                            .map((productDetail, index) => (
                                <Tr key={index}>
                                    <Td>{productDetail.product ? productDetail.product.name : '--'}</Td>
                                    <Td>{productDetail.product?.density.toFixed(2)}</Td>
                                    <Td>{productDetail.rate.toFixed(2)}</Td>
                                    <Td>{`${getRateTypeLabel(productDetail.rateType)}/${getRateUnitLabel(productDetail.rateUnit)}`}</Td>
                                    <Td>{order.orderRecipe ? (order.orderRecipe.productRecipes[index]?.mlSlurryRecipeToMix / 1000).toFixed(2) : "N/A"}</Td>
                                    <Td>{order.orderRecipe ? (order.orderRecipe.productRecipes[index]?.grSlurryRecipeToMix / 1000).toFixed(2) : "N/A"}</Td>
                                    <Td>{order.orderRecipe ? order.orderRecipe.productRecipes[index]?.rateMltoU_KS.toFixed(2) : "N/A"}</Td>
                                    <Td>{order.orderRecipe ? order.orderRecipe.productRecipes[index]?.rateGrToU_KS.toFixed(2) : "N/A"}</Td>
                                    <Td>{order.orderRecipe ? order.orderRecipe.productRecipes[index]?.rateMlTo100Kg.toFixed(2) : "N/A"}</Td>
                                    <Td>{order.orderRecipe ? order.orderRecipe.productRecipes[index]?.rateGrTo100Kg.toFixed(2) : "N/A"}</Td>
                                </Tr>
                            ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Total</Th>
                            <Th>{order.orderRecipe ? order.orderRecipe.totalCompoundsDensity.toFixed(2) : "N/A"}</Th>
                            <Th>---</Th>
                            <Th>---</Th>
                            <Th>{order.orderRecipe ? (order.orderRecipe.slurryTotalMlRecipeToMix / 1000).toFixed(2) : "N/A"}</Th>
                            <Th>{order.orderRecipe ? (order.orderRecipe.slurryTotalGrRecipeToMix / 1000).toFixed(2) : "N/A"}</Th>
                            <Th>{order.orderRecipe ? order.orderRecipe.slurryTotalMltoU_KS.toFixed(2) : "N/A"}</Th>
                            <Th>{order.orderRecipe ? order.orderRecipe.slurryTotalGToU_KS.toFixed(2) : "N/A"}</Th>
                            <Th>{order.orderRecipe ? order.orderRecipe.slurryTotalMlTo100Kg.toFixed(2) : "N/A"}</Th>
                            <Th>{order.orderRecipe ? order.orderRecipe.slurryTotalGTo100Kgs.toFixed(2) : "N/A"}</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </Box>
            {order.extraSlurry > 0 && <Text><span style={{color: 'orangered'}}>*</span> {extraSlurryPercentage}</Text>}
        </VStack>
    );
};

export default ProductDetails;