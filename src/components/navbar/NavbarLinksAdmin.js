import {
  Avatar,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Box,
  useColorModeValue,
  useColorMode,
  Portal,
} from '@chakra-ui/react';

import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom'; 
import { MdNotificationsNone, MdNotificationsActive } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import routes from 'routes';
import { useAuth } from 'contexts/AuthContext';
import { getNotificacoes, marcarComoLida, marcarTodasComoLidas } from 'services/notificacaoService';

export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const { authData, logout } = useAuth();
  const location = useLocation(); 
  const navigate = useNavigate();
  
  const [notificacoes, setNotificacoes] = useState([]);
  const user = authData?.user; 

  // --- LÓGICA DE CARGOS ---
  const mapaCargos = {
      'admin': 'Administrador',
      'administrador': 'Administrador',
      'produtor': 'Produtor Rural',
      'tecnico': 'Técnico de Campo',
      'operador': 'Operador de Máquinas'
  };

  const perfilLimpo = user?.perfil ? user.perfil.toLowerCase().trim() : '';
  const nomeCargo = mapaCargos[perfilLimpo] || user?.perfil || "Colaborador Rural";

  // --- ESTILOS ---
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );
  
  const bgNotificacaoNaoLida = useColorModeValue("blue.50", "navy.700");
  const bgHoverNotificacao = useColorModeValue("gray.100", "gray.700");

  const carregarNotificacoes = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await getNotificacoes(user.id);
      if (response && response.data) {
        setNotificacoes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (error.response?.status !== 404) console.error("Erro ao buscar notificações:", error);
    }
  }, [user]);

  useEffect(() => {
    carregarNotificacoes();
    const intervalo = setInterval(carregarNotificacoes, 30000); 
    return () => clearInterval(intervalo);
  }, [carregarNotificacoes]);

  // --- FUNÇÃO DE CLIQUE COM REDIRECIONAMENTO INTELIGENTE POR PERFIL ---
  const handleNotificacaoClick = async (notificacao) => {
    // 1. Marca como lida no banco e no estado
    if (!notificacao.lida) {
      try {
        await marcarComoLida(notificacao.id);
        setNotificacoes(prev => prev.map(n => 
          n.id === notificacao.id ? { ...n, lida: true } : n
        ));
      } catch (error) { console.error("Erro ao marcar lida:", error); }
    }

    // 2. Lógica de Redirecionamento Baseada no Perfil e Mensagem
    const msg = notificacao.mensagem.toLowerCase();
    
    // CASO SEJA ADMIN
    if (perfilLimpo === 'admin' || perfilLimpo === 'administrador') {
        // Independente de ser atribuição ou conclusão, o Admin gerencia tudo na Central
        if (msg.includes("atribuiu") || msg.includes("concluiu")) {
            navigate('/admin/solicitacoes');
        }
    } 
    // CASO SEJA PRODUTOR
    else if (perfilLimpo === 'produtor') {
        if (msg.includes("concluiu")) {
            navigate('/produtor/minhas-solicitacoes');
        }
    } 
    // CASO SEJA TÉCNICO OU OPERADOR
    else if (perfilLimpo === 'tecnico' || perfilLimpo === 'operador') {
        if (msg.includes("atribuiu")) {
            navigate('/admin/minha-agenda');
        }
    }
  };

  const handleLerTodas = async () => {
    if (notificacoes.filter(n => !n.lida).length === 0) return;
    try {
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      await marcarTodasComoLidas(user.id);
    } catch (error) { carregarNotificacoes(); }
  };

  const profilePath = location.pathname.includes('/produtor') ? '/produtor/profile' : '/admin/profile';
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SidebarResponsive routes={routes} />
      
      <Menu onOpen={handleLerTodas}>
        <MenuButton p="0px">
          <Box position="relative">
            <Icon
              mt="6px"
              as={naoLidas > 0 ? MdNotificationsActive : MdNotificationsNone}
              color={naoLidas > 0 ? "brand.500" : navbarIcon}
              w="18px"
              h="18px"
              me="10px"
            />
            {naoLidas > 0 && <Box position="absolute" top="-2px" right="5px" bg="brand.500" borderRadius="full" w="10px" h="10px" border="2px solid white" />}
          </Box>
        </MenuButton>
        <Portal>
            <MenuList boxShadow={shadow} p="20px" borderRadius="20px" bg={menuBg} border="none" mt="22px" minW="400px" maxH="400px" overflowY="auto" zIndex="1500">
                <Text fontSize="md" fontWeight="600" color={textColor} mb="20px">Notificações ({naoLidas})</Text>
                {notificacoes.map((notif) => (
                    <MenuItem 
                      key={notif.id} 
                      onClick={() => handleNotificacaoClick(notif)} 
                      _hover={{ bg: bgHoverNotificacao }} 
                      borderRadius="8px" 
                      bg={notif.lida ? "transparent" : bgNotificacaoNaoLida} 
                      mb="5px"
                    >
                        <Flex direction="column" w="100%">
                            <Text fontSize='sm' fontWeight={notif.lida ? '400' : '700'} color={textColor}>
                              {notif.mensagem}
                            </Text>
                            <Text fontSize='xs' color="gray.400" mt="1">
                              {notif.data_criacao ? new Date(notif.data_criacao).toLocaleString() : ''}
                            </Text>
                        </Flex>
                    </MenuItem>
                ))}
            </MenuList>
        </Portal>
      </Menu>

      <Button variant="no-hover" bg="transparent" p="0px" onClick={toggleColorMode}>
        <Icon h="18px" w="18px" color={navbarIcon} as={colorMode === 'light' ? IoMdMoon : IoMdSunny} />
      </Button>

      <Menu>
        <MenuButton p="0px">
          <Avatar _hover={{ cursor: 'pointer' }} name={user?.nome} bg="#11047A" size="sm" w="40px" h="40px" />
        </MenuButton>
        <Portal>
            <MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none" zIndex="1500">
            <Flex direction="column" px="20px" pt="16px" pb="10px" borderBottom="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" fontWeight="700" color={textColor}>👋&nbsp; Olá, {user?.nome || 'Utilizador'}</Text>
                <Text fontSize="xs" color="gray.400" mt="2px" fontWeight="500">
                    {nomeCargo}
                </Text>
            </Flex>

            <Flex flexDirection="column" p="10px">
                <MenuItem _hover={{ bg: 'none' }} borderRadius="8px" px="14px" as={NavLink} to={profilePath}>
                  <Text fontSize="sm">Configurações do Perfil</Text>
                </MenuItem>
                <MenuItem _hover={{ bg: 'none' }} color="red.400" borderRadius="8px" px="14px" onClick={logout}>
                  <Text fontSize="sm">Sair</Text>
                </MenuItem>
            </Flex>
            </MenuList>
        </Portal>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  secondary: PropTypes.bool,
};