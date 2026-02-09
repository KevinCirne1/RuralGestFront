// src/components/navbar/NavbarLinksAdmin.js

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
// Custom Components
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
// Import NavLink e useLocation
import { NavLink, useLocation } from 'react-router-dom';

// Assets
import { MdNotificationsNone, MdNotificationsActive } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import routes from 'routes';
import { useAuth } from 'contexts/AuthContext';

// Import do Service
import { getNotificacoes, marcarComoLida } from 'services/notificacaoService';

export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const { authData, logout } = useAuth();
  const location = useLocation(); 
  
  const [notificacoes, setNotificacoes] = useState([]);

  // --- LÓGICA DE ROTA ---
  const profilePath = location.pathname.includes('/produtor') 
    ? '/produtor/profile' 
    : '/admin/profile';

  // --- CORES ---
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );
  
  const bgNotificacaoNaoLida = useColorModeValue("blue.50", "navy.700");
  const bgHoverNotificacao = useColorModeValue("gray.100", "gray.700");

  // --- BUSCA DE NOTIFICAÇÕES COM TRATAMENTO DE ERRO ---
  const carregarNotificacoes = useCallback(async () => {
    if (!authData?.user?.id) return;

    try {
      const response = await getNotificacoes(authData.user.id);
      if (response && response.data) {
        setNotificacoes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      // Silencia erros 404 para não poluir o console do produtor/admin
      if (error.response?.status !== 404) {
        console.error("Erro ao buscar notificações:", error);
      }
    }
  }, [authData]);

  useEffect(() => {
    carregarNotificacoes();
    const intervalo = setInterval(carregarNotificacoes, 30000); // 30 segundos
    return () => clearInterval(intervalo);
  }, [carregarNotificacoes]);

  const handleLer = async (notificacao) => {
    if (!notificacao.lida) {
      try {
        await marcarComoLida(notificacao.id);
        setNotificacoes(prev => prev.map(n => 
          n.id === notificacao.id ? { ...n, lida: true } : n
        ));
      } catch (error) {
        console.error("Erro ao marcar como lida", error);
      }
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SidebarResponsive routes={routes} />
      
      {/* MENU NOTIFICAÇÕES */}
      <Menu>
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
            {naoLidas > 0 && (
              <Box
                position="absolute"
                top="-2px"
                right="5px"
                bg="brand.500"
                borderRadius="full"
                w="10px"
                h="10px"
                border="2px solid white"
              />
            )}
          </Box>
        </MenuButton>
        <Portal>
            <MenuList
            boxShadow={shadow}
            p="20px"
            borderRadius="20px"
            bg={menuBg}
            border="none"
            mt="22px"
            me={{ base: '30px', md: 'unset' }}
            minW={{ base: 'unset', md: '400px', xl: '450px' }}
            maxW={{ base: '360px', md: 'unset' }}
            maxH="400px" 
            overflowY="auto"
            zIndex="1500"
            >
            <Flex w="100%" mb="20px">
                <Text fontSize="md" fontWeight="600" color={textColor}>
                Notificações ({naoLidas})
                </Text>
                <Text
                fontSize="sm"
                fontWeight="500"
                color={textColorBrand}
                ms="auto"
                cursor="pointer"
                onClick={carregarNotificacoes}
                >
                Atualizar
                </Text>
            </Flex>
            <Flex flexDirection="column">
                {notificacoes.length === 0 ? (
                <Text fontSize="sm" color="gray.500" p="10px">Nenhuma notificação disponível.</Text>
                ) : (
                notificacoes.map((notif) => (
                    <MenuItem
                    key={notif.id}
                    _hover={{ bg: bgHoverNotificacao }} 
                    _focus={{ bg: 'none' }}
                    px="10px"
                    py="10px"
                    borderRadius="8px"
                    mb="5px"
                    bg={notif.lida ? "transparent" : bgNotificacaoNaoLida}
                    onClick={() => handleLer(notif)}
                    >
                    <Flex align='center' direction="column" alignItems="flex-start" w="100%">
                        <Text fontSize='sm' fontWeight={notif.lida ? '400' : '700'}>
                        {notif.mensagem}
                        </Text>
                        <Text fontSize='xs' color="gray.400" mt="1">
                        {notif.data_criacao ? new Date(notif.data_criacao).toLocaleString() : ''}
                        </Text>
                    </Flex>
                    </MenuItem>
                ))
                )}
            </Flex>
            </MenuList>
        </Portal>
      </Menu>

      <Button
        variant="no-hover"
        bg="transparent"
        p="0px"
        minW="unset"
        minH="unset"
        h="18px"
        w="max-content"
        onClick={toggleColorMode}
      >
        <Icon
          me="10px"
          h="18px"
          w="18px"
          color={navbarIcon}
          as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
        />
      </Button>

      {/* MENU PERFIL */}
      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: 'pointer' }}
            color="white"
            name={authData?.user?.nome || 'Utilizador'}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <Portal>
            <MenuList
            boxShadow={shadow}
            p="0px"
            mt="10px"
            borderRadius="20px"
            bg={menuBg}
            border="none"
            zIndex="1500"
            >
            <Flex w="100%" mb="0px">
                <Text
                ps="20px"
                pt="16px"
                pb="10px"
                w="100%"
                borderBottom="1px solid"
                borderColor={useColorModeValue('gray.200', 'whiteAlpha.300')}
                fontSize="sm"
                fontWeight="700"
                color={textColor}
                >
                👋&nbsp; Olá, {authData?.user?.nome || 'Utilizador'}
                </Text>
            </Flex>
            <Flex flexDirection="column" p="10px">
                <MenuItem
                _hover={{ bg: 'none' }}
                _focus={{ bg: 'none' }}
                borderRadius="8px"
                px="14px"
                as={NavLink}
                to={profilePath}
                >
                <Text fontSize="sm">Configurações do Perfil</Text>
                </MenuItem>

                <MenuItem
                _hover={{ bg: 'none' }}
                _focus={{ bg: 'none' }}
                color="red.400"
                borderRadius="8px"
                px="14px"
                onClick={logout}
                >
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
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};