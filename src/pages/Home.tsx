 

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Heading,
  Text,
  Icon,
  Flex,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FiBox, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi'
import { useEffect, useState } from 'react'


import type { IconType } from 'react-icons'
import api from "../lib/api" 

interface DashboardData {
  totalStock: number
  lowStockItems: number
  todaySales: { total_vendas: number }
  lucro_total: number
  vendedor: {
    vendedor:string
    total_vendas:number
    valor_total:number
  }
}

interface StatCardProps {
  label: string
  value: number
  icon: IconType
  colorScheme: string
  isLoading?: boolean
  onClick?: (e: React.MouseEvent) => void
  isCurrency?: boolean // Nova prop
}

// Função fora do componente para não recriar sempre
// const getTodayDate = (): string => {
//   const today = new Date()
//   return today.toISOString().split('T')[0]
// }

// Verifica se a resposta da API é válida
const checkResponseOk = (status: number): boolean => {
  return status >= 200 && status < 300
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [stockResponse, metricsResponse, salesResponse, vendedorResponse] = await Promise.all([
          api.get('/stock/quantity'),
          api.get('/metricas/estoque'),
          api.get('/metricas/vendas'),
          api.get('/metricas/vendedor/me')
        ])

        if (!checkResponseOk(stockResponse.status) || !checkResponseOk(metricsResponse.status)) {
          throw new Error('Erro ao carregar dados')
        }

        const [totalStock, stockMetrics, sales, vendedor] = [
          stockResponse.data,
          metricsResponse.data,
          salesResponse.data,
          vendedorResponse.data
          
        ]
    

        setData({
          totalStock: totalStock,
          lowStockItems: stockMetrics.produtos_baixo_estoque.length,
          todaySales: { total_vendas: sales.total_vendas },
          lucro_total: sales.lucro_total,
          vendedor: vendedor
        })

      
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Erro desconhecido ao conectar com o servidor')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  console.log('data', data)

  return (
    <Box flex="1" p={8}>
      <Box mb={8}>
        <Heading color="blue.600" fontSize="2xl" fontWeight="semibold">
          Painel de Controle - Usuário: {data?.vendedor.vendedor}
        </Heading>
        <Text color="gray.600" mt={2}>
          Estatísticas atualizadas em tempo real
        </Text>
      </Box>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <SimpleGrid columns={[1, 2, 3]} spacing={8}>
        <StatCard
          label="Produtos em Estoque"
          value={data?.totalStock ?? 0}
          icon={FiBox}
          colorScheme="blue"
          isLoading={isLoading}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            window.location.href = '/produtos'
          }}
        />
        <StatCard
          label="Itens com Estoque Baixo"
          value={data?.lowStockItems ?? 0}
          icon={FiAlertTriangle}
          colorScheme="orange"
          isLoading={isLoading}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            window.location.href = '/relatorios'
          }}
        />
        <StatCard
          label="Vendas Hoje (R$)"
          value={data?.todaySales.total_vendas ?? 0}
          icon={FiTrendingUp}
          colorScheme="green"
          isLoading={isLoading}
          isCurrency
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            window.location.href = '/graficos'
          }}
        />
        <StatCard
          label="Lucro_total"
          value={data?.lucro_total ?? 0}
          icon={FiTrendingUp}
          colorScheme="green"
          isLoading={isLoading}    
          isCurrency 
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            window.location.href = '/graficos'
          }}   
        />
       
        <StatCard
          label="Minhas vendas de hoje"
          value={data?.vendedor.total_vendas ?? 0}
          icon={FiTrendingUp}
          colorScheme="green"
          isLoading={isLoading}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            window.location.href = '/graficos'
          }}
        />
        <StatCard
          label="Total das minhas vendas"
          value={data?.vendedor.valor_total ?? 0}
          icon={FiTrendingUp}
          colorScheme="green"
          isLoading={isLoading}
          isCurrency
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            window.location.href = '/graficos'
          }}
        />
      
      </SimpleGrid>
    </Box>
  )
}

function StatCard({ label, value, icon, colorScheme, isLoading, onClick, isCurrency = false }: StatCardProps) {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Stat
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      bg={bg}
      borderColor={borderColor}
      onClick={onClick} 
      _hover={{ cursor: 'pointer', boxShadow: 'md' }}
      transition="box-shadow 0.2s"
      _active={{ boxShadow: 'lg' }}
    >
      <Flex align="center" gap={4}>
        <Box
          p={3}
          bg={`${colorScheme}.100`}
          borderRadius="full"
          color={`${colorScheme}.600`}
        >
          <Icon as={icon} boxSize={6} />
        </Box>
        <Box flex="1">
          <StatLabel color="gray.500" fontWeight="medium" fontSize="sm">
            {label}
          </StatLabel>
          {isLoading ? (
            <Skeleton height="32px" mt={2} width="60%" />
          ) : (
            <StatNumber fontSize="2xl" fontWeight="bold">
            {typeof value === 'number' 
              ? isCurrency
                ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : value.toLocaleString('pt-BR')
              : value}
          </StatNumber>
          )}
        </Box>
      </Flex>
    </Stat>
  )
}

