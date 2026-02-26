import React from "react";
import {
  Flex,
  Link,
  Text,
  useColorModeValue,
  Stack, 
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom"; // <--- IMPORTANTE: Importar isso!

export default function Footer() {
  const textColor = useColorModeValue("gray.400", "white");

  return (
    <Flex
      zIndex='3'
      flexDirection={{
        base: "column",
        xl: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent='space-between'
      px={{ base: "30px", md: "50px" }}
      pb='30px'
    >
      {/* COPY E ATRIBUIÇÃO */}
      <Text
        color={textColor}
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", xl: "0px" }}
      >
        &copy; {new Date().getFullYear()} Sistema de Gestão Rural – Pirpirituba.
        <Text as='span' fontWeight='500' ms='4px'>
          Desenvolvido com base no template Horizon UI Chakra.
        </Text>
      </Text>
      
      <Stack
        direction={{ base: 'column', lg: 'row' }} 
        spacing={{ base: '10px', lg: '44px' }}     
        alignItems="center"                        
      >
        {/* LINK 1: CONTATO */}
        <Link 
          as={RouterLink}             // Usa o RouterLink para não recarregar a página
          to='/admin/contato'         // Caminho exato definido no AdminLayout
          fontWeight='500' 
          color={textColor}
        >
          Contato
        </Link>

        {/* LINK 2: SOBRE */}
        <Link 
          as={RouterLink} 
          to='/admin/sobre'           // Caminho exato (note que não é 'sobre-o-projeto')
          fontWeight='500' 
          color={textColor}
        >
          Sobre o Projeto
        </Link>

        {/* LINK 3: POLÍTICA */}
        <Link 
          as={RouterLink} 
          to='/admin/politica'        // Caminho exato
          fontWeight='500' 
          color={textColor}
        >
          Política de Privacidade
        </Link>
      </Stack>
    </Flex>
  );
}