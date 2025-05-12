 

import {
    Box, Heading, Text, Spinner, Input, Button, IconButton,
    Alert, AlertIcon, useToast, Stat, StatLabel, StatNumber,
     Table, Thead, Tr, Th, Td, Tbody, TableContainer,
    Tag, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
    FormControl, FormLabel, NumberInput, NumberInputField,
    NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
    Card, CardHeader,  Flex,
    SimpleGrid
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import api from '../lib/api'

interface StockListItem {
    id: number
    product_id: number
    quantity: number
    produto_nome: string
}

export default function EstoquePage() {
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [estoques, setEstoques] = useState<StockListItem[]>([])
    const [quantidadeTotal, setQuantidadeTotal] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStock, setSelectedStock] = useState<StockListItem | null>(null)
    const [newQuantity, setNewQuantity] = useState(0)

    // Carregar dados
    const loadData = async () => {
        try {
            const [stocksRes, totalRes] = await Promise.all([
                api.get('/stock/with-product-names'),
                api.get('/stock/quantity')
            ])

            setEstoques(stocksRes.data)
            setQuantidadeTotal(totalRes.data)
        } catch (err: any) {
            handleError(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Manipuladores de erro
    const handleError = (err: any) => {
        const backendErrors = err.response?.data?.detail || []
        let errorMessage = 'Erro ao processar a requisição'

        if (Array.isArray(backendErrors)) {
            errorMessage = backendErrors.map(e => `${e.loc.join('.')}: ${e.msg}`).join('\n')
        } else if (typeof backendErrors === 'string') {
            errorMessage = backendErrors
        }

        setError(errorMessage)
        toast({
            title: 'Erro de Validação',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true
        })
    }

    // Abrir modal de edição
    const handleEdit = (stock: StockListItem) => {
        setSelectedStock(stock)
        setNewQuantity(stock.quantity)
        onOpen()
    }

    // Atualizar estoque
    const updateStock = async () => {
        if (!selectedStock) return

        try {
            await api.put(`/stock/${selectedStock.id}`, { quantity: newQuantity })
            toast({
                title: 'Sucesso',
                description: 'Estoque atualizado com sucesso',
                status: 'success',
                duration: 3000
            })
            loadData()
            onClose()
        } catch (err: any) {
            handleError(err)
        }
    }

    // Interface de loading
    if (loading) return (
        <Flex justify="center" align="center" minH="100vh">
            <Spinner size="xl" thickness="4px" speed="0.65s" />
            <Text mt={4} ml={4}>Carregando dados de estoque...</Text>
        </Flex>
    )

    // Interface de erro
    if (error) return (
        <Alert status="error" variant="left-accent" borderRadius="md" mx={4}>
            <AlertIcon />
            {error}
        </Alert>
    )

    return (
        <Box p={8} maxW="1400px" mx="auto">
            <Flex justify="space-between" align="center" mb={8}>
                <Heading fontSize="2xl">Gestão de Estoque</Heading>
                <Button
                    colorScheme="blue"
                    leftIcon={<AddIcon />}
                    onClick={() => {/* Implementar criação */ }}
                >
                    Novo Item
                </Button>
            </Flex>

            {/* Cards de Estatísticas */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
                <Card bg="blue.50" borderWidth="1px" borderColor="blue.100">
                    <CardHeader>
                        <Stat>
                            <StatLabel fontSize="sm" color="gray.600">Estoque Total</StatLabel>
                            <StatNumber fontSize="2xl">{quantidadeTotal}</StatNumber>
                        </Stat>
                    </CardHeader>
                </Card>

                <Card bg="green.50" borderWidth="1px" borderColor="green.100">
                    <CardHeader>
                        <Stat>
                            <StatLabel fontSize="sm" color="gray.600">Produtos Cadastrados</StatLabel>
                            <StatNumber fontSize="2xl">{estoques.length}</StatNumber>
                        </Stat>
                    </CardHeader>
                </Card>
            </SimpleGrid>

            {/* Barra de Busca */}
            <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                mb={6}
                variant="filled"
                focusBorderColor="blue.200"
            />

            {/* Tabela de Estoque */}
            <TableContainer
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
            >
                <Table variant="striped" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Produto</Th>
                            <Th isNumeric>Quantidade</Th>
                            <Th>Status</Th>
                            <Th width="120px">Ações</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {estoques
                            .filter(e => e.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item) => (
                                <Tr key={item.id} _hover={{ bg: 'gray.50' }}>
                                    <Td fontWeight="medium">{item.produto_nome}</Td>
                                    <Td isNumeric fontWeight="semibold">
                                        {item.quantity}
                                    </Td>
                                    <Td>
                                        <Tag
                                            colorScheme={
                                                item.quantity < 0 ? 'red' :
                                                    item.quantity < 10 ? 'orange' :
                                                        'green'
                                            }
                                            variant="subtle"
                                            borderRadius="full"
                                        >
                                            {
                                                item.quantity < 0 ? 'Estoque Negativo' :
                                                    item.quantity < 10 ? 'Estoque Baixo' :
                                                        'Disponível'
                                            }
                                        </Tag>
                                    </Td>
                                    <Td>
                                        <IconButton
                                            aria-label="Editar estoque"
                                            icon={<EditIcon />}
                                            size="sm"
                                            mr={2}
                                            onClick={() => handleEdit(item)}
                                        />
                                        <IconButton
                                            aria-label="Excluir item"
                                            icon={<DeleteIcon />}
                                            size="sm"
                                            colorScheme="red"
                                            variant="ghost"
                                        />
                                    </Td>
                                </Tr>
                            ))}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Modal de Edição */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Editar Estoque</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Produto</FormLabel>
                            <Input value={selectedStock?.produto_nome || ''} isReadOnly />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Nova Quantidade</FormLabel>
                            <NumberInput
                                min={0}
                                value={newQuantity}
                                onChange={(_, value) => setNewQuantity(value)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={updateStock}>
                            Salvar
                        </Button>
                        <Button onClick={onClose}>Cancelar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}