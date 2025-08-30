// src/views/produtor/DashboardProdutor.jsx

import React from "react";
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
import axios from 'axios';

const API_URL = "http://localhost:5000";
const currentProducerId = 1;

const RequestSchema = Yup.object().shape({
  serviceId: Yup.number().required('É preciso selecionar um tipo de serviço'),
  propertyId: Yup.number().required('É preciso selecionar uma propriedade'),
});

export default function DashboardProdutor() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSubmit = (values, actions) => {
    const newRequest = {
    ...values,
      farmerId: currentProducerId,
      status: "Pendente",
      data_solicitacao: new Date().toISOString(),
      data_execucao: null,
    };

    axios.post(`${API_URL}/requests`, newRequest)
    .then(response => {
        toast({ title: "Solicitação enviada com sucesso!", status: "success", duration: 5000, isClosable: true });
        actions.setSubmitting(false);
        onClose();
      })
    .catch(error => {
        toast({ title: "Erro ao enviar solicitação.", status: "error", duration: 5000, isClosable: true });
        actions.setSubmitting(false);
      });
  };

  return (
    <Flex direction="column" align="center" justify="center" h="100vh" pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Box maxW="container.lg">
        <Heading as="h1" size="xl" mb={6} textAlign="center" color={textColor}>
          Bem-vindo, Produtor!
        </Heading>
        <Text fontSize="lg" color="gray.500" textAlign="center" mb={10}>
          Aqui você pode gerenciar suas solicitações de forma rápida e fácil.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Card p={6} textAlign="center">
            <Icon as={MdList} w={12} h={12} mx="auto" color="brand.500" />
            <Heading as="h3" size="lg" mt={6} mb={2}>Minhas Solicitações</Heading>
            <Text color="gray.600" mb={6}>Acompanhe o status de todos os serviços que você já solicitou.</Text>
            <Link to="/produtor/minhas-solicitacoes">
              <Button colorScheme="gray">Ver Minhas Solicitações</Button>
            </Link>
          </Card>
          <Card p={6} textAlign="center">
            <Icon as={MdAdd} w={12} h={12} mx="auto" color="brand.500" />
            <Heading as="h3" size="lg" mt={6} mb={2}>Fazer um Novo Pedido</Heading>
            <Text color="gray.600" mb={6}>Precisa de um novo serviço? Faça sua solicitação aqui.</Text>
            <Button colorScheme="brand" onClick={onOpen}>Solicitar Novo Serviço</Button>
          </Card>
        </SimpleGrid>
      </Box>

      <Formik
        initialValues={{ serviceId: '', propertyId: '' }}
        validationSchema={RequestSchema}
        onSubmit={handleSubmit}
      >
        {(props) => (
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <Form>
                <ModalHeader>Solicitar um Novo Serviço</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Field name='serviceId'>{({ field, form }) => (<FormControl isInvalid={form.errors.serviceId && form.touched.serviceId}><FormLabel>Tipo de Serviço</FormLabel><Select {...field} placeholder="Selecione o serviço desejado"><option value="1">Corte de Terra</option><option value="2">Distribuição de Sementes</option></Select><FormErrorMessage>{form.errors.serviceId}</FormErrorMessage></FormControl>)}</Field>
                  <Field name='propertyId'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.propertyId && form.touched.propertyId}><FormLabel>Para qual Propriedade?</FormLabel><Select {...field} placeholder="Selecione a propriedade"><option value="1">Sítio Boa Esperança</option><option value="3">Chácara Alvorada</option></Select><FormErrorMessage>{form.errors.propertyId}</FormErrorMessage></FormControl>)}</Field>
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