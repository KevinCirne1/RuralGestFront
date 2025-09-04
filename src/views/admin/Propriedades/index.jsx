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
import { getAgricultores } from "services/agricultorService";
import { getPropriedades, createPropriedade, updatePropriedade, deletePropriedade } from "services/propriedadeService";

const SignupSchema = Yup.object().shape({
  terreno: Yup.string().required('O nome da propriedade é obrigatório'),
  tipo_agricultura: Yup.string().required('O tipo de agricultura é obrigatório'),
  area_total: Yup.number().required('A área total é obrigatória'),
  area_exploravel: Yup.number().required('A área explorável é obrigatória'),
  coordenadas_geograficas: Yup.string().required('As coordenadas são obrigatórias'),
  agricultor_id: Yup.string().required('É preciso selecionar um agricultor'), 
});

export default function PropriedadesPage() {
  const [propriedades, setPropriedades] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [propriedadeParaDeletar, setPropriedadeParaDeletar] = useState(null);
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propriedadesResponse, agricultoresResponse] = await Promise.all([
        getPropriedades(),
        getAgricultores()
      ]);
      setPropriedades(propriedadesResponse.data);
      setAgricultores(agricultoresResponse.data);
    } catch (error) {
      toast({ title: "Erro ao buscar dados.", description: "Verifique a conexão com a API.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (propriedade = null) => {
    setPropriedadeSelecionada(propriedade);
    onFormOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
      
      const { agricultor_id, ...dadosPropriedade } = values;

      if (propriedadeSelecionada) {
        
        await updatePropriedade(propriedadeSelecionada.id, values); 
        toast({ title: "Propriedade atualizada com sucesso!", status: "success", duration: 5000, isClosable: true });
      } else {
       
        await createPropriedade(agricultor_id, dadosPropriedade);
        toast({ title: "Propriedade cadastrada com sucesso!", status: "success", duration: 5000, isClosable: true });
      }
      
      actions.setSubmitting(false);
      onFormClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro na operação.", description: error.message, status: "error", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
    }
  };

  const handleAbrirModalExclusao = (propriedade) => {
    setPropriedadeParaDeletar(propriedade);
    onDeleteOpen();
  };

  const handleConfirmarExclusao = async () => {
    if (!propriedadeParaDeletar) return;
    try {
      await deletePropriedade(propriedadeParaDeletar.id);
      toast({ title: 'Sucesso!', description: `Propriedade "${propriedadeParaDeletar.terreno}" excluída.`, status: 'success', duration: 3000, isClosable: true });
      onDeleteClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', description: 'Não foi possível remover a propriedade.', status: 'error', duration: 5000, isClosable: true });
      onDeleteClose();
    }
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Propriedades</Text>
          <Button colorScheme='brand' onClick={() => handleOpenForm()}>Cadastrar Propriedade</Button>
        </Flex>
        <Table variant='simple' size='sm'>
          <Thead><Tr><Th>Propriedade</Th><Th>Agricultor</Th><Th>Tipo</Th><Th>Área Total (ha)</Th><Th>Área Explorável (ha)</Th><Th>Coordenadas</Th><Th>Ações</Th></Tr></Thead>
          <Tbody>
            {propriedades.map((prop) => {
              const agricultor = agricultores.find(a => a.id === prop.agricultor_id);
              return (
                <Tr key={prop.id}>
                  <Td>{prop.terreno}</Td>
                  <Td>{agricultor ? agricultor.nome : 'N/A'}</Td>
                  <Td>{prop.tipo_agricultura}</Td>
                  <Td>{prop.area_total}</Td>
                  <Td>{prop.area_exploravel}</Td>
                  <Td>{prop.coordenadas_geograficas}</Td>
                  <Td>
                    <Button size='sm' mr='10px' onClick={() => handleOpenForm(prop)}><Icon as={MdEdit} /></Button>
                    <Button size='sm' colorScheme='red' onClick={() => handleAbrirModalExclusao(prop)}><Icon as={MdDelete} /></Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>

      <Formik 
        initialValues={propriedadeSelecionada ? {
          terreno: propriedadeSelecionada.terreno,
          tipo_agricultura: propriedadeSelecionada.tipo_agricultura,
          area_total: propriedadeSelecionada.area_total,
          area_exploravel: propriedadeSelecionada.area_exploravel,
          coordenadas_geograficas: propriedadeSelecionada.coordenadas_geograficas,
          agricultor_id: propriedadeSelecionada.agricultor_id
        } : { terreno: '', tipo_agricultura: '', area_total: '', area_exploravel: '', coordenadas_geograficas: '', agricultor_id: '' }} 
        validationSchema={SignupSchema} 
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose}><ModalOverlay /><ModalContent>
            <Form><ModalHeader>{propriedadeSelecionada ? "Editar Propriedade" : "Cadastrar Nova Propriedade"}</ModalHeader><ModalCloseButton />
              <ModalBody>
                <Field name='terreno'>{({ field, form }) => (<FormControl isInvalid={form.errors.terreno && form.touched.terreno}><FormLabel>Nome da Propriedade</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.terreno}</FormErrorMessage></FormControl>)}</Field>
                <Field name='tipo_agricultura'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.tipo_agricultura && form.touched.tipo_agricultura}><FormLabel>Tipo de Agricultura</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.tipo_agricultura}</FormErrorMessage></FormControl>)}</Field>
                <Field name='area_total'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.area_total && form.touched.area_total}><FormLabel>Área Total (ha)</FormLabel><Input {...field} type="number" /><FormErrorMessage>{form.errors.area_total}</FormErrorMessage></FormControl>)}</Field>
                <Field name='area_exploravel'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.area_exploravel && form.touched.area_exploravel}><FormLabel>Área Explorável (ha)</FormLabel><Input {...field} type="number" /><FormErrorMessage>{form.errors.area_exploravel}</FormErrorMessage></FormControl>)}</Field>
                <Field name='coordenadas_geograficas'>{({ field, form }) => (<FormControl mt={4} isInvalid={form.errors.coordenadas_geograficas && form.touched.coordenadas_geograficas}><FormLabel>Coordenadas Geográficas</FormLabel><Input {...field} placeholder="-7.123, -35.567" /><FormErrorMessage>{form.errors.coordenadas_geograficas}</FormErrorMessage></FormControl>)}</Field>
                <Field name='agricultor_id'>{({ field, form }) => (
                  <FormControl mt={4} isInvalid={form.errors.agricultor_id && form.touched.agricultor_id}>
                    <FormLabel>Agricultor Responsável</FormLabel>
                    <Select {...field} placeholder="Selecione o agricultor">
                      {agricultores.map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.nome}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{form.errors.agricultor_id}</FormErrorMessage>
                  </FormControl>
                )}</Field>
              </ModalBody>
              <ModalFooter><Button colorScheme='brand' mr={3} isLoading={props.isSubmitting} type='submit'>Salvar</Button><Button variant='ghost' onClick={onFormClose}>Cancelar</Button></ModalFooter>
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
            Você tem certeza que deseja excluir a propriedade <strong>{propriedadeParaDeletar?.terreno}</strong>?
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
