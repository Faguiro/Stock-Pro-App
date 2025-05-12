"use client";
import  { useState, useEffect } from 'react';
import {
    
    Button,
    Card,
    CardBody,
    CardFooter,
    Heading,
    
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Badge,
    Flex,
    Tag,
    SimpleGrid,
    Box,
    Skeleton,
    SkeletonText
} from '@chakra-ui/react';
import api from '../lib/api'; // Ajuste o caminho conforme necessário
// import { useBreakpointValue } from '@chakra-ui/react';


interface Category {
    id: number;
    nome: string;
    product_count: number;
}

interface Product {
    id: number;
    nome: string;
    preco_venda: number;
    preco_atacado?: number;
    promocoes: Promotion[];
    categoria_id: number;
}

interface Promotion {
    id: number;
    nome: string;
    desconto: number;
}



// Componente de esqueleto para loading
const SkeletonGrid = () => (
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
    {[...Array(6)].map((_, index) => (
      <Box key={index} p={6} boxShadow="lg" bg="white">
        <Skeleton height="30px" mb={4} />
        <SkeletonText mt="4" noOfLines={2} spacing="4" />
      </Box>
    ))}
  </SimpleGrid>
);

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
    const { isOpen: isProductsOpen, onOpen: onProductsOpen, onClose: onProductsClose } = useDisclosure();
    const toast = useToast();




    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
          try {
            setIsLoading(true); // Inicia o loading
            const categoriesResponse = await api.get('/categories');
            
            const categoriesWithCount = await Promise.all(
              categoriesResponse.data.map(async (category: Category) => {
                try {
                  const productsResponse = await api.get(`/products?categoryId=${category.id}`);
                  return {
                    id: category.id,
                    nome: category.nome,
                    product_count: productsResponse.data.length,
                  };
                } catch {
                  return { ...category, product_count: 0 };
                }
              })
            );
    
            setCategories(categoriesWithCount);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
          } finally {
            setIsLoading(false); // Finaliza o loading em qualquer caso
          }
        };
    
        fetchCategories();
      }, []);



    // Handle category click
    const handleCategoryClick = async (category: Category) => {
        try {
            setIsProductsLoading(true);
            setSelectedCategory(category);
            const response = await api.get(`/products?categoryId=${category.id}`);
            setCategoryProducts(response.data);
            console.log(response.data);
            onProductsOpen();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar produtos da categoria',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsProductsLoading(false);
        }
    };


    // Handle category creation
    const handleCreateCategory = async (categoryName: string) => {
        try {
            const response = await api.post('/categories', { nome: categoryName });

            setCategories([...categories, response.data]);
            onCreateClose();
            toast({
                title: 'Categoria criada',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: 'Erro',
                description: err instanceof Error ? err.message : 'Erro desconhecido',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (isLoading) return <Spinner size="xl" />;
    if (error) return (
        <Alert status="error">
            <AlertIcon />
            {error}
        </Alert>
    );
    if (error) {
        return (
            <Alert status="error">
                <AlertIcon />
                {error}
            </Alert>
        ); // Componente de erro padrão
      }
    
      if (isLoading) {
        return <SkeletonGrid />; // Exibe esqueletos durante o carregamento
      }

    return (
        <Box p={8}>
            <Heading mb={8} display="flex" justifyContent="space-between" alignItems="center">
                Categorias
                <Button colorScheme="blue" onClick={onCreateOpen}>
                    Nova Categoria
                </Button>
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {categories.map( (category) => (
                    <Card
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        cursor="pointer"
                        _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
                    >
                        <CardBody>
                            <Heading size="md">{category.nome.toUpperCase()}</Heading>
                            <Badge mt={2} colorScheme="blue">
                                ID: {category.id}
                            </Badge>
                        </CardBody>
                        <CardFooter>
                            <Text fontSize="sm" color="gray.500">
                                {category.product_count || 0} produtos
                            </Text>
                        </CardFooter>
                    </Card>
                ))}
            </SimpleGrid>

            {/* Modal de Criação de Categoria */}
            <CreateCategoryModal
                isOpen={isCreateOpen}
                onClose={onCreateClose}
                onCreate={handleCreateCategory}
            />

            {/* Modal de Produtos da Categoria */}
            <Modal isOpen={isProductsOpen} onClose={onProductsClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Produtos da Categoria: {selectedCategory?.nome}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {isProductsLoading ? (
                            <Flex justify="center" py={8}>
                                <Spinner size="xl" />
                            </Flex>
                        ) : (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                {categoryProducts.map((product) => (
                                    <Card key={product.id} variant="outline">
                                        <CardBody>
                                            <Flex justify="space-between" align="center">
                                                <Heading size="sm">{product.nome}</Heading>
                                                <Badge colorScheme="green">
                                                    R$ {product.preco_venda.toFixed(2)}
                                                </Badge>
                                            </Flex>
                                            {product.promocoes?.length > 0 && (
                                                <Flex mt={2} wrap="wrap" gap={2}>
                                                    {product.promocoes.map((promotion) => (
                                                        <Tag key={promotion.id} colorScheme="orange">
                                                            {promotion.nome} (-{promotion.desconto}%)
                                                        </Tag>
                                                    ))}
                                                </Flex>
                                            )}
                                            {product.preco_atacado && (
                                                <Text mt={2} fontSize="sm" color="blue.500">
                                                    Preço Atacado: R$ {product.preco_atacado.toFixed(2)}
                                                </Text>
                                            )}
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        )}
                        {!isProductsLoading && categoryProducts.length === 0 && (
                            <Text textAlign="center" py={4} color="gray.500">
                                Nenhum produto encontrado nesta categoria
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onProductsClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};


// Componente Modal para Criação de Categoria
interface CreateCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (categoryName: string) => void;
}

const CreateCategoryModal = ({ isOpen, onClose, onCreate }: CreateCategoryModalProps) => {
    const [categoryName, setCategoryName] = useState('');

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        onCreate(categoryName);
        setCategoryName('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Criar Nova Categoria</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormControl isRequired mb={4}>
                            <FormLabel>Nome da Categoria</FormLabel>
                            <Input
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Digite o nome da categoria"
                            />
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

export default CategoriesPage;