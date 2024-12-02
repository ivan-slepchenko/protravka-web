import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createProduct, deleteProduct, fetchProducts } from '../store/productsSlice';
import { useState, useEffect } from 'react';
import { Box, Button, Input, HStack, VStack } from '@chakra-ui/react';

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
        <Box p={4}>
            <HStack spacing={4} mb={4}>
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} borderColor={errors.name ? 'red.500' : 'gray.300'} />
                <Input placeholder="Active Ingredient" value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)} />
                <Input placeholder="Density" value={density} onChange={(e) => setDensity(e.target.value)} borderColor={errors.density ? 'red.500' : 'gray.300'} />
                <Button onClick={handleAddProduct} flexShrink={0}>Add Product</Button>
            </HStack>
            <VStack spacing={4}>
                {products && products.map((product) => (
                    <Box key={product.id} p={4} borderWidth="1px" borderRadius="lg" w="full">
                        <HStack justifyContent="space-between">
                            <Box>
                                {product.name} - {product.activeIngredient} - {product.density}
                            </Box>
                            <Button onClick={() => dispatch(deleteProduct(product.id))}>Delete</Button>
                        </HStack>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};

export default Products;