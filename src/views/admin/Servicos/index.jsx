import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast, Textarea
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getServicos, createServico, updateServico, deleteServico } from "services/servicoService";

// CORREÇÃO: Removido o campo 'capacidade_hectares' da validação
const ServicoSchema = Yup.object().shape({
  nome_servico: Yup.string().required('O nome do serviço é obrigatório'),
  descricao: Yup.string(),
});

export default function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [servicoParaDeletar, setServicoParaDeletar] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchServicos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getServicos();
      setServicos(response.data);
    } catch (error) {
      toast({ title: "Erro ao buscar serviços.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServicos();
  }, [fetchServicos]);

  const handleOpenForm = (servico = null) => {
    setServicoSelecionado(servico);
    onFormOpen();
  };

  // CORREÇÃO: Simplificado o handleSubmit para enviar apenas os valores do formulário
  const handleSubmit = async (values, actions) => {
    try {
      if (servicoSelecionado) {
        await updateServico(servicoSelecionado.id, values);
        toast({ title: "Serviço atualizado com sucesso!", status: "success", duration: 5000, isClosable: true });
      } else {
        await createServico(values);
        toast({ title: "Serviço cadastrado com sucesso!", status: "success", duration: 5000, isClosable: true });
      }
      actions.setSubmitting(false);
      onFormClose();
      fetchServicos();
    } catch (error) {
      toast({ title: "Erro na operação.", description: error.message, status: "error", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
    }
  };
  
  const handleAbrirModalExclusao = (servico) => {
    setServicoParaDeletar(servico);
    onDeleteOpen();
  };

  const handleConfirmarExclusao = async () => {
    if (!servicoParaDeletar) return;
    try {
      await deleteServico(servicoParaDeletar.id);
      toast({
        title: "Sucesso!",
        description: `Serviço "${servicoParaDeletar.nome_servico}" excluído.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onDeleteClose();
      fetchServicos();
    } catch (error) {
      toast({
        title: 'Erro ao excluir.',
        description: 'Não foi possível remover o serviço.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
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
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Catálogo de Serviços</Text>
          <Button colorScheme='brand' onClick={() => handleOpenForm()}>Novo Serviço</Button>
        </Flex>
        <Table variant='simple'>
          {/* CORREÇÃO: Removida a coluna 'Capacidade (ha)' */}
          <Thead><Tr><Th>Nome do Serviço</Th><Th>Descrição</Th><Th>Ações</Th></Tr></Thead>
          <Tbody>
            {servicos.map((servico) => (
              <Tr key={servico.id}>
                <Td>{servico.nome_servico}</Td>
                <Td>{servico.descricao}</Td>
                {/* CORREÇÃO: Removida a célula da capacidade */}
                <Td>
                  <Button size='sm' mr='10px' onClick={() => handleOpenForm(servico)}><Icon as={MdEdit} /></Button>
                  <Button size='sm' colorScheme='red' onClick={() => handleAbrirModalExclusao(servico)}><Icon as={MdDelete} /></Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Formik
        // CORREÇÃO: Removido 'capacidade_hectares' dos valores iniciais
        initialValues={servicoSelecionado || { nome_servico: '', descricao: '' }}
        validationSchema={ServicoSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose}>
            <ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>{servicoSelecionado ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</ModalHeader><ModalCloseButton />
                <ModalBody>
                  <Field name='nome_servico'>{({ field, form }) => (<FormControl isInvalid={form.errors.nome_servico && form.touched.nome_servico}><FormLabel>Nome do Serviço</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.nome_servico}</FormErrorMessage></FormControl>)}</Field>
                  <Field name='descricao'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.descricao && form.touched.descricao}><FormLabel>Descrição</FormLabel><Textarea {...field} /><FormErrorMessage>{form.errors.descricao}</FormErrorMessage></FormControl>)}</Field>
                  {/* CORREÇÃO: Removido o campo 'capacidade_hectares' do formulário */}
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

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Você tem certeza que deseja excluir o serviço <strong>{servicoParaDeletar?.nome_servico}</strong>?
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