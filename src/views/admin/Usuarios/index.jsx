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


import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "services/usuarioService";


const SignupSchema = Yup.object().shape({
  nome: Yup.string().required('O nome é obrigatório'),
  login: Yup.string().required('O login é obrigatório'),
  perfil: Yup.string().required('O perfil é obrigatório'),
});

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchUsuarios = useCallback(() => {
    setLoading(true);
    getUsuarios()
      .then(response => { setUsuarios(response.data); })
      .catch(error => { toast({ title: "Erro ao buscar usuários.", status: "error", duration: 5000, isClosable: true }); })
      .finally(() => { setLoading(false); });
  }, [toast]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleOpenForm = (usuario = null) => {
    setUsuarioSelecionado(usuario);
    onFormOpen();
  };

  const handleSubmit = (values, actions) => {
    if (usuarioSelecionado) {
      // LÓGICA DE ATUALIZAÇÃO
      updateUsuario(usuarioSelecionado.id, values)
        .then(response => {
          toast({ title: "Usuário atualizado com sucesso!", status: "success", duration: 5000, isClosable: true });
          onFormClose();
          fetchUsuarios();
        })
        .catch(error => { toast({ title: "Erro ao atualizar usuário.", status: "error", duration: 5000, isClosable: true }); })
        .finally(() => { actions.setSubmitting(false); });
    } else {
      
      createUsuario(values)
        .then(response => {
          toast({ title: "Usuário cadastrado com sucesso!", status: "success", duration: 5000, isClosable: true });
          onFormClose();
          fetchUsuarios();
        })
        .catch(error => { toast({ title: "Erro ao cadastrar usuário.", status: "error", duration: 5000, isClosable: true }); })
        .finally(() => { actions.setSubmitting(false); });
    }
  };

  const handleAbrirModalExclusao = (usuario) => {
    setUsuarioParaDeletar(usuario);
    onDeleteOpen();
  };

  const handleConfirmarExclusao = () => {
    if (!usuarioParaDeletar) return;
    deleteUsuario(usuarioParaDeletar.id)
      .then(() => {
        toast({ title: "Usuário excluído com sucesso!", status: "success", duration: 5000, isClosable: true });
        onDeleteClose();
        fetchUsuarios();
      })
      .catch(error => { toast({ title: "Erro ao excluir usuário.", status: "error", duration: 5000, isClosable: true }); })
      .finally(() => { onDeleteClose(); }); 
};

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Usuários</Text>
          <Button colorScheme='brand' onClick={() => handleOpenForm()}>Cadastrar Usuário</Button>
        </Flex>
        <Table variant='simple' size='sm'>
          <Thead><Tr><Th>Nome</Th><Th>Login</Th><Th>Perfil</Th><Th>Ações</Th></Tr></Thead>
          <Tbody>
            {usuarios.map((user) => (
              <Tr key={user.id}>
                <Td>{user.nome}</Td>
                <Td>{user.login}</Td>
                <Td>{user.perfil}</Td>
                <Td>
                  <Button size='sm' mr='10px' onClick={() => handleOpenForm(user)}><Icon as={MdEdit} /></Button>
                  <Button size='sm' colorScheme='red' onClick={() => handleAbrirModalExclusao(user)}><Icon as={MdDelete} /></Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Formik
        initialValues={usuarioSelecionado || { nome: '', login: '', perfil: '' }}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose}><ModalOverlay /><ModalContent>
            <Form>
              <ModalHeader>{usuarioSelecionado ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</ModalHeader><ModalCloseButton />
              <ModalBody>
                <Field name='nome'>{({ field, form }) => (<FormControl isInvalid={form.errors.nome && form.touched.nome}><FormLabel>Nome Completo</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.nome}</FormErrorMessage></FormControl>)}</Field>
                <Field name='login'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.login && form.touched.login}><FormLabel>Login</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.login}</FormErrorMessage></FormControl>)}</Field>
                <Field name='perfil'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.perfil && form.touched.perfil}><FormLabel>Perfil</FormLabel><Select {...field} placeholder="Selecione o perfil"><option value="tecnico">Técnico</option><option value="gestor">Gestor</option></Select><FormErrorMessage>{form.errors.perfil}</FormErrorMessage></FormControl>)}</Field>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme='brand' mr={3} isLoading={props.isSubmitting} type='submit'>Salvar</Button>
                <Button variant='ghost' onClick={onFormClose}>Cancelar</Button>
              </ModalFooter>
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
            Você tem certeza que deseja excluir o usuário <strong>{usuarioParaDeletar?.nome}</strong>?
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