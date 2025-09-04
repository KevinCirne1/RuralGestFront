
import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getAgricultores, createAgricultor, updateAgricultor, deleteAgricultor } from "services/agricultorService";

const SignupSchema = Yup.object().shape({
  nome: Yup.string().min(3, 'O nome é muito curto!').required('O campo nome é obrigatório'),
  cpf: Yup.string().min(11, 'O CPF deve ter 11 dígitos').required('O campo CPF é obrigatório'),
  comunidade: Yup.string().required('O campo comunidade é obrigatório'),
  contato: Yup.string().required('O campo contato é obrigatório'),
});

export default function AgricultoresPage() {
  const [agricultores, setAgricultores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [agricultorParaDeletar, setAgricultorParaDeletar] = useState(null);
  const [agricultorSelecionado, setAgricultorSelecionado] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchAgricultores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAgricultores();
      setAgricultores(response.data);
    } catch (error) {
      toast({ title: "Erro ao buscar agricultores.", description: "Verifique a conexão com a API.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAgricultores();
  }, [fetchAgricultores]);

  const handleOpenForm = (agricultor = null) => {
    setAgricultorSelecionado(agricultor);
    onFormOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
      if (agricultorSelecionado) {
       
        

        const dadosParaAtualizar = {
          nome: values.nome,
          cpf: values.cpf,
          comunidade: values.comunidade,
          contato: values.contato
        };

        await updateAgricultor(agricultorSelecionado.id, dadosParaAtualizar);
        toast({ title: "Agricultor atualizado com sucesso!", status: "success", duration: 5000, isClosable: true });
      } else {
        
        await createAgricultor(values);
        toast({ title: "Agricultor cadastrado com sucesso!", status: "success", duration: 5000, isClosable: true });
      }
      
      actions.setSubmitting(false);
      onFormClose();
      fetchAgricultores(); 
    } catch (error) {
      toast({ title: "Erro na operação.", description: error.message, status: "error", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
    }
  };
  
  const handleAbrirModalExclusao = (agricultor) => {
    setAgricultorParaDeletar(agricultor);
    onDeleteOpen();
  };

  const handleConfirmarExclusao = async () => {
    if (!agricultorParaDeletar) return;
    try {
      await deleteAgricultor(agricultorParaDeletar.id);
      toast({ title: "Sucesso!", description: `Agricultor "${agricultorParaDeletar.nome}" excluído.`, status: 'success', duration: 3000, isClosable: true });
      onDeleteClose();
      fetchAgricultores();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', description: 'Não foi possível remover o agricultor.', status: 'error', duration: 5000, isClosable: true });
      onDeleteClose();
    }
  };

  if (loading) {
    return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Agricultores</Text>
          <Button colorScheme='brand' onClick={() => handleOpenForm()}>Cadastrar Agricultor</Button>
        </Flex>
        <Table variant='simple'>
          <Thead><Tr><Th>Nome</Th><Th>CPF</Th><Th>Comunidade</Th><Th>Contato</Th><Th>Última Atualização</Th><Th>Ações</Th></Tr></Thead>
          <Tbody>
            {agricultores.map((agricultor) => (
              <Tr key={agricultor.id}>
                <Td>{agricultor.nome}</Td>
                <Td>{agricultor.cpf}</Td>
                <Td>{agricultor.comunidade}</Td>
                <Td>{agricultor.contato}</Td>
                <Td>{new Date(agricultor.data_atualizacao_cadastro).toLocaleDateString()}</Td>
                <Td>
                  <Button size='sm' mr='10px' onClick={() => handleOpenForm(agricultor)}><Icon as={MdEdit} /></Button>
                  <Button size='sm' colorScheme='red' onClick={() => handleAbrirModalExclusao(agricultor)}><Icon as={MdDelete} /></Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Formik
        initialValues={agricultorSelecionado || { nome: '', cpf: '', comunidade: '', contato: '' }}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
        enableReinitialize 
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose}>
            <ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>{agricultorSelecionado ? 'Editar Agricultor' : 'Cadastrar Novo Agricultor'}</ModalHeader><ModalCloseButton />
                <ModalBody>
                  <Field name='nome'>{({ field, form }) => (<FormControl isInvalid={form.errors.nome && form.touched.nome}><FormLabel>Nome Completo</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.nome}</FormErrorMessage></FormControl>)}</Field>
                  <Field name='cpf'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.cpf && form.touched.cpf}><FormLabel>CPF</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.cpf}</FormErrorMessage></FormControl>)}</Field>
                  <Field name='comunidade'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.comunidade && form.touched.comunidade}><FormLabel>Comunidade</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.comunidade}</FormErrorMessage></FormControl>)}</Field>
                  <Field name='contato'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.contato && form.touched.contato}><FormLabel>Contato (Telefone)</FormLabel><Input {...field} type="tel" /><FormErrorMessage>{form.errors.contato}</FormErrorMessage></FormControl>)}</Field>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='brand' mr={3} isLoading={props.isSubmitting} type='submit'>Salvar</Button>
                  <Button variant='ghost' onClick={onFormClose}>Cancelar</Button>
                </ModalFooter>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </Formik>

      {/* Modal de Confirmação de Exclusão */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Você tem certeza que deseja excluir o agricultor <strong>{agricultorParaDeletar?.nome}</strong>?
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