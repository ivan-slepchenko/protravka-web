import React from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

import { Order } from "../../store/newOrderSlice";
import { OrderExecution } from "../../store/executionSlice";
import useImageModal from '../../hooks/useImageModal';
import { useTranslation } from 'react-i18next';

const OrderExecutionTab: React.FC<{ order: Order, orderExecution: OrderExecution }> = ({ order, orderExecution }) => {
    const { t } = useTranslation();
    const { ImageModal, ImageWithModal, selectedPhoto, handleClose } = useImageModal();

    const applicationMethod = orderExecution?.applicationMethod;

    return (
        <Box w="full">
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">{t('order_execution.recipe_execution_photos')}:</Text>
            <Box overflowY="auto" bg="gray.50" borderRadius="md" w={applicationMethod !== 'Surry' ? "50%" : "full"}>
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th whiteSpace="nowrap">{t('order_execution.expected_seeds_to_pack')}</Th>
                            <Th whiteSpace="nowrap">{t('order_execution.packing_photo')}</Th>                      
                            {applicationMethod === 'Surry' && (
                                <>
                                    <Th whiteSpace="nowrap">{t('order_execution.consumption_info')}</Th>
                                    <Th whiteSpace="nowrap">{t('order_execution.consumption_photo')}</Th>
                                </>
                            )}
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>
                                <Text fontSize="xs" fontWeight="bold">{orderExecution.packedseedsToTreatKg} {t('units.kg')}.</Text>
                            </Td>
                            <Td>
                                {orderExecution?.packingPhoto ? (
                                    <ImageWithModal
                                        src={orderExecution.packingPhoto}
                                    />
                                ) : t('order_execution.no_photo')}
                            </Td>
                            {applicationMethod === 'Surry' && (
                                <>
                                    <Td>
                                        <Text fontSize="xs" fontWeight="bold">{orderExecution?.slurryConsumptionPerLotKg} {t('units.kg')}.</Text>
                                    </Td>
                                    <Td>
                                        {orderExecution?.consumptionPhoto ? (
                                            <ImageWithModal
                                                src={orderExecution.consumptionPhoto}
                                            />
                                        ) : t('order_execution.no_photo')}
                                    </Td>
                                </>
                            )}
                        </Tr>
                    </Tbody>
                </Table>
            </Box>
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">{t('order_execution.product_execution_details')}</Text>
            <Box overflowY="auto" bg="gray.50" borderRadius="md">
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th whiteSpace="nowrap">{t('order_execution.product_name')}</Th>
                            <Th whiteSpace="nowrap">{t('order_execution.expected_application')}</Th>
                            <Th whiteSpace="nowrap">{t('order_execution.application_photo')}</Th>
                            {applicationMethod !== 'Surry' && (
                                <>
                                    <Th whiteSpace="nowrap">{t('order_execution.expected_consumption')}</Th>
                                    <Th whiteSpace="nowrap">{t('order_execution.consumption_photo')}</Th>
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
                                        <Td>{productDetail.product ? productDetail.product.name : t('order_execution.undefined')}</Td>
                                        <Td>
                                            <Text>{productExecution?.appliedRateKg !== undefined ? productExecution?.appliedRateKg.toFixed(2) : 0} {t('units.kg')}.</Text>
                                        </Td>
                                        <Td>
                                            {productExecution?.applicationPhoto ? (
                                                <ImageWithModal
                                                    src={productExecution.applicationPhoto}
                                                />
                                            ) : t('order_execution.no_photo')}
                                        </Td>
                                        {applicationMethod !== 'Surry' && productExecution && productExecution.productConsumptionPerLotKg !== undefined && (
                                            <>
                                                <Td>
                                                    <Text>{productExecution.productConsumptionPerLotKg.toFixed(2)} {t('units.kg')}.</Text>
                                                </Td>
                                                <Td>
                                                    {productExecution.consumptionPhoto ? (
                                                        <ImageWithModal
                                                            src={productExecution.consumptionPhoto}
                                                        />
                                                    ) : t('sorder_execution.no_photo')}
                                                </Td>
                                            </>
                                        )}
                                    </Tr>
                                );
                            })}
                    </Tbody>
                </Table>
            </Box>
            <ImageModal selectedPhoto={selectedPhoto} handleClose={handleClose} />
        </Box>
    );
};

export default OrderExecutionTab;