// src/components/ProductCard.tsx

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  Tag,
  Text,
} from "@chakra-ui/react";
import type { Product } from "../../pages/Products";
import  type { Categorias } from "../../pages/PDV";

type ProductCardProps = {
  product: Product;
  categorias: Categorias[];
  onSelect: (product: Product) => void;
  onDelete: (id: number) => void;
  onEdit: (product: Product) => void;
};

export const ProductCard = ({
  product,
  categorias,
  onSelect,
  onDelete,
  onEdit,
}: ProductCardProps) => {
  const categoria = categorias.find((cat) => cat.id === product.categoria_id);

  const estoqueTagColor =
    product.quantidade_estoque === 0
      ? "red"
      : product.quantidade_estoque < 10
      ? "orange"
      : "green";

  return (
    <Card
      boxShadow="md"
      _hover={{ transform: "translateY(-2px)", transition: "0.2s" }}
    >
      <CardBody>
        <Heading size="md" mb={2}>
          {product.nome}
        </Heading>

        <Text fontSize="sm" color="gray.600">
          {product.codigo}
        </Text>

        <Text fontSize="sm" color="gray.600">
          {categoria?.nome || "Sem categoria"}
        </Text>

        <Flex align="center" mt={3}>
          <Text fontWeight="semibold">Estoque:</Text>
          <Tag ml={2} colorScheme={estoqueTagColor}>
            {product.quantidade_estoque}
            {product.quantidade_estoque < 10 && " (Baixo)"}
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
          colorScheme="blue"
          variant="ghost"
          onClick={() => onEdit(product)}
          mr={2}
        >
          Editar
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
};
