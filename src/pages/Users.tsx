import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../lib/api';

type UserType = {
  id: number;
  name: string;
  role: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/users'); // ajuste a rota real da sua API
        setUsers(response.data);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const totalByRole = (role: string) =>
    users.filter((u) => u.role === role).length;

  if (loading) {
    return (
      <Box p={4}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading mb={6}>Usuários</Heading>

      <SimpleGrid columns={[1, 2, 3]} spacing={6} mb={6}>
        <Stat p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <StatLabel>Super Admins</StatLabel>
          <StatNumber>{totalByRole('superadmin')}</StatNumber>
        </Stat>

        <Stat p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <StatLabel>Admins</StatLabel>
          <StatNumber>{totalByRole('admin')}</StatNumber>
        </Stat>

        <Stat p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <StatLabel>Vendedores</StatLabel>
          <StatNumber>{totalByRole('vendedor')}</StatNumber>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={[1, 2]} spacing={4}>
        <Button
          as={RouterLink}
          to="/usuarios/admins"
          colorScheme="blue"
          variant="solid"
        >
          Gerenciar Admins
        </Button>
        <Button
          as={RouterLink}
          to="/usuarios/vendedores"
          colorScheme="green"
          variant="solid"
        >
          Gerenciar Vendedores
        </Button>
      </SimpleGrid>
    </Box>
  );
}
