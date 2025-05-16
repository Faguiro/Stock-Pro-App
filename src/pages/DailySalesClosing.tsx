import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Button,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../lib/api';
import SalesReport from '../components/SalesReport';

interface SaleProduct {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  tipo: string;
}

interface Sale {
  id: number;
  cliente: {
    id: number;
    nome: string;
  };
  cliente_id: number;
  vendedor_id: number;
  data: string;
  total: number;
  status: 'pendente' | 'concluida' | 'cancelada';
  payment_method: 'dinheiro' | 'cartao' | 'pix' | 'transferencia';
  payment_type: 'avista' | 'aprazo';
  installments: number;
  itens: SaleProduct[];
}

const DailySalesClosing: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchTodaySales = async () => {
      try {
        setLoading(true);
        const response = await api.get('/sales');
        const today = new Date().toISOString().split('T')[0];

        console.log(response.data);
        
        // Filtrar vendas do dia atual
        const todaySales = response.data.filter((sale: Sale) => {
          return sale.data.startsWith(today);
        });

        setSales(todaySales);
      } catch (err) {
        setError('Erro ao carregar vendas do dia');
        console.error('Error fetching sales:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySales();
  }, []);





  const handleCloseDay = async () => {
    try {
      setIsClosing(true);
      // Aqui você pode adicionar uma chamada para uma API de fechamento se necessário
    //    await api.post('/api/sales/close-day');
      
      toast({
        title: 'Caixa fechado com sucesso',
        description: 'O relatório diário foi gerado e o caixa foi fechado.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Erro ao fechar o caixa',
        description: 'Ocorreu um erro ao tentar fechar o caixa. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error closing day:', err);
    } finally {
      setIsClosing(false);
    }
  };

  const calculateTotals = () => {
    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    const paymentMethods = {
      dinheiro: 0,
      cartao: 0,
      pix: 0,
      transferencia: 0,
    };

    sales.forEach(sale => {
      paymentMethods[sale.payment_method] += sale.total;
    });

    return { totalSales, totalAmount, paymentMethods };
  };

  const { totalSales, totalAmount, paymentMethods } = calculateTotals();

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'green';
      case 'cartao': return 'blue';
      case 'pix': return 'purple';
      case 'transferencia': return 'orange';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" mb={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={6}>
        Fechamento de Vendas do Dia
      </Heading>
      
      <Text fontSize="lg" mb={6}>
        {format(new Date(), "'Hoje é' eeee, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </Text>

      <StatGroup mb={8}>
        <Stat>
          <StatLabel>Total de Vendas</StatLabel>
          <StatNumber>{totalSales}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Valor Total</StatLabel>
          <StatNumber>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalAmount)}
          </StatNumber>
        </Stat>
      </StatGroup>

      <Heading as="h2" size="lg" mb={4}>
        Resumo por Forma de Pagamento
      </Heading>
      
      <TableContainer mb={8}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Forma de Pagamento</Th>
              <Th isNumeric>Valor</Th>
              <Th isNumeric>% do Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(paymentMethods).map(([method, amount]) => (
              <Tr key={method}>
                <Td>
                  <Badge colorScheme={getPaymentMethodColor(method)}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </Badge>
                </Td>
                <Td isNumeric>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(amount)}
                </Td>
                <Td isNumeric>
                  {totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(2) + '%' : '0%'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Heading as="h2" size="lg" mb={4}>
        Vendas do Dia
      </Heading>
      
      {sales.length === 0 ? (
        <Text>Nenhuma venda realizada hoje.</Text>
      ) : (
        <TableContainer mb={8}>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Data/Hora</Th>
                <Th>Cliente</Th>
                <Th>Valor</Th>
                <Th>Pagamento</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sales.map((sale) => (
                <Tr key={sale.id}>
                  <Td>{sale.id}</Td>
                  <Td>{formatDate(sale.data)}</Td>


                  <Td>{sale.cliente.nome}</Td>
                  <Td>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(sale.total)}
                  </Td>
                  <Td>
                    <Badge colorScheme={getPaymentMethodColor(sale.payment_method)}>
                      {sale.payment_method} ({sale.payment_type})
                    </Badge>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={
                        sale.status === 'concluida' ? 'green' : 
                        sale.status === 'pendente' ? 'yellow' : 'red'
                      }
                    >
                      {sale.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Box textAlign="right" mt={8}>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleCloseDay}
          isLoading={isClosing}
          loadingText="Fechando..."
          isDisabled={sales.length === 0}
        >
          Fechar Caixa do Dia
        </Button>
      </Box>
      <SalesReport />
    </Box>
  );
};

export default DailySalesClosing;