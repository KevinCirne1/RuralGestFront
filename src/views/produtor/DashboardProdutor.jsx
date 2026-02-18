import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Heading, Text, SimpleGrid, useColorModeValue, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Select, useDisclosure, useToast, Textarea // Adicionado Textarea
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

// 1. Schema atualizado para incluir observação (opcional)
const RequestSchema = Yup.object().shape({
  servicoId: Yup.string().required('Selecione o serviço'),
  propriedadeId: Yup.string().required('Selecione a propriedade'),
  observacao: Yup.string().nullable(), 
});

export default function DashboardProdutor() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { authData } = useAuth();
  const userLogado = authData?.user;
  const agricultorLogado = authData?.agricultor; 
  const [propriedades, setPropriedades] = useState([]);
  const [servicos, setServicos] = useState([]);

  const fetchInitialData = useCallback(async () => {
    if (!userLogado) return;
    try {
      const [propRes, servRes] = await Promise.all([getPropriedades(), getServicos()]);
      const meuId = agricultorLogado?.id || userLogado?.agricultor_id;
      const minhasProps = propRes.data.filter(p => 
        String(p.agricultor_id || p.agricultor?.id) === String(meuId)
      );
      setPropriedades(minhasProps); 
      setServicos(servRes.data);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, [userLogado, agricultorLogado]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleSubmit = async (values, actions) => {
    try {
      const meuId = agricultorLogado?.id || userLogado?.agricultor_id;

      const payload = {
        agricultor_id: parseInt(meuId, 10),
        propriedade_id: parseInt(values.propriedadeId, 10),
        servico_id: parseInt(values.servicoId, 10),
        status: "Pendente",
        data_solicitacao: new Date().toISOString().split('T')[0],
        // 2. Agora enviamos o que o usuário escreveu no campo
        observacao: values.observacao || "Solicitação via Painel Produtor"
      };

      await createSolicitacao(payload);
      
      toast({ title: "Solicitação enviada!", status: "success", duration: 5000 });
      onClose();
    } catch (error) {
      const detalhe = error.response?.data?.message || "Erro ao processar vínculo.";
      toast({ 
        title: "Ação Negada", 
        description: detalhe, 
        status: "error", 
        duration: 7000, 
        isClosable: true 
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Flex direction="column" align="center" justify="center" pt={{ base: "130px", md: "80px" }} minH="80vh">
      <Box maxW="container.lg" textAlign="center">
        <Heading as="h1" size="xl" mb={6} color={textColor}>Olá, {userLogado?.nome}!</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Card p={6}>
            <Icon as={MdList} w={12} h={12} mx="auto" color="brand.500" />
            <Heading size="md" mt={4}>Minhas Solicitações</Heading>
            <Link to="/produtor/minhas-solicitacoes">
              <Button colorScheme="brand" mt={4} width="full">Ver Histórico</Button>
            </Link>
          </Card>
          <Card p={6}>
            <Icon as={MdAdd} w={12} h={12} mx="auto" color="brand.500" />
            <Heading size="md" mt={4}>Novo Pedido</Heading>
            <Button colorScheme="brand" mt={4} width="full" onClick={onOpen}>Solicitar Serviço</Button>
          </Card>
        </SimpleGrid>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <Formik 
            initialValues={{ servicoId: '', propriedadeId: '', observacao: '' }} 
            validationSchema={RequestSchema} 
            onSubmit={handleSubmit}
          >
            {(props) => (
              <Form>
                <ModalHeader>Nova Solicitação</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  <Field name='servicoId'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.servicoId && form.touched.servicoId} mb={4}>
                        <FormLabel>Serviço</FormLabel>
                        <Select {...field} placeholder="Selecione o serviço">
                          {servicos.map(s => <option key={s.id} value={s.id}>{s.nome_servico}</option>)}
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  <Field name='propriedadeId'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.propriedadeId && form.touched.propriedadeId} mb={4}>
                        <FormLabel>Propriedade</FormLabel>
                        <Select {...field} placeholder={propriedades.length > 0 ? "Selecione a propriedade" : "Nenhuma terra cadastrada"}>
                          {propriedades.map(p => <option key={p.id} value={p.id}>{p.terreno}</option>)}
                        </Select>
                        {propriedades.length === 0 && (
                          <Text fontSize="xs" color="red.400" mt={1}>Você não possui terras vinculadas ao seu perfil.</Text>
                        )}
                      </FormControl>
                    )}
                  </Field>

                  {/* 3. CAMPO DE OBSERVAÇÃO ADICIONADO AQUI */}
                  <Field name='observacao'>
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Observações / Detalhes</FormLabel>
                        <Textarea 
                          {...field} 
                          placeholder="Ex: Localização específica, detalhes do solo, urgência..." 
                          rows={4}
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Forneça detalhes que ajudem a equipe a planejar o serviço.
                        </Text>
                      </FormControl>
                    )}
                  </Field>

                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='brand' mr={3} isLoading={props.isSubmitting} type='submit' isDisabled={propriedades.length === 0}>
                    Enviar Solicitação
                  </Button>
                  <Button onClick={onClose}>Cancelar</Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </Flex>
  );
}