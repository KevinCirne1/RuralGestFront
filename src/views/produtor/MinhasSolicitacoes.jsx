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
  const userLogado = authData?.user;
  const agricultorLogado = authData?.agricultor; 

  const fetchPageData = useCallback(async () => {
    if (!userLogado) return;
    setLoading(true);
    try {
      // Prioriza o ID do agricultor vindo do objeto ou da claim do usuário
      const idParaBuscar = agricultorLogado?.id || userLogado?.agricultor_id;

      if (!idParaBuscar) {
        setLoading(false);
        return;
      }

      const solicitacoesRes = await getSolicitacoes({ agricultor_id: idParaBuscar });
      const minhasSolicitacoes = solicitacoesRes.data;

      // Ordena por data de solicitação (mais recente primeiro)
      minhasSolicitacoes.sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao));
      
      setSolicitacoes(minhasSolicitacoes);

    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast({ 
        title: "Erro ao buscar solicitações.", 
        status: "error", duration: 5000, isClosable: true 
      });
    } finally {
      setLoading(false);
    }
  }, [authData, agricultorLogado, userLogado, toast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // Auxiliar para formatar a data no padrão brasileiro
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // Define o estilo visual do Badge baseado no status
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
      case 'EM ANDAMENTO':
        return <Badge colorScheme='blue' variant="subtle"> {statusUpper} </Badge>;
      default:
        return <Badge colorScheme='gray' variant="subtle"> {statusUpper} </Badge>;
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
                <Th borderColor={borderColor}>Data Execução</Th>
                <Th borderColor={borderColor}>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {solicitacoes.map((sol) => (
                <Tr key={sol.id}>
                  <Td fontWeight="700" color={textColor}>
                    {sol.servico?.nome_servico || sol.servico_nome || 'Serviço Geral'}
                  </Td>
                  <Td>{formatDate(sol.data_solicitacao)}</Td>
                  {/* Campo que será preenchido após o Admin concluir o serviço */}
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
            <Text color="gray.400" fontSize="sm">Suas novas solicitações aparecerão aqui após o cadastro.</Text>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}