import React from "react";
import {
  Flex,
  Link,
  Text,
  useColorModeValue,
  Stack, 
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
      {/*COPYRIGHT E ATRIBUIÇÃO */}
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
      
      <Stack
        direction={{ base: 'column', lg: 'row' }} 
        spacing={{ base: '10px', lg: '44px' }}     
        alignItems="center"                        
      >

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