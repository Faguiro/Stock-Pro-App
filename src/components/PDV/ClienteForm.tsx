import { Button, Flex, Input, Text } from "@chakra-ui/react";
import type { Cliente } from "../../pages/PDV";

interface ClienteFormProps {
  novoCliente: Cliente;
  setNovoCliente: (cliente: Cliente) => void;
  onSave: () => void;
  isLoading: boolean;
}

export function ClienteForm({ novoCliente, setNovoCliente, onSave, isLoading }: ClienteFormProps) {
  return (
    <Flex mb={4} gap={4} direction="row">
      <Input
        placeholder="Nome do cliente"
        value={novoCliente.nome}
        onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
      />
      <Input
        placeholder="Email do cliente"
        value={novoCliente.email ?? ""}
        onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
      />
      <Button colorScheme="blue" ml={1} isLoading={isLoading} onClick={onSave}>
        <Text px={2}>Salvar</Text>
      </Button>
      </Flex>
    );
  }