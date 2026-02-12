import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast, Select, Badge,
  IconButton, Tooltip
} from "@chakra-ui/react";
import { MdPersonAdd, MdEdit, MdDelete } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from "services/api";
import { formatarCPF, formatarTelefone, apenasNumeros } from "utils/formatters";

// Schema de Validação
const FuncionarioSchema = Yup.object().shape({
  nome: Yup.string().required('Nome é obrigatório'),
  login: Yup.string().required('Login/CPF é obrigatório'),
  senha: Yup.string().when('id', {
      is: (val) => !val, // Se não tem ID (é criação), senha é obrigatória
      then: (schema) => schema.min(6, 'Mínimo 6 caracteres').required('Senha é obrigatória'),
      otherwise: (schema) => schema.notRequired() // Se é edição, senha é opcional
  }),
  perfil: Yup.string().required('Defina o cargo'),
  // Padronizado para 'contato', igual em Agricultores
  contato: Yup.string().nullable()
});

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controles de Modal
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios');
      // Filtra para exibir apenas equipe interna (Gestor, Admin, Técnico, Operador)
      const apenasEquipe = response.data.filter(u => u.perfil !== 'produtor');
      setFuncionarios(apenasEquipe);
    } catch (error) {
      toast({ title: "Erro ao carregar equipe.", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Função para exibir CPF formatado se for numérico, ou login normal
  const exibirLogin = (valor) => {
      if (!valor) return "";
      const apenasNums = apenasNumeros(valor);
      const isNumerico = /^\d+$/.test(apenasNums) && valor.length >= 11;
      return isNumerico ? formatarCPF(valor) : valor;
  };

  const handleOpenForm = (func = null) => {
    setFuncionarioSelecionado(func);
    onFormOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
      // Verifica se o login inserido parece um CPF
      const isCPF = /^\d+$/.test(apenasNumeros(values.login));
      
      const payload = {
          ...values,
          // Se for CPF, salva apenas números. Se for texto (ex: admin), salva texto.
          login: isCPF ? apenasNumeros(values.login) : values.login,
          // Salva 'contato' apenas com números
          contato: values.contato ? apenasNumeros(values.contato) : null
      };

      if (funcionarioSelecionado) {
        // Se for edição e a senha estiver vazia, remove do payload para não zerar a senha atual
        if (!values.senha) delete payload.senha; 
        
        await api.put(`/usuarios/${funcionarioSelecionado.id}`, payload);
        toast({ title: "Funcionário atualizado!", status: "success" });
      } else {
        await api.post('/usuarios', payload);
        toast({ title: "Funcionário cadastrado!", status: "success" });
      }
      fetchData();
      onFormClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Verifique se o login já existe.";
      toast({ title: "Erro ao salvar.", description: msg, status: "error" });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!funcionarioParaDeletar) return;
    try {
        await api.delete(`/usuarios/${funcionarioParaDeletar.id}`);
        toast({ title: "Usuário excluído com sucesso.", status: "success" });
        fetchData();
        onDeleteClose();
    } catch (error) {
        toast({ title: "Erro ao excluir.", description: "Tente novamente mais tarde.", status: "error" });
    }
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' color="brand.500" /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Equipe da Secretaria</Text>
          <Button leftIcon={<MdPersonAdd />} colorScheme='brand' onClick={() => handleOpenForm()}>
            Novo Funcionário
          </Button>
        </Flex>

        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th borderColor={borderColor}>Nome</Th>
              <Th borderColor={borderColor}>Login / CPF</Th>
              <Th borderColor={borderColor}>Contato</Th> 
              <Th borderColor={borderColor}>Cargo</Th>
              <Th borderColor={borderColor}>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {funcionarios.map((func) => (
              <Tr key={func.id}>
                <Td fontWeight="bold" borderColor={borderColor}>{func.nome}</Td>
                <Td borderColor={borderColor}>{exibirLogin(func.login)}</Td> 
                
                {/* Exibição do Contato formatado */}
                <Td borderColor={borderColor}>
                    {func.contato ? formatarTelefone(func.contato) : '-'}
                </Td>
                
                <Td borderColor={borderColor}>
                  <Badge 
                    colorScheme={
                        func.perfil === 'admin' ? 'purple' : 
                        func.perfil === 'gestor' ? 'blue' : 'green'
                    }
                    borderRadius="8px"
                    px="2"
                  >
                    {func.perfil.toUpperCase()}
                  </Badge>
                </Td>
                
                <Td borderColor={borderColor}>
                    <Flex gap="2">
                        <Tooltip label="Editar Dados">
                            <IconButton 
                                icon={<MdEdit />} 
                                colorScheme="brand" 
                                size="sm" 
                                isRound 
                                aria-label="Editar Funcionário"
                                onClick={() => handleOpenForm(func)} 
                            />
                        </Tooltip>
                        <Tooltip label="Excluir Conta">
                            <IconButton 
                                icon={<MdDelete />} 
                                colorScheme="red" 
                                size="sm" 
                                isRound 
                                aria-label="Excluir Funcionário"
                                onClick={() => { setFuncionarioParaDeletar(func); onDeleteOpen(); }} 
                            />
                        </Tooltip>
                    </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* Modal de Cadastro e Edição */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <Formik
            initialValues={funcionarioSelecionado ? {
                ...funcionarioSelecionado,
                login: exibirLogin(funcionarioSelecionado.login),
                // Preenche o campo 'contato' se existir
                contato: funcionarioSelecionado.contato ? formatarTelefone(funcionarioSelecionado.contato) : ''
            } : { 
                nome: '', login: '', senha: '', perfil: 'tecnico', contato: '' 
            }}
            validationSchema={FuncionarioSchema}
            onSubmit={handleSubmit}
            enableReinitialize
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
                        <Input {...field} placeholder="Nome do funcionário" />
                        <FormErrorMessage>{form.errors.nome}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Flex gap={4} direction={{ base: "column", md: "row" }}>
                      <Field name='login'>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.login && form.touched.login} mb={4}>
                            <FormLabel>Login (CPF ou Usuário)</FormLabel>
                            <Input 
                                {...field} 
                                placeholder="CPF ou nome de usuário"
                                onChange={(e) => {
                                    const valor = e.target.value;
                                    // Lógica simples para formatar CPF enquanto digita
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

                      <Field name='contato'>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.contato && form.touched.contato} mb={4}>
                            <FormLabel>Contato / Whatsapp</FormLabel>
                            <Input 
                                {...field} 
                                placeholder="(83) 99999-9999"
                                maxLength={15}
                                onChange={(e) => {
                                    form.setFieldValue('contato', formatarTelefone(e.target.value));
                                }}
                            />
                            <FormErrorMessage>{form.errors.contato}</FormErrorMessage>
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
                            <option value="admin">Administrador do Sistema</option>
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  <Field name='senha'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.senha && form.touched.senha} mb={4}>
                        <FormLabel>{funcionarioSelecionado ? "Nova Senha (Opcional)" : "Senha de Acesso"}</FormLabel>
                        <Input {...field} type="password" placeholder={funcionarioSelecionado ? "Deixe em branco para manter a atual" : "Crie uma senha"} />
                        <FormErrorMessage>{form.errors.senha}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>
                <ModalFooter>
                  <Button variant='ghost' mr={3} onClick={onFormClose}>Cancelar</Button>
                  <Button colorScheme='brand' type='submit' isLoading={props.isSubmitting}>Salvar</Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Tem certeza que deseja remover o acesso de <strong>{funcionarioParaDeletar?.nome}</strong>?
            <br/><br/>
            <Text fontSize="sm" color="red.500">Essa ação não pode ser desfeita.</Text>
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