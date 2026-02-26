import React, { useState, useEffect, useCallback } from "react";
import {
  Box, SimpleGrid, Text, Badge, Flex, Icon, Spinner, useToast, Button, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Textarea,
  useColorModeValue
} from "@chakra-ui/react";
import { MdAssignment, MdLocationOn, MdAccessTime, MdCheckCircle, MdChatBubbleOutline } from "react-icons/md";
import Card from "components/card/Card.js";
import api from "services/api";
import { format } from 'date-fns';

export default function MinhaAgenda() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null); 
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [obs, setObs] = useState("");
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  
  // --- DESIGN: CORES DINÂMICAS ---
  const cardBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  
  // Fundo das caixas (Transparência elegante no modo escuro)
  const boxBg = useColorModeValue("brand.50", "whiteAlpha.100");
  const boxReportBg = useColorModeValue("gray.50", "whiteAlpha.100");
  
  // --- AJUSTE DE BRILHO: Cores de texto mais claras no modo escuro ---
  const obsTextColor = useColorModeValue("brand.700", "gray.50"); // De gray.200 para gray.50
  const reportTextColor = useColorModeValue("gray.600", "white"); // De gray.300 para white

  const userId = localStorage.getItem('user_id'); 

  // --- FUNÇÃO DE DATA ---
  const formatarDataBR = (sol, tipo) => {
    let rawDate = null;
    if (tipo === 'pedido') {
      rawDate = sol.data_solicitacao || sol.created_at;
    } else {
      rawDate = sol.data_execucao || sol.updated_at;
    }

    if (!rawDate) return '---';

    try {
      if (typeof rawDate === 'string' && rawDate.length === 10 && rawDate.includes('-')) {
         const [ano, mes, dia] = rawDate.split('-');
         return `${dia}/${mes}/${ano}`;
      }
      const dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) return '---';
      return format(new Date(dateObj.valueOf() + dateObj.getTimezoneOffset() * 60000), 'dd/MM/yyyy');
    } catch (e) {
      return '---';
    }
  };

  const carregarAgenda = useCallback(async () => {
    if (!userId) {
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const res = await api.get('/solicitacoes');
      const minhasAtividades = res.data.filter(sol => {
        const idUser = String(userId);
        const isOperador = sol.operador_id && String(sol.operador_id) === idUser;
        const isVeiculo = sol.veiculo_id && String(sol.veiculo_id) === idUser;
        return isOperador || isVeiculo;
      });
      setTarefas(minhasAtividades);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao carregar agenda", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => { carregarAgenda(); }, [carregarAgenda]);

  const handleOpenConcluir = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setObs(""); 
    onOpen();
  };

  const handleConfirmarConclusao = async () => {
    if (!selectedSolicitacao) return;
    const dataSomenteDia = format(new Date(), 'yyyy-MM-dd');
    setLoadingId(selectedSolicitacao.id); 
    try {
      await api.put(`/solicitacoes/${selectedSolicitacao.id}`, {
        status: 'CONCLUÍDA',
        observacao_funcionario: obs,
        data_execucao: dataSomenteDia 
      });
      toast({ title: "Serviço concluído!", status: "success" });
      setTarefas(prev => prev.map(t => 
        t.id === selectedSolicitacao.id 
          ? { ...t, status: 'CONCLUÍDA', observacao_funcionario: obs, data_execucao: dataSomenteDia } 
          : t
      ));
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao finalizar.", status: "error" });
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' color="brand.500" /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex direction='column' mb='20px'>
        <Text fontSize='2xl' fontWeight='700' color={textColor}>Minhas Atividades - Pirpirituba</Text>
        <Text color='gray.500' fontSize='sm'>Confira os serviços atribuídos a você hoje.</Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap='20px'>
        {tarefas.length > 0 ? tarefas.map(sol => (
          <Card key={sol.id} p='20px' bg={cardBg}>
            <Flex justify='space-between' align='center' mb='15px'>
              <Badge 
                colorScheme={sol.status === 'CONCLUÍDA' ? 'green' : sol.status === 'EM ANDAMENTO' ? 'purple' : 'orange'}
                borderRadius='md' px={2} py={1}
              >
                {sol.status}
              </Badge>
              <Text fontSize='xs' color='gray.400' fontWeight='bold'>#{sol.id}</Text>
            </Flex>

            <Stack spacing={3}>
              <Text fontWeight='bold' fontSize='xl' color='brand.500'>
                {sol.servico?.nome_servico || "Serviço Geral"}
              </Text>
              
              <Flex align='center'>
                <Icon as={MdLocationOn} color='gray.400' mr='2' boxSize={5}/>
                <Text fontSize='sm'><b>Local:</b> {sol.propriedade?.terreno || "Não informado"}</Text>
              </Flex>
              
              <Flex align='center'>
                <Icon as={MdAssignment} color='gray.400' mr='2' boxSize={5}/>
                <Text fontSize='sm'><b>Agricultor:</b> {sol.agricultor?.nome}</Text>
              </Flex>
              
              <Flex align='center'>
                <Icon as={MdAccessTime} color='gray.400' mr='2' boxSize={5}/>
                <Text fontSize='sm'>
                  <b>Pedido em:</b> {formatarDataBR(sol, 'pedido')}
                </Text>
              </Flex>

              {sol.status === 'CONCLUÍDA' && (
                <Flex align='center' color="green.500">
                  <Icon as={MdCheckCircle} mr='2' boxSize={5}/>
                  <Text fontSize='sm'>
                    <b>Executado em:</b> {formatarDataBR(sol, 'execucao')}
                  </Text>
                </Flex>
              )}

              {sol.observacao && (
                <Box 
                  mt="1" p="2" borderRadius="md" borderLeft="3px solid" borderColor="brand.500"
                  bg={boxBg}
                >
                  <Text fontSize='xs' fontWeight="bold" color="brand.500" textTransform="uppercase">Pedido do Agricultor:</Text>
                  <Text fontSize='sm' color={obsTextColor} fontStyle="italic">"{sol.observacao}"</Text>
                </Box>
              )}
            </Stack>

            {sol.status === 'CONCLUÍDA' ? (
              <Box mt="4" pt="4" borderTop="1px solid" borderColor="whiteAlpha.200">
                <Text fontSize="sm" fontWeight="bold" color="green.500" mb="2">Serviço Finalizado</Text>
                {sol.observacao_funcionario && (
                  <Box 
                    p="3" borderRadius="md" borderLeft="4px solid" borderColor="green.400"
                    bg={boxReportBg}
                  >
                    <Text fontSize="xs" fontWeight="bold" color="gray.400">MEU RELATÓRIO:</Text>
                    <Text fontSize="sm" color={reportTextColor} fontStyle="italic">"{sol.observacao_funcionario}"</Text>
                  </Box>
                )}
              </Box>
            ) : (
              <Button 
                mt='20px' leftIcon={<MdCheckCircle />} colorScheme='green' width="100%"
                onClick={() => handleOpenConcluir(sol)} isLoading={loadingId === sol.id}
              >
                Concluir e Relatar
              </Button>
            )}
          </Card>
        )) : (
          <Flex direction="column" align="center" gridColumn="1 / -1" mt="10">
            <Text color='gray.500' fontSize="lg">Nenhum serviço atribuído a você.</Text>
          </Flex>
        )}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Finalizar Serviço #{selectedSolicitacao?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4} color="gray.600">Relatório de execução:</Text>
            <Textarea placeholder="Descreva o serviço realizado..." value={obs} onChange={(e) => setObs(e.target.value)} rows={5} />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme='green' onClick={handleConfirmarConclusao}>Confirmar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}