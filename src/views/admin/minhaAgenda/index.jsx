import React, { useState, useEffect, useCallback } from "react";
import {
  Box, SimpleGrid, Text, Badge, Flex, Icon, Spinner, useToast, Button, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Textarea
} from "@chakra-ui/react";
import { MdAssignment, MdLocationOn, MdAccessTime, MdCheckCircle } from "react-icons/md";
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
  
  // Pega o ID do motorista/técnico que logou
  const userId = localStorage.getItem('user_id'); 

  const carregarAgenda = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/solicitacoes');
      
      // FILTRO:
      const minhasAtividades = res.data.filter(sol => 
        (String(sol.operador_id) === String(userId) || String(sol.veiculo_id) === String(userId)) ||
        (sol.status !== 'CONCLUÍDA' && sol.operador_id === null) 
      );
      
      setTarefas(minhasAtividades);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { carregarAgenda(); }, [carregarAgenda]);

  const handleOpenConcluir = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    onOpen();
  };

  // 2. Confirma a conclusão e chama a API
  const handleConfirmarConclusao = async () => {
    if (!selectedSolicitacao) return;
    
    setLoadingId(selectedSolicitacao.id); 
    try {
      await api.put(`/solicitacoes/${selectedSolicitacao.id}`, {
        status: 'CONCLUÍDA',
        observacao_tecnico: obs 
      });

      toast({ title: "Serviço concluído!", status: "success" });
      
      // Atualiza a lista removendo o item concluído 
      setTarefas(prev => prev.map(t => 
        t.id === selectedSolicitacao.id ? { ...t, status: 'CONCLUÍDA' } : t
      ));
      
      onClose();
      setObs(""); // Limpa o campo

    } catch (error) {
      toast({ title: "Erro ao finalizar.", description: "Tente novamente.", status: "error" });
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' color="brand.500" /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex direction='column' mb='20px'>
        <Text fontSize='2xl' fontWeight='700'>Minhas Atividades - Pirpirituba</Text>
        <Text color='secondaryGray.600' fontSize='sm'>Confira os serviços atribuídos a você hoje.</Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap='20px'>
        {tarefas.length > 0 ? tarefas.map(sol => (
          <Card key={sol.id} p='20px'>
            <Flex justify='space-between' align='center' mb='15px'>
              <Badge colorScheme={sol.status === 'CONCLUÍDA' ? 'green' : 'orange'}>
                {sol.status}
              </Badge>
              <Text fontSize='xs' color='gray.400'>Protocolo #{sol.id}</Text>
            </Flex>

            <Stack spacing={3}>
              <Text fontWeight='bold' fontSize='lg' color='brand.500'>
                {sol.servico?.nome_servico || "Serviço Geral"}
              </Text>

              <Flex align='center'>
                <Icon as={MdLocationOn} color='gray.400' mr='2' />
                <Text fontSize='sm'><b>Local:</b> {sol.propriedade?.terreno}</Text>
              </Flex>

              <Flex align='center'>
                <Icon as={MdAssignment} color='gray.400' mr='2' />
                <Text fontSize='sm'><b>Agricultor:</b> {sol.agricultor?.nome}</Text>
              </Flex>

              <Flex align='center'>
                <Icon as={MdAccessTime} color='gray.400' mr='2' />
                <Text fontSize='sm'>
                  <b>Solicitado em:</b> {sol.data_solicitacao ? format(new Date(sol.data_solicitacao), 'dd/MM/yyyy') : '-'}
                </Text>
              </Flex>
            </Stack>

            {sol.status !== 'CONCLUÍDA' && (
              <Button 
                mt='20px' 
                leftIcon={<MdCheckCircle />} 
                colorScheme='brand' 
                size='sm'
                variant='outline'
                onClick={() => handleOpenConcluir(sol)} 
                isLoading={loadingId === sol.id}
              >
                Concluir Serviço
              </Button>
            )}
          </Card>
        )) : (
          <Text color='gray.500' mt='4'>Não há serviços pendentes na sua agenda.</Text>
        )}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Finalizar Serviço #{selectedSolicitacao?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3}>Confirma a conclusão deste serviço?</Text>
            
            <Text fontSize="sm" fontWeight="bold" mb={1}>Observações (Opcional):</Text>
            <Textarea 
              placeholder="Ex: Solo compactado, 2 horas de máquina..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme='green' onClick={handleConfirmarConclusao}>
              Confirmar Conclusão
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}