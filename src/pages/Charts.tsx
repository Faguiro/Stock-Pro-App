import {
  Box,
  Heading,
  Text,
  Spinner,
  Input,
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
  Card,
  CardHeader,
  SimpleGrid,
  Select,
  HStack,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as PieTooltip,
} from "recharts";

interface MetricasVendas {
  total_vendas: number;
  total_itens_vendidos: number;
  lucro_total: number;
  media_vendas_dia: number;
  produtos_mais_vendidos: Array<{ nome: string; quantidade: number }>;
}

interface VendedorMetricas {
  vendedor: string;
  total_vendas: number;
  valor_total: number;
}

export default function MetricasPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<MetricasVendas | null>(null);
  const [vendedores, setVendedores] = useState<VendedorMetricas[]>([]);
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date(),
  ]);
  const [timeFilter, setTimeFilter] = useState<
    "day" | "week" | "month" | "custom"
  >("month");
  const [vendasDiarias, setVendasDiarias] = useState<[]>([]);
  const [vendasMensais, setVendasMensais] = useState<[]>([]);

  // Carregar dados
  const loadData = async () => {
    try {
      const [metricsRes, sellersRes, vendasRes] = await Promise.all([
        api.get("/metricas/vendas"),
        api.get("/metricas/vendedores"),
        api.get("/metricas/vendas/diarias"),
        // api.get('/metricas/vendas/mensais')
      ]);
      console.log(vendasRes);

      setMetricas(metricsRes.data);
      setVendedores(sellersRes.data.total_vendas_por_vendedor);
      setVendasDiarias(vendasRes.data);
      setVendasMensais(vendasRes.data.vendas_mensais);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  console.log(vendasDiarias);
  console.log(vendasMensais);

  useEffect(() => {
    loadData();
  }, []);

  const handleError = (err: any) => {
    const errorMessage =
      err.response?.data?.detail || "Erro ao carregar métricas";
    setError(errorMessage);
    toast({
      title: "Erro",
      description: errorMessage,
      status: "error",
      duration: 5000,
    });
  };

  if (loading)
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" />
        <Text mt={4} ml={4}>
          Carregando métricas...
        </Text>
      </Flex>
    );

  const preparePieData = () => {
    return vendedores.map((vendedor) => ({
      name: vendedor.vendedor,
      value: vendedor.valor_total,
    }));
  };
  const pieData = preparePieData();

  // Cores para o gráfico de pizza
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#A4DE6C",
  ];

  if (error)
    return (
      <Alert status="error" variant="left-accent" borderRadius="md" mx={4}>
        <AlertIcon />
        {error}
      </Alert>
    );

  return (
    <Box p={8} maxW="1400px" mx="auto">
      <Flex justify="space-between" align="center" mb={8}>
        <Heading fontSize="2xl">Dashboard de Métricas</Heading>

        <HStack spacing={4}>
          <Select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            width="200px"
          >
            <option value="day">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="custom">Personalizado</option>
          </Select>

          {timeFilter === "custom" && (
            <HStack>
              <DatePicker
                selected={dateRange[0]}
                onChange={(date: Date | null) =>
                  date && setDateRange([date, dateRange[1]])
                }
                dateFormat="dd/MM/yyyy"
                customInput={<Input width="150px" />}
              />
              <Text>até</Text>
              <DatePicker
                selected={dateRange[1]}
                onChange={(date: Date | null) =>
                  date && setDateRange([dateRange[0], date])
                }
                dateFormat="dd/MM/yyyy"
                customInput={<Input width="150px" />}
              />
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* Cards de Estatísticas */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        <Card bg="blue.50" borderWidth="1px" borderColor="blue.100">
          <CardHeader>
            <Stat>
              <StatLabel fontSize="sm" color="gray.600">
                Vendas Totais
              </StatLabel>
              <StatNumber fontSize="2xl">
                {metricas?.total_vendas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </StatNumber>
            </Stat>
          </CardHeader>
        </Card>

        <Card bg="green.50" borderWidth="1px" borderColor="green.100">
          <CardHeader>
            <Stat>
              <StatLabel fontSize="sm" color="gray.600">
                Lucro Total
              </StatLabel>
              <StatNumber fontSize="2xl">
                {metricas?.lucro_total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </StatNumber>
            </Stat>
          </CardHeader>
        </Card>

        <Card bg="purple.50" borderWidth="1px" borderColor="purple.100">
          <CardHeader>
            <Stat>
              <StatLabel fontSize="sm" color="gray.600">
                Itens Vendidos
              </StatLabel>
              <StatNumber fontSize="2xl">
                {metricas?.total_itens_vendidos}
              </StatNumber>
            </Stat>
          </CardHeader>
        </Card>
      </SimpleGrid>

      {/* Gráficos e Tabelas */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Card p={4}>
          <Heading size="md" mb={4}>
            Desempenho de Vendas
          </Heading>
          <Box height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendasDiarias} /* Substituir por dados reais */>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3182CE" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        <Card p={4}>
          <Heading size="md" mb={4}>
            Top Produtos
          </Heading>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Produto</Th>
                  <Th isNumeric>Quantidade</Th>
                </Tr>
              </Thead>
              <Tbody>
                {metricas?.produtos_mais_vendidos.map((produto, index) => (
                  <Tr key={produto.nome}>
                    <Td>
                      <Badge colorScheme="blue" mr={2}>
                        #{index + 1}
                      </Badge>
                      {produto.nome}
                    </Td>
                    <Td isNumeric>{produto.quantidade}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      </SimpleGrid>

      {/* Tabela de Vendedores e Gráfico de Pizza */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Card p={4}>
          <Heading size="md" mb={4}>
            Desempenho por Vendedor (Gráfico)
          </Heading>
          <Box height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <PieTooltip
                  formatter={(value) =>
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        <Card p={4}>
          <Heading size="md" mb={4}>
            Desempenho por Vendedor (Tabela)
          </Heading>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Vendedor</Th>
                  <Th isNumeric>Vendas</Th>
                  <Th isNumeric>Valor Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {vendedores.map((vendedor) => (
                  <Tr key={vendedor.vendedor}>
                    <Td>{vendedor.vendedor}</Td>
                    <Td isNumeric>{vendedor.total_vendas}</Td>
                    <Td isNumeric>
                      {vendedor.valor_total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
