import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import { useAuth } from "contexts/AuthContext"; 

export function SidebarLinks(props) {
  let location = useLocation();
  
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue("secondaryGray.600", "secondaryGray.600");
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  const { routes } = props;

  const { authData } = useAuth();
  
  //Tenta pegar o perfil do usuário logado, do contexto/localStorage para casos de refresh
  const rawPerfil = authData?.user?.perfil || localStorage.getItem("user_perfil");
  const perfilUsuario = rawPerfil ? rawPerfil.toLowerCase() : "";

  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      
      if (route.layout === "/auth") return null;

      //SE FOR PRODUTOR/AGRICULTOR
      if (perfilUsuario === 'agricultor' || perfilUsuario === 'produtor') {
         // Não vê nada de Admin
         if (route.layout === '/admin') return null;
      }

      //SE FOR ADMIN/GESTOR
      if (perfilUsuario === 'admin' || perfilUsuario === 'gestor') {
         // Não vê nada de Produtor
         if (route.layout === '/produtor') return null;
         
         if (route.path === '/minha-agenda') return null; 
      }

      //SE FOR TÉCNICO OU OPERADOR 
      if (perfilUsuario === 'tecnico' || perfilUsuario === 'operador') {
         //Não vê painel de produtor
         if (route.layout === '/produtor') return null;

         //Dentro do Admin, só vê Agenda e Perfil
         const rotasPermitidas = ['/minha-agenda', '/profile'];
         
         // Se for rota de admin E NÃO estiver na lista de permitidas, esconde.
         if (route.layout === '/admin' && !rotasPermitidas.includes(route.path)) {
            return null;
         }
      }
      // ---------------------------------------------------------

      if (route.category) {
        return (
          <React.Fragment key={index}>
            <Text
              fontSize={"md"}
              color={activeColor}
              fontWeight='bold'
              mx='auto'
              ps={{ sm: "10px", xl: "16px" }}
              pt='18px'
              pb='12px'>
              {route.name}
            </Text>
            {createLinks(route.items)}
          </React.Fragment>
        );
      } else if (
        route.layout === "/admin" ||
        route.layout === "/produtor" || 
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
                      color={activeRoute(route.path.toLowerCase()) ? activeIcon : textColor}
                      me='18px'>
                      {route.icon}
                    </Box>
                    <Text
                      me='auto'
                      color={activeRoute(route.path.toLowerCase()) ? activeColor : textColor}
                      fontWeight={activeRoute(route.path.toLowerCase()) ? "bold" : "normal"}>
                      {route.name}
                    </Text>
                  </Flex>
                  <Box
                    h='36px'
                    w='4px'
                    bg={activeRoute(route.path.toLowerCase()) ? brandColor : "transparent"}
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
                    color={activeRoute(route.path.toLowerCase()) ? activeColor : inactiveColor}
                    fontWeight={activeRoute(route.path.toLowerCase()) ? "bold" : "normal"}>
                    {route.name}
                  </Text>
                  <Box 
                    h='36px' 
                    w='4px' 
                    bg={activeRoute(route.path.toLowerCase()) ? brandColor : "transparent"}
                    borderRadius='5px' 
                  />
                </HStack>
              </Box>
            )}
          </NavLink>
        );
      }
      return null;
    });
  };

  return createLinks(routes);
}

export default SidebarLinks;