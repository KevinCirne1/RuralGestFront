import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Heading, Text, SimpleGrid, useColorModeValue, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Select, useDisclosure, FormErrorMessage, useToast
} from "@chakra-ui/react";
import { MdAdd, MdList } from "react-icons/md";
import Card from "components/card/Card.js";
import { Link } from "react-router-dom";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// <<< MUDANÇA 1: Importações dos serviços e contexto >>>
import { useAuth } from "contexts/AuthContext";
import { getServicos } from "services/servicoService";
import { getPropriedadesByAgricultor } from "services/agricultorService";
import { createSolicitacao } from "services/solicitacaoService";

const RequestSchema = Yup.object().shape({
  servicoId: Yup.string().required('É preciso selecionar um tipo de serviço'),
  propriedadeId: Yup.string().required('É preciso selecionar uma propriedade'),
});

export default function DashboardProdutor() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // <<< MUDANÇA 2: Pega os dados do usuário logado >>>
  const { authData } = useAuth();
  const agricultorLogado = authData?.user;

  const [propriedades, setPropriedades] = useState([]);
  const [servicos, setServicos] = useState([]);

  // <<< MUDANÇA 3: Busca os dados reais para os formulários >>>
  const fetchInitialData = useCallback(async () => {
    // Só busca os dados se tiver um agricultor logado
    if (!agricultorLogado) return;

    try {
      // Faz as duas chamadas à API em paralelo
      const [propriedadesRes, servicosRes] = await Promise.all([
        getPropriedadesByAgricultor(agricultorLogado.id),
        getServicos()
      ]);
      setPropriedades(propriedadesRes.data);
      setServicos(servicosRes.data);
    } catch (error) {
      toast({ title: "Erro ao carregar dados do formulário.", status: "error", duration: 5000, isClosable: true });
    }
  }, [agricultorLogado, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // <<< MUDANÇA 4: handleSubmit agora usa os serviços e o ID do usuário real >>>
  const handleSubmit = async (values, actions) => {
    const newRequest = {
      // O `values` vem com `servicoId` e `propriedadeId` do formulário
      ...values,
      agricultorId: agricultorLogado.id, // Adiciona o ID do usuário logado
      status: "Pendente",
      data_solicitacao: new Date().toISOString(),
    };
    try {
      await createSolicitacao(newRequest);
      toast({ title: "Solicitação enviada com sucesso!", status: "success", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
      onClose();
    } catch (error) {
      toast({ title: "Erro ao enviar solicitação.", status: "error", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
    }
  };

  return (
    <Flex direction="column" align="center" justify="center" pt={{ base: "130px", md: "80px" }} minH="100vh">
      <Box maxW="container.lg" textAlign="center">
        <Heading as="h1" size="xl" mb={6} color={textColor}>
          {/* Mostra o nome do produtor logado */}
          Bem-vindo, {agricultorLogado?.nome}! 
        </Heading>
        <Text fontSize="lg" color="gray.500" mb={10}>
          Aqui você pode gerenciar suas solicitações de forma rápida e fácil.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Card p={6}>
            <Icon as={MdList} w={12} h={12} mx="auto" color="brand.500" />
            <Heading as="h3" size="lg" mt={6} mb={2}>Minhas Solicitações</Heading>
            <Text color="gray.600" mb={6}>Acompanhe o status de todos os serviços que você já solicitou.</Text>
            <Link to="/produtor/minhas-solicitacoes">
              <Button colorScheme="gray">Ver Minhas Solicitações</Button>
            </Link>
          </Card>
          <Card p={6}>
            <Icon as={MdAdd} w={12} h={12} mx="auto" color="brand.500" />
            <Heading as="h3" size="lg" mt={6} mb={2}>Fazer um Novo Pedido</Heading>
            <Text color="gray.600" mb={6}>Precisa de um novo serviço? Faça sua solicitação aqui.</Text>
            <Button colorScheme="brand" onClick={onOpen}>Solicitar Novo Serviço</Button>
          </Card>
        </SimpleGrid>
      </Box>

      {/* <<< MUDANÇA 5: O formulário agora é preenchido com dados da API >>> */}
      <Formik
        initialValues={{ servicoId: '', propriedadeId: '' }}
        validationSchema={RequestSchema}
        onSubmit={handleSubmit}>
        {(props) => (
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <Form>
                <ModalHeader>Solicitar um Novo Serviço</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Field name='servicoId'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.servicoId && form.touched.servicoId}>
                        <FormLabel>Tipo de Serviço</FormLabel>
                        <Select {...field} placeholder="Selecione o serviço desejado">
                          {/* Opções de serviço vêm da API */}
                          {servicos.map(serv => (
                            <option key={serv.id} value={serv.id}>{serv.nome_servico}</option>
                          ))}
                        </Select>
                        <FormErrorMessage>{form.errors.servicoId}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name='propriedadeId'>
                    {({ field, form }) => (
                      <FormControl mt={4} isInvalid={form.errors.propriedadeId && form.touched.propriedadeId}>
                        <FormLabel>Para qual Propriedade?</FormLabel>
                        <Select {...field} placeholder="Selecione a propriedade">
                          {/* Opções de propriedade vêm da API */}
                          {propriedades.map(prop => (
                            <option key={prop.id} value={prop.id}>{prop.terreno}</option>
                          ))}
                        </Select>
                        <FormErrorMessage>{form.errors.propriedadeId}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='brand' mr={3} isLoading={props.isSubmitting} type='submit'>Enviar Solicitação</Button>
                  <Button variant='ghost' onClick={onClose}>Cancelar</Button>
                </ModalFooter>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </Formik>
    </Flex>
  );
}