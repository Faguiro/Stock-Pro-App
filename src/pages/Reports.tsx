import {
  Box,
  Heading,
  Text,
  Spinner,
  Input,
  Button,
  IconButton,
  Alert,
  AlertIcon,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  TableContainer,
  Tag,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Card,
  CardHeader,
  Flex,
  SimpleGrid,
  Checkbox,
  Stack,
  Select,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { NumericFormat } from "react-number-format";

interface StockListItem {
  id: number;
  product_id: number;
  quantity: number;
  produto_nome: string;
}

interface Category {
  id: number;
  nome: string;
}

export default function EstoquePage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const [estoques, setEstoques] = useState<StockListItem[]>([]);
  const [quantidadeTotal, setQuantidadeTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockListItem | null>(
    null
  );
  const [newQuantity, setNewQuantity] = useState(0);

  // Estados de filtro
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterNegativeStock, setFilterNegativeStock] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Estados do formulário de criação
  const [newProductName, setNewProductName] = useState("");
  const [newProductCode, setNewProductCode] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductPurchasePrice, setNewProductPurchasePrice] =
    useState<number>(0);
  const [newProductSalePrice, setNewProductSalePrice] = useState<number>(0);
  const [newProductWholesalePrice, setNewProductWholesalePrice] = useState<
    number | undefined
  >(undefined);
  const [newProductStock, setNewProductStock] = useState(0);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados
  const loadData = async () => {
    try {
      const [stocksRes, totalRes, categoriesRes] = await Promise.all([
        api.get("/stock/with-product-names"),
        api.get("/stock/quantity"),
        api.get("/categories"),
      ]);

      setEstoques(stocksRes.data);
      setQuantidadeTotal(totalRes.data);
      setCategorias(categoriesRes.data);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Manipulador de erros
  const handleError = (err: any) => {
    const backendErrors = err.response?.data?.detail || [];
    let errorMessage = "Erro ao processar a requisição";

    if (Array.isArray(backendErrors)) {
      errorMessage = backendErrors
        .map((e) => `${e.loc.join(".")}: ${e.msg}`)
        .join("\n");
    } else if (typeof backendErrors === "string") {
      errorMessage = backendErrors;
    }

    setError(errorMessage);
    toast({
      title: "Erro de Validação",
      description: errorMessage,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  // Atualizar estoque
  const updateStock = async () => {
    if (!selectedStock) return;

    try {
      await api.put(`/stock/${selectedStock.id}`, { quantity: newQuantity });
      toast({
        title: "Sucesso",
        description: "Estoque atualizado com sucesso",
        status: "success",
        duration: 3000,
      });
      loadData();
      onClose();
    } catch (err: any) {
      handleError(err);
    }
  };

  // Criar novo produto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos obrigatórios
      if (!newProductName || !newProductCategory) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      // Criar produto
      const productResponse = await api.post("/products", {
        nome: newProductName,
        codigo: newProductCode,
        categoria_id: Number(newProductCategory),
        preco_compra: newProductPurchasePrice,
        preco_venda: newProductSalePrice,
        preco_atacado: newProductWholesalePrice,
      });

      if (productResponse) {
        // Criar registro de estoque
        await api.put(`/stock/${productResponse.data.id}`, {
          quantity: newProductStock,
        });
      }

      toast({
        title: "Produto criado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Resetar formulário
      setNewProductName("");
      setNewProductCode("");
      setNewProductCategory("");
      setNewProductPurchasePrice(0);
      setNewProductSalePrice(0);
      setNewProductWholesalePrice(undefined);
      setNewProductStock(0);

      loadData();
      onCreateClose();
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem de itens
  const filteredItems = estoques.filter((e) => {
    const searchMatch = e.produto_nome
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const statusMatch =
      (!filterLowStock && !filterNegativeStock && !filterAvailable) ||
      (filterLowStock && e.quantity >= 0 && e.quantity < 10) ||
      (filterNegativeStock && e.quantity < 0) ||
      (filterAvailable && e.quantity >= 10);

    return searchMatch && statusMatch;
  });

  // Estados de loading e erro
  if (loading)
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" />
        <Text mt={4} ml={4}>
          Carregando dados de estoque...
        </Text>
      </Flex>
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
      {/* Cabeçalho */}
      <Flex justify="space-between" align="center" mb={8}>
        <Heading fontSize="2xl">Gestão de Estoque</Heading>
        <Button
          colorScheme="blue"
          leftIcon={<AddIcon />}
          onClick={onCreateOpen}
        >
          Novo Produto
        </Button>
      </Flex>

      {/* Cards de Estatísticas */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
        <Card bg="blue.50" borderWidth="1px" borderColor="blue.100">
          <CardHeader>
            <Stat>
              <StatLabel fontSize="sm" color="gray.600">
                Estoque Total
              </StatLabel>
              <StatNumber fontSize="2xl">{quantidadeTotal}</StatNumber>
            </Stat>
          </CardHeader>
        </Card>

        <Card bg="green.50" borderWidth="1px" borderColor="green.100">
          <CardHeader>
            <Stat>
              <StatLabel fontSize="sm" color="gray.600">
                Produtos Cadastrados
              </StatLabel>
              <StatNumber fontSize="2xl">{estoques.length}</StatNumber>
            </Stat>
          </CardHeader>
        </Card>
      </SimpleGrid>

      {/* Filtros */}
      <Box mb={6}>
        <Input
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          mb={4}
          variant="filled"
          focusBorderColor="blue.200"
        />

        <Stack direction={["column", "row"]} spacing={4}>
          <Checkbox
            colorScheme="orange"
            isChecked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
          >
            Estoque Baixo (&lt;10)
          </Checkbox>
          <Checkbox
            colorScheme="red"
            isChecked={filterNegativeStock}
            onChange={(e) => setFilterNegativeStock(e.target.checked)}
          >
            Estoque Negativo
          </Checkbox>
          <Checkbox
            colorScheme="green"
            isChecked={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.checked)}
          >
            Disponível (≥10)
          </Checkbox>
        </Stack>
      </Box>

      {/* Tabela */}
      <TableContainer
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
      >
        <Table variant="striped" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Produto</Th>
              <Th isNumeric>Quantidade</Th>
              <Th>Status</Th>
              <Th width="120px">Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.map((item) => (
              <Tr key={item.id} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="medium">{item.produto_nome}</Td>
                <Td isNumeric fontWeight="semibold">
                  {item.quantity}
                </Td>
                <Td>
                  <Tag
                    colorScheme={
                      item.quantity < 0
                        ? "red"
                        : item.quantity < 10
                        ? "orange"
                        : "green"
                    }
                    variant="subtle"
                    borderRadius="full"
                  >
                    {item.quantity < 0
                      ? "Estoque Negativo"
                      : item.quantity < 10
                      ? "Estoque Baixo"
                      : "Disponível"}
                  </Tag>
                </Td>
                <Td>
                  <IconButton
                    aria-label="Editar estoque"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => {
                      setSelectedStock(item);
                      setNewQuantity(item.quantity);
                      onOpen();
                    }}
                  />
                  <IconButton
                    aria-label="Excluir item"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Modal de Criação */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleCreateProduct}>
            <ModalHeader>Criar Novo Produto</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isRequired mb={4}>
                <FormLabel>Nome do Produto</FormLabel>
                <Input
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Categoria</FormLabel>
                <Select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  placeholder="Selecione uma categoria"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Código do Produto</FormLabel>
                <Input
                  value={newProductCode}
                  onChange={(e) => setNewProductCode(e.target.value)}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} mb={4}>
                <FormControl isRequired>
                  <FormLabel>Preço de Compra (R$)</FormLabel>
                  <NumericFormat
                    customInput={Input}
                    value={newProductPurchasePrice}
                    onValueChange={(values) => {
                      setNewProductPurchasePrice(Number(values.value)); // Ex: "1234.56"
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Preço de Venda (R$)</FormLabel>
                  <NumericFormat
                    customInput={Input}
                    value={newProductSalePrice}
                    onValueChange={(values) => {
                      setNewProductSalePrice(Number(values.value)); // valor sem formatação, ex: "1500.00"
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl mb={4}>
                <FormLabel>Preço Atacado (R$)</FormLabel>
                <NumericFormat
                  customInput={Input}
                  value={newProductWholesalePrice}
                  onValueChange={(values) => {
                    setNewProductWholesalePrice(Number(values.value));
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Estoque Inicial</FormLabel>
                <NumberInput
                  min={0}
                  value={newProductStock}
                  onChange={(_, value) => setNewProductStock(value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                type="submit"
                colorScheme="blue"
                mr={3}
                isLoading={isSubmitting}
              >
                Criar
              </Button>
              <Button onClick={onCreateClose}>Cancelar</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal de Edição */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Estoque</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Produto</FormLabel>
              <Input value={selectedStock?.produto_nome || ""} isReadOnly />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Nova Quantidade</FormLabel>
              <NumberInput
                min={0}
                value={newQuantity}
                onChange={(_, value) => setNewQuantity(value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={updateStock}>
              Salvar
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
