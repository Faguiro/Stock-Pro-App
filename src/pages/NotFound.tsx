import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, red.400, pink.400)"
        backgroundClip="text"
      >
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Página não encontrada
      </Text>
      <Text color="gray.500" mb={6}>
        A página que você está tentando acessar não existe ou foi movida.
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
