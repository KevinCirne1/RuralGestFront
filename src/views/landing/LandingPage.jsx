// src/views/landing/LandingPage.jsx

import React from "react";
import { Box, Flex, Button, Heading, Text, Stack } from "@chakra-ui/react";

export default function LandingPage() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100vh"
      bg="gray.100"
    >
      <Stack spacing={4} maxW={"3xl"} textAlign="center">
        <Heading fontSize={"4xl"} fontWeight={700}>
          Sistema de Gestão Rural – Pirpirituba
        </Heading>
        <Text color={"gray.600"} fontSize={"xl"}>
          Aproximando agricultores e a secretaria, facilitando a solicitação
          e execução de serviços de forma moderna e eficiente.
        </Text>
        <Stack spacing={6} direction={"row"} justify="center">
          {/* */}
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