 

import {
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Box,
  Heading,
  useColorModeValue,
  Flex
} from '@chakra-ui/react'
import { useState } from 'react'
// import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
 // 1. Mantenha todos os hooks no topo, antes de qualquer condicional
 const [identifier, setIdentifier] = useState('')
 const [password, setPassword] = useState('')
 const [error, setError] = useState('')
 const { login } = useAuth()
//  const router = useRouter()
 const bgColor = useColorModeValue('white', 'gray.800') // Movido para cima

 

  const handleSubmit = async () => {
    try {
      await login(identifier, password)

      
    } catch (err: any) {
      setError('Credenciais inválidas')
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#EDF2F7">
      <Container maxW="md" bg={bgColor} boxShadow="xl" borderRadius="lg" p={10}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" color="blue.600">Bem-vindo ao EstockPro</Heading>
            <Text fontSize="sm" color="gray.600" mt={2}>
              Organize, controle e cresça. O estoque certo é o seu lucro garantido!
            </Text>
          </Box>

          <FormControl>
            <FormLabel>Email ou Nome de Usuário</FormLabel>
            <Input 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Digite seu e-mail ou usuário"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Senha</FormLabel>
            <Input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Digite sua senha"
            />
          </FormControl>

          {error && <Text color="red.500" textAlign="center">{error}</Text>}

          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={handleSubmit}
            type="submit" // Adicionado para melhor acessibilidade
          >
            Entrar
          </Button>
        </VStack>
      </Container>
    </Flex>
  )
}
