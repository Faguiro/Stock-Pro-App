import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Clients from '../pages/Clients';
import Categories from '../pages/Categories';
import Products from '../pages/Products';
import Reports from '../pages/Reports';
import Charts from '../pages/Charts';
import POS from '../pages/POS';
// import Users from '../pages/Users';
import MainLayout from '../layout/MainLayout';
import UsersAdmins from '../pages/UsersAdmins';
import UsersVendedores from '../pages/UsersVendedores';
import RoleRoute from '../components/RoleRoute';
import NotFound from '../pages/NotFound';


export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas privadas com layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/graficos" element={<Charts />} />
        <Route path="/pdv" element={<POS />} />
        {/* <Route path="/usuarios/admins" element={<Users />} />
        <Route path="/usuarios/vendedores" element={<Users />} /> */}
        <Route path="*" element={<NotFound />} />

        <Route path="/usuarios/admins" element={<RoleRoute roles={['superadmin']}><UsersAdmins /></RoleRoute>} />
        <Route path="/usuarios/vendedores" element={<RoleRoute roles={['superadmin', 'admin']}><UsersVendedores /></RoleRoute>} />


      </Route>

      {/* Rota fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
