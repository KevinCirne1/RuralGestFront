import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Text, useColorModeValue, SimpleGrid,
  Icon, Badge, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Select, Textarea, Input, useToast, Spinner,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  IconButton, Tooltip, Divider
} from "@chakra-ui/react";
import { 
  MdAdd, MdEdit, MdPrint, MdLocalShipping, MdEvent, 
  MdPersonAdd, MdPerson, MdDelete, MdPhone, MdChatBubbleOutline, MdCheckCircle 
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
  observacoes: Yup.string().nullable(),
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalAtribuir = useDisclosure(); 
  const alertDelete = useDisclosure();
  const cancelRef = React.useRef();

  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [solicitacaoParaDeletar, setSolicitacaoParaDeletar] = useState(null);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
  const [solicitacaoParaAtribuir, setSolicitacaoParaAtribuir] = useState(null);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const bgObs = useColorModeValue("gray.50", "whiteAlpha.50");
  const bgInput = useColorModeValue("white", "navy.800"); 
  const bgDisabled = useColorModeValue("gray.100", "navy.700"); 
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqSol, reqServ, reqVeic, reqProp, reqAgri, reqUsers] = await Promise.all([
        api.get('/solicitacoes'),
        api.get('/servicos'),
        api.get('/veiculos'),
        api.get('/propriedades'),
        api.get('/agricultores'),
        api.get('/usuarios') 
      ]);

      setSolicitacoes(reqSol.data || []);
      setServicos(reqServ.data || []);
      setVeiculos(reqVeic.data || []);
      setPropriedades(reqProp.data || []);
      setAgricultores(reqAgri.data || []);
      setEquipe((reqUsers.data || []).filter(u => u.perfil === 'tecnico' || u.perfil === 'operador'));
    } catch (error) {
      toast({ title: "Erro de conexão", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenAtribuir = (solicitacao) => {
    setSolicitacaoParaAtribuir(solicitacao);
    setTecnicoSelecionado(solicitacao.operador_id || ""); 
    modalAtribuir.onOpen();
  };

  const handleSalvarAtribuicao = async () => {
    if (!solicitacaoParaAtribuir) return;
    try {
      await api.put(`/solicitacoes/${solicitacaoParaAtribuir.id}`, {
        operador_id: tecnicoSelecionado,
        status: 'EM ANDAMENTO' 
      });
      toast({ title: "Equipe atribuída!", status: "success" });
      fetchData(); 
      modalAtribuir.onClose();
    } catch (error) {
      toast({ title: "Erro na atribuição.", status: "error" });
    }
  };

  const handleImprimir = async (solicitacao) => {
    try {
      toast({ title: "Gerando PDF...", status: "info" });
      const tipoDoc = solicitacao.status?.toUpperCase() === 'CONCLUÍDA' ? 'RELATORIO_FINAL' : 'PROTOCOLO';
      const resGerar = await api.post('/documentos', { solicitacao_id: solicitacao.id, tipo_documento: tipoDoc });
      const resDownload = await api.get(`/documentos/download/${resGerar.data.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resDownload.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipoDoc}_${solicitacao.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({ title: "Falha ao gerar documento.", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!solicitacaoParaDeletar) return;
    try {
      await api.delete(`/solicitacoes/${solicitacaoParaDeletar.id}`);
      toast({ title: "Excluído!", status: "success" });
      fetchData();
      alertDelete.onClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao excluir.";
      toast({ title: msg, status: "error" });
    }
  };

  const handleSubmit = async (values, actions) => {
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
      toast({ title: "Erro ao salvar.", status: "error" });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    if (s === 'EM ANDAMENTO') return 'purple';
    if (s === 'CONCLUÍDA') return 'green';
    if (s === 'RECUSADA') return 'red';
    return 'yellow';
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

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap='20px'>
        {solicitacoes.map((sol) => {
          // LÓGICA DE ATRIBUIÇÃO: Verifica se já possui um operador_id
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
                 <Text fontSize='sm' color='gray.500' mt="1">Pedido: <b>{sol.data_solicitacao ? format(new Date(sol.data_solicitacao), 'dd/MM/yyyy') : '-'}</b></Text>

                 {sol.data_execucao && (
                    <Text fontSize='sm' color='green.500' mt="1" fontWeight="bold">
                      Executado: {format(new Date(sol.data_execucao), 'dd/MM/yyyy')}
                    </Text>
                 )}

                 {sol.observacoes && (
                   <Flex mt="3" p="2" bg={bgObs} borderRadius="md" align="flex-start">
                      <Icon as={MdChatBubbleOutline} color="brand.500" mt="1" mr="2" w="14px" h="14px" />
                      <Text fontSize='xs' color='gray.600' fontStyle="italic">
                          {sol.observacoes}
                      </Text>
                   </Flex>
                 )}
              </Box>

              <Flex justify='space-between' mt='auto' gap="8px" pt="4" borderTop="1px solid" borderColor={borderColor}>
                 {/* AJUSTE: BOTÃO DE ATRIBUIÇÃO DINÂMICO */}
                 <Tooltip label={jaAtribuido ? "Responsável já definido" : "Atribuir técnico/operador"}>
                   <Button 
                      leftIcon={jaAtribuido ? <MdCheckCircle /> : <MdPersonAdd />} 
                      size='sm' 
                      colorScheme={jaAtribuido ? 'gray' : 'purple'} 
                      variant={jaAtribuido ? 'outline' : 'solid'}
                      flex="1" 
                      isDisabled={jaAtribuido}
                      onClick={() => handleOpenAtribuir(sol)}
                   >
                    {jaAtribuido ? "Atribuído" : "Atribuir"}
                   </Button>
                 </Tooltip>
                 
                 <Tooltip label="Editar">
                   <IconButton size='sm' colorScheme='brand' icon={<MdEdit />} onClick={() => { setSolicitacaoSelecionada(sol); onOpen(); }} />
                 </Tooltip>

                 <Tooltip label="Excluir">
                   <IconButton size='sm' colorScheme='red' icon={<MdDelete />} onClick={() => { setSolicitacaoParaDeletar(sol); alertDelete.onOpen(); }} />
                 </Tooltip>

                 <Tooltip label="Imprimir">
                   <IconButton size='sm' colorScheme='blue' variant="ghost" icon={<MdPrint />} onClick={() => handleImprimir(sol)} />
                 </Tooltip>
              </Flex>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* MODAIS (MANTIDOS) */}
      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay /><ModalContent>
          <ModalHeader>{solicitacaoSelecionada ? "Editar" : "Novo"}</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              status: solicitacaoSelecionada?.status || 'PENDENTE',
              agricultor_id: solicitacaoSelecionada?.agricultor?.id || '',
              propriedade_id: solicitacaoSelecionada?.propriedade?.id || '',
              servico_id: solicitacaoSelecionada?.servico?.id || '',
              veiculo_id: solicitacaoSelecionada?.veiculo?.id || '',
              observacoes: solicitacaoSelecionada?.observacoes || '',
              data_execucao: solicitacaoSelecionada?.data_execucao ? solicitacaoSelecionada.data_execucao.split('T')[0] : ''
            }}
            validationSchema={SolicitacaoSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(props) => (
              <Form>
                <ModalBody>
                  <Field name="status">{({ field }) => (<FormControl mb={4}><FormLabel>Status</FormLabel><Select {...field} bg={bgInput}><option value="PENDENTE">PENDENTE</option><option value="EM ANDAMENTO">EM ANDAMENTO</option><option value="CONCLUÍDA">CONCLUÍDA</option></Select></FormControl>)}</Field>
                  <Field name="agricultor_id">{({ field }) => (<FormControl mb={4}><FormLabel>Agricultor</FormLabel><Select {...field} placeholder="Selecione..." disabled={!!solicitacaoSelecionada} bg={bgDisabled}>{agricultores.map(ag => <option key={ag.id} value={ag.id}>{ag.nome}</option>)}</Select></FormControl>)}</Field>
                  <Field name="propriedade_id">{({ field }) => (<FormControl mb={4}><FormLabel>Propriedade</FormLabel><Select {...field} placeholder="Selecione..." disabled={!!solicitacaoSelecionada}>{propriedades.filter(p => !props.values.agricultor_id || String(p.agricultor_id) === String(props.values.agricultor_id)).map(p => <option key={p.id} value={p.id}>{p.terreno}</option>)}</Select></FormControl>)}</Field>
                  <Field name="servico_id">{({ field }) => (<FormControl mb={4}><FormLabel>Serviço</FormLabel><Select {...field} placeholder="Selecione..." disabled={!!solicitacaoSelecionada}>{servicos.map(s => <option key={s.id} value={s.id}>{s.nome_servico}</option>)}</Select></FormControl>)}</Field>
                  <Field name="data_execucao">{({ field }) => (<FormControl mb={4}><FormLabel fontWeight="bold">Data de Execução</FormLabel><Input {...field} type="date" bg={bgInput} /></FormControl>)}</Field>
                  <Field name="observacoes">{({ field }) => (<FormControl mb={4}><FormLabel>Observações</FormLabel><Textarea {...field} placeholder="Detalhes..." bg={bgInput} /></FormControl>)}</Field>
                </ModalBody>
                <ModalFooter><Button mr={3} onClick={onClose}>Cancelar</Button><Button colorScheme='brand' type='submit' isLoading={props.isSubmitting}>Salvar</Button></ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>

      <Modal isOpen={modalAtribuir.isOpen} onClose={modalAtribuir.onClose}>
        <ModalOverlay /><ModalContent>
          <ModalHeader>Atribuir Responsável</ModalHeader>
          <ModalBody>
            <Text mb="2" fontSize="sm">Selecione o técnico ou operador para realizar este serviço:</Text>
            <Select placeholder="Selecione..." value={tecnicoSelecionado} onChange={(e) => setTecnicoSelecionado(e.target.value)} bg={bgInput}>
              {equipe.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.perfil.toUpperCase()})</option>)}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="3" onClick={modalAtribuir.onClose}>Cancelar</Button>
            <Button colorScheme='purple' onClick={handleSalvarAtribuicao} isDisabled={!tecnicoSelecionado}>Confirmar Atribuição</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={alertDelete.isOpen} leastDestructiveRef={cancelRef} onClose={alertDelete.onClose}>
        <AlertDialogOverlay><AlertDialogContent>
          <AlertDialogHeader>Excluir Demanda</AlertDialogHeader>
          <AlertDialogBody>Deseja remover o registro #{solicitacaoParaDeletar?.id}? Esta ação não pode ser desfeita.</AlertDialogBody>
          <AlertDialogFooter><Button ref={cancelRef} onClick={alertDelete.onClose}>Cancelar</Button><Button colorScheme='red' onClick={handleDelete} ml={3}>Excluir permanentemente</Button></AlertDialogFooter>
        </AlertDialogContent></AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}