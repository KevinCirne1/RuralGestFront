import React from 'react';
import { Box, Heading, Text, VStack, UnorderedList, ListItem, useColorModeValue } from '@chakra-ui/react';

export default function Politica() {
  const bg = useColorModeValue("white", "navy.700");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* TÍTULO DA PÁGINA */}
      <Box mb='20px' ms='10px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' lineHeight='100%'>
          Política de Privacidade
        </Text>
      </Box>

      <Box bg={bg} p={8} borderRadius="20px" shadow="sm">
        <VStack spacing={6} align="start">
          <Text color="gray.500" fontSize="sm">Última atualização: Fevereiro de 2026</Text>

          <Text textAlign="justify" color="gray.500">
            A sua privacidade é importante para nós. É política do RuralGest respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no sistema.
          </Text>

          <Heading size="md" mt={4} color={textColor}>1. Informações Coletadas</Heading>
          <Text textAlign="justify" color="gray.500">
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Coletamos dados como Nome, CPF, Endereço e Propriedade Rural por meios justos e legais.
          </Text>

          <Heading size="md" mt={4} color={textColor}>2. Uso de Dados</Heading>
          <UnorderedList spacing={2} pl={4} color="gray.500">
            <ListItem>Gerenciamento de solicitações de serviços de máquinas.</ListItem>
            <ListItem>Comunicação sobre o andamento dos serviços.</ListItem>
            <ListItem>Geração de relatórios gerenciais para a Secretaria de Agricultura.</ListItem>
          </UnorderedList>

          <Heading size="md" mt={4} color={textColor}>3. Segurança</Heading>
          <Text textAlign="justify" color="gray.500">
            O sistema utiliza criptografia de senha e tokens de autenticação para evitar acessos não autorizados. Armazenamos os dados apenas pelo tempo necessário para a execução do serviço.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}