import React from "react";
import { Box, Grid, Text, useColorModeValue, Avatar, Flex, Badge, Icon } from "@chakra-ui/react";
import { MdVerified, MdEmail, MdPerson } from "react-icons/md";
import Card from "components/card/Card"; 
import { useAuth } from "contexts/AuthContext"; 

export default function ProfileOverview() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const grayColor = useColorModeValue("gray.500", "gray.400");
  
  // Pega dados do usuário logado do Contexto
  const { authData } = useAuth();
  const user = authData?.user;

  // --- LÓGICA DE CARGOS CORRIGIDA ---
  
  // 1. Dicionário que traduz o código do banco para o nome na tela
  const mapaDeCargos = {
    'admin': 'Administrador',
    'produtor': 'Produtor Rural',
    'tecnico': 'Técnico Rural',
    'operador': 'Operador de Máquinas',
    'funcionario': 'Colaborador'
  };

  // 2. Pega o perfil do usuário e converte para minúsculo (para evitar erros se vier 'Admin' ou 'ADMIN')
  const perfilUsuario = user?.perfil ? user.perfil.toLowerCase() : '';

  // 3. Define o nome final. Se não achar no mapa, usa "Colaborador Rural" como padrão.
  const roleName = mapaDeCargos[perfilUsuario] || "Colaborador Rural";

  // Define a cor do banner (pode manter estático ou mudar baseado no cargo se quiser no futuro)
  const bannerColor = 'linear(to-b, brand.400, brand.600)';

  // ----------------------------------

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
                    src="" 
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
            
            {/* Nome do Usuário */}
            <Flex align="center" gap={2} mt="10px">
                <Text color={textColor} fontWeight='bold' fontSize='2xl'>
                {user?.nome || "Visitante"}
                </Text>
                <Icon as={MdVerified} color="blue.500" w={5} h={5} />
            </Flex>

            {/* Email */}
            <Flex align="center" gap={2} mb="15px">
                <Icon as={MdEmail} color="gray.400" />
                <Text color={grayColor} fontSize='md'>
                {user?.login || "email@exemplo.com"}
                </Text>
            </Flex>

            {/* Badge do Cargo (Agora Dinâmico) */}
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

            {/* Estatísticas */}
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