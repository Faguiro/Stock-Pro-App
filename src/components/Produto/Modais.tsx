import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  SimpleGrid,
  Box,
  Text,
  Tag,
  NumberInput,
  NumberInputField,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import type { Categorias } from "../../pages/PDV";
import type { Product, Promotion } from "../../pages/Products";
import { FaTrash } from "react-icons/fa";

// import { FaPlus } from "react-icons/fa";

export const EditProductModal = ({
  isOpen,
  onClose,
  onUpdate,
  product,
  categorias,
  onAddStock,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (product: Product) => void;
  product: Product | null;
  categorias: Categorias[];
  onAddStock: (productId: number, quantityToAdd: number) => void;
}) => {
  const [formData, setFormData] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(0);
  const [newPromotion, setNewPromotion] = useState<Omit<Promotion, "id">>({
    tipo: "desconto_percentual",
    valor: 0,
    data_inicio: new Date().toISOString(),
    data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        preco_atacado: product.preco_atacado || undefined,
        promocoes: product.promocoes || [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      try {
        await onUpdate(formData);
      } catch (error) {
        console.error("Erro ao atualizar produto:", error);
      }
    }
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityToAdd > 0 && formData) {
      try {
        await onAddStock(formData.id, quantityToAdd);
        setFormData({
          ...formData,
          quantidade_estoque: formData.quantidade_estoque + quantityToAdd,
        });
        setQuantityToAdd(0);
      } catch (error) {
        console.error("Erro ao adicionar estoque:", error);
      }
    }
  };

  const handleAddPromotion = () => {
    if (formData && newPromotion.valor > 0) {
      const newId =
        formData.promocoes.length > 0
          ? Math.max(...formData.promocoes.map((p) => p.id)) + 1
          : 1;

      setFormData({
        ...formData,
        promocoes: [...formData.promocoes, { ...newPromotion, id: newId }],
      });
      setNewPromotion({
        tipo: "desconto_percentual",
        valor: 0,
        data_inicio: new Date().toISOString(),
        data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  };

  const handleRemovePromotion = (id: number) => {
    if (formData) {
      setFormData({
        ...formData,
        promocoes: formData.promocoes.filter((p) => p.id !== id),
      });
    }
  };

  if (!product || !formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar Produto</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired mb={4}>
                <FormLabel>Nome do Produto</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Código de barras</FormLabel>
                <Input
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired mb={4}>
              <FormLabel>Categoria</FormLabel>
              <Select
                value={formData.categoria_id}
                onChange={(e) =>
                  setFormData({ ...formData, categoria_id: +e.target.value })
                }
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </Select>
            </FormControl>

            <SimpleGrid columns={3} spacing={4} mb={4}>
              <FormControl isRequired>
                <FormLabel>Preço de Compra</FormLabel>
                <NumericFormat
                  customInput={Input}
                  value={formData.preco_compra}
                  onValueChange={(values) =>
                    setFormData({
                      ...formData,
                      preco_compra: Number(values.value),
                    })
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Preço de Venda</FormLabel>
                <NumericFormat
                  customInput={Input}
                  value={formData.preco_venda}
                  onValueChange={(values) =>
                    setFormData({
                      ...formData,
                      preco_venda: Number(values.value),
                    })
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Preço Atacado</FormLabel>
                <NumericFormat
                  customInput={Input}
                  value={formData.preco_atacado || ""}
                  onValueChange={(values) =>
                    setFormData({
                      ...formData,
                      preco_atacado: Number(values.value),
                    })
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                />
              </FormControl>
            </SimpleGrid>

            {/* Seção de Promoções */}
            <Box mb={6} borderWidth="1px" borderRadius="lg" p={4}>
              <Text fontWeight="bold" mb={2}>
                Promoções
              </Text>

              {formData.promocoes.length > 0 ? (
                <Box mb={4}>
                  {formData.promocoes.map((promo) => (
                    <Box
                      key={promo.id}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      mb={2}
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="semibold">Tipo: {promo.tipo}</Text>
                          <Text>Valor: {promo.valor}</Text>
                          <Text>
                            Início:{" "}
                            {new Date(promo.data_inicio).toLocaleDateString()}
                          </Text>
                          <Text>
                            Fim: {new Date(promo.data_fim).toLocaleDateString()}
                          </Text>
                        </Box>
                        <IconButton
                          aria-label="Remover promoção"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleRemovePromotion(promo.id)}
                        />
                      </Flex>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Text color="gray.500" mb={4}>
                  Nenhuma promoção cadastrada
                </Text>
              )}

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Tipo de Promoção</FormLabel>
                  <Select
                    value={newPromotion.tipo}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        tipo: e.target.value as Promotion["tipo"],
                      })
                    }
                  >
                    <option value="cupom">Cupom</option>
                    <option value="desconto_fixo">Desconto Fixo</option>
                    <option value="desconto_percentual">
                      Desconto Percentual
                    </option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Valor</FormLabel>
                  <NumberInput
                    min={0}
                    value={newPromotion.valor}
                    onChange={(_, value) =>
                      setNewPromotion({
                        ...newPromotion,
                        valor: value,
                      })
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} mt={4}>
                <FormControl>
                  <FormLabel>Data Início</FormLabel>
                  <Input
                    type="datetime-local"
                    value={newPromotion.data_inicio.substring(0, 16)}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        data_inicio: e.target.value + ":00.000Z",
                      })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Data Fim</FormLabel>
                  <Input
                    type="datetime-local"
                    value={newPromotion.data_fim.substring(0, 16)}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        data_fim: e.target.value + ":00.000Z",
                      })
                    }
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                mt={4}
                colorScheme="blue"
                onClick={handleAddPromotion}
                isDisabled={newPromotion.valor <= 0}
              >
                Adicionar Promoção
              </Button>
            </Box>

            {/* Seção de Estoque */}
            <Box borderWidth="1px" borderRadius="lg" p={4}>
              <Text fontWeight="bold" mb={2}>
                Estoque
              </Text>
              <Text mb={4}>
                Quantidade atual: {formData.quantidade_estoque}
              </Text>

              <FormControl mb={3}>
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
                type="button"
                colorScheme="green"
                isDisabled={quantityToAdd <= 0}
                onClick={handleAddStockSubmit}
              >
                Adicionar Estoque
              </Button>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" colorScheme="blue" mr={3}>
              Salvar Alterações
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export const ProductDetailModal = ({
  product,
  categorias,
  onClose,
  onEdit,
}: {
  product: Product | null;
  categorias: Categorias[];
  onClose: () => void;
  onEdit: (product: Product) => void;
}) => {
  if (!product) return null;

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
              <Text>
                {
                  categorias.find((cat) => cat.id === product.categoria_id)
                    ?.nome
                }
              </Text>
            </Box>
            <Box>
              <Text fontWeight="semibold">Estoque:</Text>
              <Tag
                size="lg"
                colorScheme={
                  product.quantidade_estoque === 0
                    ? "red"
                    : product.quantidade_estoque < 10
                    ? "orange"
                    : "green"
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
                  : "Não aplicável"}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Seção de Promoções */}
          {product.promocoes && product.promocoes.length > 0 && (
            <Box mt={6}>
              <Text fontWeight="bold" mb={2}>
                Promoções Ativas
              </Text>
              {product.promocoes.map((promo) => (
                <Box
                  key={promo.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  mb={2}
                >
                  <Text fontWeight="semibold">{promo.tipo}</Text>
                  <Text>Desconto: {promo.valor}%</Text>
                </Box>
              ))}
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              onEdit(product);
              onClose();
            }}
          >
            Editar
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
  categorias,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (product: Omit<Product, "id">) => void;
  categorias: Categorias[];
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
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
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Código de barras</FormLabel>
              <Input
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
              />
            </FormControl>

            <FormControl isRequired mb={4}>
              <FormLabel>Categoria</FormLabel>
              <Select
                value={formData.categoria_id}
                onChange={(e) =>
                  setFormData({ ...formData, categoria_id: +e.target.value })
                }
              >
                {categorias.map((cat: Categorias) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </Select>
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Preço de Compra</FormLabel>
                <NumericFormat
                  customInput={Input}
                  value={formData.preco_compra}
                  onValueChange={(values) =>
                    setFormData({
                      ...formData,
                      preco_compra: Number(values.value),
                    })
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Preço de Venda</FormLabel>
                <NumericFormat
                  customInput={Input}
                  value={formData.preco_venda}
                  onValueChange={(values) =>
                    setFormData({
                      ...formData,
                      preco_venda: Number(values.value),
                    })
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl mt={4}>
              <FormLabel>Preço Atacado</FormLabel>
              <NumericFormat
                customInput={Input}
                value={formData.preco_atacado || ""}
                onValueChange={(values) =>
                  setFormData({
                    ...formData,
                    preco_atacado: Number(values.value),
                  })
                }
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
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
