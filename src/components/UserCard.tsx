import { Box, Button, Divider, Heading, Text, useColorModeValue } from '@chakra-ui/react';

interface UserCardProps {
  nome: string;
  email: string;
  role: string;
  onDelete: () => void;
}

export default function UserCard({ nome, email, role, onDelete }: UserCardProps) {
  const bgCard = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={5} bg={bgCard} borderRadius="md" boxShadow="base">
      <Heading size="sm" mb={1}>{nome}</Heading>
      <Text fontSize="sm" color="gray.600">{email}</Text>
      <Text fontSize="xs" mt={1}>Perfil: <strong>{role}</strong></Text>
      <Divider my={3} />
      <Button size="sm" colorScheme="red" onClick={onDelete}>Excluir</Button>
    </Box>
  );
}
