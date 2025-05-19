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
  IconButton,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tfoot,
  Checkbox,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import React from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { NumericFormat } from "react-number-format";
import { FaShoppingCart } from "react-icons/fa";

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
  preferencias: Record<string, string>;
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

export interface Categorias {
  id: number;
  nome: string;
}

export default function PDV() {
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [isDesconto, setIsDesconto] = useState(false);

  const [categorias, setCategorias] = useState<Categorias[]>([]);
  const [parcelas, setParcelas] = useState(1);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    number | null
  >(null);
  const [produtos, setProdutos] = useState<
    {
      id: number;
      nome: string;
      codigo: string;
      quantidade_estoque: number;
      preco_atacado?: number;
      preco_venda?: number;
    }[]
  >([]);

  const [carrinho, setCarrinho] = useState<
    {
      promocoes: Promocao[];
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [novoCliente, setNovoCliente] = useState<clienteInput>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    preferencias: {},
    observacoes: "",
  });
  const [novoClienteLoading, setNovoClienteLoading] = useState(false);
  interface CarrinhoItem {
    id: number;
    produto: Produto;
    quantidade: number;
    preco_unitario: number;
    modo: string;
    cliente: string;
  }

  interface Carrinho {
    id: number;
    data_criacao: string;
    cliente_id: number;
    itens: CarrinhoItem[];
  }

  const [carrinhos, setCarrinhos] = useState<Carrinho[]>([]);

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
    // Verifica se pode usar preço atacado
    const podeUsarAtacado =
      modo === "atacado" &&
      quantidade >= 1 &&
      produto.preco_atacado !== undefined;

    const precoBase = podeUsarAtacado
      ? produto.preco_atacado
      : produto.preco_venda;

    if (!precoBase) return 0;

    // Aplica promoções se existirem
    const desconto =
      produto.promocoes?.find((p) => p.tipo === "desconto" || "coupon")?.valor || 0;
    return precoBase - desconto;
  };
  const addCliente = async (cliente: {
    nome: string;
    email: string | null;
    telefone: string;
    endereco: string;
    preferencias: Record<string, string>;
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
  }, [toast]);

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
  }, [toast]);

  useEffect(() => {
    const fetchProdutos = async () => {
      if (value === "2" && !categoriaSelecionada) return;
      setModoPrecoGlobal("varejo");

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
  }, [categoriaSelecionada, toast, value]); // Removed carrinho from dependencies

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
                preco:  precoFinal,
                modoPreco: modoPrecoGlobal,
               promocoes: p.promocoes,
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
            quantidade_estoque: item.quantidade,
            preco_atacado: undefined,
            preco_venda: item.preco,
            promocoes: item.promocoes,
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
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Encontra o produto original para obter os preços corretos
        const produtoOriginal = produtos.find((p) => p.id === id);

        if (!produtoOriginal) return item;

        // Verifica se pode usar atacado (quantidade >=1 e tem preço_atacado)
        const podeUsarAtacado =
          novoModo === "atacado" &&
          item.quantidade >= 1 &&
          produtoOriginal.preco_atacado !== undefined;

        const modoFinal = podeUsarAtacado ? "atacado" : "varejo";

        const precoFinal = calcularPreco(
          produtoOriginal,
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

  const salvarCarrinho = async () => {
    console.log(clienteId);
    if (carrinho.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de salvar",
        status: "warning",
      });
      return;
    }

    try {
      const response = await api.post("/cart", {
        itens: carrinho.map((item) => ({
          produto_id: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          modo: item.modoPreco,
        })),
        cliente_id: clienteId,
        total: totalCarrinho,
      });

      console.log("Carrinho salvo com sucesso:", response.data);

      toast({
        title: "Carrinho salvo com sucesso",
        status: "success",
      });
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
      toast({
        title: "Erro ao salvar carrinho",
        status: "error",
      });
    }
  };

  const removerDoCarrinho = (id: number) => {
    setCarrinho((prev) => prev.filter((p) => p.id !== id));
  };

 const changeDiscount = () => {
     setIsDesconto(!isDesconto);
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
        installments: parcelas,
      });

      toast({ title: "Venda finalizada com sucesso", status: "success" });
      setCarrinho([]);
      setClienteId("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao finalizar venda",
        status: "error",
      });
    } finally {
      setLoadingVenda(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = produtos.filter(
    (prod) =>
      prod.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.codigo.includes(searchTerm)
  );


  

  useEffect(() => {
    const fetchCarrinhos = async () => {
      try {
        const res = await api.get("/cart/carts");
        setCarrinhos(res.data);

      } catch (err) {
        console.error(err);
      }
    };
    setIsDesconto(false);
    fetchCarrinhos();
  }, []);

  if (loadingClientes) {
    return (
      <Box p={6}>
        <Heading mb={6} textAlign={"center"}>
          <Text>Ponto de Venda</Text>
        </Heading>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6} ml={[0, 0, 0]}>


      <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalhes do Carrinho</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {carrinhos &&
              carrinhos.map((carrinho) => {

              const nome_cliente = clientes[carrinho.cliente_id]
                ? clientes[carrinho.cliente_id].nome
                : "Desconhecido";

                console.log(nome_cliente)
                // Função para retornar todos os itens do carrinho
                const getCarrinhoItens = () => carrinho.itens;

                return (
                  <Box
                    key={carrinho.id}
                    m={3}
                    p={3}
                    backgroundColor={"gray.100"}
                    borderRadius={"md"}
                  >
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      mb={4}
                    >
                      <Heading fontSize="xl">Carrinho #{carrinho.id}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        Criado em:{" "}
                        {new Date(carrinho.data_criacao).toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.500" mr={2}>
                        Cliente: {nome_cliente}
                      </Text>
                      <Checkbox
                        size="sm"
                        isChecked={isDesconto}
                        mr={2}
                        colorScheme="blue"
                        onChange={() => {
                         changeDiscount()
                        }}
                      >
                        Desconto
                      </Checkbox>
                    </Flex>

                    <TableContainer>
                      <Table variant="striped" colorScheme="gray">
                        <Thead>
                          <Tr>
                            <Th>Produto</Th>
                            <Th>Modo</Th>
                            <Th>Cliente</Th>
                            <Th isNumeric>Quantidade</Th>
                            <Th isNumeric>Preço Unitário</Th>
                            <Th isNumeric>Total</Th>
                            <Th>Ações</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {carrinho.itens.map((item) => {
                            // Função para retornar dados do produto
                            const getProdutoData = () => ({
                              id: item.produto.id,
                              nome: item.produto.nome,
                              preco: item.preco_unitario,
                              modo: item.modo,
                              quantidade: item.quantidade,
                            });

                            return (
                              <Tr key={item.id}>
                                <Td>{item.produto.nome}</Td>
                                <Td>{item.modo}</Td>
                                <Td>{item.cliente}</Td>
                                <Td isNumeric>{item.quantidade}</Td>
                                <Td isNumeric>
                                  R$ {item.preco_unitario.toFixed(2)}
                                </Td>
                                <Td isNumeric>
                                  R${" "}
                                  {(
                                    item.quantidade * item.preco_unitario
                                  ).toFixed(2)}
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() =>
                                      console.log(getProdutoData())
                                    }
                                  >
                                    Dados
                                  </Button>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                        <Tfoot>
                          <Tr>
                            <Th colSpan={5}></Th>
                            <Th isNumeric>Total:</Th>
                            <Th isNumeric>
                              R${" "}
                              {carrinho.itens
                                .reduce(
                                  (total, item) =>
                                    total +
                                    item.quantidade * item.preco_unitario,
                                  0
                                )
                                .toFixed(2)}
                            </Th>
                            <Th>
                              
                               
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => {
                                  console.log(getCarrinhoItens());
                                  for (const item of getCarrinhoItens()) {
                                  
                                  const desconto = ((item.produto?.preco_venda ?? 0) - item.preco_unitario)

                                  console.log(desconto)

                                    // Monta um Produto a partir do CarrinhoItem                                    
                                    adicionarAoCarrinho({
                                      id: item.produto.id,
                                      nome: item.produto.nome,
                                      codigo: item.produto.codigo,
                                      quantidade_estoque: item.produto.quantidade_estoque,
                                      preco_atacado: item.produto.preco_atacado,
                                      preco_venda: item.produto.preco_venda,
                                      promocoes:isDesconto ? [{tipo:"desconto", valor: desconto}]:[],
                                    });
                                  }
                                  onClose();
                                }}
                              >
                                Ver Itens
                              </Button>
                            </Th>
                          </Tr>
                        </Tfoot>
                      </Table>
                    </TableContainer>
                  </Box>
                );
              })}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Fechar
            </Button>
            <Button variant="ghost">Exportar Dados</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



      <Flex gap={4} w={"100%"} h={"100%"}>
        {/* Lado esquerdo: Cliente + Carrinho */}
        <Box
          bg="gray.200"
          p={4}
          flexShrink={1}
          borderRadius="md"
          boxShadow="sm"
          overflow="hidden"
          border={"2px solid #ccc"}
          w={"70%"}
        >
          <Heading fontSize={"xl"} m={3} textAlign={"center"}>
            Carrinho
          </Heading>
          <Divider my={3} />

          <TableContainer>
            <Table size="sm" variant="striped" colorScheme="white" mb={4}>
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
                      <Text fontSize="1rem" fontWeight="bold">
                        {item.nome}
                      </Text>
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
                        disabled={item.quantidade < 5}
                      >
                        <option value="varejo">Varejo</option>
                        <option value="atacado" disabled={item.quantidade < 5}>
                          Atacado {item.quantidade < 5 && "(mín. 5 un.)"}
                        </option>
                      </Select>
                    </Td>
                    <Td isNumeric>R${item.preco.toFixed(2)}</Td>
                    <Td isNumeric>
                      R${(item.preco * item.quantidade).toFixed(2)}
                    </Td>
                    <Td>
                      <IconButton
                        size="xs"
                        colorScheme="red"
                        icon={<DeleteIcon />}
                        onClick={() => removerDoCarrinho(item.id)}
                        aria-label="Remover item"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Stack direction="row-reverse" spacing={6} mt={4}>
            <Stat>
              <StatLabel>Total</StatLabel>
              <Text
                fontSize={"2rem"}
                fontWeight="bold"
                color={"blue.800"}
                border={"1px solid gray"}
                background={"white"}
                borderRadius={"md"}
                textAlign={"center"}
              >
                <NumericFormat
                  value={totalCarrinho}
                  displayType={"text"}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                />
              </Text>
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
              placeholder="Selecionar tipo de pagamento"
              mb={4}
              value={tipo_compra}
              fontSize={"1rem"}
              fontWeight={"bold"}
              onChange={(e) => {
                setTipoCompra(e.target.value as "à vista" | "à prazo");
                if (e.target.value === "à vista") {
                  setParcelas(1);
                }
              }}
            >
              <option value="à vista">À Vista</option>
              <option value="à prazo">Parcelado</option>
            </Select>

            {tipo_compra == "à prazo" ? (
              <Select
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>
                    {num}x
                  </option>
                ))}
              </Select>
            ) : (
              <></>
            )}
          </Flex>

          <VStack align="center" mt={6}>
            <Flex width="100%" gap={2} justifyContent={"space-between"}>
              <Button
                colorScheme="teal"
                onClick={salvarCarrinho}
                size="lg"
                width="100%"
                isDisabled={carrinho.length === 0}
              >
                Salvar Carrinho
              </Button>

              <Button
                colorScheme="blue"
                onClick={finalizarVenda}
                isLoading={loadingVenda}
                size="lg"
                width="100%"
                isDisabled={carrinho.length === 0 || !clienteId}
              >
                Finalizar Venda
              </Button>
            </Flex>
          </VStack>
        </Box>
        {/* Lado esquerdo: Cliente + Carrinho */}

        {/* Lado direito: Categorias + Produtos */}
        <Box
          flex="1"
          borderRadius="md"
          boxShadow="sm"
          h={"100%"}
          // overflow="hidden"
          // overflowY={"scroll"}
        >
          <Box
            // flex="0 0 40%"
            bg="gray.200"
            p={6}
            borderRadius="md"
            boxShadow="sm"
            border={"1px solid #ccc"}
            // position={"static"}
            // right={12}
            // top={97}
            // height={painelSpand ? "90vh" : "8vh"}
            // width={painelSpand ? "25%" : "25%"}
            // overflowY={"scroll"}
            // onFocus={() => setPainelSpand(true)}
          >
            {modoCliente ? (
              <Flex mb={4} gap={4} direction="row">
                <Heading size="md" mb={4}>
                  Cliente
                </Heading>

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
                  onChange={(e) => {
                    setClienteId(e.target.value);
                  }}
                  isDisabled={loadingClientes}
                  mb={4}
                >
                  {clientes.map((c) => (
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
                  bg={"white"}
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
                  <TableContainer overflowY="auto" maxHeight="250px">
                    <Table variant="simple" size="sm">
                      <Thead position="sticky" top={0} bg="white" zIndex={1}>
                        <Tr>
                          <Th>Produto</Th>
                          <Th isNumeric>Estoque</Th>
                          <Th>Ação</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredProducts.map((prod) => (
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
                  {categorias.map((cat: Categorias) => (
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
                            {filteredProducts.map((prod: Produto) => (
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

            <Button
              colorScheme="blue"
              m={4}
              onClick={() => {
                {
                  if (carrinho.length > 0) {
                    setCarrinho([]);
                  }
                  onOpen();
                }
              }}
              leftIcon={<FaShoppingCart />}
            >
              Abrir Carrinhos
            </Button>
          </Box>
        </Box>
        {/* FIM Lado direito: Categorias + Produtos */}
      </Flex>
    </Box>
  );
}
