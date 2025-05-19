


import { Box, Button, Flex, Heading, HStack, ListItem, Tag, Text } from "@chakra-ui/react";
import type { Product } from "../../pages/Products";
import type { Categorias } from "../../pages/PDV";

// Componente de List Item
export const ProductListItem = ({
  product,
  categorias,
  onSelect,
  onDelete,
  onEdit,
}: {
  product: Product;
  categorias: Categorias[];
  onSelect: (product: Product) => void;
  onDelete: (id: number) => void;
  onEdit: (product: Product) => void;
}) => (
  <ListItem
    p={4}
    borderWidth="1px"
    borderRadius="md"
    _hover={{ shadow: "md" }}
    display="flex"
    justifyContent="space-between"
    alignItems="center"
  >
    <Box>
      <Flex align="center" mb={1}>
        <Heading size="sm" mr={3}>
          {product.nome}
        </Heading>
        <Text fontSize="sm" color="gray.600">
          {categorias.find((cat) => cat.id === product.categoria_id)?.nome}
        </Text>
      </Flex>

      <Flex align="center">
        <Text mr={3}>
          Estoque:
          <Tag
            ml={2}
            colorScheme={
              product.quantidade_estoque === 0
                ? "red"
                : product.quantidade_estoque < 10
                ? "orange"
                : "green"
            }
          >
            {product.quantidade_estoque}
            {product.quantidade_estoque < 10 && " (Baixo)"}
          </Tag>
        </Text>

        <Text fontWeight="bold">R$ {product.preco_venda.toFixed(2)}</Text>
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
        colorScheme="blue"
        variant="ghost"
        onClick={() => onEdit(product)}
      >
        Editar
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