import React, { useState, useEffect } from "react";
import {
  Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, 
  useColorModeValue, Badge, Spinner, useDisclosure, Modal, 
  ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, 
  ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, 
  IconButton, Tooltip, useToast
} from "@chakra-ui/react";
import { MdDirectionsCar, MdEdit, MdDelete } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from "services/api"; 

// Validação
const VeiculoSchema = Yup.object().shape({
  nome: Yup.string().required('Nome/Modelo é obrigatório'),
  tipo: Yup.string().required('Tipo é obrigatório'),
  placa: Yup.string().nullable()
});

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);

  // Busca dados
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/veiculos');
      setVeiculos(response.data);
    } catch (error) {
      console.log("Erro ao buscar veículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (veiculo = null) => {
    setVeiculoSelecionado(veiculo);
    onOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
        if (veiculoSelecionado) {
            // Editar
            await api.put(`/veiculos/${veiculoSelecionado.id}`, values);
            toast({ title: "Veículo atualizado!", status: "success", duration: 3000, isClosable: true });
        } else {
            // Criar
            await api.post('/veiculos', values);
            toast({ title: "Veículo cadastrado!", status: "success", duration: 3000, isClosable: true });
        }
        fetchData();
        onClose();
    } catch (error) {
        toast({ title: "Erro ao salvar.", status: "error", duration: 3000, isClosable: true });
    } finally {
        actions.setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
          try {
              await api.delete(`/veiculos/${id}`);
              toast({ title: "Veículo excluído.", status: "success", duration: 3000, isClosable: true });
              fetchData();
          } catch (error) {
              toast({ title: "Erro ao excluir.", description: "Verifique se está em uso.", status: "error" });
          }
      }
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Frota Municipal</Text>
          <Button leftIcon={<MdDirectionsCar />} colorScheme='brand' onClick={() => handleOpenModal()}>Novo Veículo</Button>
        </Flex>

        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Veículo / Modelo</Th>
              <Th>Placa</Th>
              <Th>Tipo</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {veiculos.map((veiculo) => (
              <Tr key={veiculo.id}>
                <Td fontWeight='bold'>{veiculo.nome}</Td>
                <Td>{veiculo.placa || '-'}</Td>
                <Td>{veiculo.tipo}</Td>
                <Td>
                  <Badge colorScheme={veiculo.status === 'DISPONIVEL' ? 'green' : 'red'}>
                    {veiculo.status}
                  </Badge>
                </Td>
                <Td>
                    <Flex gap='2'>
                        <Tooltip label='Editar'><IconButton icon={<MdEdit />} size='sm' onClick={() => handleOpenModal(veiculo)} /></Tooltip>
                        <Tooltip label='Excluir'><IconButton icon={<MdDelete />} size='sm' colorScheme='red' onClick={() => handleDelete(veiculo.id)} /></Tooltip>
                    </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{veiculoSelecionado ? "Editar Veículo" : "Novo Veículo"}</ModalHeader>
            <ModalCloseButton />
            <Formik
                initialValues={veiculoSelecionado || { nome: '', placa: '', tipo: '', status: 'DISPONIVEL' }}
                validationSchema={VeiculoSchema}
                onSubmit={handleSubmit}
            >
                {(props) => (
                    <Form>
                        <ModalBody>
                            <Field name='nome'>
                                {({ field, form }) => (
                                    <FormControl isInvalid={form.errors.nome && form.touched.nome} mb={4}>
                                        <FormLabel>Modelo / Nome</FormLabel>
                                        <Input {...field} placeholder="Ex: Trator Valtra A950" />
                                    </FormControl>
                                )}
                            </Field>
                            <Field name='placa'>
                                {({ field, form }) => (
                                    <FormControl isInvalid={form.errors.placa && form.touched.placa} mb={4}>
                                        <FormLabel>Placa (Opcional)</FormLabel>
                                        <Input {...field} placeholder="XYZ-1234" />
                                    </FormControl>
                                )}
                            </Field>
                            <Field name='tipo'>
                                {({ field, form }) => (
                                    <FormControl isInvalid={form.errors.tipo && form.touched.tipo} mb={4}>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select {...field} placeholder="Selecione o tipo...">
                                            {/* AQUI ESTÃO AS OPÇÕES EXPANDIDAS */}
                                            <option value="Trator">Trator</option>
                                            <option value="Retroescavadeira">Retroescavadeira</option>
                                            <option value="Motoniveladora">Motoniveladora (Patrol)</option>
                                            <option value="Caminhão">Caminhão / Caçamba</option>
                                            <option value="Pá Carregadeira">Pá Carregadeira</option>
                                            <option value="Escavadeira Hidráulica">Escavadeira Hidráulica</option>
                                            <option value="Pulverizador">Pulverizador</option>
                                            <option value="Grade Aradora">Trator com Grade</option>
                                            <option value="Semeadeira">Semeadeira</option>
                                        </Select>
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