import { Outlet } from 'react-router-dom';
import SidebarMenu from './Sidebar';
import { Box, Flex } from '@chakra-ui/react';

export default function MainLayout() {
  return (
    <Flex h="100vh">
      <SidebarMenu />
      <Box flex="1" p={4} overflow="auto">
        <Outlet />
      </Box>
    </Flex>
  );
}
