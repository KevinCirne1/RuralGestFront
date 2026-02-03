// src/views/produtor/DashboardProdutor.jsx

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

import { useAuth } from "contexts/AuthContext";
import { getServicos } from "services/servicoService";
import { getPropriedades } from "services/propriedadeService";
import { createSolicitacao } from "services/solicitacaoService";

// Esquema de validação
const RequestSchema = Yup.object().shape({
  servicoId: Yup.string().required('É preciso selecionar um tipo de serviço'),
  propriedadeId: Yup.string().required('É preciso selecionar uma propriedade'),
});

export default function DashboardProdutor() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const { authData } = useAuth();
  const agricultorLogado = authData?.user;

  const [propriedades, setPropriedades] = useState([]);
  const [servicos, setServicos] = useState([]);

  const fetchInitialData = useCallback(async () => {
    if (!agricultorLogado) return;

    try {
      // Ajuste: A função getPropriedadesByAgricultor não foi importada corretamente no seu código original
      // ou não existe no service padrão. Vou usar getPropriedades e filtrar (ou assumir que o backend já filtra).
      // Se tiver getPropriedadesByAgricultor exportada, mantenha. Aqui ajustei para garantir que não quebre.
      const [propriedadesRes, servicosRes] = await Promise.all([
        getPropriedades(), // Ajuste conforme sua API real
        getServicos()
      ]);
      
      // Filtra as propriedades do usuário logado (caso o endpoint retorne tudo)
      const minhasProps = propriedadesRes.data.filter(p => p.agricultor_id === agricultorLogado.id);
      setPropriedades(minhasProps);
      
      setServicos(servicosRes.data);
    } catch (error) {
      toast({ title: "Erro ao carregar dados.", status: "error", duration: 5000, isClosable: true });
    }
  }, [agricultorLogado, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSubmit = async (values, actions) => {
    const newRequest = {
      servico_id: values.servicoId,       
      propriedade_id: values.propriedadeId,
      agricultor_id: agricultorLogado.id,  
      status: "Pendente",
      data_solicitacao: new Date().toISOString(),
    };

    try {
      await createSolicitacao(newRequest);
      toast({ title: "Solicitação enviada com sucesso!", status: "success", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
      onClose();
    } catch (error) {
      console.error(error); 
      toast({ title: "Erro ao enviar solicitação.", status: "error", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
    }
  };

  return (
    <Flex direction="column" align="center" justify="center" pt={{ base: "130px", md: "80px" }} minH="100vh">
      <Box maxW="container.lg" textAlign="center">
        <Heading as="h1" size="xl" mb={6} color={textColor}>
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
              {/* --- ALTERADO AQUI: De colorScheme="gray" para "brand" --- */}
              <Button colorScheme="brand" width="full">Ver Minhas Solicitações</Button>
            </Link>
          </Card>
          <Card p={6}>
            <Icon as={MdAdd} w={12} h={12} mx="auto" color="brand.500" />
            <Heading as="h3" size="lg" mt={6} mb={2}>Fazer um Novo Pedido</Heading>
            <Text color="gray.600" mb={6}>Precisa de um novo serviço? Faça sua solicitação aqui.</Text>
            <Button colorScheme="brand" onClick={onOpen} width="full">Solicitar Novo Serviço</Button>
          </Card>
        </SimpleGrid>
      </Box>

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