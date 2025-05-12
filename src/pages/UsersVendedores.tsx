import {
  Box, Button, Heading, Input, SimpleGrid, Spinner, useToast,
  Text, VStack, Flex, useColorModeValue, FormControl, FormLabel
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import UserCard from '../components/UserCard';


interface User {
  id: number;
  nome: string;
  email: string;
  role: 'superadmin' | 'admin' | 'vendedor';
}

export default function UsersVendedores() {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'vendedor',
  });

  const bgCard = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/users');
        const vendedores = res.data.filter((u: User) => u.role === 'vendedor');
        setUsuarios(vendedores);
      } catch {
        toast({ title: 'Erro ao carregar vendedores', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await api.post('/users', formData);
      if (res.data.role === 'vendedor') {
        setUsuarios(prev => [...prev, res.data]);
      }
      setFormData({ nome: '', email: '', senha: '', role: 'vendedor' });
      toast({ title: 'Vendedor criado com sucesso', status: 'success' });
    } catch (err: any) {
      toast({
        title: 'Erro ao criar vendedor',
        description: err.response?.data?.detail || '',
        status: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      toast({ title: 'Vendedor excluído', status: 'success' });
    } catch {
      toast({ title: 'Erro ao excluir vendedor', status: 'error' });
    }
  };

  const filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Flex justify="center" mt={10}><Spinner size="xl" /></Flex>;

  return (
    <Box p={[4, 6, 8]} maxW="7xl" mx="auto">
      <Heading mb={6}>Administração de Vendedores</Heading>

      <Input
        placeholder="Buscar por nome ou email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb={8}
        maxW="400px"
      />

      <Flex
        direction={['column', 'column', 'row']}
        gap={8}
        align="flex-start"
        mb={10}
      >
        {/* Formulário */}
        <Box
          as="form"
          onSubmit={(e: { preventDefault: () => void; }) => {
            e.preventDefault();
            handleCreate();
          }}
          bg={bgCard}
          p={6}
          borderRadius="md"
          boxShadow="sm"
          flex="1"
          minW={["100%", "100%", "320px"]}
        >
          <Heading size="md" mb={4}>Cadastrar novo vendedor</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Nome</FormLabel>
              <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Senha</FormLabel>
              <Input type="password" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
            </FormControl>
            <Button colorScheme="blue" type="submit" alignSelf="flex-start">Criar Vendedor</Button>
          </VStack>
        </Box>

        {/* Lista */}
        <Box
          flex="2"
          w="100%"
          bg={bgCard}
          p={6}
          borderRadius="md"
          boxShadow="sm"
          overflowX="auto"
        >
          <Heading size="md" mb={4}>Lista de Vendedores ({filtrados.length})</Heading>
          {filtrados.length === 0 ? (
            <Text>Nenhum vendedor encontrado.</Text>
          ) : (
            <SimpleGrid columns={[1, 2, 2]} spacing={6}>
              {filtrados.map((u) => (
                <UserCard
                  key={u.id}
                  nome={u.nome}
                  email={u.email}
                  role={u.role}
                  onDelete={() => handleDelete(u.id)}
                />
              ))}

            </SimpleGrid>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
