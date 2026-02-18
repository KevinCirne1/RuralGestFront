import React, { useState, useEffect, useCallback } from "react";
import {
  Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Spinner, useToast, Badge, Box, IconButton, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, useDisclosure, FormControl, FormLabel, Select, Textarea // Textarea adicionado
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdInfoOutline } from "react-icons/md"; 
import Card from "components/card/Card.js";
import { useAuth } from "contexts/AuthContext";
import { getSolicitacoes } from "services/solicitacaoService";
import api from "services/api"; 

export default function MinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const deleteModal = useDisclosure();
  const editModal = useDisclosure();
  
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);

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
      const idParaBuscar = agricultorLogado?.id || userLogado?.agricultor_id;
      if (!idParaBuscar) return;

      const [solRes, servRes] = await Promise.all([
        getSolicitacoes({ agricultor_id: idParaBuscar }),
        api.get('/servicos')
      ]);

      setSolicitacoes(solRes.data.sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao)));
      setServicosDisponiveis(servRes.data);
    } catch (error) {
      toast({ title: "Erro ao buscar dados.", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [authData, agricultorLogado, userLogado, toast]);

  useEffect(() => { fetchPageData(); }, [fetchPageData]);

  const handleSalvarEdicao = async () => {
    setSubmitting(true);
    try {
        // Envia o serviço e a observação
        await api.put(`/solicitacoes/${solicitacaoSelecionada.id}`, {
            servico_id: solicitacaoSelecionada.servico_id,
            observacao: solicitacaoSelecionada.observacao // <--- Enviando a observação
        });
        toast({ title: "Solicitação atualizada!", status: "success" });
        editModal.onClose();
        fetchPageData();
    } catch (error) {
        toast({ title: "Erro ao atualizar.", status: "error" });
    } finally {
        setSubmitting(false);
    }
  };

  const handleCancelarSolicitacao = async () => {
    try {
        await api.delete(`/solicitacoes/${solicitacaoSelecionada.id}`);
        toast({ title: "Solicitação cancelada.", status: "success" });
        deleteModal.onClose();
        fetchPageData();
    } catch (error) {
        toast({ title: "Erro ao cancelar.", status: "error" });
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : "---";
  
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    const colors = { PENDENTE: 'yellow', CONCLUÍDA: 'green', APROVADA: 'green', RECUSADA: 'red', CANCELADA: 'red', 'EM ANDAMENTO': 'blue' };
    return <Badge colorScheme={colors[s] || 'gray'} variant="subtle">{s}</Badge>;
  };

  if (loading) return <Flex justify='center' align='center' height='50vh'><Spinner size='xl' color="brand.500" /></Flex>;

  return (
    <Flex direction="column" pt={{ base: "130px", md: "80px" }} align="center">
      <Card w="100%" maxW="container.xl" px="0px" pb="20px">
        <Flex px="25px" justify="space-between" mb="20px" align="center">
          <Heading as="h1" size="md" color={textColor}>Minhas Solicitações de Serviço</Heading>
        </Flex>

        <Box overflowX={{ sm: "scroll", lg: "hidden" }}>
          <Table variant='simple' color="gray.500" mb="24px">
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>Serviço</Th>
                <Th borderColor={borderColor}>Data Solicitação</Th>
                <Th borderColor={borderColor}>Data Execução</Th>
                <Th borderColor={borderColor}>Status</Th>
                <Th borderColor={borderColor} textAlign="center">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {solicitacoes.map((sol) => (
                <Tr key={sol.id}>
                  <Td fontWeight="700" color={textColor}>
                    <Box>
                      <Text>{sol.servico?.nome_servico || 'Serviço'}</Text>
                      {/* Exibe uma prévia da observação se houver */}
                      {sol.observacao && (
                        <Text fontSize="xs" color="gray.400" fontWeight="400" noOfLines={1}>
                          Obs: {sol.observacao}
                        </Text>
                      )}
                    </Box>
                  </Td>
                  <Td>{formatDate(sol.data_solicitacao)}</Td>
                  <Td>{formatDate(sol.data_execucao)}</Td>
                  <Td>{getStatusBadge(sol.status)}</Td>
                  <Td borderColor={borderColor} textAlign="center">
                    {sol.status === 'PENDENTE' ? (
                        <Flex justify="center" gap="10px">
                            <Tooltip label="Editar Pedido">
                                <IconButton icon={<MdEdit />} colorScheme="brand" size="sm" isRound 
                                    onClick={() => { setSolicitacaoSelecionada(sol); editModal.onOpen(); }} />
                            </Tooltip>
                            <Tooltip label="Cancelar Pedido">
                                <IconButton icon={<MdDelete />} colorScheme="red" size="sm" isRound 
                                    onClick={() => { setSolicitacaoSelecionada(sol); deleteModal.onOpen(); }} />
                            </Tooltip>
                        </Flex>
                    ) : (
                        <Flex justify="center">
                            <Tooltip label="Pedidos em andamento ou concluídos não podem ser alterados">
                                <Text fontSize="xs" color="gray.400" fontStyle="italic" cursor="help">
                                    <Box as="span" mr={1}><MdInfoOutline style={{display:'inline'}} /></Box>Bloqueado
                                </Text>
                            </Tooltip>
                        </Flex>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* --- MODAL DE EDIÇÃO COM CAMPO DE OBSERVAÇÃO --- */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Solicitação</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Tipo de Serviço</FormLabel>
              <Select 
                value={solicitacaoSelecionada?.servico_id}
                onChange={(e) => setSolicitacaoSelecionada({...solicitacaoSelecionada, servico_id: e.target.value})}
              >
                {servicosDisponiveis.map(s => (
                  <option key={s.id} value={s.id}>{s.nome_servico}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Observações / Detalhes</FormLabel>
              <Textarea 
                placeholder="Ex: Informar localização exata, urgência ou detalhes do terreno..."
                value={solicitacaoSelecionada?.observacao || ""}
                onChange={(e) => setSolicitacaoSelecionada({...solicitacaoSelecionada, observacao: e.target.value})}
              />
            </FormControl>

            <Text mt={4} fontSize="xs" color="gray.500">
              Esses detalhes ajudam a equipe da secretaria a planejar melhor o atendimento.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={editModal.onClose}>Voltar</Button>
            <Button colorScheme="brand" isLoading={submitting} onClick={handleSalvarEdicao}>Salvar Alteração</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- MODAL DE CANCELAMENTO --- */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Cancelar Pedido</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                Deseja realmente cancelar sua solicitação de <strong>{solicitacaoSelecionada?.servico?.nome_servico}</strong>?
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>Voltar</Button>
                <Button colorScheme="red" onClick={handleCancelarSolicitacao}>Confirmar Cancelamento</Button>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}