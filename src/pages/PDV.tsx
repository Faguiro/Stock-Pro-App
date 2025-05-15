import {
  Box,
  Heading,
  Button,
  VStack,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Select,
  Text,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  Stack,
  Input,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import React from "react";

export interface Produto {
  id: number;
  nome: string;
  codigo: string;
  quantidade_estoque: number;
  preco_atacado?: number;
  preco_venda?: number;
  promocoes?: { tipo: string; valor: number }[];
}
export interface Cliente {
  email: string | null;
  id: number;
  nome: string;
}

export interface CartItem {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  modoPreco: "varejo" | "atacado";
  promocoes?: Promocao[];
}

export interface Promocao {
  tipo: string;
  valor: number;
}
export interface clienteInput {
  nome: string;
  email: string | null;
  telefone: string;
  endereco: string;
  preferencias: Record<string, any>;
  observacoes: string;
}

export interface ProdutoVendaPayload {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  tipo: string;
}

export interface VendaPayload {
  cliente_id: number;
  produtos: ProdutoVendaPayload[];
  payment_method: string;
  payment_type: string;
  installments: number;
}

export default function PDV() {
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [parcelas, setParcelas] = useState(1);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [produtos, setProdutos] = useState<
    {
      id: number;
      nome: string;
      codigo:string;
      quantidade_estoque: number;
      preco_atacado?: number;
      preco_venda?: number;
    }[]
  >([]);

  const [carrinho, setCarrinho] = useState<
    {
      promocoes: any;
      id: number;
      nome: string;
      quantidade: number;
      preco: number;
      modoPreco: "varejo" | "atacado";
    }[]
  >([]);
  const [loadingVenda, setLoadingVenda] = useState(false);
  const [modoPrecoGlobal, setModoPrecoGlobal] = useState<"varejo" | "atacado">(
    "varejo"
  );
  const [tipo_compra, setTipoCompra] = useState<"à vista" | "à prazo">(
    "à vista"
  );
  const [forma_pagamento, setFormaPagamento] = useState<
    "dinheiro" | "cartão" | "transferencia" | "pix"
  >("dinheiro");

  const [modoCliente, setModoCliente] = useState<boolean>(false);
  const [value, setValue] = React.useState("1");

  const [novoCliente, setNovoCliente] = useState<clienteInput>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    preferencias: {},
    observacoes: "",
  });
  const [novoClienteLoading, setNovoClienteLoading] = useState(false);

  useEffect(() => {
    setValue("1");
  }, []);

  function ModoBusca() {
    return (
      <RadioGroup onChange={setValue} value={value}>
        <Stack direction="row">
          <Radio value="1">Codigo de barras</Radio>
          <Radio value="2">Categorias</Radio>
        </Stack>
      </RadioGroup>
    );
  }

  const totalCarrinho: number = carrinho.reduce(
    (acc, p) => acc + (p.preco || 0) * p.quantidade,
    0
  );

  const quantidadeCarrinho: number = carrinho.reduce(
    (acc, p) => acc + p.quantidade,
    0
  );

  // Função para calcular o preço baseado no modo e quantidade
  const calcularPreco = (
    produto: Produto,
    modo: "varejo" | "atacado",
    quantidade: number
  ) => {
    const podeUsarAtacado =
      modo === "atacado" && quantidade >= 5 && produto.preco_atacado;
    const precoBase = podeUsarAtacado
      ? produto.preco_atacado
      : produto.preco_venda;

    if (!precoBase) return 0;

    const desconto =
      produto.promocoes?.find((p) => p.tipo === "desconto")?.valor || 0;
    return precoBase - desconto;
  };

  const addCliente = async (cliente: {
    nome: string;
    email: string | null;
    telefone: string;
    endereco: string;
    preferencias: Record<string, any>;
    observacoes: string;
  }) => {
    try {
      if (cliente.email && cliente.email.length < 1) cliente.email = null;
      setNovoClienteLoading(true);
      const res = await api.post("/customers", cliente);
      setClientes([...clientes, res.data]);
      toast({ title: "Cliente adicionado", status: "success" });
    } catch {
      toast({ title: "Erro ao adicionar cliente", status: "error" });
    } finally {
      setNovoClienteLoading(false);
    }
  };

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoadingClientes(true);
        const res = await api.get("/customers");
        setClientes(res.data);
      } catch {
        toast({ title: "Erro ao buscar clientes", status: "error" });
      } finally {
        setLoadingClientes(false);
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get("/categories");
        setCategorias(res.data);
      } catch {
        toast({ title: "Erro ao buscar categorias", status: "error" });
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchProdutos = async () => {
      if (value === "2" && !categoriaSelecionada) return;

      try {
        const endpoint =
          value === "1"
            ? "/products"
            : `/products?categoryId=${categoriaSelecionada}`;

        const res = await api.get(endpoint);
        setProdutos(res.data);
      } catch {
        toast({ title: "Erro ao buscar produtos", status: "error" });
      }
    };

    fetchProdutos();
  }, [categoriaSelecionada, value]); // Removed carrinho from dependencies

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id);
      const precoFinal = calcularPreco(
        produto,
        modoPrecoGlobal,
        existente ? existente.quantidade + 1 : 1
      );

      if (existente) {
        return prev.map((p) =>
          p.id === produto.id
            ? {
                ...p,
                quantidade: p.quantidade + 1,
                preco: precoFinal,
                modoPreco: modoPrecoGlobal,
                promocoes: p.promocoes ?? [],
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            ...produto,
            quantidade: 1,
            preco: precoFinal,
            modoPreco: modoPrecoGlobal,
            promocoes: produto.promocoes ?? [],
          },
        ];
      }
    });
  };

  const atualizarQuantidade = (id: number, operacao: "mais" | "menos") => {
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const novaQtd =
          operacao === "mais" ? item.quantidade + 1 : item.quantidade - 1;
        const precoFinal = calcularPreco(
          {
            id: item.id,
            nome: item.nome,
            codigo: "",
            quantidade_estoque: 0, // Default value or fetch the actual value if available
            preco_atacado: undefined,
            preco_venda: item.preco,
            promocoes: [],
          },
          item.modoPreco,
          novaQtd
        );

        return {
          ...item,
          quantidade: novaQtd > 0 ? novaQtd : 1,
          preco: precoFinal,
        };
      })
    );
  };

  const alterarModoPrecoItem = (id: number, novoModo: "varejo" | "atacado") => {
    setModoPrecoGlobal(novoModo);
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Verifica se pode mudar para atacado
        const modoFinal =
          novoModo === "atacado" && item.quantidade < 5 ? "varejo" : novoModo;
        const precoFinal = calcularPreco(
          {
            id: item.id,
            nome: item.nome,
            codigo: "",
            quantidade_estoque: 0, // Default value or fetch the actual value if available
            preco_atacado: undefined,
            preco_venda: item.preco,
            promocoes: [],
          },
          modoFinal,
          item.quantidade
        );

        return {
          ...item,
          modoPreco: modoFinal,
          preco: precoFinal,
        };
      })
    );
  };

  const removerDoCarrinho = (id: number) => {
    setCarrinho((prev) => prev.filter((p) => p.id !== id));
  };

  const finalizarVenda = async () => {
    if (!clienteId || carrinho.length === 0) {
      toast({
        title: "Selecione um cliente e adicione produtos",
        status: "warning",
      });
      return;
    }

    try {
      setLoadingVenda(true);

      // Mapear os itens do carrinho para o formato esperado
      const produtosPayload = carrinho.map((p) => ({
        produto_id: p.id,
        quantidade: p.quantidade,
        preco_unitario: p.preco,
        tipo: p.modoPreco === "atacado" ? "atacado" : "varejo",
      }));

      // Converter os valores de forma_pagamento e tipo_compra para o formato esperado
      const paymentMethodMap = {
        dinheiro: "dinheiro",
        cartão: "cartao",
        transferencia: "transferencia",
        pix: "pix",
      };

      const paymentTypeMap = {
        "à vista": "avista",
        "à prazo": "aprazo",
      };

      await api.post("/sales", {
        cliente_id: parseInt(clienteId),
        produtos: produtosPayload,
        payment_method: paymentMethodMap[forma_pagamento],
        payment_type: paymentTypeMap[tipo_compra],
        installments:  parcelas
      });

      toast({ title: "Venda finalizada com sucesso", status: "success" });
      setCarrinho([]);
      setClienteId("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: err.message || "Erro ao finalizar venda",
        status: "error",
      });
    } finally {
      setLoadingVenda(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = produtos.filter((prod) =>
    prod.nome.toLowerCase().includes(searchTerm.toLowerCase()) || prod.codigo.includes(searchTerm)
  );

  if (loadingClientes) {
    return (
      <Box p={6}>
        <Heading mb={6}>Ponto de Venda</Heading>
        <Text>Carregando clientes...</Text>
      </Box>
    );
  }

  return (
    <Box p={6} ml={[0, 0, 0]}>
      <Heading mb={6}>Ponto de Venda</Heading>

      <Flex direction={["column", "row"]} gap={4}>
        {/* Lado esquerdo: Cliente + Carrinho */}
        <Box
          flex="0 0 60%"
          bg="gray.50"
          p={4}
          flexShrink={0}
          borderRadius="md"
          boxShadow="sm"
          overflow="hidden"
        >
          <Heading size="md" mb={4}>
            Cliente
          </Heading>

          {modoCliente ? (
            <Flex mb={4} gap={4} direction="row">
              <Input
                placeholder="Nome do cliente"
                value={novoCliente.nome}
                onChange={(e) =>
                  setNovoCliente({ ...novoCliente, nome: e.target.value })
                }
              />

              <Input
                placeholder="Email do cliente"
                value={novoCliente.email || ""}
                onChange={(e) => {
                  if (
                    e.target.value.length < 1 ||
                    !e.target.value.includes("@")
                  ) {
                    setNovoCliente({ ...novoCliente, email: null });
                  }
                  if (e.target.value.includes("@"))
                    setNovoCliente({ ...novoCliente, email: e.target.value });
                }}
              />

              <Button
                colorScheme="blue"
                ml={1}
                isDisabled={novoClienteLoading}
                isLoading={novoClienteLoading}
                onClick={() => {
                  setNovoClienteLoading(true);
                  addCliente({ ...novoCliente });
                  setModoCliente(false);
                  setNovoClienteLoading(false);
                }}
              >
                <Text px={2}>Salvar</Text>
              </Button>
            </Flex>
          ) : (
            <Flex mb={4} gap={4} direction="row">
              <Select
                placeholder="Selecionar cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                isDisabled={loadingClientes}
                mb={4}
              >
                {clientes.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
              <Button ml={1} onClick={() => setModoCliente(true)}>
                Novo
              </Button>
            </Flex>
          )}

          <Heading size="md" mb={3}>
            Carrinho
          </Heading>

          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Produto</Th>
                  <Th isNumeric>Quantidade</Th>
                  <Th>Tipo</Th>
                  <Th isNumeric>Preço</Th>
                  <Th isNumeric>Total</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {carrinho.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <Text fontSize="xs">{item.nome}</Text>
                      {item.promocoes?.length > 0 && (
                        <Text fontSize="xs" color="green.600">
                          Promoção: {item.promocoes[0].tipo} (-R$
                          {item.promocoes[0].valor.toFixed(2)})
                        </Text>
                      )}
                    </Td>

                    <Td isNumeric>
                      <Flex align="center" justify="flex-end" gap={2}>
                        <Button
                          size="xs"
                          onClick={() => atualizarQuantidade(item.id, "menos")}
                        >
                          −
                        </Button>
                        {item.quantidade}
                        <Button
                          size="xs"
                          onClick={() => atualizarQuantidade(item.id, "mais")}
                        >
                          +
                        </Button>
                      </Flex>
                    </Td>
                    <Td>
                      <Select
                        size="sm"
                        value={item.modoPreco}
                        onChange={(e) =>
                          alterarModoPrecoItem(
                            item.id,
                            e.target.value as "varejo" | "atacado"
                          )
                        }
                        disabled={
                          item.quantidade < 5 && item.modoPreco === "varejo"
                        }
                      >
                        <option value="varejo">Varejo</option>
                        <option value="atacado" disabled={item.quantidade < 5}>
                          Atacado
                        </option>
                      </Select>
                    </Td>
                    <Td isNumeric>R${item.preco.toFixed(2)}</Td>
                    <Td isNumeric>
                      R${(item.preco * item.quantidade).toFixed(2)}
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => removerDoCarrinho(item.id)}
                      >
                        🗑️
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Stack direction="row" spacing={6} mt={4}>
            <Stat>
              <StatLabel>Total</StatLabel>
              <StatNumber>R${totalCarrinho.toFixed(2)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Itens</StatLabel>
              <StatNumber>{quantidadeCarrinho}</StatNumber>
            </Stat>
          </Stack>
          <Divider my={4} />
          <Heading size="md" mb={4}>
            Forma de Pagamento
          </Heading>
          <Flex mb={4} gap={4} direction={["column", "row"]}>
            <Select
              placeholder="Selecionar forma de pagamento"
              mb={4}
              value={forma_pagamento}
              onChange={(e) =>
                setFormaPagamento(
                  e.target.value as
                    | "dinheiro"
                    | "cartão"
                    | "transferencia"
                    | "pix"
                )
              }
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="cartão">Cartão</option>
              <option value="transferencia">Transferência</option>
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
            </Select>

            <Select
              placeholder="Selecionar tipo de compra"
              mb={4}
              value={tipo_compra}
              onChange={(e) =>
                setTipoCompra(e.target.value as "à vista" | "à prazo")
              }
            >
              <option value="à vista">À Vista</option>
              <option value="à prazo">À Prazo</option>
            </Select>
            {tipo_compra == "à prazo" ? (
              <Select
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}x
                  </option>
                ))}
              </Select>
            ) : (
              <></>
            )}
          </Flex>

          <VStack align="start" mt={6}>
            {!loadingVenda && (
              <Button
                colorScheme="blue"
                onClick={finalizarVenda}
                // isLoading={}
                size="lg"
                width="100%"
              >
                Finalizar Venda
              </Button>
            )}
          </VStack>
        </Box>

        {/* Lado direito: Categorias + Produtos */}
        <Box
          flex="0 0 40%"
          bg="gray.50"
          flexShrink={0}
          p={4}
          borderRadius="md"
          boxShadow="sm"
          overflow="hidden"
        >
          <ModoBusca />

          {value === "1" && (
            <>
              <Divider my={4} />
              <Heading size="sm" mb={2}>
                Produtos
              </Heading>
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                mb={4}
              />
              {produtos.length === 0 ? (
                <Text color="gray.900">
                  Nenhum produto encontrado nesta categoria.
                </Text>
              ) : (
                <TableContainer overflowY="auto" maxHeight="500px">
                  <Table variant="simple" size="sm">
                    <Thead position="sticky" top={0} bg="white" zIndex={1}>
                      <Tr>
                        <Th>Produto</Th>
                        <Th isNumeric>Estoque</Th>
                        <Th>Ação</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProducts.map((prod: any) => (
                        <Tr key={prod.id} _hover={{ bg: "gray.100" }}>
                          <Td fontSize="xs">{prod.nome}</Td>
                          <Td isNumeric>{prod.quantidade_estoque}</Td>
                          <Td>
                            <Button
                              size="xs"
                              colorScheme="blue"
                              onClick={() => adicionarAoCarrinho(prod)}
                            >
                              Adicionar
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
          {value === "2" && (
            <>
              <Heading size="md" mb={2}>
                Categorias
              </Heading>
              <Flex wrap="wrap" gap={2} mb={4}>
                {categorias.map((cat: any) => (
                  <Button
                    key={cat.id}
                    onClick={() => setCategoriaSelecionada(cat.id)}
                    colorScheme={
                      cat.id === categoriaSelecionada ? "blue" : "gray"
                    }
                    size="sm"
                  >
                    {cat.nome}
                  </Button>
                ))}
              </Flex>

              {categoriaSelecionada && (
                <>
                  <Divider my={4} />
                  <Heading size="sm" mb={2}>
                    Produtos
                  </Heading>
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    mb={4}
                  />
                  {produtos.length === 0 ? (
                    <Text color="gray.900">
                      Nenhum produto encontrado nesta categoria.
                    </Text>
                  ) : (
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Produto</Th>
                            {/* <Th isNumeric>Preço Atacado</Th>
                                                <Th isNumeric>Preço Varejo</Th> */}
                            <Th isNumeric>Estoque</Th>
                            <Th>Ação</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredProducts.map((prod: any) => (
                            <Tr key={prod.id} _hover={{ bg: "gray.100" }}>
                              <Td fontSize={"xs"}>{prod.nome}</Td>
                              <Td isNumeric>{prod.quantidade_estoque}</Td>
                              <Td>
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  onClick={() => adicionarAoCarrinho(prod)}
                                >
                                  Adicionar
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
