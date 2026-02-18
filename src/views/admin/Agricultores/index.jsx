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
import { formatarCPF, formatarTelefone, apenasNumeros } from "utils/formatters";

export default function AgricultoresPage() {
  const [agricultores, setAgricultores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [agricultorParaDeletar, setAgricultorParaDeletar] = useState(null);
  const [agricultorSelecionado, setAgricultorSelecionado] = useState(null);
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const toast = useToast();

  const AgricultorSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    cpf: Yup.string().required('CPF é obrigatório').min(14, 'CPF incompleto'),
    comunidade: Yup.string().required('Comunidade é obrigatória'),
    contato: Yup.string().required('Contato é obrigatório').min(14, 'Telefone incompleto'),
    senha: !agricultorSelecionado 
        ? Yup.string().required('Defina uma senha para o acesso do produtor').min(6, 'Mínimo 6 caracteres')
        : Yup.string().nullable()
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAgricultores();
      setAgricultores(response.data);
    } catch (error) {
      toast({ title: "Erro ao buscar dados.", status: "error", duration: 5000 });
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
      const cpfLimpo = apenasNumeros(values.cpf);
      const contatoLimpo = apenasNumeros(values.contato);

      // --- VERIFICAÇÃO DE DUPLICIDADE (CPF) ---
      const cpfExiste = agricultores.find(ag => 
        ag.cpf === cpfLimpo && ag.id !== agricultorSelecionado?.id
      );

      if (cpfExiste) {
        toast({ 
          title: "CPF Duplicado", 
          description: `Este CPF já pertence ao agricultor ${cpfExiste.nome}.`, 
          status: "warning",
          duration: 5000,
          isClosable: true
        });
        return; // Interrompe o envio
      }

      // --- VERIFICAÇÃO DE DUPLICIDADE (TELEFONE) ---
      const contatoExiste = agricultores.find(ag => 
        ag.contato === contatoLimpo && ag.id !== agricultorSelecionado?.id
      );

      if (contatoExiste) {
         toast({ 
          title: "Telefone em uso", 
          description: `Este número já está cadastrado para ${contatoExiste.nome}.`, 
          status: "warning",
          duration: 5000,
          isClosable: true
        });
        return; // Interrompe o envio
      }

      const payload = {
        ...values,
        cpf: cpfLimpo,
        contato: contatoLimpo
      };

      if (agricultorSelecionado) {
        const { senha, ...dadosParaAtualizar } = payload; 
        await updateAgricultor(agricultorSelecionado.id, dadosParaAtualizar); 
        toast({ title: "Agricultor atualizado!", status: "success" });
      } else {
        await createAgricultor(payload);
        toast({ 
            title: "Cadastro realizado!", 
            description: `Login criado com o CPF informado.`,
            status: "success", 
            duration: 6000
        });
      }
      onFormClose();
      fetchData();
    } catch (error) {
      const msgErro = error.response?.data?.message || "Erro na operação.";
      toast({ title: "Erro", description: msgErro, status: "error" });
    } finally {
        actions.setSubmitting(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      await deleteAgricultor(agricultorParaDeletar.id);
      toast({ title: 'Sucesso!', status: 'success' });
      onDeleteClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', status: 'error' });
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
        
        <InputGroup mb="20px">
            <InputLeftElement pointerEvents='none'><Icon as={MdSearch} color='gray.300' /></InputLeftElement>
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
                      <Td color={textColor} borderColor={borderColor}>{formatarCPF(ag.cpf)}</Td>
                      <Td color={textColor} borderColor={borderColor}>{ag.comunidade}</Td>
                      <Td color={textColor} borderColor={borderColor}>{formatarTelefone(ag.contato)}</Td>
                      <Td borderColor={borderColor}>
                        <Flex gap="5px">
                          <Tooltip label="Editar">
                            <IconButton size='sm' colorScheme='brand' icon={<MdEdit />} isRound onClick={() => handleOpenForm(ag)} />
                          </Tooltip>
                          <Tooltip label="Excluir">
                            <IconButton size='sm' colorScheme='red' icon={<MdDelete />} isRound onClick={() => { setAgricultorParaDeletar(ag); onDeleteOpen(); }} />
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Formik 
        initialValues={
          agricultorSelecionado 
          ? { 
              ...agricultorSelecionado, 
              cpf: formatarCPF(agricultorSelecionado.cpf), 
              contato: formatarTelefone(agricultorSelecionado.contato) 
            } 
          : { nome: '', cpf: '', comunidade: '', contato: '', senha: '' }
        } 
        validationSchema={AgricultorSchema} 
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
            <ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>{agricultorSelecionado ? "Editar Agricultor" : "Cadastrar Agricultor"}</ModalHeader>
                <ModalCloseButton />
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
                                  <Input 
                                    {...field} 
                                    placeholder="000.000.000-00" 
                                    onChange={(e) => form.setFieldValue('cpf', formatarCPF(e.target.value))}
                                    isDisabled={!!agricultorSelecionado} 
                                    bg={!!agricultorSelecionado ? "gray.100" : "inherit"}
                                    color={!!agricultorSelecionado ? "gray.500" : "inherit"}
                                  />
                                  <FormErrorMessage>{form.errors.cpf}</FormErrorMessage>
                                  {!!agricultorSelecionado && (
                                    <FormHelperText color="orange.400" fontSize="xs">
                                      O CPF não pode ser alterado pois é o login do usuário.
                                    </FormHelperText>
                                  )}
                              </FormControl>
                          )}
                      </Field>
                      <Field name='contato'>
                          {({ field, form }) => (
                              <FormControl isInvalid={form.errors.contato && form.touched.contato} mb={4}>
                                  <FormLabel>Contato / Celular</FormLabel>
                                  <Input 
                                    {...field} 
                                    placeholder="(83) 99999-9999" 
                                    onChange={(e) => form.setFieldValue('contato', formatarTelefone(e.target.value))}
                                  />
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

                  {!agricultorSelecionado && (
                      <Field name='senha'>
                          {({ field, form }) => (
                              <FormControl isInvalid={form.errors.senha && form.touched.senha} mb={4}>
                                  <FormLabel fontWeight="bold" color="brand.500">Senha de Acesso</FormLabel>
                                  <Input {...field} type="password" placeholder="Digite uma senha..." />
                                  <FormErrorMessage>{form.errors.senha}</FormErrorMessage>
                              </FormControl>
                          )}
                      </Field>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant='ghost' mr={3} onClick={onFormClose}>Cancelar</Button>
                  <Button colorScheme='brand' isLoading={formikProps.isSubmitting} type='submit'>Salvar</Button>
                </ModalFooter>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </Formik>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay /><ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader><ModalCloseButton />
          <ModalBody>
            Tem certeza que deseja remover <strong>{agricultorParaDeletar?.nome}</strong>?
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