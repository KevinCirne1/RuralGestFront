// src/layouts/produtor/index.js

import React, { useState } from "react";
import { Portal, Box, useDisclosure } from "@chakra-ui/react";
import Footer from "components/footer/FooterAdmin.js";
// Navbar e Sidebar
import Navbar from "components/navbar/NavbarAdmin.js";
import Sidebar from "components/sidebar/Sidebar.js";
import { SidebarContext } from "contexts/SidebarContext";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes.js";

// Estilos
export default function ProdutorLayout(props) {
  const { ...rest } = props;
  
  // Estados para abrir/fechar sidebar no mobile
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  
  // Funções do Chakra UI
  const { onOpen } = useDisclosure();

  // --- O SEGREDO ESTÁ AQUI: Filtrar apenas rotas de /produtor ---
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      // Só renderiza se o layout for '/produtor'
      if (prop.layout === "/produtor") {
        return (
          <Route path={`/${prop.path}`} element={<prop.component />} key={key} />
        );
      }
      return null;
    });
  };

  // Título da página dinâmica (opcional)
  const getActiveRoute = (routes) => {
    let activeRoute = "Painel do Produtor";
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return activeRoute;
  };

  // Texto da Navbar
  const getActiveNavbarText = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return activeNavbar;
  };

  // Filtrar rotas para a Sidebar (para não aparecer menu de admin)
  const produtorRoutes = routes.filter(r => r.layout === "/produtor");

  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}>
        
        {/* SIDEBAR COM ROTAS FILTRADAS */}
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
                logoText={"RuralGest Produtor"}
                brandText={getActiveRoute(routes)}
                secondary={getActiveNavbarText(routes)}
                message={getActiveNavbarText(routes)}
                fixed={fixed}
                {...rest}
              />
            </Box>
          </Portal>

          {/* CONTEÚDO DA PÁGINA */}
          <Box mx='auto' p={{ base: "20px", md: "30px" }} pe='20px' minH='100vh' pt='50px'>
            <Routes>
              {getRoutes(routes)}
              {/* Se tentar acessar /produtor puro, joga para dashboard */}
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