import React from 'react';
import { 
  Box, 
  SimpleGrid, 
  VStack, 
  HStack, 
  Icon, 
  Text, 
  useColorModeValue 
} from '@chakra-ui/react';
import { FaPhone, FaEnvelope, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

export default function Contato() {
  const bg = useColorModeValue("white", "navy.700");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("brand.500", "white");

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* TÍTULO IGUAL AO PRINT */}
      <Box mb='20px' ms='10px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' lineHeight='100%'>
          Fale Conosco
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        
        {/* COLUNA DA ESQUERDA - EXATAMENTE COMO NO SEU CÓDIGO */}
        <Box>
          <Text fontSize="lg" color="gray.500" mb={8}>
            Tem alguma dúvida técnica ou sobre o projeto? Entre em contato diretamente com os desenvolvedores.
          </Text>
          
          <VStack align="start" spacing={10}>
            {/* KEVIN - NOME MAIOR CONFORME PEDIDO */}
            <Box w="100%">
              <HStack mb={3} spacing={3}>
                <Icon as={FaUser} color={iconColor} w={5} h={5} />
                <Text fontWeight="bold" color={textColor} fontSize="2xl"> {/* Alterado para 2xl */}
                  Kevin Cirne
                </Text>
              </HStack>
              <VStack align="start" spacing={3} pl={8}>
                <HStack>
                  <Icon as={FaPhone} color="gray.400" w={4} h={4} />
                  <Text color="gray.500" fontSize="md">+55 83 9368-4851</Text>
                </HStack>
                <HStack>
                  <Icon as={FaEnvelope} color="gray.400" w={4} h={4} />
                  <Text color="gray.500" fontSize="md">kevincirne1@gmail.com</Text>
                </HStack>
              </VStack>
            </Box>

            {/* MATHEUS - NOME MAIOR CONFORME PEDIDO */}
            <Box w="100%">
              <HStack mb={3} spacing={3}>
                <Icon as={FaUser} color={iconColor} w={5} h={5} />
                <Text fontWeight="bold" color={textColor} fontSize="2xl"> {/* Alterado para 2xl */}
                  Matheus Serafim
                </Text>
              </HStack>
              <VStack align="start" spacing={3} pl={8}>
                <HStack>
                  <Icon as={FaPhone} color="gray.400" w={4} h={4} />
                  <Text color="gray.500" fontSize="md">+55 83 8664-5843</Text>
                </HStack>
                <HStack>
                  <Icon as={FaEnvelope} color="gray.400" w={4} h={4} />
                  <Text color="gray.500" fontSize="md">matheusdev41@gmail.com</Text>
                </HStack>
              </VStack>
            </Box>

            <HStack spacing={3} pt={4}>
              <Icon as={FaMapMarkerAlt} color={iconColor} w={5} h={5} />
              <Text color="gray.500" fontSize="md">Secretaria de Agricultura – Pirpirituba, PB</Text>
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}