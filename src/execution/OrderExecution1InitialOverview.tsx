import React, { useState } from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Checkbox, Button, HStack, VStack, Grid, GridItem } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { nextPage, saveOrderExecution } from '../store/executionSlice';
import { Packaging } from '../store/newOrderSlice';

const packagingMap = {
    [Packaging.InSeeds]: "ks",
    [Packaging.InKg]: "kg",
};

const OrderExecution1InitialOverview = () => {
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);

    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    if (!currentOrder) {
        return <Text>{'Receipe not found '}</Text>;
    }

    if (currentOrder.packaging === null) {
        return <Text>{'Packaging not found '}</Text>;
    }

    const totalLitres = currentOrder.orderRecipe ? currentOrder.orderRecipe.productRecipes.reduce((total, productRecipe) => total + productRecipe.mlSlurryRecipeToMix, 0) / 1000 : undefined;
    const totalKg = currentOrder.orderRecipe ? currentOrder.orderRecipe.productRecipes.reduce((total, productRecipe) => total + productRecipe.grSlurryRecipeToMix, 0) / 1000 : undefined;
    const bagSizeUnit = packagingMap[currentOrder.packaging];

    const handleNextClick = () => {
        dispatch(nextPage());
        dispatch(saveOrderExecution());
    // Navigate to the next page if needed
    };

    return (
        <VStack p={4} w="full" h="full" flexShrink={1}>
            <VStack w='full' flexShrink={1} overflow={'auto'}>
                <Text fontSize="2xl" fontWeight="bold">Receipe Execution</Text>
                <Text>{currentOrder.crop.name} {currentOrder.variety.name}</Text>    
                
                <Grid templateColumns="3fr 1fr" gap={4} mt={4} >
                    <GridItem borderBottom="1px dotted">
                        <Text><strong>Lot:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.lotNumber}</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>Seeds To Treat:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.seedsToTreatKg} kg</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>TKW:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.tkw} gr</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>Bag Size:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.bagSize} {bagSizeUnit}</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>Expected Amount Of Bags:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.orderRecipe ? currentOrder.orderRecipe.nbSeedsUnits.toFixed() : "N/A"}</Text>
                    </GridItem>
                </Grid>
                <Table variant="simple" size="sm" mt={4}>
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>Product</Th>
                            <Th>Litres/Lot</Th>
                            <Th>Kg/Lot</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentOrder.orderRecipe && currentOrder.orderRecipe.productRecipes.map(productRecipe => {
                            return (
                                <Tr key={productRecipe.id}>
                                    <Td>{productRecipe.productDetail.product?.name}</Td>
                                    <Td>{(productRecipe.mlSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                                    <Td>{(productRecipe.grSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                                </Tr>
                            )
                        })}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Total</Th>
                            <Th>{totalLitres ? totalLitres.toFixed(2) : "N/A"}</Th>
                            <Th>{totalKg ? totalKg.toFixed(2) : "N/A"}</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </VStack>
            <Checkbox mt='auto' isChecked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
                {'I understand the amount I need to use'}
            </Checkbox>
            <HStack justifyContent={"center"}>
                <Button mt={4} w="100px" colorScheme="orange" borderRadius="full" isDisabled={!isChecked} onClick={handleNextClick}>
                    {'Next'}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution1InitialOverview;