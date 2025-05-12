import {
    Box,
    VStack,
    Link as ChakraLink,
    Button,
    Icon,
    Text,
    Tooltip,
    Flex,
    Divider,
    HStack,
    Avatar,
} from '@chakra-ui/react';
import { NavLink  } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import {
    FiHome,
    FiBox,
    FiLayers,
    FiShoppingCart,
    FiUsers,
    FiBarChart2,
    FiUserCheck,
    FiUserPlus,
    FiChevronLeft,
    FiMenu,
    FiLogOut,
    FiArchive,
} from 'react-icons/fi';

const menuItems = [
    { label: 'Dashboard', path: '/', icon: FiHome, roles: ['superadmin', 'admin', 'vendedor'] },
    { label: 'Produtos', path: '/produtos', icon: FiBox, roles: ['superadmin', 'admin'] },
    { label: 'Categorias', path: '/categorias', icon: FiLayers, roles: ['superadmin', 'admin'] },
    { label: 'PDV', path: '/pdv', icon: FiShoppingCart, roles: ['superadmin', 'vendedor'] },
    { label: 'Clientes', path: '/clientes', icon: FiUsers, roles: ['superadmin', 'admin', 'vendedor'] },
    { label: 'Estoque', path: '/relatorios', icon: FiArchive, roles: ['superadmin', 'admin'] },
    { label: 'Métricas', path: '/graficos', icon: FiBarChart2, roles: ['superadmin', 'admin'] },
    { label: 'Usuários (Admins)', path: '/usuarios/admins', icon: FiUserCheck, roles: ['superadmin'] },
    { label: 'Usuários (Vendedores)', path: '/usuarios/vendedores', icon: FiUserPlus, roles: ['superadmin', 'admin'] },
];

export default function SidebarMenu() {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed(prev => !prev);

    return (
        <Box
            p={4}
            bg="gray.200"
            h="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            transition="width 0.3s ease"
            w={collapsed ? '80px' : '250px'}
        >
            <VStack align="start" spacing={4}>
                <Flex align="center" justify="space-between" w="100%">
                    <Text fontWeight="bold" fontSize="lg" color="gray.700">
                        {collapsed ? 'EP' : 'EstockPro 1.0'}
                    </Text>
                    <Button size="sm" variant="ghost" onClick={toggleSidebar}>
                        <Icon as={collapsed ? FiMenu : FiChevronLeft} />
                    </Button>
                </Flex>

                {!collapsed && user && (
                    <HStack spacing={3} mt={2}>
                        <Avatar name={user.name} size="sm" />
                        <Box>
                            <Text fontWeight="medium">{user.name}</Text>
                            <Text fontSize="sm" color="gray.500">{user.role}</Text>
                        </Box>
                    </HStack>
                )}

                <Divider mt={2} />

                <VStack spacing={3} align="start" w="100%">
                    {menuItems
                        .filter(item => item.roles.includes(user?.role || ''))
                        .map(item => (
                            <Tooltip
                                label={item.label}
                                placement="right"
                                isDisabled={!collapsed}
                                key={item.path}
                            >
                                <ChakraLink
                                    as={NavLink}
                                    to={item.path}
                                    display="flex"
                                    alignItems="center"
                                    gap={3}
                                    fontWeight="medium"
                                    color="gray.700"
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    _hover={{ textDecoration: 'none', bg: 'gray.300' }}
                                    _activeLink={{
                                        bg: 'blue.100',
                                        color: 'blue.600',
                                        fontWeight: 'bold',
                                    }}
                                    w="100%"
                                >
                                    <Icon as={item.icon} boxSize={5} />
                                    {!collapsed && item.label}
                                </ChakraLink>
                            </Tooltip>
                        ))
                    }

                </VStack>
            </VStack>

            <Box mt={6}>
                <Tooltip label="Sair" placement="right" isDisabled={!collapsed}>
                    <Button
                        leftIcon={!collapsed ? <Icon as={FiLogOut} /> : undefined}
                        iconSpacing={collapsed ? 0 : 2}
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        width="100%"
                        justifyContent={collapsed ? 'center' : 'flex-start'}
                        onClick={logout}
                    >
                        {!collapsed ? 'Sair' : <Icon as={FiLogOut} />}
                    </Button>
                </Tooltip>
            </Box>
        </Box>
    );
}
