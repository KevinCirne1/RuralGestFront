import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast, Select
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Importa os serviços de API
import { getAgricultores } from "services/agricultorService";
import { getServicos } from "services/servicoService";
import { getSolicitacoes, createSolicitacao, updateSolicitacao, deleteSolicitacao } from "services/solicitacaoService";

const SignupSchema = Yup.object().shape({
  servicoId: Yup.string().required('É preciso selecionar um serviço'),
  agricultorId: Yup.string().required('É preciso selecionar um agricultor'),
  status: Yup.string().required('O status é obrigatório'),
});

export default function ServicosPage() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const [solicitacaoParaDeletar, setSolicitacaoParaDeletar] = useState(null);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [solicitacoesRes, agricultoresRes, servicosRes] = await Promise.all([
        getSolicitacoes(),
        getAgricultores(),
        getServicos()
      ]);
      setSolicitacoes(solicitacoesRes.data);
      setAgricultores(agricultoresRes.data);
      setServicos(servicosRes.data);
    } catch (error) {
      toast({ title: "Erro ao buscar dados.", description: "Verifique a conexão com a API.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (solicitacao = null) => {
    setSolicitacaoSelecionada(solicitacao);
    onFormOpen();
  };

  const handleAbrirModalExclusao = (solicitacao) => {
    setSolicitacaoParaDeletar(solicitacao);
    onDeleteOpen();
  };

  const handleConfirmarExclusao = async () => {
    if (!solicitacaoParaDeletar) return;
    try {
      await deleteSolicitacao(solicitacaoParaDeletar.id);
      toast({ title: 'Sucesso!', description: 'Solicitação excluída.', status: 'success', duration: 3000, isClosable: true });
      onDeleteClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', description: 'Não foi possível remover a solicitação.', status: 'error', duration: 5000, isClosable: true });
      onDeleteClose();
    }
  };

  const handleSubmit = async (values, actions) => {
    try {
      const dataToSubmit = { ...values, 
        agricultorId: parseInt(values.agricultorId),
        servicoId: parseInt(values.servicoId)
      };

      if (solicitacaoSelecionada) {
        // LÓGICA DE ATUALIZAÇÃO (PUT)
        await updateSolicitacao(solicitacaoSelecionada.id, dataToSubmit);
        toast({ title: "Solicitação atualizada com sucesso!", status: "success", duration: 5000, isClosable: true });
      } else {
        // LÓGICA DE CRIAÇÃO (POST)
        await createSolicitacao({ ...dataToSubmit, 
          data_solicitacao: new Date().toISOString(),
          status: 'Pendente' // Define o status inicial
        });
        toast({ title: "Solicitação registrada com sucesso!", status: "success", duration: 5000, isClosable: true });
      }
      
      actions.setSubmitting(false);
      onFormClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro na operação.", description: error.message, status: "error", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Serviços Solicitados</Text>
          <Button colorScheme='brand' onClick={() => handleOpenForm()}>Registrar Novo Serviço</Button>
        </Flex>
        <Table variant='simple' size='sm'>
          <Thead><Tr><Th>Serviço</Th><Th>Agricultor</Th><Th>Solicitação</Th><Th>Status</Th><Th>Ações</Th></Tr></Thead>
          <Tbody>
            {solicitacoes.map((sol) => {
              // CORREÇÃO: Usando '==' para fazer a comparação de forma correta
              const agricultor = agricultores.find(a => a.id == sol.agricultorId);
              const servico = servicos.find(s => s.id == sol.servicoId);
              return (
                <Tr key={sol.id}>
                  <Td>{servico ? servico.nome_servico : 'N/A'}</Td>
                  <Td>{agricultor ? agricultor.nome : 'N/A'}</Td>
                  <Td>{formatDate(sol.data_solicitacao)}</Td>
                  <Td>{sol.status}</Td>
                  <Td>
                    <Button size='sm' mr='10px' onClick={() => handleOpenForm(sol)}><Icon as={MdEdit} /></Button>
                    <Button size='sm' colorScheme='red' onClick={() => handleAbrirModalExclusao(sol)}><Icon as={MdDelete} /></Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>
      
      <Formik
        initialValues={solicitacaoSelecionada || { servicoId: '', agricultorId: '', status: 'Pendente' }}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose}><ModalOverlay /><ModalContent>
            <Form>
              <ModalHeader>{solicitacaoSelecionada ? 'Editar Solicitação' : 'Registrar Nova Solicitação'}</ModalHeader><ModalCloseButton />
              <ModalBody>
                <Field name='servicoId'>{({ field, form }) => (
                  <FormControl isInvalid={form.errors.servicoId && form.touched.servicoId}>
                    <FormLabel>Tipo de Serviço</FormLabel>
                    <Select {...field} placeholder="Selecione o serviço">
                      {servicos.map(serv => (
                        <option key={serv.id} value={serv.id}>{serv.nome_servico}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{form.errors.servicoId}</FormErrorMessage>
                  </FormControl>
                )}</Field>
                <Field name='agricultorId'>{({ field, form }) => (
                  <FormControl mt={4} isInvalid={form.errors.agricultorId && form.touched.agricultorId}>
                    <FormLabel>Agricultor</FormLabel>
                    <Select {...field} placeholder="Selecione o agricultor">
                      {agricultores.map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.nome}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{form.errors.agricultorId}</FormErrorMessage>
                  </FormControl>
                )}</Field>
                <Field name='status'>{({ field, form }) => (
                  <FormControl mt={4} isInvalid={form.errors.status && form.touched.status}>
                    <FormLabel>Status</FormLabel>
                    <Select {...field}>
                      <option value="Pendente">Pendente</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                    </Select>
                    <FormErrorMessage>{form.errors.status}</FormErrorMessage>
                  </FormControl>
                )}</Field>
              </ModalBody>
              <ModalFooter><Button colorScheme='brand' mr={3} isLoading={props.isSubmitting} type='submit'>Salvar</Button><Button variant='ghost' onClick={onFormClose}>Cancelar</Button></ModalFooter>
            </Form>
          </ModalContent></Modal>
        )}
      </Formik>

      {/* Modal de Confirmação de Exclusão */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Você tem certeza que deseja excluir esta solicitação?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleConfirmarExclusao}>Excluir</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}