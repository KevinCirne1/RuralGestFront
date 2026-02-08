// src/views/produtor/MinhasSolicitacoes.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Spinner, useToast, Badge, Box
} from "@chakra-ui/react";
import Card from "components/card/Card.js";

import { useAuth } from "contexts/AuthContext";
import { getSolicitacoes } from "services/solicitacaoService";

export default function MinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const toast = useToast();

  const { authData } = useAuth();
  console.log("--- DEBUG 1: AuthData Bruto ---", authData);
  const userLogado = authData?.user;
  const agricultorLogado = authData?.agricultor; 

  const fetchPageData = useCallback(async () => {
    
    if (!userLogado) return;
    setLoading(true);
    try {

      const idUser = userLogado?.id;
      const idAgricultorNoUser = userLogado?.agricultor_id;
      const idAgricultorObjeto = agricultorLogado?.id;

      console.log("--- DEBUG 2: IDs Encontrados ---", {
        id_do_usuario_logado: idUser,
        agricultor_id_dentro_do_user: idAgricultorNoUser,
        id_do_objeto_agricultor: idAgricultorObjeto
      });
      // 1. Tenta descobrir o ID do Agricultor corretamente
      // Se no login você salvou o objeto 'agricultor', use ele.
      // Se salvou o ID dentro do user, use user.agricultor_id
      const idParaBuscar = agricultorLogado?.id || userLogado?.agricultor_id;

      if (!idParaBuscar) {
        console.error("ID do Agricultor não encontrado no AuthContext", authData);
        // Se não achou ID, não adianta buscar, vai vir vazio ou tudo
        setLoading(false);
        return;
      }
      console.log(`--- DEBUG 3: Buscando solicitações para Agricultor ID: ${idParaBuscar}`);

      // 2. Chama o Backend passando o filtro (MUDANÇA AQUI)
      // O Backend vai fazer o trabalho pesado e retornar só o que é desse ID
      const solicitacoesRes = await getSolicitacoes({ agricultor_id: idParaBuscar });

      console.log("--- DEBUG 4: Resposta do Backend ---", solicitacoesRes.data);
      
      const minhasSolicitacoes = solicitacoesRes.data;

      // 3. Apenas ordenamos (Backend não ordenou por data, então ordenamos aqui)
      minhasSolicitacoes.sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao));
      
      setSolicitacoes(minhasSolicitacoes);


    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast({ 
        title: "Erro ao buscar solicitações.", 
        description: "Verifique sua conexão com o servidor.",
        status: "error", 
        duration: 5000, 
        isClosable: true 
      });
    } finally {
      setLoading(false);
    }
  }, [authData, agricultorLogado, userLogado, toast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const getStatusBadge = (status) => {
    if (!status) return <Badge>N/A</Badge>;
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case 'APROVADA':
      case 'CONCLUÍDA':
        return <Badge colorScheme='green' variant="subtle"> {statusUpper} </Badge>;
      case 'RECUSADA':
      case 'CANCELADA':
        return <Badge colorScheme='red' variant="subtle"> {statusUpper} </Badge>;
      case 'PENDENTE':
        return <Badge colorScheme='yellow' variant="subtle"> {statusUpper} </Badge>;
      default:
        return <Badge colorScheme='blue' variant="subtle"> {statusUpper} </Badge>;
    }
  };

  if (loading) return (
    <Flex justify='center' align='center' height='50vh'>
      <Spinner size='xl' color="brand.500" thickness="4px" />
    </Flex>
  );

  return (
    <Flex direction="column" pt={{ base: "130px", md: "80px" }} align="center">
      <Card w="100%" maxW="container.xl" px="0px" pb="20px">
        <Flex px="25px" justify="space-between" mb="20px" align="center">
          <Heading as="h1" size="md" color={textColor}>
            Minhas Solicitações de Serviço
          </Heading>
        </Flex>

        <Box overflowX={{ sm: "scroll", lg: "hidden" }}>
          <Table variant='simple' color="gray.500" mb="24px">
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>Serviço</Th>
                <Th borderColor={borderColor}>Data Solicitação</Th>
                <Th borderColor={borderColor}>Previsão Execução</Th>
                <Th borderColor={borderColor}>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {solicitacoes.map((sol) => (
                <Tr key={sol.id}>
                  <Td fontWeight="700" color={textColor}>
                    {sol.servico?.nome_servico || 'Serviço Geral'}
                  </Td>
                  <Td>{formatDate(sol.data_solicitacao)}</Td>
                  <Td>{formatDate(sol.data_execucao)}</Td>
                  <Td>{getStatusBadge(sol.status)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {solicitacoes.length === 0 && (
          <Flex direction="column" align="center" mt={10}>
            <Text color="gray.400" fontSize="lg">Nenhum pedido encontrado.</Text>
            <Text color="gray.400" fontSize="sm">Suas novas solicitações aparecerão aqui.</Text>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}