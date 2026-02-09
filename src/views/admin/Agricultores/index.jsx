import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast,
  IconButton, Tooltip, InputGroup, InputLeftElement, FormHelperText
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdPersonAdd, MdSearch } from "react-icons/md"; 
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getAgricultores, createAgricultor, updateAgricultor, deleteAgricultor } from "services/agricultorService";

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
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const toast = useToast();

  // --- VALIDAÇÃO DINÂMICA (CORRIGIDA) ---
  // Substituímos o .when() por um ternário simples para evitar erro de versão do Yup
  const AgricultorSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    cpf: Yup.string().required('CPF é obrigatório'),
    comunidade: Yup.string().required('Comunidade é obrigatória'),
    contato: Yup.string().required('Contato é obrigatório'),
    
    // Se NÃO tem agricultor selecionado (null), estamos criando -> Senha Obrigatória
    // Se TEM agricultor selecionado (objeto), estamos editando -> Senha Opcional
    senha: !agricultorSelecionado 
        ? Yup.string().required('Defina uma senha para o acesso do produtor')
        : Yup.string().nullable()
  });

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
        // Na edição, removemos a senha do objeto para não enviar vazia
        // (A menos que você queira implementar troca de senha na edição futuramente)
        const { senha, ...dadosParaAtualizar } = values; 
        await updateAgricultor(agricultorSelecionado.id, dadosParaAtualizar); 
        toast({ title: "Agricultor atualizado!", status: "success", duration: 5000, isClosable: true });
      } else {
        // Na criação, mandamos tudo (incluindo a senha)
        await createAgricultor(values);
        toast({ 
            title: "Agricultor e Usuário criados!", 
            description: `Login: ${values.cpf} (ou email) | Senha: Definida no cadastro`,
            status: "success", 
            duration: 6000, 
            isClosable: true 
        });
      }
      onFormClose();
      fetchData();
    } catch (error) {
      console.error(error);
      const msgErro = error.response?.data?.message || "Erro desconhecido";
      toast({ 
        title: "Erro na operação.", 
        description: msgErro, 
        status: "error", 
        duration: 5000, 
        isClosable: true 
      });
    } finally {
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
      toast({ title: 'Sucesso!', description: `Agricultor e acesso removidos.`, status: 'success', duration: 3000, isClosable: true });
      onDeleteClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', description: 'Verifique se ele possui propriedades vinculadas.', status: 'error', duration: 5000, isClosable: true });
      onDeleteClose();
    }
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' color='brand.500' /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Agricultores</Text>
          <Button leftIcon={<MdPersonAdd />} colorScheme='brand' onClick={() => handleOpenForm()}>Novo Agricultor</Button>
        </Flex>
        
        {/* --- BARRA DE PESQUISA --- */}
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

        <Table variant='simple' size='sm' color='gray.500'>
          <Thead>
            <Tr>
              <Th borderColor={borderColor}>Nome</Th>
              <Th borderColor={borderColor}>CPF (Login)</Th>
              <Th borderColor={borderColor}>Comunidade</Th>
              <Th borderColor={borderColor}>Contato</Th>
              <Th borderColor={borderColor}>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {agricultores
                .filter(ag => {
                    const termo = busca.toLowerCase();
                    return (
                        ag.nome.toLowerCase().includes(termo) ||
                        (ag.cpf && ag.cpf.includes(termo)) || 
                        ag.comunidade.toLowerCase().includes(termo)
                    );
                })
                .map((ag) => (
                    <Tr key={ag.id}>
                      <Td fontWeight="bold" color={textColor} borderColor={borderColor}>{ag.nome}</Td>
                      <Td borderColor={borderColor}>{ag.cpf}</Td>
                      <Td borderColor={borderColor}>{ag.comunidade}</Td>
                      <Td borderColor={borderColor}>{ag.contato}</Td>
                      <Td borderColor={borderColor}>
                        <Flex gap="5px">
                          <Tooltip label="Editar">
                            <IconButton 
                                size='sm' 
                                colorScheme='brand' 
                                icon={<MdEdit />} 
                                isRound 
                                onClick={() => handleOpenForm(ag)} 
                            />
                          </Tooltip>
                          <Tooltip label="Excluir">
                            <IconButton 
                                size='sm' 
                                colorScheme='red' 
                                icon={<MdDelete />} 
                                isRound 
                                onClick={() => handleAbrirModalExclusao(ag)} 
                            />
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
            ))}

            {agricultores.length > 0 && agricultores.filter(ag => ag.nome.toLowerCase().includes(busca.toLowerCase()) || (ag.cpf && ag.cpf.includes(busca))).length === 0 && (
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
        initialValues={agricultorSelecionado || { nome: '', cpf: '', comunidade: '', contato: '', senha: '' }} 
        validationSchema={AgricultorSchema} 
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
            <ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>{agricultorSelecionado ? "Editar Agricultor" : "Cadastrar Agricultor e Acesso"}</ModalHeader><ModalCloseButton />
                <ModalBody>
                  <Field name='nome'>
                      {({ field, form }) => (
                          <FormControl isInvalid={form.errors.nome && form.touched.nome} mb={4}>
                              <FormLabel>Nome Completo</FormLabel>
                              <Input {...field} placeholder="Ex: José da Silva" />
                              <FormErrorMessage>{form.errors.nome}</FormErrorMessage>
                          </FormControl>
                      )}
                  </Field>
                  
                  <Flex gap="4">
                      <Field name='cpf'>
                          {({ field, form }) => (
                              <FormControl isInvalid={form.errors.cpf && form.touched.cpf} mb={4}>
                                  <FormLabel>CPF (Usuário)</FormLabel>
                                  <Input {...field} placeholder="000.000.000-00" />
                                  <FormErrorMessage>{form.errors.cpf}</FormErrorMessage>
                              </FormControl>
                          )}
                      </Field>
                      <Field name='contato'>
                          {({ field, form }) => (
                              <FormControl isInvalid={form.errors.contato && form.touched.contato} mb={4}>
                                  <FormLabel>Contato / Celular</FormLabel>
                                  <Input {...field} placeholder="(83) 99999-9999" />
                                  <FormErrorMessage>{form.errors.contato}</FormErrorMessage>
                              </FormControl>
                          )}
                      </Field>
                  </Flex>

                  <Field name='comunidade'>
                      {({ field, form }) => (
                          <FormControl isInvalid={form.errors.comunidade && form.touched.comunidade} mb={4}>
                              <FormLabel>Comunidade / Localidade</FormLabel>
                              <Input {...field} placeholder="Ex: Sítio Cajueiro" />
                              <FormErrorMessage>{form.errors.comunidade}</FormErrorMessage>
                          </FormControl>
                      )}
                  </Field>

                  {/* CAMPO DE SENHA (SÓ NA CRIAÇÃO) */}
                  {!agricultorSelecionado && (
                      <Field name='senha'>
                          {({ field, form }) => (
                              <FormControl isInvalid={form.errors.senha && form.touched.senha} mb={4}>
                                  <FormLabel fontWeight="bold" color="brand.500">Senha de Acesso ao Sistema</FormLabel>
                                  <Input {...field} type="password" placeholder="Digite uma senha..." />
                                  <FormHelperText>
                                      Esta senha será usada pelo agricultor para logar.
                                  </FormHelperText>
                                  <FormErrorMessage>{form.errors.senha}</FormErrorMessage>
                              </FormControl>
                          )}
                      </Field>
                  )}

                </ModalBody>
                <ModalFooter>
                  <Button variant='ghost' mr={3} onClick={onFormClose}>Cancelar</Button>
                  <Button colorScheme='brand' isLoading={props.isSubmitting} type='submit'>
                      {agricultorSelecionado ? "Atualizar Dados" : "Salvar Cadastro"}
                  </Button>
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
            <Text fontSize="sm" color="red.500" mt={2}>
                Isso apagará os dados pessoais e o login de acesso dele.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleConfirmarExclusao}>Excluir Definitivamente</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}