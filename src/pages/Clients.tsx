 

import {
  Box, Button, Heading, Input, SimpleGrid, Spinner, useDisclosure, useToast,
  Text, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Stack,
   Textarea, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import api from '../lib/api'

interface Customer {
  id: number
  nome: string
  email?: string
  telefone?: string
  endereco?: string
  preferencias?: Record<string, any>
  observacoes?: string
}

export default function ClientesPage() {
  const toast = useToast()
  const [clientes, setClientes] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const cancelRef = useRef(null)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    preferencias: '{}', // Agora como texto para facilitar
    observacoes: ''
  })

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  // Buscar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await api.get('/customers')
        setClientes(res.data)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar clientes')
      } finally {
        setLoading(false)
      }
    }
    fetchClientes()
  }, [])

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        preferencias: JSON.parse(formData.preferencias || '{}'),
      }
      const res = await api.post('/customers', payload)
      setClientes(prev => [...prev, res.data])
      resetForm()
      toast({ title: 'Cliente criado', status: 'success' })
      onCreateClose()
    } catch {
      toast({ title: 'Erro ao criar cliente', status: 'error' })
    }
  }

  const handleEdit = async () => {
    if (!editingCustomer) return

    try {
      const payload = {
        ...formData,
        preferencias: JSON.parse(formData.preferencias || '{}'),
      }
      const res = await api.put(`/customers/${editingCustomer.id}`, payload)
      setClientes(prev => prev.map(c => c.id === editingCustomer.id ? res.data : c))
      resetForm()
      toast({ title: 'Cliente atualizado', status: 'success' })
      onEditClose()
    } catch {
      toast({ title: 'Erro ao atualizar cliente', status: 'error' })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      preferencias: '{}',
      observacoes: ''
    })
    setEditingCustomer(null)
  }

  const handleOpenEdit = (cliente: Customer) => {
    setEditingCustomer(cliente)
    setFormData({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || '',
      preferencias: JSON.stringify(cliente.preferencias || {}),
      observacoes: cliente.observacoes || ''
    })
    onEditOpen()
  }

  const confirmDelete = (cliente: Customer) => {
    setCustomerToDelete(cliente)
    onDeleteOpen()
  }

  const handleDelete = async () => {
    if (!customerToDelete) return
    try {
      await api.delete(`/customers/${customerToDelete.id}`)
      setClientes(prev => prev.filter(c => c.id !== customerToDelete.id))
      toast({ title: 'Cliente removido', status: 'success' })
    } catch {
      toast({ title: 'Erro ao remover cliente', status: 'error' })
    } finally {
      onDeleteClose()
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Spinner size="xl" />
  if (error) return (
    <Alert status="error"><AlertIcon />{error}</Alert>
  )

  return (
    <Box p={8}>
      <Heading mb={6} display="flex" justifyContent="space-between" alignItems="center">
        Clientes
        <Button colorScheme="blue" onClick={onCreateOpen}>
          Novo Cliente
        </Button>
      </Heading>

      <Input
        placeholder="Buscar por nome ou e-mail"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb={4}
      />

      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {clientesFiltrados.map((cliente) => (
          <Box key={cliente.id} p={4} borderWidth={1} borderRadius="md" boxShadow="sm">
            <Heading size="sm">{cliente.nome}</Heading>
            {cliente.email && <Text fontSize="sm" color="gray.600">{cliente.email}</Text>}
            {cliente.telefone && <Text fontSize="sm" color="gray.600">{cliente.telefone}</Text>}
            {cliente.endereco && <Text fontSize="xs" color="gray.500">{cliente.endereco}</Text>}
            {/* {cliente.preferencias && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Preferências: {JSON.stringify(cliente.preferencias)}
              </Text>
            )} */}
            <Stack mt={3} direction="row">
              <Button size="sm" colorScheme="teal" onClick={() => handleOpenEdit(cliente)}>
                Editar
              </Button>
              <Button size="sm" colorScheme="red" onClick={() => confirmDelete(cliente)}>
                Excluir
              </Button>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Modal de criação */}
      <CustomerModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreate}
        title="Novo Cliente"
        buttonText="Salvar"
      />

      {/* Modal de edição */}
      <CustomerModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEdit}
        title="Editar Cliente"
        buttonText="Atualizar"
      />

      {/* Confirmação de exclusão */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Cliente
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir o cliente "{customerToDelete?.nome}"? Essa ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

// Componente de Modal Reutilizável
function CustomerModal({ isOpen, onClose, formData, setFormData, onSubmit, title, buttonText }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Nome</FormLabel>
            <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Telefone</FormLabel>
            <Input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Endereço</FormLabel>
            <Input value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Preferências (JSON)</FormLabel>
            <Textarea
              value={formData.preferencias}
              onChange={(e) => setFormData({ ...formData, preferencias: e.target.value })}
              placeholder='{"newsletter": true}'
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Observações</FormLabel>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onSubmit}>
            {buttonText}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
