import React, { useState } from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Checkbox, Button, HStack, VStack, Grid, GridItem } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { nextPage, saveOrderExecution } from '../store/executionSlice';
import { Packaging } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';

const packagingMap = {
    [Packaging.InSeeds]: "ks",
    [Packaging.InKg]: "kg",
};

const OrderExecution1InitialOverview = () => {
    const { t } = useTranslation();
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);

    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    if (!currentOrder) {
        return <Text>{t('order_execution.recipe_not_found')}</Text>;
    }

    if (currentOrder.packaging === null) {
        return <Text>{t('order_execution.packaging_not_found')}</Text>;
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
                <Text fontSize="2xl" fontWeight="bold">{t('order_execution.recipe_execution')}</Text>
                <Text>{currentOrder.crop.name} {currentOrder.variety.name}</Text>    
                
                <Grid templateColumns="3fr 1fr" gap={4} mt={4} >
                    <GridItem borderBottom="1px dotted">
                        <Text><strong>{t('order_execution.lot')}:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.lotNumber}</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>{t('order_execution.seeds_to_treat')}:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.seedsToTreatKg} {t('units.kg')}.</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>{t('order_execution.tkw')}:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.tkw?.toFixed(2)} {t('units.gr')}.</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>{t('order_execution.bag_size')}:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.bagSize} {bagSizeUnit}</Text>
                    </GridItem>

                    <GridItem borderBottom="1px dotted">
                        <Text><strong>{t('order_execution.expected_amount_of_bags')}:</strong></Text>
                    </GridItem>
                    <GridItem borderBottom="1px dotted">
                        <Text>{currentOrder.orderRecipe ? currentOrder.orderRecipe.nbSeedsUnits.toFixed() : "N/A"}</Text>
                    </GridItem>
                </Grid>
                <Table variant="simple" size="sm" mt={4}>
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>{t('order_execution.product')}</Th>
                            <Th>{t('order_execution.litres_lot')}</Th>
                            <Th>{t('order_execution.kg_lot')}</Th>
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
                            <Th>{t('order_execution.total')}</Th>
                            <Th>{totalLitres ? totalLitres.toFixed(2) : "N/A"}</Th>
                            <Th>{totalKg ? totalKg.toFixed(2) : "N/A"}</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </VStack>
            <Checkbox mt='auto' isChecked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
                {t('order_execution.understand_amount_to_use')}
            </Checkbox>
            <HStack justifyContent={"center"}>
                <Button mt={4} w="100px" colorScheme="orange" borderRadius="full" isDisabled={!isChecked} onClick={handleNextClick}>
                    {t('order_execution.next')}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution1InitialOverview;