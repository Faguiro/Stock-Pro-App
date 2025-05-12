import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading as="h2" size="xl" mt={6} mb={2}>
        Acesso Negado
      </Heading>
      <Text color="gray.500" mb={6}>
        Você não tem permissão para acessar esta página.
      </Text>
      <Button
        colorScheme="blue"
        onClick={() => navigate('/')}
      >
        Voltar para o início
      </Button>
    </Box>
  );
}
