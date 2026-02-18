import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export default function DefaultCard(props) {
  const { title, value } = props;
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Box p='20px' bg='white' _dark={{ bg: 'navy.700' }} borderRadius='20px' boxShadow='md'>
      <Flex direction='column'>
        <Text fontSize='sm' color='gray.400' fontWeight='normal'>
          {title}
        </Text>
        <Text fontSize='3xl' color={textColor} fontWeight='bold'>
          {value}
        </Text>
      </Flex>
    </Box>
  );
}