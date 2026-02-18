import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Badge,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  Tooltip,
  useToast,
  HStack,
  VStack
} from "@chakra-ui/react";

import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from "services/api";

//Esquema de Validação
const VeiculoSchema = Yup.object().shape({
  nome: Yup.string().required('Nome/Modelo é obrigatório'),
  tipo: Yup.string().required('Tipo é obrigatório'),
  status: Yup.string().required('Status é obrigatório'),
  placa: Yup.string().nullable()
});

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/veiculos');
      setVeiculos(response.data);
    } catch (error) {
      console.error("Erro ao buscar veículos");
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
            await api.put(`/veiculos/${veiculoSelecionado.id}`, values);
            toast({ title: "Veículo atualizado!", status: "success", duration: 3000 });
        } else {
            await api.post('/veiculos', values);
            toast({ title: "Veículo cadastrado!", status: "success", duration: 3000 });
        }
        fetchData();
        onClose();
    } catch (error) {
        toast({ title: "Erro ao salvar.", status: "error", duration: 3000 });
    } finally {
        actions.setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
          try {
              await api.delete(`/veiculos/${id}`);
              toast({ title: "Veículo excluído.", status: "success", duration: 3000 });
              fetchData();
          } catch (error) {
              toast({ title: "Erro ao excluir.", description: "Verifique se está em uso.", status: "error" });
          }
      }
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    if (s === 'DISPONIVEL' || s === 'DISPONÍVEL') return 'green';
    if (s === 'EM USO') return 'blue';
    if (s === 'MANUTENÇÃO' || s === 'MANUTENCAO') return 'orange';
    return 'gray';
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' color='brand.500' /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card px='0px' pb='20px'>
        <Flex justify='space-between' align='center' mb='20px' px='25px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Frota Municipal</Text>
          <Button 
            leftIcon={<MdAdd />} 
            colorScheme='brand' 
            variant='solid'
            onClick={() => handleOpenModal()}
          >
            Novo Veículo
          </Button>
        </Flex>

        <Box overflowX={{ sm: "scroll", lg: "hidden" }}>
          <Table variant='simple' color='gray.500'>
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>Veículo / Modelo</Th>
                <Th borderColor={borderColor}>Placa</Th>
                <Th borderColor={borderColor}>Tipo</Th>
                <Th borderColor={borderColor}>Status</Th>
                <Th borderColor={borderColor}>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {veiculos.map((veiculo) => (
                <Tr key={veiculo.id}>
                  <Td fontWeight='bold' color={textColor} borderColor={borderColor}>
                    {veiculo.nome}
                  </Td>

                  <Td borderColor={borderColor} color={textColor}>
                    {veiculo.placa || '-'}
                  </Td>
                  
                  <Td borderColor={borderColor} color={textColor}>
                    {veiculo.tipo}
                  </Td>
                  
                  <Td borderColor={borderColor}>
                    <Badge 
                        colorScheme={getStatusColor(veiculo.status)} 
                        variant='solid'
                        px='10px' 
                        borderRadius='8px'
                    >
                      {veiculo.status}
                    </Badge>
                  </Td>
                  <Td borderColor={borderColor}>
                      <HStack gap='2'>
                          <Tooltip label='Editar Veículo'>
                            <IconButton 
                                icon={<MdEdit />} 
                                size='sm' 
                                colorScheme='brand' 
                                variant='solid'
                                isRound 
                                onClick={() => handleOpenModal(veiculo)} 
                                aria-label="Editar"
                            />
                          </Tooltip>
                          
                          <Tooltip label='Excluir Veículo'>
                            <IconButton 
                                icon={<MdDelete />} 
                                size='sm' 
                                colorScheme='red' 
                                variant='solid'
                                isRound
                                onClick={() => handleDelete(veiculo.id)} 
                                aria-label="Excluir"
                            />
                          </Tooltip>
                      </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{veiculoSelecionado ? "Gerenciar Veículo" : "Cadastrar Novo Veículo"}</ModalHeader>
            <ModalCloseButton />
            <Formik
                initialValues={veiculoSelecionado || { nome: '', placa: '', tipo: '', status: 'DISPONIVEL' }}
                validationSchema={VeiculoSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {(props) => (
                    <Form>
                        <ModalBody>
                            <VStack spacing={4}>
                                <Field name='nome'>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.nome && form.touched.nome}>
                                            <FormLabel>Modelo / Nome</FormLabel>
                                            <Input {...field} placeholder="Ex: Trator Valtra A950" />
                                        </FormControl>
                                    )}
                                </Field>

                                <Field name='placa'>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.placa && form.touched.placa}>
                                            <FormLabel>Placa (Opcional)</FormLabel>
                                            <Input {...field} placeholder="XYZ-1234" />
                                        </FormControl>
                                    )}
                                </Field>

                                <Field name='tipo'>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.tipo && form.touched.tipo}>
                                            <FormLabel>Tipo de Maquinário</FormLabel>
                                            <Select {...field} placeholder="Selecione o tipo...">
                                                <option value="Trator">Trator</option>
                                                <option value="Retroescavadeira">Retroescavadeira</option>
                                                <option value="Motoniveladora">Motoniveladora (Patrol)</option>
                                                <option value="Caminhão">Caminhão / Caçamba</option>
                                                <option value="Pá Carregadeira">Pá Carregadeira</option>
                                            </Select>
                                        </FormControl>
                                    )}
                                </Field>

                                <Field name='status'>
                                    {({ field }) => (
                                        <FormControl>
                                            <FormLabel>Status Atual</FormLabel>
                                            <Select {...field}>
                                                <option value="DISPONIVEL">DISPONÍVEL</option>
                                                <option value="EM USO">EM USO</option>
                                                <option value="MANUTENÇÃO">MANUTENÇÃO</option>
                                            </Select>
                                        </FormControl>
                                    )}
                                </Field>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant='ghost' mr={3} onClick={onClose}>Cancelar</Button>
                            <Button colorScheme='brand' type='submit' isLoading={props.isSubmitting}>Confirmar Dados</Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </ModalContent>
      </Modal>
    </Box>
  );
}