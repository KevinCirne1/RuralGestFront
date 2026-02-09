import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast, Select, Badge
} from "@chakra-ui/react";
import { MdPersonAdd, MdEdit } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from "services/api";
import { formatarCPF, formatarTelefone, apenasNumeros } from "utils/formatters";

// --- CORREÇÃO DO SCHEMA (Compatível com Yup atualizado) ---
const FuncionarioSchema = Yup.object().shape({
  nome: Yup.string().required('Nome é obrigatório'),
  login: Yup.string().required('Login/CPF é obrigatório'),
  // O erro estava aqui. Agora usamos (schema) => schema...
  senha: Yup.string().when('id', {
      is: (val) => !val, // Se não tem ID (é criação)
      then: (schema) => schema.min(6, 'Mínimo 6 caracteres').required('Senha é obrigatória'),
      otherwise: (schema) => schema.notRequired() // Se tem ID (é edição), senha é opcional
  }),
  perfil: Yup.string().required('Defina o cargo'),
  telefone: Yup.string().nullable()
});

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios');
      // Filtra produtores
      const apenasEquipe = response.data.filter(u => u.perfil !== 'produtor');
      setFuncionarios(apenasEquipe);
    } catch (error) {
      toast({ title: "Erro ao carregar equipe.", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Função inteligente para exibir o Login (CPF ou Texto)
  const exibirLogin = (valor) => {
      if (!valor) return "";
      const apenasNums = apenasNumeros(valor);
      const isNumerico = /^\d+$/.test(apenasNums) && valor.length >= 11;
      return isNumerico ? formatarCPF(valor) : valor;
  };

  const handleSubmit = async (values, actions) => {
    try {
      // Verifica se o login é numérico (CPF)
      const isCPF = /^\d+$/.test(apenasNumeros(values.login));
      
      const payload = {
          ...values,
          // Se for CPF limpa a máscara. Se for "admin" mantém o texto.
          login: isCPF ? apenasNumeros(values.login) : values.login,
          telefone: apenasNumeros(values.telefone)
      };

      if (funcionarioSelecionado) {
        if (!values.senha) delete payload.senha; 
        await api.put(`/usuarios/${funcionarioSelecionado.id}`, payload);
        toast({ title: "Atualizado com sucesso!", status: "success" });
      } else {
        await api.post('/usuarios', payload);
        toast({ title: "Cadastrado com sucesso!", status: "success" });
      }
      fetchData();
      onClose();
    } catch (error) {
      toast({ title: "Erro.", description: "Verifique se o login já existe.", status: "error" });
    } finally {
      actions.setSubmitting(false);
    }
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Equipe de Pirpirituba</Text>
          <Button leftIcon={<MdPersonAdd />} colorScheme='brand' onClick={() => { setFuncionarioSelecionado(null); onOpen(); }}>
            Novo Funcionário
          </Button>
        </Flex>

        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Login / CPF</Th>
              <Th>Telefone</Th>
              <Th>Cargo</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {funcionarios.map((func) => (
              <Tr key={func.id}>
                <Td fontWeight="bold">{func.nome}</Td>
                <Td>{exibirLogin(func.login)}</Td> 
                <Td>{func.telefone ? formatarTelefone(func.telefone) : '-'}</Td>
                <Td>
                  <Badge colorScheme={func.perfil === 'admin' ? 'red' : 'green'}>
                    {func.perfil.toUpperCase()}
                  </Badge>
                </Td>
                <Td>
                  <Button size='xs' leftIcon={<MdEdit />} onClick={() => { setFuncionarioSelecionado(func); onOpen(); }}>Editar</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <Formik
            initialValues={funcionarioSelecionado ? {
                ...funcionarioSelecionado,
                login: exibirLogin(funcionarioSelecionado.login),
                telefone: funcionarioSelecionado.telefone ? formatarTelefone(funcionarioSelecionado.telefone) : ''
            } : { 
                // IMPORTANTE: id undefined na criação para o Yup saber que é novo
                nome: '', login: '', senha: '', perfil: 'tecnico', telefone: '' 
            }}
            validationSchema={FuncionarioSchema}
            onSubmit={handleSubmit}
          >
            {(props) => (
              <Form>
                <ModalHeader>{funcionarioSelecionado ? "Editar Membro" : "Novo Funcionário"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Field name='nome'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.nome && form.touched.nome} mb={4}>
                        <FormLabel>Nome Completo</FormLabel>
                        <Input {...field} />
                        <FormErrorMessage>{form.errors.nome}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Flex gap={4}>
                      <Field name='login'>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.login && form.touched.login} mb={4}>
                            <FormLabel>Login (CPF ou Usuário)</FormLabel>
                            <Input 
                                {...field} 
                                onChange={(e) => {
                                    const valor = e.target.value;
                                    // SÓ aplica máscara se for números
                                    if (/^\d*$/.test(apenasNumeros(valor)) && valor.length > 3 && !/[a-zA-Z]/.test(valor)) {
                                       form.setFieldValue('login', formatarCPF(valor));
                                    } else {
                                       form.setFieldValue('login', valor);
                                    }
                                }}
                            />
                            <FormErrorMessage>{form.errors.login}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>

                      <Field name='telefone'>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.telefone && form.touched.telefone} mb={4}>
                            <FormLabel>Telefone</FormLabel>
                            <Input 
                                {...field} 
                                maxLength={15}
                                onChange={(e) => {
                                    form.setFieldValue('telefone', formatarTelefone(e.target.value));
                                }}
                            />
                            <FormErrorMessage>{form.errors.telefone}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                  </Flex>

                  <Field name='perfil'>
                    {({ field }) => (
                      <FormControl mb={4}>
                        <FormLabel>Cargo / Função</FormLabel>
                        <Select {...field}>
                            <option value="tecnico">Técnico Agrícola</option>
                            <option value="operador">Operador de Máquinas</option>
                            <option value="gestor">Secretário / Gestor</option>
                            <option value="admin">Administrador</option>
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  <Field name='senha'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.senha && form.touched.senha} mb={4}>
                        <FormLabel>Senha</FormLabel>
                        <Input {...field} type="password" />
                        <FormErrorMessage>{form.errors.senha}</FormErrorMessage>
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
    </Box>
  );
}