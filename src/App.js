import React, { useState } from "react";
import { Portal, Box, useDisclosure } from "@chakra-ui/react";
import Footer from "components/footer/FooterAdmin.js";
import Navbar from "components/navbar/NavbarAdmin.js";
import Sidebar from "components/sidebar/Sidebar.js";
import { SidebarContext } from "contexts/SidebarContext";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes.js";
import { useAuth } from "contexts/AuthContext";

export default function ProdutorLayout(props) {
  const { ...rest } = props;
  
  // Estados para controle do layout
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { onOpen } = useDisclosure();

  //RECUPERA O PERFIL DO USUÁRIO LOGADO
  const { authData } = useAuth();
  const userProfile = authData?.user?.perfil?.toLowerCase(); 

  //LÓGICA DE ROTAS
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      // Verifica se a rota pertence a este layout
      if (prop.layout === "/produtor") {

        if (prop.roles && !prop.roles.includes(userProfile)) {
            return null;
        }

        return (
          <Route path={`/${prop.path}`} element={<prop.component />} key={key} />
        );
      }
      return null;
    });
  };

  const getActiveRoute = (routes) => {
    let activeRoute = "Painel do Produtor";
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return activeRoute;
  };

  const getActiveNavbarText = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return activeNavbar;
  };

  const produtorRoutes = routes.filter(r => 
      r.layout === "/produtor" && 
      (!r.roles || r.roles.includes(userProfile))
  );

  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}>
        
        <Sidebar routes={produtorRoutes} display='none' {...rest} />
        
        <Box
          float='right'
          minHeight='100vh'
          height='100%'
          overflow='auto'
          position='relative'
          maxHeight='100%'
          w={{ base: "100%", xl: "calc( 100% - 290px )" }}
          maxWidth={{ base: "100%", xl: "calc( 100% - 290px )" }}
          transition='all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)'
          transitionDuration='.2s, .2s, .35s'
          transitionProperty='top, bottom, width'
          transitionTimingFunction='linear, linear, ease'>
          
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                logoText={"RuralGest"}
                brandText={getActiveRoute(routes)}
                secondary={getActiveNavbarText(routes)}
                message={getActiveNavbarText(routes)}
                fixed={fixed}
                {...rest}
              />
            </Box>
          </Portal>

          <Box mx='auto' p={{ base: "20px", md: "30px" }} pe='20px' minH='100vh' pt='50px'>
            <Routes>
              {getRoutes(routes)}
              <Route path="/" element={<Navigate to="/produtor/dashboard" replace />} />
            </Routes>
          </Box>
          
          <Box>
            <Footer />
          </Box>
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}