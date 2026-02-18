import React, { useState } from "react";
import { Portal, Box, useDisclosure } from "@chakra-ui/react";
import Footer from "components/footer/FooterAdmin.js";
import Navbar from "components/navbar/NavbarAdmin.js";
import Sidebar from "components/sidebar/Sidebar.js";
import { SidebarContext } from "contexts/SidebarContext";
import { Routes, Route, Navigate, useLocation } from "react-router-dom"; // Adicionado useLocation
import routes from "routes.js";

export default function ProdutorLayout(props) {
  const { ...rest } = props;
  const location = useLocation(); // Hook para pegar a URL atual com precisão
  
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { onOpen } = useDisclosure();

  // Filtrar rotas para a Sidebar (apenas o que é /produtor)
  const produtorRoutes = routes.filter(r => r.layout === "/produtor");

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/produtor") {
        return (
          <Route path={prop.path} element={<prop.component />} key={key} />
        );
      }
      return null;
    });
  };

  // NOVA FUNÇÃO: Identifica a rota ativa de forma precisa
  const getActiveRoute = (routes) => {
    // 1. Procuramos a rota que coincide exatamente com o caminho atual
    const activeRoute = routes.find(route => 
      location.pathname === route.layout + route.path
    );

    // 2. Se achou, retorna o nome. Se não (ex: tela inicial), retorna o padrão.
    return activeRoute ? activeRoute.name : "Painel do Produtor";
  };

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
                logoText={"RuralGest Produtor"}
                brandText={getActiveRoute(routes)} // Agora usa a função precisa
                secondary={false} // Mantemos false para evitar transparência
                message={""} // Vazio para evitar duplicidade
                fixed={fixed}
                {...rest}
              />
            </Box>
          </Portal>

          <Box mx='auto' p={{ base: "20px", md: "30px" }} pe='20px' minH='100vh' pt='50px'>
            <Routes>
              {getRoutes(routes)}
              {/* Redirecionamento padrão */}
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