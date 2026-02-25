import React from 'react';
import { Box, SimpleGrid, Icon, Text, Heading, VStack, useColorModeValue } from '@chakra-ui/react';
import { FaReact, FaPython, FaDocker, FaDatabase } from 'react-icons/fa';

export default function Sobre() {
  const bg = useColorModeValue("white", "navy.700");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* TÍTULO DA PÁGINA */}
      <Box mb='20px' ms='10px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' lineHeight='100%'>
          Sobre o Projeto
        </Text>
      </Box>

      <Box bg={bg} p={8} borderRadius="20px" shadow="sm">
        <VStack spacing={8} align="start">
          <Box>
            <Text fontSize="md" color="gray.500" textAlign="justify">
              O RuralGest é uma plataforma web desenvolvida para modernizar a gestão de serviços agrícolas no município de Pirpirituba-PB. 
              O sistema visa centralizar solicitações, controlar a execução de serviços com máquinas (tratores) e fornecer dados estratégicos 
              para a Secretaria de Agricultura.
            </Text>
          </Box>

          <Box w="100%">
            <Heading size="md" color={textColor} mb={4}>Contexto Acadêmico</Heading>
            <Text color="gray.500">
              Este software foi desenvolvido como Trabalho de Conclusão de Curso (TCC) para obtenção do grau de Bacharel em Sistemas de Informação.
              O projeto une engenharia de software aplicada à resolução de problemas reais do setor público.
            </Text>
          </Box>

          <Box w="100%">
            <Heading size="md" color={textColor} mb={6}>Tecnologias Utilizadas</Heading>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
              {[
                { icon: FaReact, title: "ReactJS", desc: "Front-end Dinâmico", color: "blue.400" },
                { icon: FaPython, title: "Python/Flask", desc: "API Robusta", color: "yellow.500" },
                { icon: FaDatabase, title: "PostgreSQL", desc: "Banco de Dados", color: "blue.600" },
                { icon: FaDocker, title: "Docker", desc: "Infraestrutura", color: "cyan.500" }
              ].map((tech, index) => (
                <Box key={index} p={5} borderWidth="1px" borderRadius="lg" textAlign="center" _hover={{ bg: "gray.50" }}>
                  <Icon as={tech.icon} w={8} h={8} color={tech.color} />
                  <Text mt={2} fontWeight="bold" color={textColor}>{tech.title}</Text>
                  <Text fontSize="sm" color="gray.500">{tech.desc}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Box pt={10} borderTopWidth={1} borderColor="gray.100" w="100%">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Desenvolvido por Kevin Cirne & Matheus Serafim © 2026.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}