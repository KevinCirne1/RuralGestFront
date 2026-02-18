import React from "react";
// 1. Adicionamos o useColorModeValue nos imports
import { Flex, Button, Heading, Text, Stack, useColorModeValue } from "@chakra-ui/react";

export default function LandingPage() {
  // 2. Definimos as cores dinâmicas
  // Fundo: Cinza claro no modo Light | Azul escuro (navy.900) no modo Dark
  const bg = useColorModeValue("gray.100", "navy.900");
  // Título: Azul escuro no modo Light | Branco no modo Dark
  const mainColor = useColorModeValue("gray.800", "white");
  // Subtítulo: Cinza médio no modo Light | Cinza claro no modo Dark
  const subColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100vh"
      bg={bg} // 3. Aplicamos a cor de fundo dinâmica aqui
    >
      <Stack spacing={4} maxW={"3xl"} textAlign="center">
        <Heading 
          fontSize={"4xl"} 
          fontWeight={700} 
          color={mainColor} // 4. Cor do título dinâmica
        >
          Sistema de Gestão Rural – Pirpirituba
        </Heading>
        
        <Text 
          color={subColor} // 5. Cor do texto secundário dinâmica
          fontSize={"xl"}
        >
          Aproximando agricultores e a secretaria, facilitando a solicitação
          e execução de serviços de forma moderna e eficiente.
        </Text>
        
        <Stack spacing={6} direction={"row"} justify="center">
          <Button
            as="a"
            href="/#/auth/sign-in"
            rounded={"full"}
            px={6}
            colorScheme={"brand"}
            bg={"brand.400"}
            _hover={{ bg: "brand.500" }}
          >
            Acessar o Sistema
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
}