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
  
  const cardBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  // Pega o ID do motorista/técnico que logou
  const userId = localStorage.getItem('user_id'); 

  // --- FUNÇÃO SEGURA PARA FORMATAR DATA ---
  // Isso impede o erro "RangeError: Invalid time value"
  const formatarData = (dataISO) => {
    if (!dataISO) return 'A definir'; // Se for nulo ou vazio
    
    const dataObj = new Date(dataISO);
    // Verifica se a data é válida antes de formatar
    if (isNaN(dataObj.getTime())) {
      return 'Data Inválida'; 
    }
    
    return format(dataObj, 'dd/MM/yyyy');
  };

  const carregarAgenda = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/solicitacoes');
      
      // FILTRO: Mostra serviços atribuídos ao usuário logado
      const minhasAtividades = res.data.filter(sol => 
        (String(sol.operador_id) === String(userId) || String(sol.veiculo_id) === String(userId))
      );
      
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
    
    setLoadingId(selectedSolicitacao.id); 
    try {
      await api.put(`/solicitacoes/${selectedSolicitacao.id}`, {
        status: 'CONCLUÍDA',
        observacao_funcionario: obs,
        data_execucao: new Date().toISOString() 
      });

      toast({ title: "Serviço concluído com sucesso!", status: "success" });
      
      // Atualiza a lista localmente para refletir a mudança
      setTarefas(prev => prev.map(t => 
        t.id === selectedSolicitacao.id ? { ...t, status: 'CONCLUÍDA', observacao_funcionario: obs } : t
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
                  {/* AQUI ESTAVA O ERRO: Agora usamos a função segura */}
                  <b>Data:</b> {formatarData(sol.data_execucao)}
                </Text>
              </Flex>

              {/* --- NOVO BLOCO: PEDIDO DO AGRICULTOR --- */}
              {sol.observacao && (
                <Box mt="1" p="2" bg="brand.50" borderRadius="md" borderLeft="3px solid" borderColor="brand.500">
                  <Flex align="center" mb="1">
                    <Icon as={MdChatBubbleOutline} color="brand.500" mr="1" w="12px" h="12px" />
                    <Text fontSize='xs' fontWeight="bold" color="brand.800" textTransform="uppercase">
                      Pedido do Agricultor:
                    </Text>
                  </Flex>
                  <Text fontSize='sm' color="brand.700" fontStyle="italic">
                    "{sol.observacao}"
                  </Text>
                </Box>
              )}

              {/* --- INSTRUÇÕES DO ADMIN --- */}
              {sol.observacoes && (
                <Box mt="1" p="2" bg="blue.50" borderRadius="md" borderLeft="3px solid" borderColor="blue.400">
                  <Flex align="center" mb="1">
                    <Icon as={MdChatBubbleOutline} color="blue.500" mr="1" w="12px" h="12px" />
                    <Text fontSize='xs' fontWeight="bold" color="blue.800" textTransform="uppercase">
                      Instruções do Admin:
                    </Text>
                  </Flex>
                  <Text fontSize='sm' color="blue.700">
                    "{sol.observacoes}"
                  </Text>
                </Box>
              )}
            </Stack>

            {/* SEÇÃO DE STATUS E RELATÓRIO DO FUNCIONÁRIO APÓS CONCLUIR */}
            {sol.status === 'CONCLUÍDA' && (
              <Box mt="4" pt="4" borderTop="1px solid" borderColor="gray.100">
                <Flex align="center" color="green.500" mb="2">
                    <Icon as={MdCheckCircle} mr="2"/>
                    <Text fontSize="sm" fontWeight="bold">Serviço Finalizado</Text>
                </Flex>
                
                {sol.observacao_funcionario && (
                  <Box p="3" bg="gray.50" borderRadius="md" borderLeft="4px solid" borderColor="green.400">
                    <Flex align="center" mb="1">
                       <Icon as={MdChatBubbleOutline} mr="1" boxSize={3} color="gray.400"/>
                       <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Meu Relatório:</Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" fontStyle="italic">
                      "{sol.observacao_funcionario}"
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            {sol.status !== 'CONCLUÍDA' && (
              <Button 
                mt='20px' leftIcon={<MdCheckCircle />} colorScheme='green' width="100%"
                onClick={() => handleOpenConcluir(sol)} isLoading={loadingId === sol.id}
                loadingText="Salvando..."
              >
                Concluir e Relatar
              </Button>
            )}
          </Card>
        )) : (
          <Flex direction="column" align="center" gridColumn="1 / -1" mt="10">
            <Text color='gray.500' fontSize="lg">Nenhum serviço pendente.</Text>
          </Flex>
        )}
      </SimpleGrid>

      {/* MODAL DE CONCLUSÃO */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Finalizar Serviço #{selectedSolicitacao?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4} color="gray.600">Descreva brevemente como foi a execução do serviço:</Text>
            <Textarea 
              placeholder="Ex: Solo em boas condições. Serviço realizado com sucesso..."
              value={obs} onChange={(e) => setObs(e.target.value)} 
              focusBorderColor="brand.500" rows={5}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme='green' onClick={handleConfirmarConclusao}>Confirmar Conclusão</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}