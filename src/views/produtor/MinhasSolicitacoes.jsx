// src/views/produtor/MinhasSolicitacoes.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Spinner, useToast, Badge
} from "@chakra-ui/react";
import Card from "components/card/Card.js";

import { useAuth } from "contexts/AuthContext";
import { getSolicitacoes } from "services/solicitacaoService";

export default function MinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const { authData } = useAuth();
  const agricultorLogado = authData?.user;

  const fetchPageData = useCallback(async () => {
    if (!agricultorLogado) return;
    setLoading(true);
    try {
      const solicitacoesRes = await getSolicitacoes();
      
      // Filtragem: garante que só apareçam as solicitações deste usuário
      const minhasSolicitacoes = solicitacoesRes.data.filter(
        sol => sol.agricultor && sol.agricultor.id === agricultorLogado.id
      );
      
      setSolicitacoes(minhasSolicitacoes);

    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao buscar solicitações.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [agricultorLogado, toast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // --- AQUI ESTÁ A MÁGICA DAS CORES ---
  const getStatusBadge = (status) => {
    if (!status) return <Badge>N/A</Badge>;

    const statusUpper = status.toUpperCase(); // Garante que "aprovada" vire "APROVADA"

    switch (statusUpper) {
      case 'APROVADA':
      case 'CONCLUÍDO':
        return (
            <Badge colorScheme='green' p="5px" borderRadius="8px" variant="subtle">
                {status}
            </Badge>
        );
      case 'RECUSADA':
      case 'CANCELADA':
        return (
            <Badge colorScheme='red' p="5px" borderRadius="8px" variant="subtle">
                {status}
            </Badge>
        );
      case 'PENDENTE':
      case 'EM ANDAMENTO':
      default:
        return (
            <Badge colorScheme='yellow' p="5px" borderRadius="8px" variant="subtle">
                {status}
            </Badge>
        );
    }
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Flex direction="column" align="center" pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card w="100%" maxW="container.lg">
        <Heading as="h1" size="lg" mb={6} color={textColor}>
          Minhas Solicitações de Serviço
        </Heading>
        <Table variant='simple' size='md'>
          <Thead>
            <Tr>
              <Th>Serviço</Th>
              <Th>Data da Solicitação</Th>
              <Th>Data da Execução</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {solicitacoes.map((sol) => {
              return (
                <Tr key={sol.id}>
                  <Td fontWeight="bold">
                    {sol.servico ? sol.servico.nome_servico : 'Serviço não identificado'}
                  </Td>
                  <Td>{formatDate(sol.data_solicitacao)}</Td>
                  <Td>{formatDate(sol.data_execucao)}</Td>
                  <Td>{getStatusBadge(sol.status)}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        {solicitacoes.length === 0 && !loading && (
          <Text mt={6} textAlign="center" color="gray.500">
            Você ainda não fez nenhuma solicitação.
          </Text>
        )}
      </Card>
    </Flex>
  );
}