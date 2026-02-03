import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast,
  IconButton, Tooltip, InputGroup, InputLeftElement
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdPersonAdd, MdSearch } from "react-icons/md"; 
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getAgricultores, createAgricultor, updateAgricultor, deleteAgricultor } from "services/agricultorService";

// Validação do Formulário
const AgricultorSchema = Yup.object().shape({
  nome: Yup.string().required('Nome é obrigatório'),
  cpf: Yup.string().required('CPF é obrigatório'),
  comunidade: Yup.string().required('Comunidade é obrigatória'),
  contato: Yup.string().required('Contato é obrigatório')
});

export default function AgricultoresPage() {
  const [agricultores, setAgricultores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADO DA BUSCA ---
  const [busca, setBusca] = useState("");

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [agricultorParaDeletar, setAgricultorParaDeletar] = useState(null);
  const [agricultorSelecionado, setAgricultorSelecionado] = useState(null);
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAgricultores();
      setAgricultores(response.data);
    } catch (error) {
      toast({ title: "Erro ao buscar dados.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (agricultor = null) => {
    setAgricultorSelecionado(agricultor);
    onFormOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
      if (agricultorSelecionado) {
        await updateAgricultor(agricultorSelecionado.id, values); 
        toast({ title: "Agricultor atualizado!", status: "success", duration: 5000, isClosable: true });
      } else {
        await createAgricultor(values);
        toast({ title: "Agricultor cadastrado!", status: "success", duration: 5000, isClosable: true });
      }
      actions.setSubmitting(false);
      onFormClose();
      fetchData();
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
      toast({ title: 'Sucesso!', description: `Agricultor excluído.`, status: 'success', duration: 3000, isClosable: true });
      onDeleteClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', description: 'Verifique se ele possui propriedades vinculadas.', status: 'error', duration: 5000, isClosable: true });
      onDeleteClose();
    }
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Agricultores</Text>
          <Button leftIcon={<MdPersonAdd />} colorScheme='brand' onClick={() => handleOpenForm()}>Novo Agricultor</Button>
        </Flex>
        
        {/* --- BARRA DE PESQUISA (TURBINADA) --- */}
        <InputGroup mb="20px">
            <InputLeftElement pointerEvents='none'>
                <Icon as={MdSearch} color='gray.300' />
            </InputLeftElement>
            <Input 
                placeholder="Buscar por Nome, CPF ou Comunidade..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                borderRadius="10px"
            />
        </InputGroup>

        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>CPF</Th>
              <Th>Comunidade</Th>
              <Th>Contato</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* --- FILTRO INTELIGENTE: Busca em vários campos --- */}
            {agricultores
                .filter(ag => {
                    const termo = busca.toLowerCase();
                    return (
                        ag.nome.toLowerCase().includes(termo) ||
                        ag.cpf.includes(termo) || 
                        ag.comunidade.toLowerCase().includes(termo)
                    );
                })
                .map((ag) => (
                    <Tr key={ag.id}>
                      <Td fontWeight="bold">{ag.nome}</Td>
                      <Td>{ag.cpf}</Td>
                      <Td>{ag.comunidade}</Td>
                      <Td>{ag.contato}</Td>
                      <Td>
                        <Flex gap="5px">
                          <Tooltip label="Editar">
                            <IconButton size='sm' colorScheme='brand' icon={<MdEdit />} onClick={() => handleOpenForm(ag)} />
                          </Tooltip>
                          <Tooltip label="Excluir">
                            <IconButton size='sm' colorScheme='red' icon={<MdDelete />} onClick={() => handleAbrirModalExclusao(ag)} />
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
            ))}

            {/* Mensagem se não achar nada */}
            {agricultores.length > 0 && agricultores.filter(ag => ag.nome.toLowerCase().includes(busca.toLowerCase()) || ag.cpf.includes(busca)).length === 0 && (
                <Tr>
                    <Td colSpan={5} textAlign="center" py="4" color="gray.500">
                        Nenhum agricultor encontrado para "{busca}".
                    </Td>
                </Tr>
            )}
          </Tbody>
        </Table>
      </Card>

      {/* Formulário (Modal) */}
      <Formik 
        initialValues={agricultorSelecionado || { nome: '', cpf: '', comunidade: '', contato: '' }} 
        validationSchema={AgricultorSchema} 
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
            <ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>{agricultorSelecionado ? "Editar Agricultor" : "Cadastrar Agricultor"}</ModalHeader><ModalCloseButton />
                <ModalBody>
                  <Field name='nome'>{({ field, form }) => (<FormControl isInvalid={form.errors.nome && form.touched.nome} mb={4}><FormLabel>Nome Completo</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.nome}</FormErrorMessage></FormControl>)}</Field>
                  
                  <Flex gap="4">
                      <Field name='cpf'>{({ field, form }) => (<FormControl isInvalid={form.errors.cpf && form.touched.cpf} mb={4}><FormLabel>CPF</FormLabel><Input {...field} placeholder="000.000.000-00" /><FormErrorMessage>{form.errors.cpf}</FormErrorMessage></FormControl>)}</Field>
                      <Field name='contato'>{({ field, form }) => (<FormControl isInvalid={form.errors.contato && form.touched.contato} mb={4}><FormLabel>Contato / Celular</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.contato}</FormErrorMessage></FormControl>)}</Field>
                  </Flex>

                  <Field name='comunidade'>{({ field, form }) => (<FormControl isInvalid={form.errors.comunidade && form.touched.comunidade} mb={4}><FormLabel>Comunidade / Localidade</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.comunidade}</FormErrorMessage></FormControl>)}</Field>
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

      {/* Modal Exclusão */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay /><ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader><ModalCloseButton />
          <ModalBody>
            Tem certeza que deseja remover <strong>{agricultorParaDeletar?.nome}</strong>?
            <Text fontSize="sm" color="red.500" mt={2}>Cuidado: Se ele tiver propriedades cadastradas, a exclusão pode ser bloqueada.</Text>
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