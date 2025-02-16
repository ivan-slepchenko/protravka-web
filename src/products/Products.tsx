import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createProduct, deleteProduct } from '../store/productsSlice';
import { Fragment, useRef, useState } from 'react';
import { Button, Input, HStack, VStack, Grid, GridItem, Text } from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const Products = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const products = useSelector((state: RootState) => state.products.products);
    const [name, setName] = useState('');
    const [activeIngredient, setActiveIngredient] = useState('');
    const [density, setDensity] = useState('');
    const [errors, setErrors] = useState<{ name?: boolean; density?: boolean }>({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    const handleAddProduct = () => {
        const newErrors: { name?: boolean; density?: boolean } = {};
        if (!name) newErrors.name = true;
        if (!density) newErrors.density = true;
        setErrors(newErrors);

        if (!newErrors.name && !newErrors.density) {
            dispatch(createProduct({ id: '', name, activeIngredient, density: parseFloat(density) }));
            setName('');
            setActiveIngredient('');
            setDensity('');
        }
    };

    const handleDeleteProduct = (productId: string) => {
        setSelectedProductId(productId);
        onOpen();
    };

    const confirmDeleteProduct = () => {
        if (selectedProductId) {
            dispatch(deleteProduct(selectedProductId));
            setSelectedProductId(null);
            onClose();
        }
    };

    return (
        <VStack p={4} w="full" h="full" overflow='hidden'>
            <HStack spacing={4} mb={4} p={4} w="full" flexShrink={0}>
                <Input placeholder={t('products.name')} value={name} onChange={(e) => setName(e.target.value)} borderColor={errors.name ? 'red.500' : 'gray.300'} />
                <Input placeholder={t('products.active_ingredient')} value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)} />
                <Input
                    placeholder={t('products.density')}
                    value={density}
                    onChange={(e) => setDensity(e.target.value === '' ? '' : e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value)}
                    borderColor={errors.density ? 'red.500' : 'gray.300'}
                    type="number"
                    step="0.01"
                />
                <Button onClick={handleAddProduct} flexShrink={0} size="sm">{t('products.add_product')}</Button>
            </HStack>
            <VStack w="full" overflowY="auto" overflowX="hidden" p={4} flexShrink={1}>
                <Grid templateColumns="repeat(4, 1fr)" borderWidth="1px" borderRadius="lg" w="full">
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">{t('products.name')}</GridItem>
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">{t('products.active_ingredient')}</GridItem>
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">{t('products.density')}</GridItem>
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">{t('products.actions')}</GridItem>
                    {products && products
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((product) => (
                            <Fragment key={product.id}>
                                <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200"><Text>{product.name}</Text></GridItem>
                                <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200"><Text>{product.activeIngredient}</Text></GridItem>
                                <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200"><Text>{product.density}</Text></GridItem>
                                <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200">
                                    <Button onClick={() => handleDeleteProduct(product.id)} size="sm">{t('products.delete')}</Button>
                                </GridItem>
                            </Fragment>
                        ))}
                </Grid>
            </VStack>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t('products.delete_product')}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {t('products.confirm_delete')}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                {t('products.cancel')}
                            </Button>
                            <Button colorScheme="red" onClick={confirmDeleteProduct} ml={3}>
                                {t('products.delete')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
};

export default Products;