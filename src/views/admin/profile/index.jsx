import React from "react";
import { Box, Grid, Text, useColorModeValue, Avatar, Flex, Badge, Icon } from "@chakra-ui/react";
import { MdVerified, MdEmail, MdPerson } from "react-icons/md";
import Card from "components/card/Card"; 
import { useAuth } from "contexts/AuthContext"; 

export default function ProfileOverview() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const grayColor = useColorModeValue("gray.500", "gray.400");
  
  const { authData } = useAuth();
  const user = authData?.user;

  // --- LÓGICA DE CARGOS ROBUSTA ---
  const mapaDeCargos = {
    'admin': 'Administrador',
    'administrador': 'Administrador',
    'produtor': 'Produtor Rural',
    'tecnico': 'Técnico Rural',
    'operador': 'Operador de Máquinas',
    'funcionario': 'Colaborador'
  };

  // Limpa o texto: minúsculo e sem espaços extras
  const perfilUsuario = user?.perfil ? user.perfil.toLowerCase().trim() : '';
  
  // Fallback: Se não achar no mapa, tenta usar o valor bruto do banco antes de ir para o padrão
  const roleName = mapaDeCargos[perfilUsuario] || user?.perfil || "Colaborador Rural";

  const bannerColor = 'linear(to-b, brand.400, brand.600)';

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={{ base: "20px", xl: "20px" }}>
        <Card mb={{ base: "0px", lg: "20px" }} align='center'>
          <Box
            bgGradient={bannerColor}
            h='130px'
            w='100%'
            borderRadius='20px 20px 0 0'
            mb='60px'
            position='relative'
          >
            <Flex justify="center">
                <Avatar
                    name={user?.nome || "Usuário"}
                    h='120px'
                    w='120px'
                    border='5px solid white'
                    position='absolute'
                    bottom='-60px'
                    bg="brand.500"
                    color="white"
                    fontSize="50px"
                    fontWeight="bold"
                />
            </Flex>
          </Box>

          <Flex direction='column' align='center' p='20px'>
            <Flex align="center" gap={2} mt="10px">
                <Text color={textColor} fontWeight='bold' fontSize='2xl'>
                {user?.nome || "Visitante"}
                </Text>
                <Icon as={MdVerified} color="blue.500" w={5} h={5} />
            </Flex>

            <Flex align="center" gap={2} mb="15px">
                <Icon as={MdEmail} color="gray.400" />
                <Text color={grayColor} fontSize='md'>
                {user?.login || "email@exemplo.com"}
                </Text>
            </Flex>

            <Badge 
                colorScheme="brand" 
                fontSize="1em" 
                borderRadius="full" 
                px="20px" 
                py="5px"
                mb="30px"
                textTransform="uppercase"
                variant="solid"
            >
                {roleName}
            </Badge>

            <Grid templateColumns="repeat(3, 1fr)" gap={10} w="80%" borderTop="1px solid" borderColor="gray.100" pt="30px" pb="10px">
                <Flex direction="column" align="center">
                    <Text fontWeight="bold" fontSize="2xl" color={textColor}>BR</Text>
                    <Text fontSize="sm" color={grayColor}>País</Text>
                </Flex>
                <Flex direction="column" align="center">
                    <Icon as={MdPerson} w="30px" h="30px" color={textColor} mb="5px"/>
                    <Text fontSize="sm" color={grayColor}>Perfil Ativo</Text>
                </Flex>
                <Flex direction="column" align="center">
                    <Text fontWeight="bold" fontSize="2xl" color={textColor}>2026</Text>
                    <Text fontSize="sm" color={grayColor}>Membro desde</Text>
                </Flex>
            </Grid>
          </Flex>
        </Card>
      </Grid>
    </Box>
  );
}