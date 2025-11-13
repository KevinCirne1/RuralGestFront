import React from "react";
import {
  Flex,
  Link,
  Text,
  useColorModeValue,
  Stack, // Importamos o Stack
} from "@chakra-ui/react";

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
      {/* BLOCO 1: COPYRIGHT E ATRIBUIÇÃO */}
      <Text
        color={textColor}
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", xl: "0px" }}
      >
        © {new Date().getFullYear()} Sistema de Gestão Rural – Pirpirituba.
        <Text as='span' fontWeight='500' ms='4px'>
          Desenvolvido com base no template Horizon UI Chakra.
        </Text>
      </Text>
      
      {/* BLOCO 2: LINKS USANDO STACK */}
      <Stack
        direction={{ base: 'column', lg: 'row' }} // FORÇA a direção coluna em telas pequenas
        spacing={{ base: '10px', lg: '44px' }}     // Controla o espaçamento entre os links
        alignItems="center"                        // Centraliza os links em telas pequenas
      >
        {/* Usamos <Link> diretamente no Stack */}
        <Link fontWeight='500' color={textColor} href='#/contato'>
          Contato
        </Link>
        <Link fontWeight='500' color={textColor} href='#/sobre-o-projeto'>
          Sobre o Projeto
        </Link>
        <Link fontWeight='500' color={textColor} href='#/politica-de-privacidade'>
          Política de Privacidade
        </Link>
      </Stack>
    </Flex>
  );
}