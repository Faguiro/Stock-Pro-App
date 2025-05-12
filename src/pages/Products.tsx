"use client";
import api from '../lib/api';
import {
  Box, Button, Card, CardBody, CardFooter, Heading, SimpleGrid, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, Input,
  NumberInput, NumberInputField, Select, useToast, Spinner, Alert,
  AlertIcon, Tag, Flex, List, ListItem, HStack, IconButton,
} from '@chakra-ui/react';
import { FaList, FaTh } from 'react-icons/fa';
import { useEffect, useState } from 'react';



interface Product {
  id: number;
  codigo: string;
  nome: string;
  categoria_id: number;
  preco_compra: number;
  preco_venda: number;
  preco_atacado?: number;
  promocoes: Promotion[];
  quantidade_estoque: number;
}

interface Promotion {
  id: number;
  nome: string;
  desconto: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes, stockRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
          api.get('/stock/with-product-names')
        ]);

        setCategorias(categoriesRes.data);

        const productsWithStock = productsRes.data.map((product: any) => {
          const stockItem = stockRes.data.find((s: any) => s.product_id === product.id);
          return {
            ...product,
            quantidade_estoque: stockItem?.quantity || 0
          };
        });

        setProducts(productsWithStock);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      const response = await api.post('/products', newProductData);
      if (response.status >= 200 && response.status < 300) {
        const createdProduct = response.data;
        setProducts(prev => [...prev, createdProduct]);
        onClose();
        toast({
          title: 'Produto criado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: 'Produto deletado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: (err as Error).message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddStock = async (productId: number, quantityToAdd: number) => {
    try {
      await api.put(`/stock/${productId}`, { quantity: quantityToAdd });
  
      // Atualiza o estado local após a adição
      setProducts(prev =>
        prev.map(p =>
          p.id === productId
            ? { ...p, quantidade_estoque: p.quantidade_estoque + quantityToAdd }
            : p
        )
      );
  
      toast({
        title: 'Estoque atualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Erro ao adicionar estoque',
        description: (err as Error).message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categorias.find(cat => cat.id === product.categoria_id)?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <Box textAlign="center" mt={20}>
      <Spinner size="xl" thickness="4px" />
      <Text mt={4}>Carregando produtos...</Text>
    </Box>
  );

  if (error) return (
    <Alert status="error" variant="left-accent" borderRadius="md" mx={4}>
      <AlertIcon />
      {error}
    </Alert>
  );

  return (
    <Box p={8} maxW="1400px" mx="auto">
      <Heading mb={8} display="flex" justifyContent="space-between" alignItems="center">
        Produtos
        <HStack spacing={4}>
          <IconButton
            icon={<FaTh />}
            aria-label="Visualização em grid"
            colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
            onClick={() => setViewMode('grid')}
          />
          <IconButton
            icon={<FaList />}
            aria-label="Visualização em lista"
            colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
            onClick={() => setViewMode('list')}
          />
          <Button colorScheme="blue" onClick={onOpen}>
            Novo Produto
          </Button>
        </HStack>
      </Heading>

      <Input
        placeholder="Buscar produto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb={6}
        variant="filled"
        focusBorderColor="blue.200"
      />

      {viewMode === 'grid' ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              categorias={categorias}
              onSelect={setSelectedProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </SimpleGrid>
      ) : (
        <List spacing={4}>
          {filteredProducts.map((product) => (
            <ProductListItem
              key={product.id}             
              product={product}
              categorias={categorias}
              onSelect={setSelectedProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </List>
      )}

      <CreateProductModal
        isOpen={isOpen}
        onClose={onClose}
        onCreate={handleCreateProduct}
        categorias={categorias}      
      />

      <ProductDetailModal
        product={selectedProduct}
        categorias={categorias}
        onClose={() => setSelectedProduct(null)}
        onAddStock={handleAddStock}
      />
    </Box>
  );
};

// Componente de Card
const ProductCard = ({ product, categorias, onSelect, onDelete }: {
  product: Product;
  categorias: any[];
  onSelect: (product: Product) => void;
  onDelete: (id: number) => void;
}) => (
  <Card boxShadow="md" _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}>
    <CardBody>
      <Heading size="md" mb={2}>{product.nome}</Heading>
      <Text fontSize="sm" color="gray.600">
        {categorias.find(cat => cat.id === product.categoria_id)?.nome}
      </Text>
      
      <Flex align="center" mt={3}>
        <Text fontWeight="semibold">Estoque:</Text>
        <Tag
          ml={2}
          colorScheme={
            product.quantidade_estoque === 0 ? 'red' :
            product.quantidade_estoque < 10 ? 'orange' : 'green'
          }
        >
          {product.quantidade_estoque}
          {product.quantidade_estoque < 10 && ' (Baixo)'}
        </Tag>
      </Flex>

      <Text mt={3} fontSize="xl" fontWeight="bold">
        R$ {product.preco_venda.toFixed(2)}
      </Text>
    </CardBody>

    <CardFooter borderTop="1px" borderColor="gray.100">
      <Button
        colorScheme="teal"
        variant="outline"
        onClick={() => onSelect(product)}
        mr={2}
      >
        Detalhes
      </Button>
      <Button
        colorScheme="red"
        variant="ghost"
        onClick={() => onDelete(product.id)}
      >
        Excluir
      </Button>
    </CardFooter>
  </Card>
);

// Componente de List Item
const ProductListItem = ({ product, categorias, onSelect, onDelete }: {
  product: Product;
  categorias: any[];
  onSelect: (product: Product) => void;
  onDelete: (id: number) => void;
}) => (
  <ListItem
    p={4}
    borderWidth="1px"
    borderRadius="md"
    _hover={{ shadow: 'md' }}
    display="flex"
    justifyContent="space-between"
    alignItems="center"
  >
    <Box>
      <Flex align="center" mb={1}>
        <Heading size="sm" mr={3}>{product.nome}</Heading>
        <Text fontSize="sm" color="gray.600">
          {categorias.find(cat => cat.id === product.categoria_id)?.nome}
        </Text>
      </Flex>
      
      <Flex align="center">
        <Text mr={3}>Estoque: 
          <Tag
            ml={2}
            colorScheme={
              product.quantidade_estoque === 0 ? 'red' :
              product.quantidade_estoque < 10 ? 'orange' : 'green'
            }
          >
            {product.quantidade_estoque}
            {product.quantidade_estoque < 10 && ' (Baixo)'}
          </Tag>
        </Text>
        
        <Text fontWeight="bold">
          R$ {product.preco_venda.toFixed(2)}
        </Text>
      </Flex>
    </Box>

    <HStack spacing={2}>
      <Button
        size="sm"
        colorScheme="teal"
        variant="outline"
        onClick={() => onSelect(product)}
      >
        Detalhes
      </Button>
      <Button
        size="sm"
        colorScheme="red"
        variant="ghost"
        onClick={() => onDelete(product.id)}
      >
        Excluir
      </Button>
    </HStack>
  </ListItem>
);

// Componente de Modal para Criar Produto
const CreateProductModal = ({ isOpen, onClose, onCreate, categorias }: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (product: Omit<Product, 'id'>) => void;
  categorias: any[];
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    categoria_id: categorias[0]?.id || 1,
    preco_compra: 0,
    preco_venda: 0,
    preco_atacado: undefined as number | undefined,
    promocoes: [] as Promotion[],
    quantidade_estoque: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Novo Produto</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Nome do Produto</FormLabel>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired mb={4}>
              <FormLabel>Categoria</FormLabel>
              <Select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: +e.target.value })}
              >
                {categorias.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </Select>
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Preço de Compra</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={formData.preco_compra}
                  onChange={(_, v) => setFormData({ ...formData, preco_compra: v })}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Preço de Venda</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={formData.preco_venda}
                  onChange={(_, v) => setFormData({ ...formData, preco_venda: v })}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <FormControl mt={4}>
              <FormLabel>Preço Atacado (Opcional)</FormLabel>
              <NumberInput
                min={0}
                precision={2}
                value={formData.preco_atacado || ''}
                onChange={(_, v) => setFormData({ ...formData, preco_atacado: v })}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" colorScheme="blue" mr={3}>
              Salvar
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

// Componente de Modal para Detalhes do Produto
const ProductDetailModal = ({ product, categorias, onClose, onAddStock }: any) => {
  const [quantityToAdd, setQuantityToAdd] = useState(0);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityToAdd > 0) {
      onAddStock(product.id, quantityToAdd);
      setQuantityToAdd(0);  // Limpa o input após a adição
    }
  };

  return (
    <Modal isOpen={!!product} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{product.nome}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text fontWeight="semibold">Categoria:</Text>
              <Text>{categorias.find((cat: any) => cat.id === product.categoria_id)?.nome}</Text>
            </Box>

            <Box>
              <Text fontWeight="semibold">Estoque:</Text>
              <Tag
                size="lg"
                colorScheme={
                  product.quantidade_estoque === 0 ? 'red' :
                  product.quantidade_estoque < 10 ? 'orange' : 'green'
                }
              >
                {product.quantidade_estoque} unidades
              </Tag>
            </Box>

            <Box>
              <Text fontWeight="semibold">Preço de Compra:</Text>
              <Text>R$ {product.preco_compra.toFixed(2)}</Text>
            </Box>

            <Box>
              <Text fontWeight="semibold">Preço de Venda:</Text>
              <Text>R$ {product.preco_venda.toFixed(2)}</Text>
            </Box>

            <Box>
              <Text fontWeight="semibold">Preço Atacado:</Text>
              <Text>
                {product.preco_atacado 
                  ? `R$ ${product.preco_atacado.toFixed(2)}` 
                  : 'Não aplicável'}
              </Text>
            </Box>
          </SimpleGrid>

          <Box mt={6}>
            <form onSubmit={handleSubmit}>
              <FormControl>
                <FormLabel>Adicionar ao Estoque</FormLabel>
                <NumberInput
                  min={1}
                  value={quantityToAdd}
                  onChange={(_, value) => setQuantityToAdd(value)}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <Button
                type="submit"
                mt={3}
                colorScheme="green"
                isDisabled={quantityToAdd <= 0}
              >
                Adicionar
              </Button>
            </form>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Fechar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


export default ProductsPage;