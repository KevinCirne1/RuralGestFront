import { Flex, useColorModeValue, Text } from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";
import React from "react";

export function SidebarBrand() {
  // Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align='center' direction='column'>
      {/* Você pode substituir este componente por uma tag <Image> com o seu logo */}
      <Text fontSize="2xl" fontWeight="bold" color={logoColor} my='32px'>
        Gestão Rural
      </Text>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;