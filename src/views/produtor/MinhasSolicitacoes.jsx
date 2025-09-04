// src/views/produtor/MinhasSolicitacoes.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Spinner, useToast, Badge, Box
} from "@chakra-ui/react";
import Card from "components/card/Card.js";


import { useAuth } from "contexts/AuthContext";
import { getSolicitacoes } from "services/solicitacaoService";
import { getServicos } from "services/servicoService"; 

export default function MinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [servicos, setServicos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  
  const { authData } = useAuth();
  const agricultorLogado = authData?.user;

  
  const fetchPageData = useCallback(async () => {
    if (!agricultorLogado) return;
    setLoading(true);
    try {
      // Fazemos as duas chamadas em paralelo
      const [solicitacoesRes, servicosRes] = await Promise.all([
        getSolicitacoes(),
        getServicos()
      ]);
      
      
      const minhasSolicitacoes = solicitacoesRes.data.filter(sol => sol.agricultor_id === agricultorLogado.id);
      
      setSolicitacoes(minhasSolicitacoes);
      setServicos(servicosRes.data); 

    } catch (error) {
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
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendente':
        return <Badge colorScheme='yellow'>{status}</Badge>;
      case 'Concluído':
        return <Badge colorScheme='green'>{status}</Badge>;
      case 'Em Andamento':
        return <Badge colorScheme='blue'>{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              // <<< MUDANÇA 4: Lógica para encontrar o nome do serviço >>>
              const servicoInfo = servicos.find(s => s.id === sol.servico_id);
              
              return (
                <Tr key={sol.id}>
                  <Td>{servicoInfo ? servicoInfo.nome_servico : 'Serviço não encontrado'}</Td>
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