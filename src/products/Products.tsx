import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createProduct, deleteProduct, fetchProducts } from '../store/productsSlice';
import { useState, useEffect } from 'react';
import { Box, Button, Input, HStack, VStack, Grid, GridItem, Text } from '@chakra-ui/react';

const Products = () => {
    const dispatch: AppDispatch = useDispatch();
    const products = useSelector((state: RootState) => state.products.products);
    const [name, setName] = useState('');
    const [activeIngredient, setActiveIngredient] = useState('');
    const [density, setDensity] = useState('');
    const [errors, setErrors] = useState<{ name?: boolean; density?: boolean }>({});

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

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

    return (
        <VStack p={4} w="full" h="full" overflow='hidden'>
            <HStack spacing={4} mb={4} p={4} w="full" flexShrink={0}>
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} borderColor={errors.name ? 'red.500' : 'gray.300'} />
                <Input placeholder="Active Ingredient" value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)} />
                <Input placeholder="Density" value={density} onChange={(e) => setDensity(e.target.value)} borderColor={errors.density ? 'red.500' : 'gray.300'} />
                <Button onClick={handleAddProduct} flexShrink={0} size="sm">Add Product</Button>
            </HStack>
            <VStack w="full" overflowY="auto" overflowX="hidden" p={4} flexShrink={1}>
                <Grid templateColumns="repeat(4, 1fr)" borderWidth="1px" borderRadius="lg" w="full">
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Name</GridItem>
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Active Ingredient</GridItem>
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Density</GridItem>
                    <GridItem bg="gray.100" p={2} fontWeight="bold" borderRight="1px solid" borderColor="gray.200">Actions</GridItem>
                    {products && products.map((product) => (
                        <React.Fragment key={product.id}>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200"><Text>{product.name}</Text></GridItem>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200"><Text>{product.activeIngredient}</Text></GridItem>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200"><Text>{product.density}</Text></GridItem>
                            <GridItem p={2} borderBottom="1px solid" borderRight="1px solid" borderColor="gray.200">
                                <Button onClick={() => dispatch(deleteProduct(product.id))} size="sm">Delete</Button>
                            </GridItem>
                        </React.Fragment>
                    ))}
                </Grid>
            </VStack>
        </VStack>
    );
};

export default Products;