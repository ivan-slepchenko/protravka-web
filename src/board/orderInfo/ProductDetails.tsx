
import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { Order } from "../../store/newOrderSlice";
import { getRateTypeLabel, getRateUnitLabel } from "../../newOrder/NewOrder";

const ProductDetails: React.FC<{ order: Order }> = ({ order }) => (
    <Box maxHeight="300px" overflowY="auto" bg="gray.50" borderRadius="md">
        <Table variant="simple" size="sm" w="full">
            <Thead bg="orange.100">
                <Tr>
                    <Th rowSpan={2} width="20%" whiteSpace="nowrap" borderBottom="1px" borderColor="gray.400">Product Name</Th>
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
                            <Td width="20%" borderBottom="1px" borderColor="gray.400">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
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
);

export default ProductDetails;