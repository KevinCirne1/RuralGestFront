import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast, Select, Badge,
  IconButton, Tooltip, InputGroup, InputLeftElement, Icon, FormHelperText 
} from "@chakra-ui/react";
import { MdPersonAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md"; 
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from "services/api";
import { formatarCPF, formatarTelefone, apenasNumeros } from "utils/formatters";

const FuncionarioSchema = Yup.object().shape({
  nome: Yup.string().required('Nome é obrigatório'),
  login: Yup.string().required('Login/CPF é obrigatório'),
  // Senha só é obrigatória se não tiver ID (ou seja, criando novo)
  senha: Yup.string().when('id', {
      is: (val) => !val, 
      then: (schema) => schema.min(6, 'Mínimo 6 caracteres').required('Senha é obrigatória'),
      otherwise: (schema) => schema.notRequired() 
  }),
  perfil: Yup.string().required('Defina o cargo'),
  contato: Yup.string().nullable()
});

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  
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
      // Filtra para não mostrar o "Produtor" (Agricultor), apenas a equipe interna
      const apenasEquipe = response.data.filter(u => u.perfil !== 'produtor');
      setFuncionarios(apenasEquipe);
    } catch (error) {
      toast({ title: "Erro ao carregar equipe.", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exibirLogin = (valor) => {
      if (!valor) return "";
      // Se for puramente numérico e grande, assume que é CPF e formata
      const apenasNums = apenasNumeros(valor);
      const isCpf = /^\d+$/.test(apenasNums) && valor.length >= 11 && !/[a-zA-Z]/.test(valor);
      return isCpf ? formatarCPF(valor) : valor;
  };

  const handleOpenForm = (func = null) => {
    setFuncionarioSelecionado(func);
    onFormOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
      // --- CORREÇÃO DE LÓGICA DE LOGIN ---
      // Verifica se o login digitado contém alguma letra
      const possuiLetras = /[a-zA-Z]/.test(values.login);
      
      let loginFinal = values.login;

      if (!possuiLetras) {
          // Se NÃO tem letras, assume que é CPF/Telefone e limpa a formatação (pontos e traços)
          loginFinal = apenasNumeros(values.login);
      }
      // Se TEM letras (ex: "joao.silva" ou "admin123"), mantém original
      
      // --- 1. VERIFICAÇÃO DE DUPLICIDADE (LOGIN) ---
      const loginExiste = funcionarios.find(func => 
         func.login === loginFinal && func.id !== funcionarioSelecionado?.id
      );

      if (loginExiste) {
        toast({ 
            title: "Login Indisponível", 
            description: "Este CPF ou nome de usuário já está sendo usado.", 
            status: "warning",
            duration: 5000,
            isClosable: true
        });
        return; 
      }

      // --- 2. VERIFICAÇÃO DE DUPLICIDADE (CONTATO) ---
      if (values.contato) {
        const contatoLimpo = apenasNumeros(values.contato);
        const contatoExiste = funcionarios.find(func => 
            func.contato === contatoLimpo && func.id !== funcionarioSelecionado?.id
        );

        if (contatoExiste) {
            toast({ 
                title: "Telefone em uso", 
                description: `Número já pertence a ${contatoExiste.nome}.`, 
                status: "warning",
                duration: 5000,
                isClosable: true
            });
            return; 
        }
      }

      const payload = {
          ...values,
          login: loginFinal,
          contato: values.contato ? apenasNumeros(values.contato) : null
      };

      // Remove senha do payload se for edição e estiver vazia (para não sobrescrever com vazio)
      if (funcionarioSelecionado && !values.senha) {
          delete payload.senha; 
      }

      if (funcionarioSelecionado) {
        await api.put(`/usuarios/${funcionarioSelecionado.id}`, payload);
        toast({ title: "Funcionário atualizado!", status: "success" });
      } else {
        await api.post('/usuarios', payload);
        toast({ title: "Funcionário cadastrado!", status: "success" });
      }
      fetchData();
      onFormClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao salvar dados.";
      toast({ title: "Erro na operação.", description: msg, status: "error" });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!funcionarioParaDeletar) return;
    try {
        await api.delete(`/usuarios/${funcionarioParaDeletar.id}`);
        toast({ title: "Usuário excluído.", status: "success" });
        fetchData();
        onDeleteClose();
    } catch (error) {
        toast({ title: "Erro ao excluir.", description: "Verifique se ele possui tarefas vinculadas.", status: "error" });
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

        <InputGroup mb="20px">
            <InputLeftElement pointerEvents='none'><Icon as={MdSearch} color='gray.300' /></InputLeftElement>
            <Input 
                placeholder="Buscar por Nome, Login ou Cargo..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                borderRadius="10px"
            />
        </InputGroup>

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
            {funcionarios
                .filter(func => {
                    const termo = busca.toLowerCase();
                    const loginDisplay = func.login ? String(func.login).toLowerCase() : "";
                    return (
                        func.nome.toLowerCase().includes(termo) ||
                        loginDisplay.includes(termo) ||
                        func.perfil.toLowerCase().includes(termo)
                    );
                })
                .map((func) => (
                    <Tr key={func.id}>
                        <Td fontWeight="bold" borderColor={borderColor}>{func.nome}</Td>
                        <Td borderColor={borderColor}>{exibirLogin(func.login)}</Td> 
                        <Td borderColor={borderColor}>
                            {func.contato ? formatarTelefone(func.contato) : '-'}
                        </Td>
                        <Td borderColor={borderColor}>
                        <Badge 
                            colorScheme={
                                func.perfil === 'admin' ? 'purple' : 'green'
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
                                        onClick={() => handleOpenForm(func)} 
                                    />
                                </Tooltip>
                                <Tooltip label="Excluir Conta">
                                    <IconButton 
                                        icon={<MdDelete />} 
                                        colorScheme="red" 
                                        size="sm" 
                                        isRound 
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

      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <Formik
            initialValues={funcionarioSelecionado ? {
                ...funcionarioSelecionado,
                id: funcionarioSelecionado.id, // Garante que o ID vai para validação do Yup
                login: exibirLogin(funcionarioSelecionado.login),
                contato: funcionarioSelecionado.contato ? formatarTelefone(funcionarioSelecionado.contato) : '',
                senha: '' // Senha sempre vazia na edição
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
                                // Bloqueia edição de login se já existir (opcional, removi o disabled para flexibilidade)
                                onChange={(e) => {
                                    const valor = e.target.value;
                                    // Se for só número e parecer CPF, formata
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
                            <option value="admin">Assistente (Admin)</option>
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