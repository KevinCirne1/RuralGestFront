import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Flex, Button, Text, useColorModeValue, SimpleGrid,
  Icon, Badge, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Select, Textarea, Input, useToast, Spinner,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  IconButton, Tooltip, InputGroup, InputLeftElement, Divider
} from "@chakra-ui/react";
import { 
  MdAdd, MdEdit, MdPrint, MdEvent, 
  MdPerson, MdDelete, MdChatBubbleOutline, MdCheckCircle, MdSearch, MdPersonAdd 
} from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from "services/api"; 
import { format } from 'date-fns';

const SolicitacaoSchema = Yup.object().shape({
  status: Yup.string().required('Status é obrigatório'),
  agricultor_id: Yup.number().required('Agricultor é obrigatório'),
  propriedade_id: Yup.number().required('Propriedade é obrigatória'),
  servico_id: Yup.number().required('Serviço é obrigatório'),
  veiculo_id: Yup.number().nullable(),
  observacao: Yup.string().nullable(),
  observacoes: Yup.string().nullable(),
  observacao_funcionario: Yup.string().nullable(),
  data_execucao: Yup.string().nullable()
});

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [propriedades, setPropriedades] = useState([]); 
  const [agricultores, setAgricultores] = useState([]);
  const [equipe, setEquipe] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalAtribuir = useDisclosure(); 
  const alertDelete = useDisclosure();
  const cancelRef = useRef();

  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [solicitacaoParaDeletar, setSolicitacaoParaDeletar] = useState(null);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
  const [solicitacaoParaAtribuir, setSolicitacaoParaAtribuir] = useState(null);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const bgInput = useColorModeValue("white", "navy.800"); 
  const bgDisabled = useColorModeValue("gray.100", "navy.700"); 
  
  const bgObsAgricultor = useColorModeValue("brand.50", "rgba(66, 42, 244, 0.1)");
  const bgRetornoEquipe = useColorModeValue("green.50", "rgba(72, 187, 120, 0.1)"); 

  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqSol, reqServ, reqVeic, reqProp, reqAgri, reqUsers] = await Promise.all([
        api.get('/solicitacoes'), api.get('/servicos'), api.get('/veiculos'),
        api.get('/propriedades'), api.get('/agricultores'), api.get('/usuarios') 
      ]);
      
      const sortedSolicitacoes = (reqSol.data || []).sort((a, b) => {
         return new Date(b.data_solicitacao) - new Date(a.data_solicitacao);
      });

      setSolicitacoes(sortedSolicitacoes);
      setServicos(reqServ.data || []);
      setVeiculos(reqVeic.data || []);
      setPropriedades(reqProp.data || []);
      setAgricultores(reqAgri.data || []);
      setEquipe((reqUsers.data || []).filter(u => u.perfil === 'tecnico' || u.perfil === 'operador'));
    } catch (error) { toast({ title: "Erro de conexão", status: "error" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (values, actions) => {
    const servicoRegra = servicos.find(s => s.id == values.servico_id);

    if (
        solicitacaoSelecionada && 
        values.status === 'CONCLUÍDA' && 
        servicoRegra?.requer_funcionario !== false && 
        !solicitacaoSelecionada.operador_id
    ) {
        toast({ 
            title: "Atribuição Obrigatória", 
            description: `O serviço "${servicoRegra?.nome_servico}" exige um funcionário responsável. Atribua alguém antes de concluir.`, 
            status: "error", 
            duration: 6000, 
            isClosable: true 
        });
        actions.setSubmitting(false);
        return; 
    }

    try {
      if (solicitacaoSelecionada) {
        await api.put(`/solicitacoes/${solicitacaoSelecionada.id}`, values);
        toast({ title: "Atualizada!", status: "success" });
      } else {
        await api.post('/solicitacoes', values);
        toast({ title: "Sucesso!", status: "success" });
      }
      fetchData(); 
      onClose();
    } catch (error) { 
        if (error.response && error.response.status === 409) {
            toast({ 
                title: "Atenção: Pedido Duplicado", 
                description: error.response.data.message || "Você já tem um pedido em aberto.", 
                status: "warning", 
                duration: 6000, 
                isClosable: true 
            });
        } else {
            toast({ 
                title: "Erro ao salvar.", 
                description: error.response?.data?.message || "Verifique os dados.",
                status: "error" 
            }); 
        }
    } finally { 
        actions.setSubmitting(false); 
    }
  };

  const handleOpenAtribuir = (solicitacao) => {
    setSolicitacaoParaAtribuir(solicitacao);
    setTecnicoSelecionado(solicitacao.operador_id || ""); 
    modalAtribuir.onOpen();
  };

  const handleSalvarAtribuicao = async () => {
    try {
      const operadorId = tecnicoSelecionado === "" ? null : tecnicoSelecionado;

      await api.put(`/solicitacoes/${solicitacaoParaAtribuir.id}`, { 
          operador_id: operadorId, 
          status: 'EM ANDAMENTO' 
      });
      
      toast({ title: "Situação atualizada!", status: "success" });
      fetchData(); 
      modalAtribuir.onClose();
    } catch (error) { toast({ title: "Erro na atribuição.", status: "error" }); }
  };

  const handleImprimir = async (solicitacao) => {
    try {
      toast({ title: "Gerando PDF...", status: "info" });
      const tipoDoc = solicitacao.status?.toUpperCase() === 'CONCLUÍDA' ? 'RELATORIO_FINAL' : 'PROTOCOLO';
      const resGerar = await api.post('/documentos', { solicitacao_id: solicitacao.id, tipo_documento: tipoDoc });
      const resDownload = await api.get(`/documentos/download/${resGerar.data.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resDownload.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `${tipoDoc}_${solicitacao.id}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { toast({ title: "Falha ao gerar documento.", status: "error" }); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/solicitacoes/${solicitacaoParaDeletar.id}`);
      toast({ title: "Registro excluído!", status: "success" });
      fetchData(); alertDelete.onClose();
    } catch (error) { toast({ title: "Não é possível excluir uma solicitação concluída ou em andamento.", status: "error" }); }
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    if (s === 'EM ANDAMENTO') return 'purple';
    if (s === 'CONCLUÍDA') return 'green';
    if (s === 'RECUSADA' || s === 'CANCELADA') return 'red';
    return 'yellow';
  };

  const initialValues = {
    status: solicitacaoSelecionada?.status || 'PENDENTE',
    agricultor_id: solicitacaoSelecionada?.agricultor?.id || '',
    propriedade_id: solicitacaoSelecionada?.propriedade?.id || '',
    servico_id: solicitacaoSelecionada?.servico?.id || '',
    veiculo_id: solicitacaoSelecionada?.veiculo?.id || '',
    observacao: solicitacaoSelecionada?.observacao || '',
    observacoes: solicitacaoSelecionada?.observacoes || '',
    observacao_funcionario: solicitacaoSelecionada?.observacao_funcionario || '',
    data_execucao: solicitacaoSelecionada?.data_execucao ? solicitacaoSelecionada.data_execucao.split('T')[0] : ''
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' color="brand.500" /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex justify='space-between' align='center' mb='20px'>
        <Text fontSize='2xl' fontWeight='700' color={textColor}>Central de Solicitações</Text>
        <Button leftIcon={<MdAdd />} colorScheme='brand' onClick={() => { setSolicitacaoSelecionada(null); onOpen(); }}>
          Nova Demanda
        </Button>
      </Flex>

      <InputGroup mb="20px">
        <InputLeftElement pointerEvents='none'><Icon as={MdSearch} color='gray.300' /></InputLeftElement>
        <Input 
            placeholder="Buscar por agricultor, serviço, status ou propriedade..." 
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
            borderRadius="10px" 
            bg={bgInput} 
            border="1px solid" 
            borderColor={borderColor} 
        />
      </InputGroup>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap='20px'>
        {solicitacoes
          .filter((sol) => {
             const termo = busca.toLowerCase();
             return (
                 sol.agricultor?.nome?.toLowerCase().includes(termo) || 
                 sol.servico?.nome_servico?.toLowerCase().includes(termo) || 
                 sol.status?.toLowerCase().includes(termo) ||
                 sol.propriedade?.terreno?.toLowerCase().includes(termo)
             );
          })
          .map((sol) => {
            const jaAtribuido = !!sol.operador_id;
            return (
              <Card key={sol.id} p='20px' display='flex' flexDirection='column'>
                <Flex justify='space-between' mb='10px'>
                  <Badge colorScheme={getStatusColor(sol.status)} borderRadius='8px' px='10px' py='5px'>{sol.status}</Badge>
                  <Text fontSize='xs' color='gray.400'>#{sol.id}</Text>
                </Flex>

                <Flex align='center' mb='15px'>
                  <Icon as={MdEvent} color='brand.500' w='20px' h='20px' mr='10px' />
                  <Text fontWeight='bold' fontSize='lg'>{sol.servico?.nome_servico}</Text>
                </Flex>

                <Box mb='15px'>
                  <Flex align="center" mb="2">
                      <Icon as={MdPerson} color="brand.500" mr="2" />
                      <Text fontWeight='800' color={textColor}>{sol.agricultor?.nome}</Text>
                  </Flex>
                  <Text fontSize='sm' color='gray.500'>Local: <b>{sol.propriedade?.terreno}</b></Text>
                  
                  <Text fontSize='sm' color='gray.500' mt="1">
                    Pedido: <b>{sol.data_solicitacao ? (sol.data_solicitacao.includes('/') ? sol.data_solicitacao : format(new Date(sol.data_solicitacao), 'dd/MM/yyyy')) : '-'}</b>
                  </Text>

                  {/* --- DATA DE EXECUÇÃO CORRIGIDA --- */}
                  {sol.status === 'CONCLUÍDA' && sol.data_execucao && (
                    <Flex align="center" mt="1">
                       <Icon as={MdCheckCircle} color="green.500" w="12px" h="12px" mr="1" />
                       <Text fontSize='sm' color='green.600' fontWeight="bold">
                          Executado em: {
                              sol.data_execucao.includes('/') 
                                ? sol.data_execucao 
                                : format(new Date(sol.data_execucao), 'dd/MM/yyyy')
                          }
                       </Text>
                    </Flex>
                  )}
                  {/* ---------------------------------- */}

                  {sol.observacao && (
                    <Box mt="3" p="2" bg={bgObsAgricultor} borderRadius="md" borderLeft="3px solid" borderColor="brand.500">
                      <Flex align="center" mb="1">
                        <Icon as={MdChatBubbleOutline} color="brand.500" mr="1" w="12px" h="12px" />
                        <Text fontSize='xs' fontWeight="bold" color="brand.800" textTransform="uppercase">
                          Pedido do Agricultor:
                        </Text>
                      </Flex>
                      <Text fontSize='sm' color="brand.700" fontStyle="italic">"{sol.observacao}"</Text>
                    </Box>
                  )}

                  {sol.observacoes && (
                    <Box mt="2" p="2" bg="blue.50" borderRadius="md" borderLeft="3px solid" borderColor="blue.400">
                      <Flex align="center" mb="1">
                        <Icon as={MdChatBubbleOutline} color="blue.500" mr="1" w="12px" h="12px" />
                        <Text fontSize='xs' fontWeight="bold" color="blue.800" textTransform="uppercase">
                          Notas Internas:
                        </Text>
                      </Flex>
                      <Text fontSize='sm' color="blue.700">"{sol.observacoes}"</Text>
                    </Box>
                  )}

                  {sol.observacao_funcionario && (
                    <Box mt="3" p="3" bg={bgRetornoEquipe} borderLeft="4px solid" borderColor="green.400" borderRadius="sm">
                      <Flex align="center" mb="1">
                        <Icon as={MdCheckCircle} color="green.400" mr="1" w="14px" h="14px" />
                        <Text fontSize='xs' fontWeight="bold" color="green.800" textTransform="uppercase">Retorno da Equipe:</Text>
                      </Flex>
                      <Text fontSize='sm' color="green.700" fontStyle="italic">"{sol.observacao_funcionario}"</Text>
                    </Box>
                  )}
                </Box>

                <Flex justify='space-between' mt='auto' gap="8px" pt="4" borderTop="1px solid" borderColor={borderColor}>
                  <Button 
                    leftIcon={jaAtribuido ? <MdCheckCircle /> : <MdPersonAdd />} 
                    size='sm' 
                    colorScheme={jaAtribuido ? 'green' : 'purple'} 
                    variant='solid'
                    flex="1" 
                    isDisabled={jaAtribuido}
                    _disabled={{
                        bg: 'green.500',   
                        color: 'white',    
                        cursor: 'not-allowed', 
                        opacity: 1,        
                        boxShadow: 'none'
                    }}
                    onClick={() => !jaAtribuido && handleOpenAtribuir(sol)}
                  >
                    {jaAtribuido ? "Atribuído" : "Atribuir"}
                  </Button>
                  
                  <Tooltip label="Editar"><IconButton size='sm' colorScheme='brand' icon={<MdEdit />} onClick={() => { setSolicitacaoSelecionada(sol); onOpen(); }} /></Tooltip>
                  <Tooltip label="Excluir"><IconButton size='sm' colorScheme='red' icon={<MdDelete />} onClick={() => { setSolicitacaoParaDeletar(sol); alertDelete.onOpen(); }} /></Tooltip>
                  <Tooltip label="Imprimir"><IconButton size='sm' colorScheme='orange' icon={<MdPrint />} onClick={() => handleImprimir(sol)} /></Tooltip>
                </Flex>
              </Card>
            );
          })}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{solicitacaoSelecionada ? "Editar Demanda" : "Nova Demanda"}</ModalHeader>
          <ModalCloseButton />
          
          <Formik
            initialValues={initialValues}
            validationSchema={SolicitacaoSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(props) => (
              <Form>
                <ModalBody>
                  <Field name="status">
                      {({ field }) => (
                          <FormControl mb={4}>
                              <FormLabel>Status</FormLabel>
                              <Select {...field} bg={bgInput}>
                                  <option value="PENDENTE">PENDENTE</option>
                                  <option value="EM ANDAMENTO">EM ANDAMENTO</option>
                                  <option value="CONCLUÍDA">CONCLUÍDA</option>
                                  <option value="CANCELADA">CANCELADA</option>
                              </Select>
                          </FormControl>
                      )}
                  </Field>

                  <Field name="agricultor_id">
                      {({ field }) => (
                          <FormControl mb={4} isRequired>
                              <FormLabel>Agricultor</FormLabel>
                              <Select {...field} placeholder="Selecione..." disabled={!!solicitacaoSelecionada} bg={!!solicitacaoSelecionada ? bgDisabled : bgInput}>
                                  {agricultores.map(ag => <option key={ag.id} value={ag.id}>{ag.nome}</option>)}
                              </Select>
                          </FormControl>
                      )}
                  </Field>

                  <Field name="propriedade_id">
                      {({ field }) => (
                          <FormControl mb={4} isRequired>
                              <FormLabel>Propriedade</FormLabel>
                              <Select {...field} placeholder="Selecione..." disabled={!!solicitacaoSelecionada} bg={!!solicitacaoSelecionada ? bgDisabled : bgInput}>
                                  {propriedades
                                      .filter(p => !props.values.agricultor_id || String(p.agricultor_id) === String(props.values.agricultor_id))
                                      .map(p => <option key={p.id} value={p.id}>{p.terreno}</option>)
                                  }
                              </Select>
                              {!props.values.agricultor_id && <Text fontSize="xs" color="red.300">Selecione um agricultor primeiro.</Text>}
                          </FormControl>
                      )}
                  </Field>

                  <Field name="servico_id">
                      {({ field }) => (
                          <FormControl mb={4} isRequired>
                              <FormLabel>Serviço</FormLabel>
                              <Select {...field} placeholder="Selecione..." disabled={!!solicitacaoSelecionada} bg={!!solicitacaoSelecionada ? bgDisabled : bgInput}>
                                  {servicos.map(s => <option key={s.id} value={s.id}>{s.nome_servico}</option>)}
                              </Select>
                          </FormControl>
                      )}
                  </Field>
                  
                  <Field name="data_execucao">
                      {({ field }) => (
                          <FormControl mb={4}>
                              <FormLabel fontWeight="bold">Data de Execução</FormLabel>
                              <Input {...field} type="date" bg={bgInput} />
                          </FormControl>
                      )}
                  </Field>
                  
                  <Divider mb={4} />
                  
                  {!solicitacaoSelecionada && (
                    <Field name="observacao">
                        {({ field }) => (
                            <FormControl mb={4}>
                                <FormLabel color="brand.500">Pedido do Agricultor (Observação)</FormLabel>
                                <Textarea {...field} placeholder="Digite aqui o que o agricultor solicitou..." bg={bgInput} />
                            </FormControl>
                        )}
                    </Field>
                  )}

                  <Field name="observacoes">
                      {({ field }) => (
                          <FormControl mb={4}>
                              <FormLabel>Notas da Secretaria (Interno)</FormLabel>
                              <Textarea {...field} placeholder="Detalhes para a equipe..." bg={bgInput} />
                          </FormControl>
                      )}
                  </Field>
                  
                </ModalBody>
                
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>Cancelar</Button>
                    <Button colorScheme='brand' type='submit' isLoading={props.isSubmitting}>
                        Salvar Alterações
                    </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>

      <Modal isOpen={modalAtribuir.isOpen} onClose={modalAtribuir.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Atribuir Responsável Técnico</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2} fontSize="sm" color="gray.500">
                Selecione o funcionário que será responsável por executar este serviço.
                <br/>
                <b>Nota:</b> Se o serviço for administrativo ou auto-atendimento, esta atribuição pode ser opcional.
            </Text>
            <Select 
                placeholder="Selecione o técnico..." 
                value={tecnicoSelecionado} 
                onChange={(e) => setTecnicoSelecionado(e.target.value)} 
                bg={bgInput}
            >
              {equipe.map(f => (
                  <option key={f.id} value={f.id}>
                      {f.nome} — {f.perfil.toUpperCase()}
                  </option>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
              <Button variant="ghost" mr="3" onClick={modalAtribuir.onClose}>Cancelar</Button>
              <Button colorScheme='purple' onClick={handleSalvarAtribuicao}>
                  Confirmar Atribuição
              </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={alertDelete.isOpen} leastDestructiveRef={cancelRef} onClose={alertDelete.onClose}>
        <AlertDialogOverlay>
            <AlertDialogContent>
                <AlertDialogHeader fontSize='lg' fontWeight='bold'>Excluir Registro</AlertDialogHeader>
                <AlertDialogBody>
                    Tem certeza? Essa ação não pode ser desfeita e removerá o histórico deste atendimento.
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={alertDelete.onClose}>Sair</Button>
                    <Button colorScheme='red' onClick={handleDelete} ml={3}>Remover Permanentemente</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}