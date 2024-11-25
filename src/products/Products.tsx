
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createProduct, deleteProduct, fetchProducts } from '../store/productsSlice';
import { useState, useEffect } from 'react';
import { Box, Button, Input, HStack, VStack } from '@chakra-ui/react';

const Products = () => {
  const dispatch: AppDispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.products);
  const [name, setName] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddProduct = () => {
    dispatch(createProduct({ id: '', name }));
    setName('');
  };

  return (
    <Box p={4}>
      <HStack spacing={4} mb={4}>
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={handleAddProduct} flexShrink={0}>Add Product</Button>
      </HStack>
      <VStack spacing={4}>
        {products && products.map((product) => (
          <Box key={product.id} p={4} borderWidth="1px" borderRadius="lg" w="full">
            <HStack justifyContent="space-between">
              <Box>
                {product.name}
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