// hooks/useProductHandlers.ts
import { useCallback } from "react";
import type { Product } from "../../pages/Products";
import api from "../../lib/api";
import { useToast } from "@chakra-ui/react";

type HandlersProps = {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onClose: () => void;
  onEditClose: () => void;
  onEditOpen: () => void;
  setProductToEdit: (product: Product) => void;
};

export const useProductHandlers = ({
  setProducts,
  onClose,
  // onEditClose,
  onEditOpen,
  setProductToEdit,
}: HandlersProps) => {
  const toast = useToast();

  const handleCreateProduct = useCallback(
    async (newProductData: Omit<Product, "id">) => {
      try {
        const response = await api.post("/products", newProductData);
        if (response.status >= 200 && response.status < 300) {
          const createdProduct = response.data;
          setProducts((prev) => [...prev, createdProduct]);
          onClose();
          toast({
            title: "Produto criado",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: (error as Error).message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [setProducts, onClose, toast]
  );

const handleUpdateProduct = useCallback(
  async (updatedProduct: Product) => {
    try {
      // Remove campos calculados ou desnecessários para o backend
      const { id, ...updateData } = updatedProduct;
      const response = await api.put(`/products/${id}`, updateData);
      
      if (response.status >= 200 && response.status < 300) {
        setProducts(prev =>
          prev.map(p =>
            p.id === id 
              ? { 
                  ...response.data,
                  quantidade_estoque: updatedProduct.quantidade_estoque,
                  promocoes: updatedProduct.promocoes 
                } 
              : p
          )
        );
        
        toast({
          title: "Produto atualizado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar produto",
        description: (error as Error).message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  },
  [setProducts, toast]
);

  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      try {
        await api.delete(`/products/${productId}`);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast({
          title: "Produto deletado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Erro",
          description: (err as Error).message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [setProducts, toast]
  );

  const handleAddStock = useCallback(
  async (productId: number, quantityToAdd: number) => {
    try {
      const response = await api.put(`/stock/${productId}`, { quantity: quantityToAdd });
      
      if (response.status >= 200 && response.status < 300) {
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, quantidade_estoque: p.quantidade_estoque + quantityToAdd }
              : p
          )
        );
        
        toast({
          title: "Estoque atualizado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        return true;
      }
    } catch (err) {
      toast({
        title: "Erro ao adicionar estoque",
        description: (err as Error).message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  },
  [setProducts, toast]
);

  const handleEditClick = useCallback(
    (product: Product) => {
      setProductToEdit(product);
      onEditOpen();
    },
    [setProductToEdit, onEditOpen]
  );

  return {
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleAddStock,
    handleEditClick,
  };
};
