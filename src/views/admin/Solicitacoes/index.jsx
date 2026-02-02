import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, useDisclosure, Spinner, useToast, Select, Badge, Alert, AlertIcon, Textarea,
  Input, IconButton, Tooltip
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { MdEdit, MdDeleteForever, MdPrint } from "react-icons/md"; // Ícone de Impressora
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getAgricultores } from "services/agricultorService";
import { getServicos } from "services/servicoService";
import { getPropriedades } from "services/propriedadeService";
import { getSolicitacoes, createSolicitacao, updateSolicitacao } from "services/solicitacaoService";
import api from "services/api"; 
import jsPDF from "jspdf"; // --- IMPORTANTE: Biblioteca de PDF

const SolicitacaoSchema = Yup.object().shape({
  servico_id: Yup.string().required('Selecione um serviço'),
  agricultor_id: Yup.string().required('Selecione um agricultor'),
  propriedade_id: Yup.string().required('Selecione uma propriedade'),
  status: Yup.string().required('Status obrigatório'),
});

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  const [veiculos, setVeiculos] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Modais
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRefuseOpen, onOpen: onRefuseOpen, onClose: onRefuseClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [editData, setEditData] = useState({});

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [solRes, agrRes, servRes, propRes, veicRes] = await Promise.all([
        getSolicitacoes(),
        getAgricultores(),
        getServicos(),
        getPropriedades(),
        api.get("/veiculos") 
      ]);
      setSolicitacoes(solRes.data);
      setAgricultores(agrRes.data);
      setServicos(servRes.data);
      setPropriedades(propRes.data);
      setVeiculos(veicRes.data); 
    } catch (error) {
      toast({ title: "Erro ao carregar dados.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FUNÇÃO GERADORA DE PDF ---
  const gerarPDF = (sol) => {
    const doc = new jsPDF();
    
    // Configurações visuais simples
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PREFEITURA MUNICIPAL", 105, 20, null, null, "center");
    
    doc.setFontSize(16);
    doc.text("SECRETARIA DE AGRICULTURA", 105, 30, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(18);
    doc.text(`ORDEM DE SERVIÇO Nº ${sol.id}`, 105, 50, null, null, "center");

    // Dados do Pedido
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    const startY = 70;
    const lineHeight = 10;

    doc.text(`AGRICULTOR: ${sol.agricultor?.nome || '---'}`, 20, startY);
    doc.text(`PROPRIEDADE: ${sol.propriedade?.terreno || '---'}`, 20, startY + lineHeight);
    doc.text(`SERVIÇO SOLICITADO: ${sol.servico?.nome_servico || '---'}`, 20, startY + (lineHeight * 2));
    
    const dataFormatada = sol.data_execucao 
        ? new Date(sol.data_execucao).toLocaleDateString('pt-BR') 
        : 'A definir';
    doc.text(`DATA PREVISTA: ${dataFormatada}`, 20, startY + (lineHeight * 3));

    // Destaque para o Veículo
    doc.setFont("helvetica", "bold");
    doc.text(`VEÍCULO ALOCADO: ${sol.veiculo?.nome || 'Nenhum / Manual'}`, 20, startY + (lineHeight * 4));
    doc.setFont("helvetica", "normal");

    // Área de Assinaturas
    doc.text("Declaramos que o serviço foi realizado conforme solicitado.", 20, 150);
    
    doc.line(20, 180, 90, 180);
    doc.text("Assinatura do Operador", 30, 185);

    doc.line(110, 180, 180, 180);
    doc.text("Assinatura do Agricultor", 120, 185);

    // Rodapé
    doc.setFontSize(10);
    doc.text("RuralGest - Sistema de Gestão Agrícola", 105, 280, null, null, "center");

    // Baixar o arquivo
    doc.save(`OS_${sol.id}_${sol.agricultor?.nome}.pdf`);
  };

  // --- LÓGICAS DE AÇÃO (Aprovar, Recusar, etc...) ---
  const handleAbrirRecusa = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setMotivoRecusa(""); 
    onRefuseOpen();
  };

  const handleConfirmarRecusa = async () => {
    if (!motivoRecusa) {
        toast({ title: "Informe o motivo", status: "warning", duration: 2000 });
        return;
    }
    try {
        await updateSolicitacao(solicitacaoSelecionada.id, { 
            ...solicitacaoSelecionada, 
            status: 'RECUSADA',
            motivo_recusa: motivoRecusa 
        });
        toast({ title: "Solicitação Recusada", status: "warning", duration: 3000, isClosable: true });
        onRefuseClose();
        fetchData();
    } catch (error) {
        toast({ title: "Erro ao recusar.", status: "error", duration: 5000 });
    }
  };

  const handleAbrirAprovacao = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setVeiculoSelecionadoId(""); 
    onApproveOpen(); 
  };

  const handleConfirmarAprovacao = async () => {
    if (!solicitacaoSelecionada) return;
    if (solicitacaoSelecionada.servico.tipo_veiculo && !veiculoSelecionadoId) {
        toast({ title: "Selecione um veículo!", description: "Este serviço exige maquinário.", status: "error" });
        return;
    }

    try {
        await updateSolicitacao(solicitacaoSelecionada.id, {
            ...solicitacaoSelecionada,
            status: 'APROVADA',
            veiculo_id: veiculoSelecionadoId || null 
        });

        toast({ title: "Solicitação Aprovada!", description: "Veículo alocado.", status: "success", duration: 3000 });
        onApproveClose();
        fetchData(); 
    } catch (error) {
        toast({ title: "Erro ao aprovar.", description: "Verifique o servidor.", status: "error" });
    }
  };

  const handleAbrirCancelar = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    onCancelOpen();
  };

  const handleConfirmarCancelar = async () => {
    try {
      await updateSolicitacao(solicitacaoSelecionada.id, {
        status: 'CANCELADA' 
      });
      toast({ title: "Solicitação Cancelada.", status: "info", duration: 3000 });
      onCancelClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao cancelar.", status: "error" });
    }
  };

  const handleAbrirEditar = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setEditData({
      veiculo_id: solicitacao.veiculo ? solicitacao.veiculo.id : "",
      data_execucao: solicitacao.data_execucao ? solicitacao.data_execucao.split('T')[0] : ""
    });
    onEditOpen();
  };

  const handleSalvarEdicao = async () => {
    try {
      const payload = { ...editData };
      if (payload.veiculo_id === "") payload.veiculo_id = null;
      
      await updateSolicitacao(solicitacaoSelecionada.id, payload);
      toast({ title: "Solicitação Atualizada!", status: "success", duration: 3000 });
      onEditClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao editar.", status: "error" });
    }
  };

  const handleSubmitManual = async (values, actions) => {
    try {
      const dataToSubmit = { 
        ...values, 
        agricultor_id: parseInt(values.agricultor_id),
        servico_id: parseInt(values.servico_id),
        propriedade_id: parseInt(values.propriedade_id)
      };
      await createSolicitacao(dataToSubmit);
      toast({ title: "Criado com sucesso!", status: "success", duration: 5000 });
      actions.setSubmitting(false);
      onFormClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao criar.", status: "error", duration: 5000 });
      actions.setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getVeiculosDisponiveis = (tipoNecessario) => {
    if (!tipoNecessario) return [];
    return veiculos.filter(v => v.tipo === tipoNecessario && v.status === 'DISPONIVEL');
  };
  
  const getVeiculosParaEdicao = () => {
    if (!solicitacaoSelecionada?.servico?.tipo_veiculo) return [];
    const tipo = solicitacaoSelecionada.servico.tipo_veiculo;
    const currentId = solicitacaoSelecionada.veiculo?.id;
    return veiculos.filter(v => 
      (v.tipo === tipo && v.status === 'DISPONIVEL') || (v.id === currentId)
    );
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Gestão de Solicitações</Text>
          <Button colorScheme='brand' onClick={onFormOpen}>Nova Solicitação Manual</Button>
        </Flex>
        
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
                <Th>Serviço</Th>
                <Th>Agricultor</Th>
                <Th>Veículo</Th> 
                <Th>Data</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {solicitacoes.map((sol) => {
              const isPendente = sol.status === 'Pendente' || sol.status === 'PENDENTE';
              const isFinalizado = sol.status === 'CANCELADA' || sol.status === 'CONCLUÍDA' || sol.status === 'RECUSADA';
              const isAprovada = sol.status === 'APROVADA';

              return (
                <Tr key={sol.id}>
                  <Td fontWeight="bold">
                    {sol.servico ? sol.servico.nome_servico : 'N/A'}
                    {sol.servico?.tipo_veiculo && isPendente && (
                        <Badge ml="2" colorScheme="purple" fontSize="0.6em">Requer {sol.servico.tipo_veiculo}</Badge>
                    )}
                  </Td>
                  <Td>{sol.agricultor ? sol.agricultor.nome : 'N/A'}</Td>
                  <Td>
                    {sol.veiculo ? <Badge colorScheme="blue">{sol.veiculo.nome}</Badge> : <Text fontSize="xs" color="gray.400">-</Text>}
                  </Td>
                  <Td>{formatDate(sol.data_solicitacao)}</Td>
                  <Td>
                    <Badge colorScheme={
                        sol.status === 'APROVADA' ? 'green' : 
                        sol.status === 'RECUSADA' || sol.status === 'CANCELADA' ? 'red' : 'yellow'
                    } p="5px" borderRadius="8px">
                        {sol.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap="5px">
                        
                        {/* --- BOTÃO DE IMPRESSÃO (NOVIDADE) --- */}
                        {isAprovada && (
                            <Tooltip label="Imprimir O.S.">
                                <IconButton 
                                    size='sm' 
                                    colorScheme='purple' // Um destaque diferente
                                    icon={<MdPrint />} 
                                    onClick={() => gerarPDF(sol)} 
                                />
                            </Tooltip>
                        )}

                        {/* Ações de Aprovação/Recusa */}
                        {isPendente ? (
                            <>
                                <Tooltip label="Aprovar"><IconButton size='sm' colorScheme='green' icon={<CheckIcon />} onClick={() => handleAbrirAprovacao(sol)} /></Tooltip>
                                <Tooltip label="Recusar"><IconButton size='sm' colorScheme='red' icon={<CloseIcon />} onClick={() => handleAbrirRecusa(sol)} /></Tooltip>
                            </>
                        ) : null}

                        {/* Botão Editar */}
                        {!isFinalizado && (
                           <Tooltip label="Editar">
                              <IconButton 
                                size='sm' 
                                colorScheme='brand' 
                                icon={<MdEdit />} 
                                onClick={() => handleAbrirEditar(sol)} 
                              />
                           </Tooltip>
                        )}

                        {/* Botão Cancelar (Laranja) */}
                        {sol.status !== 'CANCELADA' && (
                           <Tooltip label="Cancelar Pedido">
                               <IconButton 
                                    size='sm' 
                                    colorScheme='orange' 
                                    icon={<MdDeleteForever />} 
                                    onClick={() => handleAbrirCancelar(sol)} 
                                />
                           </Tooltip>
                        )}
                    </Flex>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>
      
      {/* MODAIS (CÓDIGO IGUAL AO ANTERIOR) */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Aprovar Solicitação</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {solicitacaoSelecionada && (
                    <>
                        <Text mb="20px">Agricultor: {solicitacaoSelecionada.agricultor?.nome}</Text>
                        {solicitacaoSelecionada.servico?.tipo_veiculo ? (
                            <FormControl isRequired>
                                <FormLabel>Veículo Disponível</FormLabel>
                                {getVeiculosDisponiveis(solicitacaoSelecionada.servico.tipo_veiculo).length > 0 ? (
                                    <Select placeholder="Selecione..." value={veiculoSelecionadoId} onChange={(e) => setVeiculoSelecionadoId(e.target.value)}>
                                        {getVeiculosDisponiveis(solicitacaoSelecionada.servico.tipo_veiculo).map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                                    </Select>
                                ) : (
                                    <Alert status="error"><AlertIcon />Sem {solicitacaoSelecionada.servico.tipo_veiculo} disponível.</Alert>
                                )}
                            </FormControl>
                        ) : (
                            <Alert status="info"><AlertIcon />Serviço manual (sem veículo).</Alert>
                        )}
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onApproveClose}>Cancelar</Button>
                <Button colorScheme="green" onClick={handleConfirmarAprovacao}>Confirmar</Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRefuseOpen} onClose={onRefuseClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Recusar Solicitação</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Text mb="10px">Motivo da recusa:</Text>
                <Textarea placeholder="Ex: Trator quebrou..." value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)} />
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onRefuseClose}>Voltar</Button>
                <Button colorScheme="red" onClick={handleConfirmarRecusa}>Recusar</Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Cancelar Solicitação</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Tem certeza? O status mudará para "CANCELADA" e o trator será liberado.
                </Alert>
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onCancelClose}>Voltar</Button>
                <Button colorScheme="red" onClick={handleConfirmarCancelar}>Sim, Cancelar</Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Editar Solicitação</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
               <FormControl mb={4}>
                   <FormLabel>Data de Execução</FormLabel>
                   <Input type="date" value={editData.data_execucao} onChange={(e) => setEditData({...editData, data_execucao: e.target.value})} />
               </FormControl>
               {solicitacaoSelecionada?.servico?.tipo_veiculo && (
                   <FormControl>
                       <FormLabel>Trocar Veículo</FormLabel>
                       <Select value={editData.veiculo_id} onChange={(e) => setEditData({...editData, veiculo_id: e.target.value})}>
                           <option value="">Sem veículo</option>
                           {getVeiculosParaEdicao().map(v => (
                               <option key={v.id} value={v.id}>{v.nome} {v.status === 'EM_USO' && v.id !== solicitacaoSelecionada.veiculo?.id ? '(Ocupado)' : ''}</option>
                           ))}
                       </Select>
                   </FormControl>
               )}
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onEditClose}>Cancelar</Button>
                <Button colorScheme="blue" onClick={handleSalvarEdicao}>Salvar Alterações</Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

      <Formik initialValues={{ servico_id: '', agricultor_id: '', propriedade_id: '', status: 'Pendente' }} validationSchema={SolicitacaoSchema} onSubmit={handleSubmitManual}>
        {(props) => {
          const propriedadesDoAgricultor = propriedades.filter(p => p.agricultor_id === parseInt(props.values.agricultor_id));
          return (
            <Modal isOpen={isFormOpen} onClose={onFormClose}><ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>Nova Solicitação</ModalHeader><ModalCloseButton />
                <ModalBody>
                  <Field name='servico_id'>{({ field, form }) => (
                    <FormControl isInvalid={form.errors.servico_id && form.touched.servico_id}><FormLabel>Serviço</FormLabel><Select {...field} placeholder="Selecione...">{servicos.map(s => <option key={s.id} value={s.id}>{s.nome_servico}</option>)}</Select></FormControl>
                  )}</Field>
                  <Field name='agricultor_id'>{({ field, form }) => (
                    <FormControl mt={4} isInvalid={form.errors.agricultor_id && form.touched.agricultor_id}><FormLabel>Agricultor</FormLabel><Select {...field} placeholder="Selecione..." onChange={(e) => {props.setFieldValue('agricultor_id', e.target.value); props.setFieldValue('propriedade_id', '');}}>{agricultores.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</Select></FormControl>
                  )}</Field>
                  <Field name='propriedade_id'>{({ field, form }) => (
                    <FormControl mt={4} isInvalid={form.errors.propriedade_id && form.touched.propriedade_id}><FormLabel>Propriedade</FormLabel><Select {...field} placeholder="Selecione..." disabled={!props.values.agricultor_id}>{propriedadesDoAgricultor.map(p => <option key={p.id} value={p.id}>{p.terreno}</option>)}</Select></FormControl>
                  )}</Field>
                </ModalBody>
                <ModalFooter><Button colorScheme='brand' type='submit' isLoading={props.isSubmitting}>Salvar</Button></ModalFooter>
              </Form>
            </ModalContent></Modal>
          )
        }}
      </Formik>
    </Box>
  );
}