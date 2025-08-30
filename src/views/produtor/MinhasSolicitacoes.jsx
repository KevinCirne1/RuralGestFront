// src/views/produtor/MinhasSolicitacoes.jsx

import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Spinner, useToast, Badge
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import axios from 'axios';

const API_URL = "http://localhost:5000";
const currentProducerId = 1;

export default function MinhasSolicitacoes() {
  // AQUI ESTAVA O ERRO, AGORA CORRIGIDO
  // CORREÇÃO ✅
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  useEffect(() => {
    // Usando a rota correta para a API Falsa
    axios.get(`${API_URL}/requests?farmerId=${currentProducerId}&_expand=service`)
    .then(response => {
        setSolicitacoes(response.data);
      })
    .catch(error => {
        toast({ title: "Erro ao buscar solicitações.", status: "error", duration: 5000, isClosable: true });
      })
    .finally(() => { setLoading(false); });
  }, [toast]); // Adicionando toast como dependência para o linter

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
  }

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
                {solicitacoes.map((sol) => (
                <Tr key={sol.id}>
                    <Td>{sol.service?.nome_servico}</Td>
                    <Td>{formatDate(sol.data_solicitacao)}</Td>
                    <Td>{formatDate(sol.data_execucao)}</Td>
                    <Td>{getStatusBadge(sol.status)}</Td>
                </Tr>
                ))}
            </Tbody>
            </Table>
            {solicitacoes.length === 0 && (
                <Text mt={6} textAlign="center" color="gray.500">
                    Você ainda não fez nenhuma solicitação.
                </Text>
            )}
        </Card>
    </Flex>
  );
}