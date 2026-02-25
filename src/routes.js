// src/routes.js

import React from 'react';
import { Icon } from '@chakra-ui/react';
import { 
  MdPerson, MdHome, MdLandscape, MdBuild, MdLock, 
  MdAssignment, MdList, MdPeople, MdDirectionsCar, MdSchedule
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/dashboard';
import Agricultores from 'views/admin/Agricultores';
import Propriedades from 'views/admin/Propriedades';
import Servicos from 'views/admin/Servicos'; 
import Solicitacoes from 'views/admin/Solicitacoes';
import Profile from 'views/admin/profile'; 
import Veiculos from 'views/admin/Veiculos'; 
import Funcionarios from "views/admin/Funcionarios"; 

// Auth Imports
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';

// Produtor Imports
import DashboardProdutor from 'views/produtor/DashboardProdutor'; 
import MinhasSolicitacoes from 'views/produtor/MinhasSolicitacoes';

//Agenda dos funcionários
import MinhaAgenda from "views/admin/minhaAgenda";

// NOTA: As páginas Sobre, Contato e Politica foram removidas daqui
// para não aparecerem no menu lateral. Elas serão importadas
// diretamente no arquivo de Layout (src/layouts/admin/index.js).

const routes = [
  // --- ROTAS EXCLUSIVAS DO ADMIN ---
  {
    name: 'Painel Administrativo',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: MainDashboard,
    roles: ['admin'] 
  },
  {
    name: 'Agricultores',
    layout: '/admin',
    path: '/agricultores',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Agricultores,
    roles: ['admin']
  },
  {
    name: "Funcionários",
    layout: "/admin",
    path: "/funcionarios",
    icon: <Icon as={MdPeople} width='20px' height='20px' color='inherit' />,
    component: Funcionarios,
    roles: ['admin']
  },
  {
    name: 'Propriedades',
    layout: '/admin',
    path: '/propriedades',
    icon: <Icon as={MdLandscape} width="20px" height="20px" color="inherit" />,
    component: Propriedades,
    roles: ['admin']
  },
  {
    name: 'Solicitações', 
    layout: '/admin',
    path: '/solicitacoes', 
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    component: Solicitacoes,
    roles: ['admin']
  },
  {
    name: 'Serviços', 
    layout: '/admin',
    path: '/servicos',
    icon: <Icon as={MdBuild} width="20px" height="20px" color="inherit" />,
    component: Servicos, 
    roles: ['admin']
  },
  {
    name: "Frota de Veículos",
    layout: "/admin",
    path: "/veiculos",
    icon: <Icon as={MdDirectionsCar} width='20px' height='20px' color='inherit' />,
    component: Veiculos,
    roles: ['admin']
  },

  // --- ROTA EXCLUSIVA PARA TÉCNICOS / MOTORISTAS ---
  {
    name: 'Minha Agenda',
    layout: '/admin',
    path: '/minha-agenda',
    icon: <Icon as={MdSchedule} width="20px" height="20px" color="inherit" />,
    component: MinhaAgenda,
    roles: ['tecnico', 'operador'] 
  },

  // --- ROTAS DO PRODUTOR ---
  {
    name: 'Painel do Produtor',
    layout: '/produtor',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: DashboardProdutor,
    roles: ['produtor', 'agricultor']
  },
  {
    name: 'Meus Pedidos',
    layout: '/produtor',
    path: '/minhas-solicitacoes',
    icon: <Icon as={MdList} width="20px" height="20px" color="inherit" />,
    component: MinhasSolicitacoes,
    roles: ['produtor', 'agricultor']
  },

  // --- ROTAS DE PERFIL ---
  {
    name: 'Meu Perfil',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
    roles: ['admin', 'tecnico', 'operador'] 
  },
  {
    name: 'Meu Perfil',
    layout: '/produtor',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
    roles: ['produtor', 'agricultor']
  },

  // --- ROTAS DE AUTENTICAÇÃO ---
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignIn,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignUp,
  },
];

export default routes;