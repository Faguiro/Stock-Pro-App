import api from "../lib/api";
import {
  Box,
  Button,

  Heading,
  SimpleGrid,
  Text,
  // Modal,
  // ModalOverlay,
  // ModalContent,
  // ModalHeader,
  // ModalFooter,
  // ModalBody,
  // ModalCloseButton,
  useDisclosure,
  // FormControl,
  // FormLabel,
  Input,
  // NumberInput,
  // NumberInputField,
  // Select,
  // useToast,
  Spinner,
  Alert,
  AlertIcon,
  // Tag,

  List,

  HStack,
  IconButton,
} from "@chakra-ui/react";
// import { NumericFormat } from "react-number-format";
import { FaList, FaTh } from "react-icons/fa";
import { useEffect, useState } from "react";
import type { Categorias } from "./PDV";
// import { handleAddStock, handleCreateProduct, handleDeleteProduct, handleEditClick, handleUpdateProduct } from "../components/Produto/useProductHandlers.ts";

export interface Product {
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

export interface Promotion {
  id: number;
  tipo: 'cupom' | 'desconto_fixo' | 'desconto_percentual' | 'desconto';
  valor: number;
  data_inicio: string;
  data_fim: string;
}



// import { useDisclosure, useToast } from "@chakra-ui/react";
// import { useState } from "react";
import { useProductHandlers } from "../components/Produto/useProductHandlers.ts";
import { ProductCard } from "../components/Produto/ProductCard.tsx";
import { ProductListItem } from "../components/Produto/ListItem.tsx";
import { CreateProductModal, EditProductModal, ProductDetailModal } from "../components/Produto/Modais.tsx";
// import { Product } from "@/types/Product";

export const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const {
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleAddStock,
    handleEditClick,
  } = useProductHandlers({
    setProducts,
    onClose,
    onEditClose,
    onEditOpen,
    setProductToEdit,
  });


  // const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const { 
  //   isOpen: isEditOpen, 
  //   onOpen: onEditOpen, 
  //   onClose: onEditClose 
  // } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState<Categorias[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes, stockRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products"),
          api.get("/stock/with-product-names"),
        ]);

        setCategorias(categoriesRes.data);

        const productsWithStock = productsRes.data.map((product: Product) => {
          const stockItem = stockRes.data.find(
            (s: { product_id: number }) => s.product_id === product.id
          );
          return {
            ...product,
            quantidade_estoque: stockItem?.quantity || 0,
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


  const filteredProducts = products.filter(
    (product) =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.includes(searchTerm) ||
      categorias
        .find((cat) => cat.id === product.categoria_id)
        ?.nome.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" thickness="4px" />
        <Text mt={4}>Carregando produtos...</Text>
      </Box>
    );

  if (error)
    return (
      <Alert status="error" variant="left-accent" borderRadius="md" mx={4}>
        <AlertIcon />
        {error}
      </Alert>
    );

  return (
    <Box p={8} maxW="1400px" mx="auto">
      <Heading
        mb={8}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        Produtos
        <HStack spacing={4}>
          <IconButton
            icon={<FaTh />}
            aria-label="Visualização em grid"
            colorScheme={viewMode === "grid" ? "blue" : "gray"}
            onClick={() => setViewMode("grid")}
          />
          <IconButton
            icon={<FaList />}
            aria-label="Visualização em lista"
            colorScheme={viewMode === "list" ? "blue" : "gray"}
            onClick={() => setViewMode("list")}
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

      {viewMode === "grid" ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categorias={categorias}
              onSelect={setSelectedProduct}
              onDelete={handleDeleteProduct}
              onEdit={handleEditClick}
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
              onEdit={handleEditClick}
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

      <EditProductModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onUpdate={handleUpdateProduct}
        product={productToEdit}
        categorias={categorias}
        onAddStock={handleAddStock}
      />

      <ProductDetailModal
        product={selectedProduct}
        categorias={categorias}
        onClose={() => setSelectedProduct(null)}
        // onAddStock={handleAddStock}
        onEdit={handleEditClick}
      />
    </Box>
  );
};


export default ProductPage;