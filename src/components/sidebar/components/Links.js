/* eslint-disable */
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";
// 1. IMPORTAÇÃO DO CONTEXTO DE AUTENTICAÇÃO
import { useAuth } from "contexts/AuthContext"; 

export function SidebarLinks(props) {
  //  Chakra color mode
  let location = useLocation();
  
  // --- DEFINIÇÃO DE CORES (PADRÃO AZUL/BRAND PARA TODOS) ---
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue("secondaryGray.600", "secondaryGray.600");
  // Aqui garantimos que o ícone ativo seja SEMPRE o azul da marca (brand.500)
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  // Aqui garantimos que a barrinha lateral ativa seja SEMPRE o azul da marca
  let brandColor = useColorModeValue("brand.500", "brand.400");

  const { routes } = props;

  // 2. RECUPERAR O PERFIL DO USUÁRIO LOGADO
  const { authData } = useAuth();
  const perfilUsuario = authData?.user?.perfil; 

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      
      // ---------------------------------------------------------
      // 3. FILTRO DE VISIBILIDADE
      // ---------------------------------------------------------

      // A. Rotas de Autenticação nunca aparecem
      if (route.layout === "/auth") return null;

      // B. SE FOR PRODUTOR: Esconde painel de Admin
      if (perfilUsuario === 'agricultor' || perfilUsuario === 'produtor') {
         if (route.layout === '/admin') return null;
      }

      // C. SE FOR ADMIN: Esconde painel de Produtor
      if (perfilUsuario === 'admin' || perfilUsuario === 'gestor') {
         if (route.layout === '/produtor') return null;
      }
      // ---------------------------------------------------------

      if (route.category) {
        return (
          <>
            <Text
              fontSize={"md"}
              color={activeColor}
              fontWeight='bold'
              mx='auto'
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              pt='18px'
              pb='12px'
              key={index}>
              {route.name}
            </Text>
            {createLinks(route.items)}
          </>
        );
      } else if (
        route.layout === "/admin" ||
        route.layout === "/produtor" || 
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        return (
          <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={activeRoute(route.path.toLowerCase()) ? "22px" : "26px"}
                  py='5px'
                  ps='10px'>
                  <Flex w='100%' alignItems='center' justifyContent='center'>
                    <Box
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeIcon
                          : textColor
                      }
                      me='18px'>
                      {route.icon}
                    </Box>
                    <Text
                      me='auto'
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
                      }>
                      {route.name}
                    </Text>
                  </Flex>
                  <Box
                    h='36px'
                    w='4px'
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor // <--- BARRA AZUL SE ATIVO
                        : "transparent"
                    }
                    borderRadius='5px'
                  />
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={activeRoute(route.path.toLowerCase()) ? "22px" : "26px"}
                  py='5px'
                  ps='10px'>
                  <Text
                    me='auto'
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
                    }>
                    {route.name}
                  </Text>
                  {/* CORRIGIDO AQUI: A barra só aparece se estiver ativo */}
                  <Box 
                    h='36px' 
                    w='4px' 
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor 
                        : "transparent"
                    }
                    borderRadius='5px' 
                  />
                </HStack>
              </Box>
            )}
          </NavLink>
        );
      }
    });
  };
  return createLinks(routes);
}

export default SidebarLinks;