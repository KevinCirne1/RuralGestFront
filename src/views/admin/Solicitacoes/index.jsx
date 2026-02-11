import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Text, useColorModeValue, SimpleGrid,
  Icon, Badge, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Select, Textarea, Input, useToast, Spinner
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdPrint, MdLocalShipping, MdEvent, MdPersonAdd, MdPerson, MdLocationOn, MdCalendarToday } from "react-icons/md";
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
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const modalAtribuir = useDisclosure(); 
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
  const [solicitacaoParaAtribuir, setSolicitacaoParaAtribuir] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const grayLabel = useColorModeValue("gray.500", "gray.400");
  const toast = useToast();
  const bgInput = useColorModeValue("white", "navy.800"); 
  const bgDisabled = useColorModeValue("gray.100", "navy.700"); 

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

      const listaEquipe = (reqUsers.data || []).filter(u => 
        u.perfil === 'tecnico' || u.perfil === 'operador'
      );
      setEquipe(listaEquipe);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ title: "Erro de conexão com a API", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImprimir = async (solicitacao) => {
    try {
      toast({ title: "Gerando PDF...", status: "info", duration: 2000 });
      const tipoDoc = solicitacao.status?.toUpperCase() === 'CONCLUÍDA' ? 'RELATORIO_FINAL' : 'PROTOCOLO';
      const resGerar = await api.post('/documentos', { solicitacao_id: solicitacao.id, tipo_documento: tipoDoc });
      const documentoId = resGerar.data.id;
      const resDownload = await api.get(`/documentos/download/${documentoId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resDownload.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipoDoc}_${solicitacao.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Documento baixado!", status: "success" });
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      toast({ title: "Falha ao gerar documento", status: "error" });
    }
  };

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
      
      toast({ title: "Equipe atribuída com sucesso!", status: "success" });
      fetchData(); 
      modalAtribuir.onClose();
    } catch (error) {
      toast({ title: "Erro ao atribuir funcionário.", status: "error" });
    }
  };

  const handleGerenciar = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    onOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
      if (solicitacaoSelecionada) {
        await api.put(`/solicitacoes/${solicitacaoSelecionada.id}`, values);
        toast({ title: "Atualizada com sucesso!", status: "success" });
      } else {
        const payload = { ...values, data_solicitacao: new Date().toISOString().split('T')[0] };
        await api.post('/solicitacoes', payload);
        toast({ title: "Nova demanda criada!", status: "success" });
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
    if (s === 'APROVADA') return 'blue';
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
        {solicitacoes.map((sol) => (
          <Card key={sol.id} p='20px' display='flex' flexDirection='column'>
            <Flex justify='space-between' mb='10px'>
              <Badge colorScheme={getStatusColor(sol.status)} borderRadius='8px' px='10px' py='5px'>
                {sol.status}
              </Badge>
              <Text fontSize='xs' color='gray.400'>#{sol.id}</Text>
            </Flex>

            <Flex align='center' mb='15px'>
               <Icon as={MdEvent} color='brand.500' w='20px' h='20px' mr='10px' />
               <Text fontWeight='bold' fontSize='lg'>{sol.servico?.nome_servico || "Serviço Geral"}</Text>
            </Flex>

            <Box mb='20px'>
               <Flex align="center" mb="2">
                   <Icon as={MdPerson} color="brand.500" mr="2" w="20px" h="20px" />
                   <Text fontSize='md' fontWeight='800' color={textColor}>
                       {sol.agricultor?.nome}
                   </Text>
               </Flex>

               <Text fontSize='sm' color='gray.500'>
                   Local: <Text as='span' fontWeight='700' color={textColor}>{sol.propriedade?.terreno}</Text>
               </Text>
               
               <Text fontSize='sm' color='gray.500' mt="1">
                   Pedido em: <Text as='span' fontWeight='700' color={textColor}>
                       {sol.data_solicitacao ? format(new Date(sol.data_solicitacao), 'dd/MM/yyyy') : '-'}
                   </Text>
               </Text>
               
               {sol.operador_id ? (
                   <Text fontSize='sm' color='purple.600' fontWeight='bold' mt='3' display='flex' align='center'>
                       <Icon as={MdPerson} mr='1' /> Resp: {equipe.find(e => e.id === sol.operador_id)?.nome || "Técnico"}
                   </Text>
               ) : (
                   <Text fontSize='xs' color='red.400' mt='2' fontStyle="italic">* Aguardando atribuição</Text>
               )}

               {sol.veiculo && (
                 <Flex mt='2' align='center' color='blue.600'>
                    <Icon as={MdLocalShipping} mr='1' />
                    <Text fontSize='sm' fontWeight='bold'>{sol.veiculo.nome}</Text>
                 </Flex>
               )}
            </Box>

            <Flex justify='space-between' mt='auto' gap="2">
               <Button 
                  leftIcon={<MdPersonAdd />} 
                  size='sm' 
                  colorScheme='purple' 
                  variant='solid'
                  flex="1" 
                  onClick={() => handleOpenAtribuir(sol)}
               >
                  Atribuir
               </Button>
               
               <Button onClick={() => handleGerenciar(sol)} size='sm' colorScheme='brand' variant='outline'>
                 <Icon as={MdEdit} />
               </Button>

               <Button onClick={() => handleImprimir(sol)} size='sm' variant='ghost'>
                  <Icon as={MdPrint} />
               </Button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>

      {/*  MODAL DE CRIAR/EDITAR */}
      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{solicitacaoSelecionada ? `Gerenciar Demanda #${solicitacaoSelecionada.id}` : "Nova Demanda Manual"}</ModalHeader>
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
                            <Field name='status'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Status</FormLabel>
                                        <Select {...field} bg={bgInput}>
                                            <option value="PENDENTE">PENDENTE</option>
                                            <option value="APROVADA">APROVADA</option>
                                            <option value="EM ANDAMENTO">EM ANDAMENTO</option>
                                            <option value="CONCLUÍDA">CONCLUÍDA</option>
                                            <option value="RECUSADA">RECUSADA</option>
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name='agricultor_id'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Agricultor</FormLabel>
                                        <Select 
                                            {...field} 
                                            disabled={!!solicitacaoSelecionada} 
                                            bg={!!solicitacaoSelecionada ? bgDisabled : bgInput} 
                                            placeholder="Selecione o agricultor..."
                                        >
                                            {agricultores.map(ag => (<option key={ag.id} value={ag.id}>{ag.nome}</option>))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name='propriedade_id'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Propriedade (Local)</FormLabel>
                                        <Select 
                                            {...field} 
                                            disabled={!!solicitacaoSelecionada} 
                                            bg={!!solicitacaoSelecionada ? bgDisabled : bgInput} 
                                            placeholder="Selecione a propriedade..."
                                        >
                                            {propriedades.filter(p => !props.values.agricultor_id || String(p.agricultor_id) === String(props.values.agricultor_id)).map(p => (<option key={p.id} value={p.id}>{p.terreno}</option>))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name='servico_id'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Serviço Solicitado</FormLabel>
                                        <Select 
                                            {...field} 
                                            disabled={!!solicitacaoSelecionada} 
                                            bg={!!solicitacaoSelecionada ? bgDisabled : bgInput} 
                                            placeholder="Selecione o serviço..."
                                        >
                                            {servicos.map(s => (<option key={s.id} value={s.id}>{s.nome_servico}</option>))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name='veiculo_id'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel color='brand.500' fontWeight='bold'>Alocar Máquina</FormLabel>
                                        <Select {...field} bg={bgInput} placeholder="Selecione a máquina (Opcional)...">
                                            {veiculos.map(v => (<option key={v.id} value={v.id}>{v.nome} ({v.status})</option>))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name='data_execucao'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel fontWeight='bold'>Data de Execução</FormLabel>
                                        <Input {...field} bg={bgInput} type="date" focusBorderColor="brand.500" />
                                    </FormControl>
                                )}
                            </Field>

                            <Field name='observacoes'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Observações</FormLabel>
                                        <Textarea {...field} bg={bgInput} placeholder="Detalhes da execução..." />
                                    </FormControl>
                                )}
                            </Field>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant='ghost' mr={3} onClick={onClose}>Cancelar</Button>
                            <Button colorScheme='brand' type='submit' isLoading={props.isSubmitting}>Salvar</Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </ModalContent>
      </Modal>

      {/* MODAL DE ATRIBUIÇÃO DE EQUIPE */}
      <Modal isOpen={modalAtribuir.isOpen} onClose={modalAtribuir.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Definir Responsável Técnico</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
             <Text mb={4}>
                Quem será o responsável pela solicitação <b>#{solicitacaoParaAtribuir?.id}</b>?
             </Text>
             <FormControl>
                <FormLabel fontWeight="bold">Selecione o Funcionário:</FormLabel>
                <Select 
                   bg={bgInput}
                   placeholder="Selecione um técnico/motorista..." 
                   value={tecnicoSelecionado}
                   onChange={(e) => setTecnicoSelecionado(e.target.value)}
                   size="lg"
                >
                   {equipe.map(func => (
                      <option key={func.id} value={func.id}>
                         {func.nome} ({func.perfil.toUpperCase()})
                      </option>
                   ))}
                </Select>
             </FormControl>
          </ModalBody>
          <ModalFooter>
             <Button variant='ghost' mr={3} onClick={modalAtribuir.onClose}>Cancelar</Button>
             <Button colorScheme='purple' onClick={handleSalvarAtribuicao}>
                Salvar Atribuição
             </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}